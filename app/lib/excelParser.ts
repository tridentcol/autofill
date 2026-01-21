import * as ExcelJS from 'exceljs';
import type {
  ExcelFormat,
  SheetStructure,
  Section,
  Field,
  DetectedCell,
  ParserConfig,
  FieldType,
} from '@/types';

/**
 * Configuración por defecto del parser
 */
const DEFAULT_CONFIG: ParserConfig = {
  detectHeaders: true,
  detectCheckboxes: true,
  detectTables: true,
  detectSignatures: true,
  maxEmptyCellsToDetect: 200,
  keywordPatterns: {
    name: ['nombre', 'realizado por', 'elaboro', 'responsable'],
    date: ['fecha', 'dia', 'mes', 'año'],
    signature: ['firma', 'firmas', 'firmante'],
    observations: ['observ', 'comentario', 'notas'],
    checkboxYes: ['si', 'yes', 'cumple'],
    checkboxNo: ['no', 'n/a', 'na', 'no aplica'],
    checkboxNA: ['n/a', 'na', 'no aplica'],
  },
};

/**
 * Clase principal para parsear archivos Excel
 */
export class ExcelParser {
  private config: ParserConfig;

  constructor(config?: Partial<ParserConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Parsea un archivo Excel y extrae toda su estructura
   */
  async parseExcelFile(
    fileBuffer: ArrayBuffer,
    formatInfo: { id: string; name: string; description: string }
  ): Promise<ExcelFormat> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer);

    const sheets: SheetStructure[] = [];

    workbook.eachSheet((worksheet) => {
      const sheetStructure = this.parseSheet(worksheet);
      sheets.push(sheetStructure);
    });

