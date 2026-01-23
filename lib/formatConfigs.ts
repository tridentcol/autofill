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

    // PASO 1: FECHA DE DILIGENCIAMIENTO (Fila 6)
    // Formato calendario con zona horaria Colombia (UTC-5)
    // Auto-completado con fecha/hora actual, hora por defecto 7:00 AM
    const now = new Date();
    const colombiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }));

    sections.push({
      id: 'fecha_diligenciamiento',
      type: 'basic_info',
      title: 'Paso 1: Fecha de Diligenciamiento',
      fields: [
        {
          id: 'fecha_dia',
          label: 'Día',
          type: 'number',
          cellRef: 'F6',
          row: 6,
          col: 6,
          required: true,
          value: colombiaTime.getDate()
        },
        {
          id: 'fecha_mes',
          label: 'Mes',
          type: 'number',
          cellRef: 'G6',
          row: 6,
          col: 7,
          required: true,
          value: colombiaTime.getMonth() + 1
        },
        {
          id: 'fecha_año',
          label: 'Año',
          type: 'number',
          cellRef: 'H6',
          row: 6,
          col: 8,
          required: true,
          value: colombiaTime.getFullYear()
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
    // 11 riesgos específicos + 1 campo "Otro"
    // Una sola firma de responsable se aplica a todas las 12 filas (Q9:Q19)
    const riesgosFields: Field[] = [];
    const riesgos = [
      '1. Tropezón o caída a nivel de suelo',
      '2. Caída a distinto nivel: fractura, traumatismo, conmociones y muerte',
      '3. Electrocución. Manipulación de líneas, herramientas y equipos',
      '4. Quemaduras: explosión o incendio',
      '5. Caída de objetos: Heridas, Fracturas, contusiones',
      '6. Esfuerzo: manipulación manual de cargas',
      '7. Heridas laceraciones perforaciones por herramientas',
      '8. Cambios de temperatura: frío o calor',
      '9. Accidentes de tránsito atropellamiento',
      '10. Biológico: Mordeduras, picaduras',
      '11. Otro (Describa):',
    ];

    // Campo de texto para el riesgo "Otro"
    riesgosFields.push({
      id: 'riesgo_otro_descripcion',
      label: 'Descripción del otro riesgo',
      type: 'text',
      cellRef: 'I19',
      row: 19,
      col: 9,
      required: false
    });

    // Una sola firma que se aplica a todas las filas (Q9:Q19)
    riesgosFields.push({
      id: 'riesgo_responsable',
      label: 'Responsable de la evaluación de riesgos',
      type: 'signature',
      cellRef: 'Q9',
      row: 9,
      col: 17,
      required: true,
      validation: {
        applyToAll: true, // Esta firma se replica en Q9, Q10, Q11... hasta Q19
      }
    });

    sections.push({
      id: 'evaluacion_riesgos',
      type: 'table',
      title: 'Paso 2: Evaluación de Riesgos y Controles',
      fields: riesgosFields,
      startRow: 9,
      endRow: 19,
      startCol: 2,
      endCol: 20,
    });

    // PASO 3: TRABAJADORES (Filas 22-25)
    // Sistema de base de datos con cuadrillas predefinidas
    // TODO: Implementar base de datos con las siguientes cuadrillas:
    // CUAD1: Carlos Guzmán (Conductor, CC 1143359194), Kleiver Polo (Técnico, CC 9288327)
    // CUAD61: Luis Hernández (Conductor), Jefferson Genes (Técnico, CC 1050967799)
    // CUAD64: Andrés Puello (Conductor, CC 1050963621), Juan Carlos Romero (Técnico, CC 73228082), Leonardo Torres (Supervisor, CC 1124034299)
    // CUAD65: Joseph Puello (Conductor, CC 9298718), Remberto Martínez (Técnico, CC 1047425281)
    //
    // Supervisores adicionales:
    // - Antonio Cabarcas - Asistente técnico
    // - Deivi Zabaleta - Coordinador de zona
    // - Leonardo Torres - Supervisor de cuadrilla
    //
    // Sistema de permisos:
    // - Usuario ADMIN: puede editar/agregar/eliminar trabajadores en la base de datos
    // - Usuario REGULAR: solo puede ver y seleccionar trabajadores existentes para llenar formularios
    // - Cada persona debe tener parámetro para asignar firma
    // - Firma inicial = nombre de la persona

    const trabajadoresFields: Field[] = [];

    // Selector de cuadrilla (dropdown principal)
    trabajadoresFields.push({
      id: 'cuadrilla_select',
      label: 'Seleccionar Cuadrilla',
      type: 'select',
      cellRef: 'B21', // Fila antes de la tabla de trabajadores
      row: 21,
      col: 2,
      required: false,
      options: ['CUAD1', 'CUAD61', 'CUAD64', 'CUAD65', 'Manual'],
      group: 'cuadrilla_selector'
    });

    // Campos para cada trabajador (hasta 4)
    for (let i = 0; i < 4; i++) {
      const row = 22 + i;
      trabajadoresFields.push(
        {
          id: `trabajador${i+1}_nombre`,
          label: `Trabajador ${i+1} - Nombre Completo`,
          type: 'select', // Será dropdown desde base de datos
          cellRef: `B${row}`,
          row,
          col: 2,
          required: i === 0, // Primer trabajador obligatorio
          options: [], // Se llenará desde la base de datos
          group: 'trabajadores_tabla'
        },
        {
          id: `trabajador${i+1}_cargo`,
          label: `Trabajador ${i+1} - Cargo`,
          type: 'text', // Se auto-completa al seleccionar trabajador
          cellRef: `F${row}`,
          row,
          col: 6,
          required: false,
          group: 'trabajadores_tabla'
        },
        {
          id: `trabajador${i+1}_cedula`,
          label: `Trabajador ${i+1} - Cédula`,
          type: 'text', // Se auto-completa al seleccionar trabajador
          cellRef: `J${row}`,
          row,
          col: 10,
          required: false,
          group: 'trabajadores_tabla'
        },
        {
          id: `trabajador${i+1}_firma`,
          label: `Trabajador ${i+1} - Firma`,
          type: 'signature', // Se auto-completa al seleccionar trabajador
          cellRef: `N${row}`,
          row,
          col: 14,
          required: false,
          group: 'trabajadores_tabla'
        }
      );
    }

    sections.push({
      id: 'trabajadores',
      type: 'worker_list',
      title: 'Paso 3: Trabajadores',
      fields: trabajadoresFields,
      startRow: 21,
      endRow: 25,
      startCol: 2,
      endCol: 20,
    });

    // PASO 4: ACTIVIDAD Y ALTURA (Filas 26-28)
    sections.push({
      id: 'actividad_altura',
      type: 'basic_info',
      title: 'Paso 4: Actividad y Altura',
      fields: [
        { id: 'actividad_ejecutar', label: 'Actividad a Ejecutar', type: 'textarea', cellRef: 'B26', row: 26, col: 2, required: true },
        { id: 'altura_aproximada', label: 'Altura Aproximada (metros)', type: 'text', cellRef: 'B28', row: 28, col: 2, required: false },
      ],
      startRow: 26,
      endRow: 28,
      startCol: 2,
      endCol: 20,
    });

    // PASO 5: PERÍODO DE VALIDEZ (Fila 29)
    // Botones de turno para auto-completar horarios:
    // - Turno Mañana: 7:00 AM - 3:00 PM
    // - Turno Noche: 3:00 PM - 11:00 PM
    // Separar claramente DESDE y HASTA

    // Botones de selección de turno (UI helper)
    const turnoButtons = {
      manana: { desde: '07:00', hasta: '15:00' },
      noche: { desde: '15:00', hasta: '23:00' }
    };

    sections.push({
      id: 'periodo_validez',
      type: 'basic_info',
      title: 'Paso 5: Período de Validez',
      fields: [
        // Selector de turno (helper UI, no va al Excel)
        {
          id: 'turno_select',
          label: 'Seleccionar Turno',
          type: 'radio',
          cellRef: 'B28', // Fila antes del período
          row: 28,
          col: 2,
          required: false,
          options: ['Turno Mañana (7:00 AM - 3:00 PM)', 'Turno Noche (3:00 PM - 11:00 PM)', 'Personalizado'],
          group: 'turno_selector'
        },
        // DESDE
        {
          id: 'desde_dia',
          label: 'Desde - Día',
          type: 'number',
          cellRef: 'F29',
          row: 29,
          col: 6,
          required: true,
          value: colombiaTime.getDate(),
          group: 'desde'
        },
        {
          id: 'desde_mes',
          label: 'Desde - Mes',
          type: 'number',
          cellRef: 'G29',
          row: 29,
          col: 7,
          required: true,
          value: colombiaTime.getMonth() + 1,
          group: 'desde'
        },
        {
          id: 'desde_año',
          label: 'Desde - Año',
          type: 'number',
          cellRef: 'H29',
          row: 29,
          col: 8,
          required: true,
          value: colombiaTime.getFullYear(),
          group: 'desde'
        },
        {
          id: 'desde_hora',
          label: 'Desde - Hora',
          type: 'time',
          cellRef: 'J29',
          row: 29,
          col: 10,
          required: true,
          value: '07:00',
          group: 'desde'
        },
        // HASTA
        {
          id: 'hasta_dia',
          label: 'Hasta - Día',
          type: 'number',
          cellRef: 'P29',
          row: 29,
          col: 16,
          required: true,
          value: colombiaTime.getDate(),
          group: 'hasta'
        },
        {
          id: 'hasta_mes',
          label: 'Hasta - Mes',
          type: 'number',
          cellRef: 'Q29',
          row: 29,
          col: 17,
          required: true,
          value: colombiaTime.getMonth() + 1,
          group: 'hasta'
        },
        {
          id: 'hasta_año',
          label: 'Hasta - Año',
          type: 'number',
          cellRef: 'R29',
          row: 29,
          col: 18,
          required: true,
          value: colombiaTime.getFullYear(),
          group: 'hasta'
        },
        {
          id: 'hasta_hora',
          label: 'Hasta - Hora',
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
    // 10 items con opciones SI/NO/N/A
    const preparacionFields: Field[] = [];
    const preparacionItems = [
      '1°. Se ha instalado señalización preventiva que delimite el área de trabajo.',
      '2°. El área se encuentra limpia y ordenada.',
      '3°. Se ha realizado la inspección preoperacional.',
      '4°. Se cuenta con la autorización para realizar el trabajo.',
      '5°. Se han identificado los riesgos de la actividad.',
      '6°. Se han comunicado los riesgos al personal.',
      '7°. El personal cuenta con la capacitación requerida.',
      '8°. Se cuenta con los elementos de protección personal.',
      '9°. Se cuenta con las herramientas adecuadas.',
      '10°. Los equipos y herramientas a utilizar se encuentran en buen estado.',
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
      title: 'Paso 6: Preparación del Área',
      fields: preparacionFields,
      startRow: 31,
      endRow: 40,
      startCol: 2,
      endCol: 20,
    });

    // PASO 7: SISTEMA DE ACCESO (Fila 43)
    // Checkboxes simples (no SI/NO/N/A, solo marcar/desmarcar)
    sections.push({
      id: 'sistema_acceso',
      type: 'basic_info',
      title: 'Paso 7: Sistema de Acceso para Trabajo en Alturas',
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
    // 24 checkboxes simples distribuidos en 3 columnas + campo "Otro"
    // NO usar radio buttons SI/NO/N/A, solo marcar/desmarcar
    const eppFields: Field[] = [
      // Columna G (8 items)
      { id: 'epp_casco', label: 'Casco de Seguridad con Barbuquejo', type: 'checkbox', cellRef: 'G46', row: 46, col: 7, required: false },
      { id: 'epp_gafas_oscuro', label: 'Gafas de Seguridad Lente Oscuro', type: 'checkbox', cellRef: 'G47', row: 47, col: 7, required: false },
      { id: 'epp_guantes_vaqueta', label: 'Guantes de Vaqueta', type: 'checkbox', cellRef: 'G48', row: 48, col: 7, required: false },
      { id: 'epp_proteccion_auditiva', label: 'Protección Auditiva', type: 'checkbox', cellRef: 'G49', row: 49, col: 7, required: false },
      { id: 'epp_proteccion_respiratoria', label: 'Protección Respiratoria', type: 'checkbox', cellRef: 'G50', row: 50, col: 7, required: false },
      { id: 'epp_botas_puntera', label: 'Botas de Seguridad con Puntera', type: 'checkbox', cellRef: 'G51', row: 51, col: 7, required: false },
      { id: 'epp_botas_dielectricas', label: 'Botas Dieléctricas', type: 'checkbox', cellRef: 'G52', row: 52, col: 7, required: false },
      { id: 'epp_arnes', label: 'Arnés de Cuerpo Completo', type: 'checkbox', cellRef: 'G53', row: 53, col: 7, required: false },

      // Columna M (8 items)
      { id: 'epp_eslinga_absorbedor', label: 'Eslinga con Absorbedor de Impactos', type: 'checkbox', cellRef: 'M46', row: 46, col: 13, required: false },
      { id: 'epp_eslinga_posicionamiento', label: 'Eslinga de Posicionamiento', type: 'checkbox', cellRef: 'M47', row: 47, col: 13, required: false },
      { id: 'epp_delantal', label: 'Delantal o Pechera para Soldadura', type: 'checkbox', cellRef: 'M48', row: 48, col: 13, required: false },
      { id: 'epp_careta', label: 'Careta Esmeriladora', type: 'checkbox', cellRef: 'M49', row: 49, col: 13, required: false },
      { id: 'epp_guantes_dielectricos', label: 'Guantes Dieléctricos', type: 'checkbox', cellRef: 'M50', row: 50, col: 13, required: false },
      { id: 'epp_faja', label: 'Faja Sacrolumbar', type: 'checkbox', cellRef: 'M51', row: 51, col: 13, required: false },
      { id: 'epp_casco_sin_barbuquejo', label: 'Casco de Seguridad sin Barbuquejo', type: 'checkbox', cellRef: 'M52', row: 52, col: 13, required: false },
      { id: 'epp_otro_m53', label: 'Otro', type: 'checkbox', cellRef: 'M53', row: 53, col: 13, required: false },

      // Columna T (8 items)
      { id: 'epp_kit_rescate', label: 'Kit de Rescate', type: 'checkbox', cellRef: 'T46', row: 46, col: 20, required: false },
      { id: 'epp_autorretractil', label: 'Autorretráctil', type: 'checkbox', cellRef: 'T47', row: 47, col: 20, required: false },
      { id: 'epp_silla_suspension', label: 'Silla para Trabajo en Suspensión', type: 'checkbox', cellRef: 'T48', row: 48, col: 20, required: false },
      { id: 'epp_chaleco', label: 'Chaleco Reflectivo/Camisa con Reflectivo', type: 'checkbox', cellRef: 'T49', row: 49, col: 20, required: false },
      { id: 'epp_freno', label: 'Freno o Arrestador de Caída', type: 'checkbox', cellRef: 'T50', row: 50, col: 20, required: false },
      { id: 'epp_gafas_claro', label: 'Gafas de Lente Claro', type: 'checkbox', cellRef: 'T51', row: 51, col: 20, required: false },
      { id: 'epp_linea_vida', label: 'Línea de Vida', type: 'checkbox', cellRef: 'T52', row: 52, col: 20, required: false },
      { id: 'epp_otro_t53', label: 'Otro', type: 'checkbox', cellRef: 'T53', row: 53, col: 20, required: false },

      // Campo de texto para especificar "Otro"
      { id: 'epp_otro_descripcion', label: 'Otro(s) - Especificar', type: 'text', cellRef: 'H53', row: 53, col: 8, required: false },
    ];

    sections.push({
      id: 'epp',
      type: 'checklist',
      title: 'Paso 8: Elementos de Protección Personal (EPP)',
      fields: eppFields,
      startRow: 46,
      endRow: 53,
      startCol: 2,
      endCol: 20,
    });

    // PASO 9: HERRAMIENTAS Y OBSERVACIONES
    sections.push({
      id: 'herramientas_observaciones',
      type: 'observations',
      title: 'Paso 9: Herramientas y Observaciones',
      fields: [
        { id: 'herramientas', label: 'Herramientas a Utilizar', type: 'textarea', cellRef: 'B56', row: 56, col: 2, required: false },
        { id: 'observaciones', label: 'Observaciones', type: 'textarea', cellRef: 'B59', row: 59, col: 2, required: false },
      ],
      startRow: 56,
      endRow: 63,
      startCol: 2,
      endCol: 20,
    });

    // PASO 10: FIRMAS FINALES (Filas 65-67)
    // Filtrado por rol de usuario desde base de datos:
    // - N65: Solo supervisores (Antonio Cabarcas, Deivi Zabaleta, Leonardo Torres)
    // - N66: Solo conductores (Carlos Guzmán, Luis Hernández, Andrés Puello, Joseph Puello)
    // - N67: Solo supervisores
    sections.push({
      id: 'firmas_autorizacion',
      type: 'signatures',
      title: 'Paso 10: Firmas de Autorización',
      fields: [
        {
          id: 'firma_autoriza_trabajo',
          label: 'Autoriza el Trabajo',
          type: 'signature',
          cellRef: 'N65',
          row: 65,
          col: 14,
          required: true,
          validation: {
            pattern: 'supervisor_only' // Solo supervisores
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
            pattern: 'conductor_only' // Solo conductores
          }
        },
        {
          id: 'firma_coordinador_tsa',
          label: 'Coordinador de TSA',
          type: 'signature',
          cellRef: 'N67',
          row: 67,
          col: 14,
          required: true,
          validation: {
            pattern: 'supervisor_only' // Solo supervisores
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
