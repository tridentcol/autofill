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
            if (signature) {
              // Si applyToAll es true, replicar en todas las ubicaciones de firma
              if (field.validation?.applyToAll) {
                // Ubicaciones de firma para formato grúa: columna G y O
                const firmaLocations = [
                  { cellRef: 'G11', mergedRows: 3 },  // DOCUMENTACION
                  { cellRef: 'G17', mergedRows: 11 }, // LUCES
                  { cellRef: 'G31', mergedRows: 7 },  // NEUMATICOS
                  { cellRef: 'G43', mergedRows: 3 },  // ESPEJOS
                  { cellRef: 'O11', mergedRows: 3 },  // OPERADOR
                  { cellRef: 'O17', mergedRows: 9 },  // ACCESORIO Y SEGURIDAD
                  { cellRef: 'O31', mergedRows: 9 },  // GENERAL
                  { cellRef: 'O43', mergedRows: 5 },  // VIDRIOS
                ];

                for (const location of firmaLocations) {
                  const cell = worksheet.getCell(location.cellRef);
                  await this.insertSignature(
                    workbook,
                    worksheet,
                    signature,
                    Number(cell.row),
                    Number(cell.col),
                    location.mergedRows,
                    1  // Una sola columna para formato grúa
                  );
                }
              } else if (field.cellRef) {
                // Firma individual
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
    col: number,
    mergedRows: number = 1,
    mergedCols: number = 1
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

      // Determinar dimensiones según el tipo de celda
      let imgWidth: number;
      let imgHeight: number;
      let columnWidth: number;

      if (mergedCols > 1) {
        // Firma en múltiples columnas (Herramientas y Equipos: A-L)
        // Ancho total del área: 1116 píxeles
        columnWidth = 1116;

        // Tamaño de referencia para área multi-columna
        // Usar dimensiones proporcionales al contenedor
        imgWidth = 348;  // ~9.2cm a 37.8px/cm
        imgHeight = imgWidth / aspectRatio;

        // Limitar altura máxima
        const maxHeight = 80;  // ~2.1cm
        if (imgHeight > maxHeight) {
          imgHeight = maxHeight;
          imgWidth = imgHeight * aspectRatio;
        }
      } else if (col === 7) {
        // Columna G (355px de ancho)
        // Referencias: 6.26cm x 1.44cm = 237px x 54px
        columnWidth = 355;
        imgWidth = 237;
        imgHeight = imgWidth / aspectRatio;

        const maxHeight = 54;
        if (imgHeight > maxHeight) {
          imgHeight = maxHeight;
          imgWidth = imgHeight * aspectRatio;
        }
      } else if (col === 15) {
        // Columna O (341px de ancho)
        // Referencias: 6.02cm x 1.38cm = 228px x 52px
        columnWidth = 341;
        imgWidth = 228;
        imgHeight = imgWidth / aspectRatio;

        const maxHeight = 52;
        if (imgHeight > maxHeight) {
          imgHeight = maxHeight;
          imgWidth = imgHeight * aspectRatio;
        }
      } else {
        // Otras columnas (usar valores por defecto)
        columnWidth = 64;
        imgWidth = 50;
        imgHeight = imgWidth / aspectRatio;
      }

      // Calcular el alto total del contenedor basado en mergedRows para centrado vertical
      let totalHeight = 0;
      for (let i = 0; i < mergedRows; i++) {
        const currentRow = worksheet.getRow(row + i);
        // Altura por defecto en Excel es ~15 puntos = ~20 píxeles
        const rowHeight = currentRow.height || 15;
        totalHeight += rowHeight * 1.33; // Convertir puntos a píxeles (1 punto ≈ 1.33 píxeles)
      }

      // Para firmas en una sola fila, ajustar la altura de la fila para que quepa la imagen
      if (mergedRows === 1) {
        const excelRow = worksheet.getRow(row);
        excelRow.height = Math.max((imgHeight + 10) * 0.75, 15); // Convertir píxeles a puntos, mínimo 15 puntos
        // Recalcular totalHeight después del ajuste
        totalHeight = excelRow.height * 1.33;
      }

      // Calcular offsets para centrar
      const verticalOffset = Math.max((totalHeight - imgHeight) / 2, 0);
      const horizontalOffset = Math.max((columnWidth - imgWidth) / 2, 0);

      // Agregar imagen al workbook
      const imageId = workbook.addImage({
        buffer: buffer as any,
        extension: 'png',
      });

      // Insertar imagen centrada
      worksheet.addImage(imageId, {
        tl: {
          col: col - 1,              // ExcelJS usa índice 0
          colOff: horizontalOffset,  // Centrar horizontalmente
          row: row - 1,              // ExcelJS usa índice 0
          rowOff: verticalOffset     // Centrar verticalmente
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
