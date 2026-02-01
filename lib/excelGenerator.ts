import * as ExcelJS from 'exceljs';
import { Buffer } from 'buffer';
import type { FormData, Signature } from '@/types';

// Estilo estándar para todo el texto: tamaño 20, color negro
const STANDARD_FONT: Partial<ExcelJS.Font> = {
  size: 20,
  color: { argb: 'FF000000' },  // Negro puro
  name: 'Arial'
};

/**
 * Genera un archivo Excel rellenado con los datos del formulario
 */
export class ExcelGenerator {
  /**
   * Genera el archivo Excel rellenado
   */
  async generateFilledExcel(
    originalFileBuffer: ArrayBuffer,
    formData: FormData,
    signatures: Map<string, Signature>,
    excelFormat: any
  ): Promise<Blob> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(originalFileBuffer);

    // Crear un mapa de fields por ID para búsqueda rápida
    const fieldsMap = new Map<string, any>();
    if (excelFormat?.sheets) {
      for (const sheet of excelFormat.sheets) {
        for (const section of sheet.sections) {
          for (const field of section.fields) {
            fieldsMap.set(field.id, field);
          }
        }
      }
    }

    // Rellenar cada hoja con los datos
    for (let sheetIndex = 0; sheetIndex < formData.sheets.length; sheetIndex++) {
      const sheetData = formData.sheets[sheetIndex];
      const worksheet = workbook.getWorksheet(sheetData.sheetName);
      if (!worksheet) continue;

      // Limpiar celdas de firmas finales (borrar "FIRMA")
      const firmasCells = ['N65', 'N66', 'N67'];
      for (const cellRef of firmasCells) {
        const cell = worksheet.getCell(cellRef);
        if (cell.value?.toString().toUpperCase().includes('FIRMA')) {
          cell.value = '';
        }
      }

      // Rellenar cada sección
      for (let sectionIndex = 0; sectionIndex < sheetData.sections.length; sectionIndex++) {
        const sectionData = sheetData.sections[sectionIndex];

        for (const fieldData of sectionData.fields) {
          if (!fieldData.completed || fieldData.value === null || fieldData.value === undefined) continue;

          // Buscar el field original
          const field = fieldsMap.get(fieldData.fieldId);
          if (!field) continue;

          // Saltar campos sin cellRef válido (como turno_select que es solo UI)
          if (!field.cellRef || field.cellRef === '') continue;

          if (field.type === 'signature') {
            // Insertar firma como imagen
            const signature = signatures.get(fieldData.value);
            if (signature && field.cellRef) {
              // Verificar si es firma replicada en múltiples filas (responsable de controles)
              if (field.validation?.applyToAll && field.validation?.applyToRows && field.validation?.cellRef) {
                const colLetter = field.validation.cellRef;
                const mergedCols = field.validation?.mergedCols || 4;

                // Insertar firma en cada fila - se ajusta automáticamente al rango de celdas
                for (const row of field.validation.applyToRows) {
                  const cellRef = `${colLetter}${row}`;
                  const cell = worksheet.getCell(cellRef);
                  await this.insertSignature(
                    workbook,
                    worksheet,
                    signature,
                    row,
                    Number(cell.col),
                    1,
                    mergedCols
                  );
                }
              } else if (field.validation?.applyToAll && !field.validation?.applyToRows) {
                // Formato grúa - insertar firma en múltiples ubicaciones
                const firmaLocations = [
                  { cellRef: 'G11', mergedCols: 1 },
                  { cellRef: 'G17', mergedCols: 1 },
                  { cellRef: 'G31', mergedCols: 1 },
                  { cellRef: 'G43', mergedCols: 1 },
                  { cellRef: 'O11', mergedCols: 1 },
                  { cellRef: 'O17', mergedCols: 1 },
                  { cellRef: 'O31', mergedCols: 1 },
                  { cellRef: 'O43', mergedCols: 1 },
                ];
                for (const loc of firmaLocations) {
                  const cell = worksheet.getCell(loc.cellRef);
                  await this.insertSignature(
                    workbook,
                    worksheet,
                    signature,
                    Number(cell.row),
                    Number(cell.col),
                    1,
                    loc.mergedCols
                  );
                }
              } else {
                // Firma individual - se ajusta automáticamente al rango de celdas merged
                const cell = worksheet.getCell(field.cellRef);
                const mergedRows = field.validation?.mergedRows || 1;
                const mergedCols = field.validation?.mergedCols || 1;

                await this.insertSignature(
                  workbook,
                  worksheet,
                  signature,
                  Number(cell.row),
                  Number(cell.col),
                  mergedRows,
                  mergedCols
                );
              }
            }
          } else if (field.type === 'radio') {
            // Para radio buttons (checklist con SI/NO/N/A)
            if (field.validation?.pattern) {
              try {
                const cellRefs = JSON.parse(field.validation.pattern);
                const selectedCellRef = cellRefs[fieldData.value];

                if (selectedCellRef) {
                  const cell = worksheet.getCell(selectedCellRef);
                  cell.value = 'X';
                  cell.font = STANDARD_FONT;
                  cell.alignment = { vertical: 'middle', horizontal: 'center' };
                }
              } catch (e) {
                console.error('Error parsing radio cellRefs:', e);
              }
            }
          } else if (field.type === 'checkbox') {
            // Checkbox individual - usar símbolo de check (✓)
            if (fieldData.value && field.cellRef) {
              const cell = worksheet.getCell(field.cellRef);
              cell.value = '✓';
              cell.font = STANDARD_FONT;
              cell.alignment = { vertical: 'middle', horizontal: 'center' };
            }
          } else if (field.type === 'date') {
            // Formatear fecha
            if (field.cellRef) {
              // Verificar si hay configuración de descomposición de fecha
              if (field.validation?.pattern === 'decompose_date' && field.validation?.dayCellRef) {
                // Descomponer fecha en día, mes, año
                const date = new Date(fieldData.value);
                const day = date.getDate().toString().padStart(2, '0');  // 01, 02, ..., 31
                const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 01, 02, ..., 12
                const year = date.getFullYear();

                // Escribir día
                const dayCell = worksheet.getCell(field.validation.dayCellRef);
                dayCell.value = day;
                dayCell.font = STANDARD_FONT;
                dayCell.alignment = { vertical: 'middle', horizontal: 'center' };

                // Escribir mes
                const monthCell = worksheet.getCell(field.validation.monthCellRef);
                monthCell.value = month;
                monthCell.font = STANDARD_FONT;
                monthCell.alignment = { vertical: 'middle', horizontal: 'center' };

                // Escribir año
                const yearCell = worksheet.getCell(field.validation.yearCellRef);
                yearCell.value = year;
                yearCell.font = STANDARD_FONT;
                yearCell.alignment = { vertical: 'middle', horizontal: 'center' };
              } else {
                // Comportamiento original para fechas normales
                const cell = worksheet.getCell(field.cellRef);
                const currentValue = cell.value?.toString() || '';
                const cleanedValue = currentValue.replace(/_+/g, '').trim();
                const dateStr = new Date(fieldData.value).toLocaleDateString('es-ES');
                cell.value = cleanedValue ? `${cleanedValue} ${dateStr}` : dateStr;
                cell.font = STANDARD_FONT;
              }
            }
          } else if (field.type === 'time') {
            // Formatear hora
            if (field.cellRef) {
              const cell = worksheet.getCell(field.cellRef);
              cell.value = fieldData.value;
              cell.font = STANDARD_FONT;
              cell.alignment = { vertical: 'middle', horizontal: 'center' };
            }
          } else if (field.type === 'textarea') {
            // Para campos de texto largo
            if (field.cellRef) {
              const cell = worksheet.getCell(field.cellRef);
              // Verificar si debe concatenar con la etiqueta existente
              if (field.validation?.appendToLabel && field.validation?.labelText) {
                cell.value = `${field.validation.labelText} ${fieldData.value}`;
              } else {
                cell.value = fieldData.value;
              }
              cell.font = STANDARD_FONT;
              cell.alignment = {
                vertical: 'top',
                horizontal: 'left',
                wrapText: true
              };
            }
          } else {
            // Texto o número normal
            if (field.cellRef) {
              const cell = worksheet.getCell(field.cellRef);
              const currentValue = cell.value?.toString() || '';

              // Para campos de trabajadores, limpiar "NOMBRE" y "CARGO"
              const isWorkerField = field.id?.includes('trabajador') &&
                (field.id?.includes('nombre') || field.id?.includes('cargo'));

              if (isWorkerField) {
                // Poner solo el valor, sin concatenar con NOMBRE o CARGO
                cell.value = fieldData.value;
              } else if (field.validation?.appendToLabel && field.validation?.labelText) {
                cell.value = `${field.validation.labelText} ${fieldData.value}`;
              } else {
                const cleanedValue = currentValue.replace(/_+/g, '').trim();
                // Si ya tiene texto, agregar el valor después
                if (cleanedValue && !cleanedValue.includes(fieldData.value)) {
                  cell.value = `${cleanedValue} ${fieldData.value}`;
                } else if (!cleanedValue) {
                  cell.value = fieldData.value;
                } else {
                  cell.value = fieldData.value;
                }
              }
              cell.font = STANDARD_FONT;
            }
          }
        }
      }
    }

