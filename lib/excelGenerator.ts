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
    signatures: Map<string, Signature>
  ): Promise<Blob> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(originalFileBuffer);

    // Rellenar cada hoja con los datos
    for (const sheetData of formData.sheets) {
      const worksheet = workbook.getWorksheet(sheetData.sheetName);
      if (!worksheet) continue;

      // Rellenar cada sección
      for (const sectionData of sheetData.sections) {
        for (const fieldData of sectionData.fields) {
          if (!fieldData.completed || !fieldData.value) continue;

          // Buscar el field original para obtener cellRef
          const field = this.findFieldById(fieldData.fieldId, formData);
          if (!field) continue;

          // Rellenar la celda
          const cell = worksheet.getCell(field.cellRef);

          if (field.type === 'signature') {
            // Insertar firma como imagen
            const signature = signatures.get(fieldData.value);
            if (signature) {
              await this.insertSignature(
                workbook,
                worksheet,
                signature,
                Number(cell.row),
                Number(cell.col)
              );
            }
          } else if (field.type === 'checkbox') {
            // Marcar checkbox (agregar X o marca)
            if (fieldData.value) {
              cell.value = 'X';
              cell.alignment = { vertical: 'middle', horizontal: 'center' };
            }
          } else if (field.type === 'date') {
            // Formatear fecha
            cell.value = new Date(fieldData.value);
            cell.numFmt = 'dd/mm/yyyy';
          } else if (field.type === 'time') {
            // Formatear hora
            cell.value = fieldData.value;
          } else {
            // Texto o número normal
            cell.value = fieldData.value;
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