    return {
      id: formatInfo.id,
      name: formatInfo.name,
      description: formatInfo.description,
      filePath: '',
      fileType: 'xlsx',
      sheets,
    };
  }

  /**
   * Parsea una hoja individual del Excel
   */
  private parseSheet(worksheet: ExcelJS.Worksheet): SheetStructure {
    const sheetStructure: SheetStructure = {
      name: worksheet.name,
      sections: [],
      mergedCells: [],
    };

    // Detectar celdas combinadas
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        if (cell.isMerged) {
          const address = cell.address;
          if (!sheetStructure.mergedCells.includes(address)) {
            sheetStructure.mergedCells.push(address);
          }
        }
      });
    });

    // Detectar secciones
    const sections = this.detectSections(worksheet);
    sheetStructure.sections = sections;

    return sheetStructure;
  }

  /**
   * Detecta las diferentes secciones en una hoja
   */
  private detectSections(worksheet: ExcelJS.Worksheet): Section[] {
    const sections: Section[] = [];
    const maxRow = Math.min(worksheet.rowCount, 100); // Limitar análisis
    const maxCol = Math.min(worksheet.columnCount, 30);

    // Analizar estructura
    const cells = this.getAllCells(worksheet, maxRow, maxCol);

    // 1. Detectar encabezado (primeras filas con texto grande o combinado)
    const headerSection = this.detectHeader(cells, worksheet);
    if (headerSection) sections.push(headerSection);

    // 2. Detectar información básica (campos como nombre, fecha, cargo, etc.)
    const basicInfoSection = this.detectBasicInfo(cells, worksheet);
    if (basicInfoSection) sections.push(basicInfoSection);

    // 3. Detectar checklists (SI/NO/N/A)
    const checklistSections = this.detectChecklists(cells, worksheet);
    sections.push(...checklistSections);

    // 4. Detectar tablas dinámicas
    const tableSections = this.detectTables(cells, worksheet);
    sections.push(...tableSections);

    // 5. Detectar área de firmas
    const signatureSection = this.detectSignatures(cells, worksheet);
    if (signatureSection) sections.push(signatureSection);

    // 6. Detectar observaciones
    const observationsSection = this.detectObservations(cells, worksheet);
    if (observationsSection) sections.push(observationsSection);

    return sections;
  }

  /**
   * Obtiene todas las celdas de la hoja
   */
  private getAllCells(
    worksheet: ExcelJS.Worksheet,
    maxRow: number,
    maxCol: number
  ): DetectedCell[] {
    const cells: DetectedCell[] = [];

    for (let row = 1; row <= maxRow; row++) {
      for (let col = 1; col <= maxCol; col++) {
        const cell = worksheet.getCell(row, col);
        cells.push({
          ref: cell.address,
          row,
          col,
          value: cell.value,
          isEmpty: !cell.value,
          isMerged: cell.isMerged,
          style: cell.style,
        });
      }
    }

    return cells;
  }

  /**
   * Detecta la sección de encabezado
   */
  private detectHeader(
    cells: DetectedCell[],
    worksheet: ExcelJS.Worksheet
  ): Section | null {
    // Buscar las primeras filas con texto combinado o en mayúsculas
    const headerCells = cells
      .filter((c) => c.row <= 5 && !c.isEmpty && c.value)
      .filter((c) => {
        const text = String(c.value).toUpperCase();
        return (
          text.includes('INSPECCION') ||
          text.includes('ANALISIS') ||
          text.includes('PERMISO') ||
          text.includes('FORMATO') ||
          c.isMerged
        );
      });

    if (headerCells.length === 0) return null;

    const firstRow = Math.min(...headerCells.map((c) => c.row));
    const lastRow = Math.max(...headerCells.map((c) => c.row));

    return {
      id: 'header',
      type: 'header',
      title: 'Encabezado',
      fields: [],
      startRow: firstRow,
      endRow: lastRow,
      startCol: 1,
      endCol: worksheet.columnCount,
    };
  }

  /**
   * Detecta campos de información básica (nombre, fecha, cargo, etc.)
   */
  private detectBasicInfo(
    cells: DetectedCell[],
    worksheet: ExcelJS.Worksheet
  ): Section | null {
    const fields: Field[] = [];
    const keywords = [
      ...this.config.keywordPatterns.name,
      ...this.config.keywordPatterns.date,
      'cargo',
      'lugar',
      'zona',
      'marca',
      'modelo',
      'placa',
      'kilometraje',
    ];

    let minRow = Infinity;
    let maxRow = 0;

    // Buscar celdas con estas palabras clave
    for (const cell of cells) {
      if (cell.isEmpty || !cell.value) continue;

      const text = String(cell.value).toLowerCase();
      const hasKeyword = keywords.some((kw) => text.includes(kw));

      if (hasKeyword && text.includes(':')) {
        // Esta celda contiene un label, buscar la celda siguiente que esté vacía
        const nextCell = cells.find(
          (c) => c.row === cell.row && c.col === cell.col + 1
        );

        if (nextCell && nextCell.isEmpty) {
          const fieldType = this.detectFieldType(text);
          fields.push({
            id: `basic_${nextCell.ref}`,
            label: text.replace(':', '').trim(),
            type: fieldType,
            cellRef: nextCell.ref,
            row: nextCell.row,
            col: nextCell.col,
            required: true,
          });

          minRow = Math.min(minRow, cell.row);
          maxRow = Math.max(maxRow, cell.row);
        }
      }
    }

    if (fields.length === 0) return null;

    return {
      id: 'basic_info',
      type: 'basic_info',
      title: 'Información Básica',
      fields,
      startRow: minRow,
      endRow: maxRow,
      startCol: 1,
      endCol: worksheet.columnCount,
    };
  }

  /**
   * Detecta checklists con SI/NO/N/A
   */
  private detectChecklists(
    cells: DetectedCell[],
    worksheet: ExcelJS.Worksheet
  ): Section[] {
    const sections: Section[] = [];

    // Buscar patrones de SI/NO/N/A en encabezados de columna
    const checkboxHeaders = cells.filter((c) => {
      if (c.isEmpty) return false;
      const text = String(c.value).toLowerCase().trim();
      return text === 'si' || text === 'no' || text === 'n/a';
    });

    if (checkboxHeaders.length < 2) return sections;

    // Agrupar por fila (deben estar en la misma fila)
    const groupedByRow = new Map<number, DetectedCell[]>();
    for (const cell of checkboxHeaders) {
      if (!groupedByRow.has(cell.row)) {
        groupedByRow.set(cell.row, []);
      }
      groupedByRow.get(cell.row)!.push(cell);
    }

    // Procesar cada grupo
    for (const [headerRow, headerCells] of groupedByRow) {
      if (headerCells.length < 2) continue;

      // Buscar la columna de "ITEM" o similar
      const itemCol = this.findColumnWithKeyword(
        cells,
        headerRow,
        ['item', 'requerimiento', 'descripcion']
      );

      if (!itemCol) continue;

      // Buscar columna de observaciones
      const obsCol = this.findColumnWithKeyword(
        cells,
        headerRow,
        this.config.keywordPatterns.observations
      );

      // Detectar filas de items (después del encabezado)
      const fields: Field[] = [];
      let currentRow = headerRow + 1;
      let emptyRows = 0;
      let minRow = currentRow;
      let maxRow = currentRow;

      while (emptyRows < 3 && currentRow <= worksheet.rowCount) {
        const itemCell = worksheet.getCell(currentRow, itemCol);

        if (itemCell.value) {
          emptyRows = 0;
          const itemText = String(itemCell.value);

          // Crear field para cada checkbox
          for (const checkCell of headerCells) {
            const fieldCell = worksheet.getCell(currentRow, checkCell.col);
            fields.push({
              id: `check_${fieldCell.address}`,
              label: `${itemText} - ${checkCell.value}`,
              type: 'checkbox',
              cellRef: fieldCell.address,
              row: currentRow,
              col: checkCell.col,
              required: false,
              options: ['SI', 'NO', 'N/A'],
            });
          }

          // Agregar campo de observaciones si existe
          if (obsCol) {
            const obsCell = worksheet.getCell(currentRow, obsCol);
            fields.push({
              id: `obs_${obsCell.address}`,
              label: `Observaciones: ${itemText}`,
              type: 'textarea',
              cellRef: obsCell.address,
              row: currentRow,
              col: obsCol,
              required: false,
            });
          }

          maxRow = currentRow;
        } else {
          emptyRows++;
        }

        currentRow++;
      }

      if (fields.length > 0) {
        sections.push({
          id: `checklist_${headerRow}`,
          type: 'checklist',
          title: `Checklist (Fila ${headerRow})`,
          fields,
          startRow: minRow,
          endRow: maxRow,
          startCol: Math.min(...headerCells.map((c) => c.col)),
          endCol: Math.max(...headerCells.map((c) => c.col)),
        });
      }
    }

    return sections;
  }

  /**
   * Detecta tablas dinámicas
   */
  private detectTables(
    cells: DetectedCell[],
    worksheet: ExcelJS.Worksheet
  ): Section[] {
    // Por ahora, retornamos vacío. Se puede expandir para detectar tablas complejas
    return [];
  }

  /**
   * Detecta área de firmas
   */
  private detectSignatures(
    cells: DetectedCell[],
    worksheet: ExcelJS.Worksheet
  ): Section | null {
    const fields: Field[] = [];
    const signatureKeywords = this.config.keywordPatterns.signature;

    let minRow = Infinity;
    let maxRow = 0;

    for (const cell of cells) {
      if (cell.isEmpty || !cell.value) continue;

      const text = String(cell.value).toLowerCase();
      const hasSignatureKeyword = signatureKeywords.some((kw) => text.includes(kw));

      if (hasSignatureKeyword) {
        // Buscar celda vacía debajo o al lado
        const belowCell = cells.find(
          (c) => c.row === cell.row + 1 && c.col === cell.col
        );
        const nextCell = cells.find(
          (c) => c.row === cell.row && c.col === cell.col + 1
        );

        const targetCell = belowCell?.isEmpty ? belowCell : nextCell?.isEmpty ? nextCell : null;

        if (targetCell) {
          fields.push({
            id: `sig_${targetCell.ref}`,
            label: text,
            type: 'signature',
            cellRef: targetCell.ref,
            row: targetCell.row,
            col: targetCell.col,
            required: true,
          });

          minRow = Math.min(minRow, targetCell.row);
          maxRow = Math.max(maxRow, targetCell.row);
        }
      }
    }

    if (fields.length === 0) return null;

    return {
      id: 'signatures',
      type: 'signatures',
      title: 'Firmas',
      fields,
      startRow: minRow,
      endRow: maxRow,
      startCol: 1,
      endCol: worksheet.columnCount,
    };
  }

  /**
   * Detecta área de observaciones
   */
  private detectObservations(
    cells: DetectedCell[],
    worksheet: ExcelJS.Worksheet
  ): Section | null {
    const obsKeywords = this.config.keywordPatterns.observations;

    for (const cell of cells) {
      if (cell.isEmpty || !cell.value) continue;

      const text = String(cell.value).toLowerCase();
      const hasObsKeyword = obsKeywords.some((kw) => text.includes(kw));

      if (hasObsKeyword) {
        // Buscar celda grande debajo o al lado
        const belowCell = worksheet.getCell(cell.row + 1, cell.col);

        return {
          id: 'observations',
          type: 'observations',
          title: 'Observaciones',
          fields: [
            {
              id: `obs_${belowCell.address}`,
              label: text,
              type: 'textarea',
              cellRef: belowCell.address,
              row: cell.row + 1,
              col: cell.col,
              required: false,
            },
          ],
          startRow: cell.row,
          endRow: cell.row + 5,
          startCol: cell.col,
          endCol: worksheet.columnCount,
        };
      }
    }

    return null;
  }

  /**
   * Encuentra una columna que contenga ciertas palabras clave
   */
  private findColumnWithKeyword(
    cells: DetectedCell[],
    row: number,
    keywords: string[]
  ): number | null {
    const rowCells = cells.filter((c) => c.row === row && !c.isEmpty);

    for (const cell of rowCells) {
      const text = String(cell.value).toLowerCase();
      if (keywords.some((kw) => text.includes(kw))) {
        return cell.col;
      }
    }

    return null;
  }

  /**
   * Detecta el tipo de campo basado en el label
   */
  private detectFieldType(label: string): FieldType {
    const lowerLabel = label.toLowerCase();

    if (this.config.keywordPatterns.date.some((kw) => lowerLabel.includes(kw))) {
      return 'date';
    }

    if (lowerLabel.includes('hora') || lowerLabel.includes('time')) {
      return 'time';
    }

    if (
      lowerLabel.includes('kilometraje') ||
      lowerLabel.includes('numero') ||
      lowerLabel.includes('cantidad')
    ) {
      return 'number';
    }

    if (this.config.keywordPatterns.signature.some((kw) => lowerLabel.includes(kw))) {
      return 'signature';
    }

    if (this.config.keywordPatterns.observations.some((kw) => lowerLabel.includes(kw))) {
      return 'textarea';
    }

    return 'text';
  }
}

/**
 * Función helper para cargar un archivo Excel desde una URL
 */
export async function loadExcelFromURL(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load Excel file: ${response.statusText}`);
  }
  return await response.arrayBuffer();
}

/**
 * Función helper para cargar un archivo Excel desde un File
 */
export async function loadExcelFromFile(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result instanceof ArrayBuffer) {
        resolve(e.target.result);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}
