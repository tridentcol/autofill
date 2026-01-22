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
              // Mantener el texto original y reemplazar los guiones bajos
              const currentValue = cell.value?.toString() || '';
              const cleanedValue = currentValue.replace(/_+/g, '').trim();
              const dateStr = new Date(fieldData.value).toLocaleDateString('es-ES');
              cell.value = cleanedValue ? `${cleanedValue} ${dateStr}` : dateStr;
            }
          } else if (field.type === 'time') {
            // Formatear hora
            if (field.cellRef) {
              const cell = worksheet.getCell(field.cellRef);
              // Mantener el texto original y reemplazar los guiones bajos
              const currentValue = cell.value?.toString() || '';
              const cleanedValue = currentValue.replace(/_+/g, '').trim();
              cell.value = cleanedValue ? `${cleanedValue} ${fieldData.value}` : fieldData.value;
            }
          } else if (field.type === 'textarea') {
            // Para observaciones, reemplazar completamente
            if (field.cellRef) {
              const cell = worksheet.getCell(field.cellRef);
              cell.value = fieldData.value;
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
              // Mantener el texto original (como "REALIZADO POR:") y agregar el valor después
              const currentValue = cell.value?.toString() || '';
              const cleanedValue = currentValue.replace(/_+/g, '').trim();

              // Si ya tiene texto (como "REALIZADO POR:"), agregar el valor después
              if (cleanedValue && !cleanedValue.includes(fieldData.value)) {
                cell.value = `${cleanedValue} ${fieldData.value}`;
              } else if (!cleanedValue) {
                // Si no hay texto, solo poner el valor
                cell.value = fieldData.value;
              }
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

      // Obtener dimensiones de la imagen desde el dataUrl
      const img = await this.getImageDimensions(signature.dataUrl);
      const aspectRatio = img.width / img.height;

      // Altura máxima deseada para la firma
      const maxHeight = 80;

      // Calcular dimensiones manteniendo la relación de aspecto
      // Empezar con la altura máxima
      let imgHeight = maxHeight;
      let imgWidth = imgHeight * aspectRatio;

      // Ajustar la altura de la fila 39 para que quepa la imagen
      const excelRow = worksheet.getRow(row);
      excelRow.height = imgHeight * 0.75; // Convertir píxeles a puntos (1 punto = ~1.33 píxeles)

      // Agregar imagen al workbook
      const imageId = workbook.addImage({
        buffer: buffer as any,
        extension: 'png',
      });

      // Para centrar entre columnas A (0) y L (11), usar tl y br
      // Calcular cuántas columnas necesitamos para la imagen
      const columnWidth = 64; // Ancho aproximado de columna en píxeles
      const totalColumns = 12; // A hasta L
      const totalWidth = totalColumns * columnWidth;

      // Calcular posición de inicio para centrar
      const startOffset = (totalWidth - imgWidth) / 2;
      const startCol = Math.floor(startOffset / columnWidth);
      const colOffset = startOffset % columnWidth;

      // ExcelJS soporta colOff/rowOff pero los tipos TypeScript no lo incluyen
      worksheet.addImage(imageId, {
        tl: {
          col: startCol,
          colOff: colOffset,
          row: row - 1,
          rowOff: 5  // Pequeño margen vertical
        } as any,
        ext: { width: imgWidth, height: imgHeight },
        editAs: 'oneCell'
      } as any);
    } catch (error) {
      console.error('Error inserting signature:', error);
      // Si falla, insertar texto alternativo
      const cell = worksheet.getCell(row, col);
      cell.value = `[Firma: ${signature.name}]`;
    }
  }

  /**
   * Obtiene las dimensiones de una imagen desde su dataUrl
   */
  private getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        // Si estamos en el servidor, usar valores por defecto
        resolve({ width: 400, height: 150 });
        return;
      }

      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      img.src = dataUrl;
    });
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