    // Generar el buffer del archivo
    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }

  /**
   * Obtiene las dimensiones de una imagen desde su dataUrl
   */
  private getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        // En servidor, asumir dimensiones estándar de firma
        resolve({ width: 400, height: 100 });
        return;
      }

      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        // Si falla, usar dimensiones por defecto
        resolve({ width: 400, height: 100 });
      };
      img.src = dataUrl;
    });
  }

  /**
   * Inserta una firma como imagen en el Excel, centrada y manteniendo relación de aspecto
   */
  private async insertSignature(
    workbook: ExcelJS.Workbook,
    worksheet: ExcelJS.Worksheet,
    signature: Signature,
    row: number,
    col: number,
    mergedRows: number = 1,
    mergedCols: number = 1
  ): Promise<void> {
    try {
      // Convertir base64 a buffer
      const base64Data = signature.dataUrl.replace(/^data:image\/\w+;base64,/, '');
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const buffer = Buffer.from(bytes);

      // Obtener dimensiones originales de la imagen
      const imgDimensions = await this.getImageDimensions(signature.dataUrl);
      const aspectRatio = imgDimensions.width / imgDimensions.height;

      // Constantes de conversión Excel
      const PIXELS_PER_COL_UNIT = 7.5;  // Píxeles por unidad de ancho de columna
      const PIXELS_PER_ROW_POINT = 1.33; // Píxeles por punto de altura de fila

      // DEBUG: Mostrar información de columnas
      console.log(`[Firma ${signature.name}] Celda: col=${col}, row=${row}, mergedCols=${mergedCols}, mergedRows=${mergedRows}`);

      const colWidthsDebug: { col: number; width: number | undefined; pixels: number }[] = [];

      // Calcular tamaño del contenedor en píxeles
      let containerWidth = 0;
      for (let i = 0; i < mergedCols; i++) {
        const colObj = worksheet.getColumn(col + i);
        const width = colObj.width;
        const pixels = (width || 8.43) * PIXELS_PER_COL_UNIT;
        colWidthsDebug.push({ col: col + i, width, pixels });
        containerWidth += pixels;
      }

      console.log(`[Firma ${signature.name}] Columnas:`, colWidthsDebug);
      console.log(`[Firma ${signature.name}] containerWidth=${containerWidth}px`);

      let containerHeight = 0;
      for (let i = 0; i < mergedRows; i++) {
        const rowObj = worksheet.getRow(row + i);
        containerHeight += (rowObj.height || 15) * PIXELS_PER_ROW_POINT;
      }

      console.log(`[Firma ${signature.name}] containerHeight=${containerHeight}px`);

      // Calcular tamaño óptimo manteniendo relación de aspecto
      // Usar 85% del contenedor como máximo para dejar margen
      const maxWidth = containerWidth * 0.85;
      const maxHeight = containerHeight * 0.85;

      let finalWidth: number;
      let finalHeight: number;

      // Ajustar al contenedor manteniendo aspecto
      if (maxWidth / aspectRatio <= maxHeight) {
        // Limitado por ancho
        finalWidth = maxWidth;
        finalHeight = maxWidth / aspectRatio;
      } else {
        // Limitado por alto
        finalHeight = maxHeight;
        finalWidth = maxHeight * aspectRatio;
      }

      console.log(`[Firma ${signature.name}] Imagen: finalWidth=${finalWidth}px, finalHeight=${finalHeight}px`);

      // Calcular offset en EMUs para centrar
      // 1 pixel = 9525 EMUs (a 96 DPI)
      const EMUS_PER_PIXEL = 9525;

      const horizontalPaddingPx = (containerWidth - finalWidth) / 2;
      const verticalPaddingPx = (containerHeight - finalHeight) / 2;

      console.log(`[Firma ${signature.name}] Padding: horizontal=${horizontalPaddingPx}px, vertical=${verticalPaddingPx}px`);

      const colOffEMU = Math.round(horizontalPaddingPx * EMUS_PER_PIXEL);
      const rowOffEMU = Math.round(verticalPaddingPx * EMUS_PER_PIXEL);

      console.log(`[Firma ${signature.name}] EMU offset: col=${colOffEMU}, row=${rowOffEMU}`);

      // Agregar imagen al workbook
      const imageId = workbook.addImage({
        buffer: buffer as any,
        extension: 'png',
      });

      // Posicionar con EMUs para centrado preciso
      worksheet.addImage(imageId, {
        tl: {
          nativeCol: col - 1,
          nativeColOff: colOffEMU,
          nativeRow: row - 1,
          nativeRowOff: rowOffEMU
        } as any,
        ext: { width: finalWidth, height: finalHeight }
      });

    } catch (error) {
      console.error('Error inserting signature:', error);
      // Si falla, insertar texto alternativo
      const cell = worksheet.getCell(row, col);
      cell.value = `[Firma: ${signature.name}]`;
      cell.font = STANDARD_FONT;
    }
  }

}

/**
 * Función helper para descargar el archivo Excel
 */
export function downloadExcelFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
