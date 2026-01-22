import type { ExcelFormat, Section, Field } from '@/types';

/**
 * Configuraciones específicas para formatos conocidos
 * Estas configuraciones tienen prioridad sobre el parser automático
 */

export const FORMAT_CONFIGS: Record<string, (worksheetData?: any) => Section[]> = {
  'inspeccion-herramientas': (worksheetData?: any) => {
    const sections: Section[] = [];

    // 1. INFORMACIÓN BÁSICA (Header)
    sections.push({
      id: 'basic_info',
      type: 'basic_info',
      title: 'Información Básica',
      fields: [
        {
          id: 'basic_A5',
          label: 'REALIZADO POR',
          type: 'text',
          cellRef: 'A5',
          row: 5,
          col: 1,
          required: true,
        },
        {
          id: 'basic_A6',
          label: 'CARGO',
          type: 'text',
          cellRef: 'A6',
          row: 6,
          col: 1,
          required: true,
        },
        {
          id: 'basic_F5',
          label: 'LUGAR ZONA DE TRABAJO',
          type: 'text',
          cellRef: 'F5',
          row: 5,
          col: 6,
          required: true,
        },
        {
          id: 'basic_F6',
          label: 'FECHA',
          type: 'date',
          cellRef: 'F6',
          row: 6,
          col: 6,
          required: true,
        },
      ],
      startRow: 5,
      endRow: 6,
      startCol: 1,
      endCol: 12,
    });

    // 2. CHECKLIST DE HERRAMIENTAS (Filas 10-38)
    const herramientas = [
      'Agarradoras para cable',
      'Alicate aislado',
      'Barreton- Barra punta',
      'Candados',
      'Cavador (hoyadoras/paladraga)',
      'Cizalla con mangos aislados',
      'Cuchilla de exacto',
      'Cuerda de nylon',
      'Destornilladores estriados aislado',
      'Destornilladores pala aislado',
      'Diferencial tipo señorita (guaya o cadena)',
      'Flexometro',
      'Macho solo boca recta - pinza de presion',
      'Linterna de mano',
      'Llave de expansion',
      'Llave tipo Rachet',
      'Llaves mixta (corona y boca)',
      'Lima plana',
      'Machete o Rula',
      'Martillo mango aislado',
      'Pala cuadrada',
      'Segueta con marco aislado con hojas',
      'Zunchadora',
      'Pinza voltiamperimetrica',
      'Coratafrios',
      'Escalera dielectrica de dos cuerpos',
      'Escalera tipo tijera',
      'Conos de seguridad',
      'Rollo de cinta de seguridad para demarcar',
    ];

    const checklistFields: Field[] = [];

    herramientas.forEach((herramienta, index) => {
      const row = 10 + index;

      // Campo radio para SI/NO/N/A
      checklistFields.push({
        id: `item_${row}`,
        label: herramienta,
        type: 'radio',
        cellRef: `F${row}`,
        row: row,
        col: 2,
        required: false,
        options: ['SI', 'NO', 'N/A'],
        validation: {
          pattern: JSON.stringify({
            SI: `F${row}`,
            NO: `G${row}`,
            'N/A': `H${row}`,
          }),
        },
      });

      // Campo de observaciones para esta herramienta
      checklistFields.push({
        id: `obs_I${row}`,
        label: 'Observaciones',
        type: 'textarea',
        cellRef: `I${row}`,
        row: row,
        col: 9,
        required: false,
      });
    });

    sections.push({
      id: 'checklist',
      type: 'checklist',
      title: 'Inspección de Herramientas',
      fields: checklistFields,
      startRow: 10,
      endRow: 38,
      startCol: 2,
      endCol: 12,
    });

    // 3. FIRMA
    sections.push({
      id: 'signatures',
      type: 'signatures',
      title: 'Firma',
      fields: [
        {
          id: 'sig_A39',
          label: 'Firma del Inspector',
          type: 'signature',
          cellRef: 'A39',
          row: 39,
          col: 1,
          required: true,
        },
      ],
      startRow: 39,
      endRow: 40,
      startCol: 1,
      endCol: 12,
    });

    // 4. OBSERVACIONES GENERALES
    sections.push({
      id: 'observations',
      type: 'observations',
      title: 'Observaciones Generales',
      fields: [
        {
          id: 'obs_general_A42',
          label: 'Observaciones Generales',
          type: 'textarea',
          cellRef: 'A42',
          row: 42,
          col: 1,
          required: false,
        },
      ],
      startRow: 41,
      endRow: 47,
      startCol: 1,
      endCol: 12,
    });

    return sections;
  },

  // Aquí se pueden agregar configuraciones para otros formatos
  'inspeccion-vehiculo': (worksheetData?: any) => {
    // TODO: Implementar configuración específica para inspección de vehículos
    return [];
  },

  'permiso-trabajo': (worksheetData?: any) => {
    // TODO: Implementar configuración específica para permiso de trabajo
    return [];
  },

  'ats': (worksheetData?: any) => {
    // TODO: Implementar configuración específica para ATS
    return [];
  },

  'inspeccion-grua': (worksheetData?: any) => {
    // TODO: Implementar configuración específica para inspección de grúa
    return [];
  },
};

/**
 * Obtiene la configuración específica para un formato si existe
 */
export function getFormatConfig(formatId: string): ((worksheetData?: any) => Section[]) | null {
  return FORMAT_CONFIGS[formatId] || null;
}
