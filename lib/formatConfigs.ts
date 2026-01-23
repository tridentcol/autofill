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
          validation: {
            mergedRows: 2,   // Filas 39-40 (firma puede sobresalir naturalmente sobre la línea)
            mergedCols: 12,  // A39:L40 tiene 12 columnas (A-L), ancho total: 1116px
          },
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
    const sections: Section[] = [];

    // 1. INFORMACIÓN BÁSICA (Filas 5-8)
    sections.push({
      id: 'basic_info',
      type: 'basic_info',
      title: 'Información Básica del Vehículo',
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
          id: 'basic_A7',
          label: 'MARCA',
          type: 'text',
          cellRef: 'A7',
          row: 7,
          col: 1,
          required: true,
        },
        {
          id: 'basic_D7',
          label: 'LINEA',
          type: 'text',
          cellRef: 'D7',
          row: 7,
          col: 4,
          required: true,
        },
        {
          id: 'basic_A8',
          label: 'FECHA CAMBIO DE ACEITE',
          type: 'date',
          cellRef: 'A8',
          row: 8,
          col: 1,
          required: false,
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
        {
          id: 'basic_J6',
          label: 'KILOMETRAJE ACTUAL',
          type: 'number',
          cellRef: 'J6',
          row: 6,
          col: 10,
          required: true,
        },
        {
          id: 'basic_F7',
          label: 'PLACA',
          type: 'text',
          cellRef: 'F7',
          row: 7,
          col: 6,
          required: true,
        },
        {
          id: 'basic_J7',
          label: 'MODELO',
          type: 'text',
          cellRef: 'J7',
          row: 7,
          col: 10,
          required: true,
        },
        {
          id: 'basic_F8',
          label: 'CAMBIO DE ACEITE KILOMETRAJE',
          type: 'number',
          cellRef: 'F8',
          row: 8,
          col: 6,
          required: false,
        },
      ],
      startRow: 5,
      endRow: 8,
      startCol: 1,
      endCol: 12,
    });

    // 2. CHECKLIST DE INSPECCIÓN
    const checklistFields: Field[] = [];

    // DOCUMENTACION (filas 11-13)
    const documentacion = [
      'TARJETA DE PROPIEDAD',
      'SOAT VIGENTE',
      'REVISION TECNICO MECANICA VIGENTE (SI APLICA)',
    ];

    documentacion.forEach((req, index) => {
      const row = 11 + index;
      checklistFields.push({
        id: `item_${row}`,
        label: req,
        type: 'radio',
        cellRef: `F${row}`,
        row: row,
        col: 2,
        required: false,
        group: 'DOCUMENTACION DEL EQUIPO',
        options: ['SI', 'NO', 'N/A'],
        validation: {
          pattern: JSON.stringify({
            SI: `F${row}`,
            NO: `G${row}`,
            'N/A': `H${row}`,
          }),
        },
      });

      checklistFields.push({
        id: `obs_I${row}`,
        label: 'Observaciones',
        type: 'textarea',
        cellRef: `I${row}`,
        row: row,
        col: 9,
        required: false,
        group: 'DOCUMENTACION DEL EQUIPO',
      });
    });

    // LUCES (filas 14-26)
    const luces = [
      'FAROLA IZQUIERDA',
      'FAROLA DERECHA',
      'EXPLORADORAS',
      'DIRECCIONAL FRONTAL IZQUIERDO',
      'DIRECCIONAL FRONTAL DERECHO',
      'DIRECCIONAL TRASERO IZQUIERDO',
      'DIRECCIONAL TRASERO DERECHO',
      'FRENOS',
      'TERCER STOP',
      'RETROCESO',
      'PARQUEO O ESTACIONAMIENTO',
      'CABIANA INTERIOR',
      'TABLERO DE INSTRUMENTOS',
    ];

    luces.forEach((req, index) => {
      const row = 14 + index;
      checklistFields.push({
        id: `item_${row}`,
        label: req,
        type: 'radio',
        cellRef: `F${row}`,
        row: row,
        col: 2,
        required: false,
        group: 'LUCES',
        options: ['SI', 'NO', 'N/A'],
        validation: {
          pattern: JSON.stringify({
            SI: `F${row}`,
            NO: `G${row}`,
            'N/A': `H${row}`,
          }),
        },
      });

      checklistFields.push({
        id: `obs_I${row}`,
        label: 'Observaciones',
        type: 'textarea',
        cellRef: `I${row}`,
        row: row,
        col: 9,
        required: false,
        group: 'LUCES',
      });
    });

    // NEUMATICOS/LLANTAS (filas 27-31)
    const neumaticos = [
      'FRONTAL IZQUIERDA',
      'FRONTAL DERECHA',
      'TRASERA IZQUIERDA',
      'TRASERA DERECHA',
      'REPUESTO',
    ];

    neumaticos.forEach((req, index) => {
      const row = 27 + index;
      checklistFields.push({
        id: `item_${row}`,
        label: req,
        type: 'radio',
        cellRef: `F${row}`,
        row: row,
        col: 2,
        required: false,
        group: 'NEUMATICOS',
        options: ['SI', 'NO', 'N/A'],
        validation: {
          pattern: JSON.stringify({
            SI: `F${row}`,
            NO: `G${row}`,
            'N/A': `H${row}`,
          }),
        },
      });

      checklistFields.push({
        id: `obs_I${row}`,
        label: 'Observaciones',
        type: 'textarea',
        cellRef: `I${row}`,
        row: row,
        col: 9,
        required: false,
        group: 'NEUMATICOS',
      });
    });

    // VIDRIOS (filas 32-37)
    const vidrios = [
      'PANORAMICO',
      'TRASERO',
      'LATERAL IZQUIERDO  DELANTERO',
      'LATERAL IZQUIERDO  TRASERO',
      'LATERAL DERECHO DELANTERO',
      'LATERAL DERECHO TRASERO',
    ];

    vidrios.forEach((req, index) => {
      const row = 32 + index;
      checklistFields.push({
        id: `item_${row}`,
        label: req,
        type: 'radio',
        cellRef: `F${row}`,
        row: row,
        col: 2,
        required: false,
        group: 'VIDRIOS',
        options: ['SI', 'NO', 'N/A'],
        validation: {
          pattern: JSON.stringify({
            SI: `F${row}`,
            NO: `G${row}`,
            'N/A': `H${row}`,
          }),
        },
      });

      checklistFields.push({
        id: `obs_I${row}`,
        label: 'Observaciones',
        type: 'textarea',
        cellRef: `I${row}`,
        row: row,
        col: 9,
        required: false,
        group: 'VIDRIOS',
      });
    });

    // ESPEJOS (filas 38-41)
    const espejos = [
      'LATERAL IZQUIERDO',
      'LATERAL DERECHO',
      'LUNAS',
      'FRONTAL INTERIOR CABINA',
    ];

    espejos.forEach((req, index) => {
      const row = 38 + index;
      checklistFields.push({
        id: `item_${row}`,
        label: req,
        type: 'radio',
        cellRef: `F${row}`,
        row: row,
        col: 2,
        required: false,
        group: 'ESPEJOS',
        options: ['SI', 'NO', 'N/A'],
        validation: {
          pattern: JSON.stringify({
            SI: `F${row}`,
            NO: `G${row}`,
            'N/A': `H${row}`,
          }),
        },
      });

      checklistFields.push({
        id: `obs_I${row}`,
        label: 'Observaciones',
        type: 'textarea',
        cellRef: `I${row}`,
        row: row,
        col: 9,
        required: false,
        group: 'ESPEJOS',
      });
    });

    // GENERAL (filas 42-60)
    const general = [
      'BRAZO MECANICO LIMPIA PARABRISAS',
      'PLUMILLAS O CUCHILLAS LIMPIA PARABRISAS',
      'TAPA COMBUSTIBLE',
      'COJINERIA',
      'PINTURA',
      'PITO',
      'AIRE ACONDICIONADO',
      'RADIO',
      'ELEVAVIDRIOS DELANTEROS',
      'ELEVAVIDRIOS TRASEROS',
      'FRENOS',
      'FRENO DE MANO',
      'GATO',
      'CONOS',
      'EXTINTOR',
      'CRUCETA',
      'LINTERNA DE BATERIAS',
      'BOTIQUIN',
      'CINTURONES DE SEGURIDAD',
    ];

    general.forEach((req, index) => {
      const row = 42 + index;
      checklistFields.push({
        id: `item_${row}`,
        label: req,
        type: 'radio',
        cellRef: `F${row}`,
        row: row,
        col: 2,
        required: false,
        group: 'GENERAL',
        options: ['SI', 'NO', 'N/A'],
        validation: {
          pattern: JSON.stringify({
            SI: `F${row}`,
            NO: `G${row}`,
            'N/A': `H${row}`,
          }),
        },
      });

      checklistFields.push({
        id: `obs_I${row}`,
        label: 'Observaciones',
        type: 'textarea',
        cellRef: `I${row}`,
        row: row,
        col: 9,
        required: false,
        group: 'GENERAL',
      });
    });

    sections.push({
      id: 'checklist',
      type: 'checklist',
      title: 'Inspección del Vehículo',
      fields: checklistFields,
      startRow: 11,
      endRow: 60,
      startCol: 2,
      endCol: 12,
    });

    // 3. OBSERVACIONES GENERALES
    sections.push({
      id: 'observations',
      type: 'observations',
      title: 'Observaciones Generales',
      fields: [
        {
          id: 'obs_general_A63',
          label: 'Observaciones Generales',
          type: 'textarea',
          cellRef: 'A63',
          row: 63,
          col: 1,
          required: false,
        },
      ],
      startRow: 62,
      endRow: 63,
      startCol: 1,
      endCol: 12,
    });

    return sections;
  },

  'permiso-trabajo': (worksheetData?: any) => {
    const sections: Section[] = [];

    // 1. FECHA, HORA Y LUGAR (Fila 6)
    sections.push({
      id: 'fecha_hora_lugar',
      type: 'basic_info',
      title: 'Fecha, Hora y Lugar',
      fields: [
        { id: 'fecha_dia', label: 'Día', type: 'text', cellRef: 'F6', row: 6, col: 6, required: true },
        { id: 'fecha_mes', label: 'Mes', type: 'text', cellRef: 'G6', row: 6, col: 7, required: true },
        { id: 'fecha_año', label: 'Año', type: 'text', cellRef: 'H6', row: 6, col: 8, required: true },
        { id: 'hora', label: 'Hora', type: 'time', cellRef: 'J6', row: 6, col: 10, required: true },
        { id: 'lugar', label: 'Lugar', type: 'text', cellRef: 'P6', row: 6, col: 16, required: true },
      ],
      startRow: 6,
      endRow: 6,
      startCol: 2,
      endCol: 20,
    });

    // 2. TRABAJADORES (Filas 22-25) - hasta 4 trabajadores
    const trabajadoresFields: Field[] = [];
    for (let i = 0; i < 4; i++) {
      const row = 22 + i;
      trabajadoresFields.push(
        { id: `trabajador${i+1}_nombre`, label: `Trabajador ${i+1} - Nombre`, type: 'text', cellRef: `B${row}`, row, col: 2, required: i === 0 },
        { id: `trabajador${i+1}_cargo`, label: `Trabajador ${i+1} - Cargo`, type: 'text', cellRef: `F${row}`, row, col: 6, required: false },
        { id: `trabajador${i+1}_cedula`, label: `Trabajador ${i+1} - Cédula`, type: 'text', cellRef: `J${row}`, row, col: 10, required: false },
        { id: `trabajador${i+1}_firma`, label: `Trabajador ${i+1} - Firma`, type: 'signature', cellRef: `N${row}`, row, col: 14, required: false }
      );
    }
    sections.push({
      id: 'trabajadores',
      type: 'table',
      title: 'Trabajadores',
      fields: trabajadoresFields,
      startRow: 22,
      endRow: 25,
      startCol: 2,
      endCol: 20,
    });

    // 3. ACTIVIDAD Y ALTURA (Filas 26-28)
    sections.push({
      id: 'actividad_altura',
      type: 'basic_info',
      title: 'Actividad y Altura',
      fields: [
        { id: 'actividad', label: 'Actividad a Ejecutar', type: 'textarea', cellRef: 'B26', row: 26, col: 2, required: true },
        { id: 'altura', label: 'Altura Aproximada', type: 'text', cellRef: 'B28', row: 28, col: 2, required: false },
      ],
      startRow: 26,
      endRow: 28,
      startCol: 2,
      endCol: 20,
    });

    // 4. VÁLIDO DESDE/HASTA (Fila 29)
    sections.push({
      id: 'validez',
      type: 'basic_info',
      title: 'Período de Validez',
      fields: [
        { id: 'desde_dia', label: 'Desde - Día', type: 'text', cellRef: 'F29', row: 29, col: 6, required: true },
        { id: 'desde_mes', label: 'Desde - Mes', type: 'text', cellRef: 'G29', row: 29, col: 7, required: true },
        { id: 'desde_año', label: 'Desde - Año', type: 'text', cellRef: 'H29', row: 29, col: 8, required: true },
        { id: 'desde_hora', label: 'Desde - Hora', type: 'time', cellRef: 'J29', row: 29, col: 10, required: true },
        { id: 'hasta_dia', label: 'Hasta - Día', type: 'text', cellRef: 'P29', row: 29, col: 16, required: true },
        { id: 'hasta_mes', label: 'Hasta - Mes', type: 'text', cellRef: 'Q29', row: 29, col: 17, required: true },
        { id: 'hasta_año', label: 'Hasta - Año', type: 'text', cellRef: 'R29', row: 29, col: 18, required: true },
        { id: 'hasta_hora', label: 'Hasta - Hora', type: 'time', cellRef: 'T29', row: 29, col: 20, required: true },
      ],
      startRow: 29,
      endRow: 29,
      startCol: 2,
      endCol: 20,
    });

    // 5. HERRAMIENTAS Y OBSERVACIONES
    sections.push({
      id: 'herramientas_obs',
      type: 'observations',
      title: 'Herramientas y Observaciones',
      fields: [
        { id: 'herramientas', label: 'Herramientas a Utilizar', type: 'textarea', cellRef: 'B56', row: 56, col: 2, required: false },
        { id: 'observaciones', label: 'Observaciones', type: 'textarea', cellRef: 'B59', row: 59, col: 2, required: false },
      ],
      startRow: 56,
      endRow: 63,
      startCol: 2,
      endCol: 20,
    });

    // 6. FIRMAS FINALES (Filas 65-67)
    sections.push({
      id: 'firmas_finales',
      type: 'signatures',
      title: 'Firmas de Autorización',
      fields: [
        { id: 'firma_autoriza', label: 'Autoriza el Trabajo', type: 'signature', cellRef: 'N65', row: 65, col: 14, required: true },
        { id: 'firma_emergencia', label: 'Activa el Plan de Emergencia', type: 'signature', cellRef: 'N66', row: 66, col: 14, required: true },
        { id: 'firma_coordinador', label: 'Coordinador de TSA', type: 'signature', cellRef: 'N67', row: 67, col: 14, required: true },
      ],
      startRow: 65,
      endRow: 67,
      startCol: 14,
      endCol: 20,
    });

    return sections;
  },

  'ats': (worksheetData?: any) => {
    // TODO: Implementar configuración específica para ATS
    return [];
  },

  'inspeccion-grua': (worksheetData?: any) => {
    const sections: Section[] = [];

    // 1. INFORMACIÓN BÁSICA (Filas 6-8)
    sections.push({
      id: 'basic_info',
      type: 'basic_info',
      title: 'Información Básica del Equipo',
      fields: [
        {
          id: 'basic_A6',
          label: 'REALIZADO POR',
          type: 'text',
          cellRef: 'A6',
          row: 6,
          col: 1,
          required: true,
        },
        {
          id: 'basic_A7',
          label: 'CARGO',
          type: 'text',
          cellRef: 'A7',
          row: 7,
          col: 1,
          required: true,
        },
        {
          id: 'basic_A8',
          label: 'KILOMETRAJE ACTUAL',
          type: 'number',
          cellRef: 'A8',
          row: 8,
          col: 1,
          required: true,
        },
        {
          id: 'basic_H7',
          label: 'PLACA',
          type: 'text',
          cellRef: 'H7',
          row: 7,
          col: 8,
          required: true,
        },
        {
          id: 'basic_H8',
          label: 'ULTIMO CAMBIO DE ACEITE FECHA',
          type: 'date',
          cellRef: 'H8',
          row: 8,
          col: 8,
          required: false,
        },
        {
          id: 'basic_I6',
          label: 'MARCA',
          type: 'text',
          cellRef: 'I6',
          row: 6,
          col: 9,
          required: true,
        },
        {
          id: 'basic_I7',
          label: 'MODELO',
          type: 'text',
          cellRef: 'I7',
          row: 7,
          col: 9,
          required: true,
        },
        {
          id: 'basic_P6',
          label: 'LINEA',
          type: 'text',
          cellRef: 'P6',
          row: 6,
          col: 16,
          required: true,
        },
        {
          id: 'basic_P7',
          label: 'FECHA',
          type: 'date',
          cellRef: 'P7',
          row: 7,
          col: 16,
          required: true,
        },
        {
          id: 'basic_O8',
          label: 'KILOMETRAJE CAMBIO DE ACEITE',
          type: 'number',
          cellRef: 'O8',
          row: 8,
          col: 15,
          required: false,
        },
      ],
      startRow: 6,
      endRow: 8,
      startCol: 1,
      endCol: 16,
    });

    // 2. CHECKLIST COLUMNA IZQUIERDA
    const checklistLeftFields: Field[] = [];

    // DOCUMENTACION DEL EQUIPO (filas 11-13)
    const documentacion = [
      'PERMISO DE CIRCULACION AL DIA',
      'REVISION TECNOMECANICA AL DIA',
      'SOAT VIGENTE',
    ];

    documentacion.forEach((req, index) => {
      const row = 11 + index;
      checklistLeftFields.push({
        id: `left_item_${row}`,
        label: req,
        type: 'radio',
        cellRef: `D${row}`,
        row: row,
        col: 2,
        required: false,
        group: 'DOCUMENTACION DEL EQUIPO',
        options: ['SI', 'NO', 'N/A'],
        validation: {
          pattern: JSON.stringify({
            SI: `D${row}`,
            NO: `E${row}`,
            'N/A': `F${row}`,
          }),
        },
      });

      // Observaciones en columna H
      checklistLeftFields.push({
        id: `obs_H${row}`,
        label: 'Observaciones',
        type: 'textarea',
        cellRef: `H${row}`,
        row: row,
        col: 8,
        required: false,
        group: 'DOCUMENTACION DEL EQUIPO',
      });
    });

    // LUCES (filas 17-27)
    const luces = [
      'ALTAS',
      'BAJAS',
      'RETROCESO',
      'LATERAL DERECHA DELANTERA',
      'LATERAL IZQUIERDA DELANTERA',
      'LATERAL DERECHA TRASERA',
      'LATERAL IZQUIERDA TRASERA',
      'FRENO',
      'ESTACIONAMIENTO',
      'CABINA INTERIOR',
      'EMERGENCIA',
    ];

    luces.forEach((req, index) => {
      const row = 17 + index;
      checklistLeftFields.push({
        id: `left_item_${row}`,
        label: req,
        type: 'radio',
        cellRef: `D${row}`,
        row: row,
        col: 2,
        required: false,
        group: 'LUCES',
        options: ['SI', 'NO', 'N/A'],
        validation: {
          pattern: JSON.stringify({
            SI: `D${row}`,
            NO: `E${row}`,
            'N/A': `F${row}`,
          }),
        },
      });

      // Observaciones en columna H
      checklistLeftFields.push({
        id: `obs_H${row}`,
        label: 'Observaciones',
        type: 'textarea',
        cellRef: `H${row}`,
        row: row,
        col: 8,
        required: false,
        group: 'LUCES',
      });
    });

    // NEUMATICOS (filas 31-37)
    const neumaticos = [
      'DELANTERO IZQUIERDO',
      'DELANTERO DERECHO',
      'TRASERO INTERNO DERECHO',
      'TRASERO INTERNO IZQUIERDO',
      'TRASERO DERECHO',
      'TRASERO IZQUIERDO',
      'REPUESTOS',
    ];

    neumaticos.forEach((req, index) => {
      const row = 31 + index;
      checklistLeftFields.push({
        id: `left_item_${row}`,
        label: req,
        type: 'radio',
        cellRef: `D${row}`,
        row: row,
        col: 2,
        required: false,
        group: 'NEUMATICOS',
        options: ['SI', 'NO', 'N/A'],
        validation: {
          pattern: JSON.stringify({
            SI: `D${row}`,
            NO: `E${row}`,
            'N/A': `F${row}`,
          }),
        },
      });

      // Observaciones en columna H
      checklistLeftFields.push({
        id: `obs_H${row}`,
        label: 'Observaciones',
        type: 'textarea',
        cellRef: `H${row}`,
        row: row,
        col: 8,
        required: false,
        group: 'NEUMATICOS',
      });
    });

    // ESPEJOS (filas 43-45)
    const espejos = [
      'LATERAL IZQUIERDO',
      'LATERAL DERECHO',
      'FRONTAL CABINA',
    ];

    espejos.forEach((req, index) => {
      const row = 43 + index;
      checklistLeftFields.push({
        id: `left_item_${row}`,
        label: req,
        type: 'radio',
        cellRef: `D${row}`,
        row: row,
        col: 2,
        required: false,
        group: 'ESPEJOS',
        options: ['SI', 'NO', 'N/A'],
        validation: {
          pattern: JSON.stringify({
            SI: `D${row}`,
            NO: `E${row}`,
            'N/A': `F${row}`,
          }),
        },
      });

      // Observaciones en columna H
      checklistLeftFields.push({
        id: `obs_H${row}`,
        label: 'Observaciones',
        type: 'textarea',
        cellRef: `H${row}`,
        row: row,
        col: 8,
        required: false,
        group: 'ESPEJOS',
      });
    });

    sections.push({
      id: 'checklist_left',
      type: 'checklist',
      title: 'Inspección - Parte 1',
      fields: checklistLeftFields,
      startRow: 11,
      endRow: 45,
      startCol: 1,
      endCol: 8,
    });

    // 3. CHECKLIST COLUMNA DERECHA
    const checklistRightFields: Field[] = [];

    // OPERADOR (filas 11-13)
    const operador = [
      'LICENCIA MUNICIPAL',
      'CURSO DE OPERADOR',
      'LICENCIA INTERNA',
    ];

    operador.forEach((req, index) => {
      const row = 11 + index;
      checklistRightFields.push({
        id: `right_item_${row}`,
        label: req,
        type: 'radio',
        cellRef: `L${row}`,
        row: row,
        col: 10,
        required: false,
        group: 'OPERADOR',
        options: ['SI', 'NO', 'N/A'],
        validation: {
          pattern: JSON.stringify({
            SI: `L${row}`,
            NO: `M${row}`,
            'N/A': `N${row}`,
          }),
        },
      });

      // Observaciones en columna P
      checklistRightFields.push({
        id: `obs_P${row}`,
        label: 'Observaciones',
        type: 'textarea',
        cellRef: `P${row}`,
        row: row,
        col: 16,
        required: false,
        group: 'OPERADOR',
      });
    });

    // ACCESORIO Y SEGURIDAD (filas 17-25)
    const accesorios = [
      'EXTINTOR',
      'BOTIQUIN',
      'CONOS',
      'BOCINA',
      'SIRENA',
      'ESCALERAS',
      'INDICADOR DE CAPACIDAD',
      'CORTACORRIENTES',
      'SISTEMA DE COMUNICACIÓN O RADIO',
    ];

    accesorios.forEach((req, index) => {
      const row = 17 + index;
      checklistRightFields.push({
        id: `right_item_${row}`,
        label: req,
        type: 'radio',
        cellRef: `L${row}`,
        row: row,
        col: 10,
        required: false,
        group: 'ACCESORIO Y SEGURIDAD',
        options: ['SI', 'NO', 'N/A'],
        validation: {
          pattern: JSON.stringify({
            SI: `L${row}`,
            NO: `M${row}`,
            'N/A': `N${row}`,
          }),
        },
      });

      // Observaciones en columna P
      checklistRightFields.push({
        id: `obs_P${row}`,
        label: 'Observaciones',
        type: 'textarea',
        cellRef: `P${row}`,
        row: row,
        col: 16,
        required: false,
        group: 'ACCESORIO Y SEGURIDAD',
      });
    });

    // GENERAL (filas 31-39)
    const general = [
      'ESTABILIZADORES',
      'BRAZO GIRATORIO',
      'ESCALERA DE ACCESO',
      'SISTEMA OPERACIONAL',
      'CANASTA',
      'POLEAS',
      'CABLES',
      'GANCHOS',
      'SEGURO GANCHOS',
    ];

    general.forEach((req, index) => {
      const row = 31 + index;
      checklistRightFields.push({
        id: `right_item_${row}`,
        label: req,
        type: 'radio',
        cellRef: `L${row}`,
        row: row,
        col: 10,
        required: false,
        group: 'GENERAL',
        options: ['SI', 'NO', 'N/A'],
        validation: {
          pattern: JSON.stringify({
            SI: `L${row}`,
            NO: `M${row}`,
            'N/A': `N${row}`,
          }),
        },
      });

      // Observaciones en columna P
      checklistRightFields.push({
        id: `obs_P${row}`,
        label: 'Observaciones',
        type: 'textarea',
        cellRef: `P${row}`,
        row: row,
        col: 16,
        required: false,
        group: 'GENERAL',
      });
    });

    // VIDRIOS (filas 43-47)
    const vidrios = [
      'PARABRISAS',
      'IZQUIERDO',
      'DERECHO',
      'LUNETAS',
      'TRASERO',
    ];

    vidrios.forEach((req, index) => {
      const row = 43 + index;
      checklistRightFields.push({
        id: `right_item_${row}`,
        label: req,
        type: 'radio',
        cellRef: `L${row}`,
        row: row,
        col: 10,
        required: false,
        group: 'VIDRIOS',
        options: ['SI', 'NO', 'N/A'],
        validation: {
          pattern: JSON.stringify({
            SI: `L${row}`,
            NO: `M${row}`,
            'N/A': `N${row}`,
          }),
        },
      });

      // Observaciones en columna P
      checklistRightFields.push({
        id: `obs_P${row}`,
        label: 'Observaciones',
        type: 'textarea',
        cellRef: `P${row}`,
        row: row,
        col: 16,
        required: false,
        group: 'VIDRIOS',
      });
    });

    sections.push({
      id: 'checklist_right',
      type: 'checklist',
      title: 'Inspección - Parte 2',
      fields: checklistRightFields,
      startRow: 11,
      endRow: 47,
      startCol: 9,
      endCol: 16,
    });

    // 4. FIRMA ÚNICA (Se aplicará a todas las firmas)
    sections.push({
      id: 'signatures',
      type: 'signatures',
      title: 'Firma del Inspector',
      fields: [
        {
          id: 'sig_G11',
          label: 'Firma (se aplicará a todos los espacios)',
          type: 'signature',
          cellRef: 'G11',
          row: 11,
          col: 7,
          required: true,
          validation: {
            mergedRows: 3,
            applyToAll: true, // Nueva propiedad para indicar que se replica
          },
        },
      ],
      startRow: 48,
      endRow: 48,
      startCol: 1,
      endCol: 16,
    });

    return sections;
  },
};

/**
 * Obtiene la configuración específica para un formato si existe
 */
export function getFormatConfig(formatId: string): ((worksheetData?: any) => Section[]) | null {
  return FORMAT_CONFIGS[formatId] || null;
}
