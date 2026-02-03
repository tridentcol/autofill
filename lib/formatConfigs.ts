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

    // Paso 3 de firma eliminado: la firma se pone automáticamente según la sesión iniciada

    // 3. OBSERVACIONES GENERALES
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

    // Zona horaria Colombia (UTC-5)
    const now = new Date();
    const colombiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
    const colombiaDateStr = colombiaTime.toISOString().split('T')[0];

    // PASO 1: FECHA DE DILIGENCIAMIENTO (Fila 6)
    // FECHA DE DILIGENCIAMIENTO está en B6:E6 (etiqueta)
    // Día: F6, Mes: G6, Año: H6
    // HORA está en I6 (etiqueta), se rellena en J6:K6
    // LUGAR está en M6:O6 (etiqueta), se rellena en P6:T6
    sections.push({
      id: 'fecha_diligenciamiento',
      type: 'basic_info',
      title: 'Fecha de Diligenciamiento',
      fields: [
        {
          id: 'fecha_completa',
          label: 'Fecha',
          type: 'date',
          cellRef: 'F6',
          row: 6,
          col: 6,
          required: true,
          value: colombiaDateStr,
          validation: {
            pattern: 'decompose_date',
            dayCellRef: 'F6',
            monthCellRef: 'G6',
            yearCellRef: 'H6'
          }
        },
        {
          id: 'hora',
          label: 'Hora',
          type: 'time',
          cellRef: 'J6',
          row: 6,
          col: 10,
          required: true,
          value: '07:00'
        },
        {
          id: 'lugar',
          label: 'Lugar/Zona de Trabajo',
          type: 'text',
          cellRef: 'P6',
          row: 6,
          col: 16,
          required: true
        },
      ],
      startRow: 6,
      endRow: 6,
      startCol: 2,
      endCol: 20,
    });

    // PASO 2: EVALUACIÓN DE RIESGOS Y CONTROLES (Filas 9-19)
    // 12 peligros: B9:H9 hasta B19:H19 (descripciones)
    // Medidas: I9:P9 hasta I19:P19
    // Responsable (firma): Q9:T9 hasta Q19:T19 - Se rellena automáticamente desde paso de firmas
    const riesgosFields: Field[] = [];

    // Campo de texto para el riesgo "12. Otro (Describa):" en I19:P19
    riesgosFields.push({
      id: 'riesgo_otro_descripcion',
      label: 'Descripción del otro riesgo (Peligro 12)',
      type: 'text',
      cellRef: 'I19',
      row: 19,
      col: 9,
      required: false
    });

    sections.push({
      id: 'evaluacion_riesgos',
      type: 'table',
      title: 'Evaluación de Riesgos y Controles',
      fields: riesgosFields,
      startRow: 9,
      endRow: 19,
      startCol: 2,
      endCol: 20,
    });

    // PASO 3: TRABAJADORES (Filas 22-25)
    // Fila 21 tiene encabezados, Filas 22-25 son para 4 trabajadores
    // NOMBRE: B#:E#, CARGO: F#:I#, CÉDULA: J#:M#, FIRMA: N#:T#
    const trabajadoresFields: Field[] = [];

    trabajadoresFields.push({
      id: 'cuadrilla_select',
      label: 'Seleccionar Cuadrilla',
      type: 'select',
      cellRef: 'B21',
      row: 21,
      col: 2,
      required: false,
      options: ['CUAD1', 'CUAD61', 'CUAD64', 'CUAD65', 'Manual'],
      group: 'cuadrilla_selector'
    });

    // 4 trabajadores en filas 22, 23, 24, 25
    for (let i = 0; i < 4; i++) {
      const row = 22 + i;
      trabajadoresFields.push(
        {
          id: `trabajador${i+1}_nombre`,
          label: `Trabajador ${i+1} - Nombre Completo`,
          type: 'text',
          cellRef: `B${row}`,
          row,
          col: 2,
          required: i === 0,
          group: 'trabajadores_tabla'
        },
        {
          id: `trabajador${i+1}_cargo`,
          label: `Trabajador ${i+1} - Cargo`,
          type: 'text',
          cellRef: `F${row}`,
          row,
          col: 6,
          required: false,
          group: 'trabajadores_tabla'
        },
        {
          id: `trabajador${i+1}_cedula`,
          label: `Trabajador ${i+1} - Cédula`,
          type: 'text',
          cellRef: `J${row}`,
          row,
          col: 10,
          required: false,
          group: 'trabajadores_tabla'
        },
        {
          id: `trabajador${i+1}_firma`,
          label: `Trabajador ${i+1} - Firma`,
          type: 'signature',
          cellRef: `N${row}`,
          row,
          col: 14,
          required: false,
          group: 'trabajadores_tabla',
          validation: {
            mergedCols: 7,
            pattern: 'tecnico_conductor'
          }
        }
      );
    }

    sections.push({
      id: 'trabajadores',
      type: 'worker_list',
      title: 'Trabajadores',
      fields: trabajadoresFields,
      startRow: 21,
      endRow: 25,
      startCol: 2,
      endCol: 20,
    });

    // PASO 4: ACTIVIDAD Y ALTURA
    // ACTIVIDAD A EJECUTAR: B26:T27 (celda combinada)
    // ALTURA APROXIMADA: B28:T28 (celda combinada)
    sections.push({
      id: 'actividad_altura',
      type: 'basic_info',
      title: 'Actividad y Altura',
      fields: [
        {
          id: 'actividad_ejecutar',
          label: 'Actividad a Ejecutar',
          type: 'textarea',
          cellRef: 'B26',
          row: 26,
          col: 2,
          required: true,
          validation: {
            appendToLabel: true,
            labelText: 'ACTIVIDAD A EJECUTAR:'
          }
        },
        {
          id: 'altura_aproximada',
          label: 'Altura Aproximada',
          type: 'text',
          cellRef: 'B28',
          row: 28,
          col: 2,
          required: false,
          validation: {
            appendToLabel: true,
            labelText: 'ALTURA APROXIMADA A LA CUAL SE VA DESARROLLAR LA ACTIVIDAD SI APLICA:',
            suffix: ' metros'
          }
        },
      ],
      startRow: 26,
      endRow: 28,
      startCol: 2,
      endCol: 20,
    });

    // PASO 5: PERÍODO DE VALIDEZ (Fila 29)
    // VALIDO DESDE: B29:D29 (etiqueta)
    // Día: F29, Mes: G29, Año: H29
    // Hora: J29:L29 (combinada)
    // HASTA: M29:N29 (etiqueta)
    // Día: P29, Mes: Q29, Año: R29
    // Hora: T29
    sections.push({
      id: 'periodo_validez',
      type: 'basic_info',
      title: 'Período de Validez',
      fields: [
        // Nota: turno_select es solo un helper de UI, no se exporta al Excel
        {
          id: 'desde_fecha',
          label: 'Fecha Inicio',
          type: 'date',
          cellRef: 'F29',
          row: 29,
          col: 6,
          required: true,
          value: colombiaDateStr,
          group: 'desde',
          validation: {
            pattern: 'decompose_date',
            dayCellRef: 'F29',
            monthCellRef: 'G29',
            yearCellRef: 'H29'
          }
        },
        {
          id: 'desde_hora',
          label: 'Hora Inicio',
          type: 'time',
          cellRef: 'J29',
          row: 29,
          col: 10,
          required: true,
          value: '07:00',
          group: 'desde'
        },
        {
          id: 'hasta_fecha',
          label: 'Fecha Fin',
          type: 'date',
          cellRef: 'P29',
          row: 29,
          col: 16,
          required: true,
          value: colombiaDateStr,
          group: 'hasta',
          validation: {
            pattern: 'decompose_date',
            dayCellRef: 'P29',
            monthCellRef: 'Q29',
            yearCellRef: 'R29'
          }
        },
        {
          id: 'hasta_hora',
          label: 'Hora Fin',
          type: 'time',
          cellRef: 'T29',
          row: 29,
          col: 20,
          required: true,
          value: '15:00',
          group: 'hasta'
        },
      ],
      startRow: 28,
      endRow: 29,
      startCol: 2,
      endCol: 20,
    });

    // PASO 6: PREPARACIÓN DEL ÁREA (Filas 31-40)
    // Descripción: B#:Q#, SI: R#, NO: S#, N/A: T#
    const preparacionFields: Field[] = [];
    const preparacionItems = [
      'SE HA INSTALADO SEÑALIZACIÓN PREVENTIVA QUE DELIMITE EL ÁREA DE TRABAJO (CINTA, CONOS, SEÑALES TUBULARES O POLISOMBRAS, DE TAL MANERA QUE SE PUEDA AISLAR O RESTRINGIR LA ZONA Y NO SE PERMITA EL PASO DE PERSONAS O VEHÍCULOS AJENOS A LA LABOR) EN CASO DE IZAJE.',
      'EL PERSONAL QUE INTERVIENE PRESENTA AFILIACION A SEGURIDAD SOCIAL.',
      'EL PERSONAL QUE EJECUTA LABORES EN ALTURAS POSEE CERTIFICACION DE TSA',
      'LOS ELEMENTOS DE PROTECCIÓN PERSONAL Y LOS SISTEMAS PROTECCION CONTRA CAIDAS A UTILIZAR EN LA LABOR FUERON INSPECCIONADOS Y SE ENCUENTRAN EN BUENAS CONDICIONES.',
      'SE REQUIERE LA PRESENCIA DE UNA PERSONA DE SEGURIDAD DE LA EMPRESA, UN BRIGADISTA O UN BOMBERO DURANTE LA EJECUCIÓN DE LA LABOR.',
      'LOS TRABAJADORES REVISAN LOS ACCESOS AL ÁREA DE TRABAJO E IDENTIFICAN LAS SALIDAS DE EMERGENCIA SIGUIENDO LAS PAUTAS A TENER EN CUENTA EN CASO DE PRESENTARSE UNA EMERGENCIA.',
      'SE GARANTIZA QUE LAS PERSONAS QUE REALIZARÁN EL DILIGENCIAMIENTO DEL PERMISO Y QUIENES EJECUTARÁN EL TRABAJO CONOCEN LOS EQUIPOS.',
      'SE VERIFICARON LOS PUNTOS DE ANCLAJE A SER UTILIZADOS POR CADA TRABAJADOR DURANTE LA TAREA',
      'EL PERSONAL CUMPLE CON LOS REQUISITOS DE APTITUD PARA REALIZAR LA TAREA',
      'LOS EQUIPOS Y HERRAMIENTAS A UTILIZAR SE ENCUENTRAN EN BUEN ESTADO.',
    ];

    for (let i = 0; i < 10; i++) {
      const row = 31 + i;
      preparacionFields.push({
        id: `preparacion_${i+1}`,
        label: preparacionItems[i],
        type: 'radio',
        cellRef: `R${row}`,
        row,
        col: 18,
        required: true,
        options: ['SI', 'NO', 'N/A'],
        validation: {
          pattern: JSON.stringify({
            'SI': `R${row}`,
            'NO': `S${row}`,
            'N/A': `T${row}`,
          }),
        },
      });
    }

    sections.push({
      id: 'preparacion_area',
      type: 'checklist',
      title: 'Preparación del Área',
      fields: preparacionFields,
      startRow: 31,
      endRow: 40,
      startCol: 2,
      endCol: 20,
    });

    // PASO 7: SISTEMA DE ACCESO (Fila 43)
    // ESCALERA: etiqueta B43:C43, check en D43
    // ANDAMIO: etiqueta E43, check en F43
    // CANASTA GRUA: etiqueta G43:H43, check en I43
    // PLATAFORMAS MOVILES: etiqueta J43:M43, check en N43:O43
    // OTRO: espacio Q43:T43 (texto)
    sections.push({
      id: 'sistema_acceso',
      type: 'basic_info',
      title: 'Sistema de Acceso para Trabajo en Alturas',
      fields: [
        { id: 'acceso_escalera', label: 'Escalera', type: 'checkbox', cellRef: 'D43', row: 43, col: 4, required: false },
        { id: 'acceso_andamio', label: 'Andamio', type: 'checkbox', cellRef: 'F43', row: 43, col: 6, required: false },
        { id: 'acceso_canasta', label: 'Canasta Grúa', type: 'checkbox', cellRef: 'I43', row: 43, col: 9, required: false },
        { id: 'acceso_plataformas', label: 'Plataformas Móviles', type: 'checkbox', cellRef: 'N43', row: 43, col: 14, required: false },
        { id: 'acceso_otro', label: 'Otro (especificar)', type: 'text', cellRef: 'Q43', row: 43, col: 17, required: false },
      ],
      startRow: 43,
      endRow: 43,
      startCol: 2,
      endCol: 20,
    });

    // PASO 8: ELEMENTOS DE PROTECCIÓN PERSONAL - EPP (Filas 46-53)
    // Columna G: checks (etiquetas en B#:F#)
    // Columna M: checks (etiquetas en H#:L#)
    // Columna T: checks (etiquetas en N#:S#)
    // OTRO(S): H53:T53 (texto)
    const eppFields: Field[] = [
      // Columna G - checks
      { id: 'epp_casco', label: 'Casco de Seguridad con Barbuquejo', type: 'checkbox', cellRef: 'G46', row: 46, col: 7, required: false },
      { id: 'epp_gafas_oscuro', label: 'Gafas de Seguridad Lente Oscuro', type: 'checkbox', cellRef: 'G47', row: 47, col: 7, required: false },
      { id: 'epp_guantes_vaqueta', label: 'Guantes de Vaqueta', type: 'checkbox', cellRef: 'G48', row: 48, col: 7, required: false },
      { id: 'epp_proteccion_auditiva', label: 'Protección Auditiva', type: 'checkbox', cellRef: 'G49', row: 49, col: 7, required: false },
      { id: 'epp_proteccion_respiratoria', label: 'Protección Respiratoria', type: 'checkbox', cellRef: 'G50', row: 50, col: 7, required: false },
      { id: 'epp_botas_puntera', label: 'Botas de Seguridad con Puntera', type: 'checkbox', cellRef: 'G51', row: 51, col: 7, required: false },
      { id: 'epp_botas_dielectricas', label: 'Botas Dieléctricas', type: 'checkbox', cellRef: 'G52', row: 52, col: 7, required: false },
      { id: 'epp_arnes', label: 'Arnés de Cuerpo Completo', type: 'checkbox', cellRef: 'G53', row: 53, col: 7, required: false },

      // Columna M - checks
      { id: 'epp_eslinga_absorbedor', label: 'Eslinga con Absorbedor de Impactos', type: 'checkbox', cellRef: 'M46', row: 46, col: 13, required: false },
      { id: 'epp_eslinga_posicionamiento', label: 'Eslinga de Posicionamiento', type: 'checkbox', cellRef: 'M47', row: 47, col: 13, required: false },
      { id: 'epp_delantal', label: 'Delantal o Pechera para Soldadura', type: 'checkbox', cellRef: 'M48', row: 48, col: 13, required: false },
      { id: 'epp_careta', label: 'Careta Esmeriladora', type: 'checkbox', cellRef: 'M49', row: 49, col: 13, required: false },
      { id: 'epp_guantes_dielectricos', label: 'Guantes Dieléctricos', type: 'checkbox', cellRef: 'M50', row: 50, col: 13, required: false },
      { id: 'epp_faja', label: 'Faja Sacrolumbar', type: 'checkbox', cellRef: 'M51', row: 51, col: 13, required: false },
      { id: 'epp_casco_sin_barbuquejo', label: 'Casco de Seguridad sin Barbuquejo', type: 'checkbox', cellRef: 'M52', row: 52, col: 13, required: false },

      // Columna T - checks
      { id: 'epp_kit_rescate', label: 'Kit de Rescate', type: 'checkbox', cellRef: 'T46', row: 46, col: 20, required: false },
      { id: 'epp_autorretractil', label: 'Autorretráctil', type: 'checkbox', cellRef: 'T47', row: 47, col: 20, required: false },
      { id: 'epp_silla_suspension', label: 'Silla para Trabajo en Suspensión', type: 'checkbox', cellRef: 'T48', row: 48, col: 20, required: false },
      { id: 'epp_chaleco', label: 'Chaleco Reflectivo/Camisa con Reflectivo', type: 'checkbox', cellRef: 'T49', row: 49, col: 20, required: false },
      { id: 'epp_freno', label: 'Freno o Arrestador de Caída', type: 'checkbox', cellRef: 'T50', row: 50, col: 20, required: false },
      { id: 'epp_gafas_claro', label: 'Gafas de Lente Claro', type: 'checkbox', cellRef: 'T51', row: 51, col: 20, required: false },
      { id: 'epp_linea_vida', label: 'Línea de Vida', type: 'checkbox', cellRef: 'T52', row: 52, col: 20, required: false },

      // Campo de texto para "OTRO(S)" en H53:T53
      { id: 'epp_otro_descripcion', label: 'Otro(s) - Especificar', type: 'text', cellRef: 'H53', row: 53, col: 8, required: false },
    ];

    sections.push({
      id: 'epp',
      type: 'checklist',
      title: 'Elementos de Protección Personal',
      fields: eppFields,
      startRow: 46,
      endRow: 53,
      startCol: 2,
      endCol: 20,
    });

    // PASO 9: HERRAMIENTAS Y OBSERVACIONES
    // HERRAMIENTAS: B55:T57 (combinada, título en B54)
    // OBSERVACIONES: B59:T63 (combinada, título en B58)
    sections.push({
      id: 'herramientas_observaciones',
      type: 'observations',
      title: 'Herramientas y Observaciones',
      fields: [
        { id: 'herramientas', label: 'Herramientas a Utilizar', type: 'textarea', cellRef: 'B55', row: 55, col: 2, required: false },
        { id: 'observaciones', label: 'Observaciones', type: 'textarea', cellRef: 'B59', row: 59, col: 2, required: false },
      ],
      startRow: 55,
      endRow: 63,
      startCol: 2,
      endCol: 20,
    });

    // PASO 10: FIRMAS FINALES (Filas 65-67)
    // Inspector: Firma unificada que aplica a:
    //   - Q9:T19 (Responsable de controles en evaluación de riesgos)
    //   - N65:T65 (Autoriza el trabajo)
    //   - N67:T67 (Coordinador de TSA)
    // Activa Plan de Emergencia: N66:T66 (solo conductores ayudantes)
    sections.push({
      id: 'firmas_autorizacion',
      type: 'signatures',
      title: 'Firmas de Autorización',
      fields: [
        {
          id: 'firma_inspector',
          label: 'Inspector',
          type: 'signature',
          cellRef: 'N65',
          row: 65,
          col: 14,
          required: true,
          validation: {
            mergedCols: 7,
            pattern: 'supervisor_only',
            applyToMultiple: [
              { cellRef: 'Q', rows: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], mergedCols: 4 },
              { cellRef: 'N65', mergedCols: 7 },
              { cellRef: 'N67', mergedCols: 7 }
            ]
          }
        },
        {
          id: 'firma_plan_emergencia',
          label: 'Activa el Plan de Emergencia',
          type: 'signature',
          cellRef: 'N66',
          row: 66,
          col: 14,
          required: true,
          validation: {
            mergedCols: 7,
            pattern: 'conductor_ayudante'
          }
        },
      ],
      startRow: 65,
      endRow: 67,
      startCol: 14,
      endCol: 20,
    });

    return sections;
  },

  'ats': (worksheetData?: any) => {
    const sections: Section[] = [];

    // Zona horaria Colombia
    const now = new Date();
    const colombiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
    const day = String(colombiaTime.getDate()).padStart(2, '0');
    const month = String(colombiaTime.getMonth() + 1).padStart(2, '0');
    const year = colombiaTime.getFullYear();
    const colombiaDateFormatted = `${day}/${month}/${year}`;

    // 1. INFORMACIÓN BÁSICA DEL TRABAJO (Filas 6-10)
    sections.push({
      id: 'basic_info',
      type: 'basic_info',
      title: 'Información del Trabajo',
      fields: [
        {
          id: 'ubicacion_trabajo',
          label: 'Lugar/Zona de Trabajo', // Este label activa el selector de zonas en FieldRenderer
          type: 'text',
          cellRef: 'G6',
          row: 6,
          col: 7,
          required: true,
        },
        {
          id: 'descripcion_trabajo',
          label: 'Descripción del Trabajo',
          type: 'textarea',
          cellRef: 'G7',
          row: 7,
          col: 7,
          required: true,
        },
        {
          id: 'equipo_elabora',
          label: 'Equipo que Elabora ATS (Cuadrilla)',
          type: 'text', // Se renderiza especial con selector de cuadrilla
          cellRef: 'G8',
          row: 8,
          col: 7,
          required: true,
        },
        {
          id: 'objetivo',
          label: 'Objetivo',
          type: 'textarea',
          cellRef: 'G9',
          row: 9,
          col: 7,
          required: true,
        },
      ],
      startRow: 6,
      endRow: 9,
      startCol: 7,
      endCol: 27,
    });

    // 2. HERRAMIENTAS / EQUIPOS (Fila 10) - con checkboxes
    sections.push({
      id: 'herramientas',
      type: 'basic_info',
      title: 'Herramientas / Equipos',
      fields: [
        {
          id: 'herramientas',
          label: 'Herramientas / Equipos a Utilizar',
          type: 'textarea',
          cellRef: 'G10',
          row: 10,
          col: 7,
          required: true,
        },
      ],
      startRow: 10,
      endRow: 10,
      startCol: 7,
      endCol: 27,
    });

    // 3. ELABORÓ (Filas 57-59) - Autocomplete con usuario actual
    sections.push({
      id: 'elaboro_info',
      type: 'basic_info',
      title: 'Elaborado Por',
      fields: [
        {
          id: 'elaboro_nombre',
          label: 'Elaboró',
          type: 'text',
          cellRef: 'A57',
          row: 57,
          col: 1,
          required: true,
          validation: {
            appendToLabel: true,
            labelText: 'Elaboró:',
          },
        },
        {
          id: 'elaboro_cargo',
          label: 'Cargo',
          type: 'text',
          cellRef: 'A58',
          row: 58,
          col: 1,
          required: true,
          validation: {
            appendToLabel: true,
            labelText: 'Cargo:',
          },
        },
        {
          id: 'elaboro_fecha',
          label: 'Fecha',
          type: 'text', // Texto para mostrar DD/MM/AAAA directamente
          cellRef: 'A59',
          row: 59,
          col: 1,
          required: true,
          value: colombiaDateFormatted,
          validation: {
            appendToLabel: true,
            labelText: 'Fecha:',
          },
        },
      ],
      startRow: 57,
      endRow: 59,
      startCol: 1,
      endCol: 11,
    });

    // 4. REVISO Y APROBO (Nombre del Inspector, no firma) (Filas 57-59, columnas L-AA)
    sections.push({
      id: 'reviso_aprobo',
      type: 'basic_info', // Cambiado de 'signatures' a 'basic_info'
      title: 'Reviso y Aprobó',
      fields: [
        {
          id: 'inspector_nombre',
          label: 'Reviso y Aprobó (Nombre)',
          type: 'text', // Selector especial de inspector
          cellRef: 'L57',
          row: 57,
          col: 12,
          required: true,
          validation: {
            appendToLabel: true,
            labelText: 'Reviso y Aprobó:',
            pattern: 'supervisor_only', // Para filtrar solo supervisores
          },
        },
        {
          id: 'inspector_cargo',
          label: 'Cargo (Inspector)',
          type: 'text',
          cellRef: 'L58',
          row: 58,
          col: 12,
          required: true,
          validation: {
            appendToLabel: true,
            labelText: 'Cargo:',
          },
        },
        {
          id: 'inspector_fecha',
          label: 'Fecha (Inspector)',
          type: 'text', // Texto para mostrar DD/MM/AAAA directamente
          cellRef: 'L59',
          row: 59,
          col: 12,
          required: true,
          value: colombiaDateFormatted,
          validation: {
            appendToLabel: true,
            labelText: 'Fecha:',
          },
        },
      ],
      startRow: 57,
      endRow: 59,
      startCol: 12,
      endCol: 27,
    });

    return sections;
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

    // Paso 4 eliminado: no se usa firma. El nombre "REALIZADO POR" del paso 1
    // se escribe automáticamente en las celdas G11, G17, G31, G43, O11, O17, O31, O43.

    return sections;
  },
};

/**
 * Obtiene la configuración específica para un formato si existe
 */
export function getFormatConfig(formatId: string): ((worksheetData?: any) => Section[]) | null {
  return FORMAT_CONFIGS[formatId] || null;
}
