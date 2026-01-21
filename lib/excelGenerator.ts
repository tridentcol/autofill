import * as ExcelJS from 'exceljs';
import { Buffer } from 'buffer';
import type { FormData, Signature } from '@/types';

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

      // Rellenar cada sección
      for (let sectionIndex = 0; sectionIndex < sheetData.sections.length; sectionIndex++) {
        const sectionData = sheetData.sections[sectionIndex];

        for (const fieldData of sectionData.fields) {
          if (!fieldData.completed || fieldData.value === null || fieldData.value === undefined) continue;

          // Buscar el field original
          const field = fieldsMap.get(fieldData.fieldId);
          if (!field) continue;

          if (field.type === 'signature') {
            // Insertar firma como imagen
            const signature = signatures.get(fieldData.value);
            if (signature && field.cellRef) {
              const cell = worksheet.getCell(field.cellRef);
              await this.insertSignature(
                workbook,
                worksheet,
                signature,
                Number(cell.row),
                Number(cell.col)
              );
            }
          } else if (field.type === 'radio') {
            // Para radio buttons (checklistscon SI/NO/N/A)
            // Obtener el mapeo de opciones a celdas
            if (field.validation?.pattern) {
              try {
                const cellRefs = JSON.parse(field.validation.pattern);
                const selectedCellRef = cellRefs[fieldData.value];

                if (selectedCellRef) {
                  const cell = worksheet.getCell(selectedCellRef);
                  cell.value = 'X';
                  cell.alignment = { vertical: 'middle', horizontal: 'center' };
                }
              } catch (e) {
                console.error('Error parsing radio cellRefs:', e);
              }
            }
          } else if (field.type === 'checkbox') {
            // Checkbox individual
            if (fieldData.value && field.cellRef) {
              const cell = worksheet.getCell(field.cellRef);
              cell.value = 'X';
              cell.alignment = { vertical: 'middle', horizontal: 'center' };
            }
          } else if (field.type === 'date') {
            // Formatear fecha
            if (field.cellRef) {
              const cell = worksheet.getCell(field.cellRef);
              cell.value = new Date(fieldData.value);
              cell.numFmt = 'dd/mm/yyyy';
            }
          } else if (field.type === 'time') {
            // Formatear hora
            if (field.cellRef) {
              const cell = worksheet.getCell(field.cellRef);
              cell.value = fieldData.value;
            }
          } else {
            // Texto o número normal
            if (field.cellRef) {
              const cell = worksheet.getCell(field.cellRef);
              cell.value = fieldData.value;
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
   * Inserta una firma como imagen en el Excel
   */
  private async insertSignature(
    workbook: ExcelJS.Workbook,
    worksheet: ExcelJS.Worksheet,
    signature: Signature,
    row: number,
    col: number
  ): Promise<void> {
    try {
      // Convertir base64 a buffer
      const base64Data = signature.dataUrl.replace(/^data:image\/\w+;base64,/, '');

      // Convertir base64 a ArrayBuffer para ExcelJS
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const buffer = Buffer.from(bytes);

      // Agregar imagen al workbook
      const imageId = workbook.addImage({
        buffer: buffer as any,
        extension: 'png',
      });

      // Calcular posición de la imagen
      // ExcelJS usa coordenadas basadas en celdas
      worksheet.addImage(imageId, {
        tl: { col: col - 1, row: row - 1 }, // top-left
        ext: { width: 150, height: 50 }, // tamaño de la imagen
      });
    } catch (error) {
      console.error('Error inserting signature:', error);
      // Si falla, insertar texto alternativo
      const cell = worksheet.getCell(row, col);
      cell.value = `[Firma: ${signature.name}]`;
    }
  }

  /**
   * Busca un field por su ID en los datos del formulario
   */
  private findFieldById(fieldId: string, formData: FormData): any {
    // Esta es una búsqueda simplificada
    // En producción, deberíamos tener un mapa de fields
    // Por ahora, retornamos un objeto con cellRef extraído del ID
    const match = fieldId.match(/[A-Z]+\d+/);
    if (match) {
      return { cellRef: match[0], type: 'text' };
    }
    return null;
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
