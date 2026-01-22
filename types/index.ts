// Tipos principales del sistema de autorrellenado

export interface ExcelFormat {
  id: string;
  name: string;
  description: string;
  filePath: string;
  fileType: 'xlsx' | 'xls';
  sheets: SheetStructure[];
  thumbnail?: string;
}

export interface SheetStructure {
  name: string;
  sections: Section[];
  mergedCells: string[];
}

export interface Section {
  id: string;
  type: SectionType;
  title: string;
  fields: Field[];
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
}

export type SectionType =
  | 'header'           // Encabezado del formulario
  | 'basic_info'       // Información básica (nombre, cargo, fecha, etc.)
  | 'checklist'        // Lista de verificación con SI/NO/N/A
  | 'table'            // Tabla con múltiples filas
  | 'signatures'       // Área de firmas
  | 'observations'     // Campo de observaciones/comentarios
  | 'risk_matrix'      // Matriz de riesgos (para ATS)
  | 'worker_list';     // Lista de trabajadores

export interface Field {
  id: string;
  label: string;
  type: FieldType;
  cellRef: string;      // Ej: "B5"
  row: number;
  col: number;
  required: boolean;
  value?: any;
  options?: string[];   // Para campos de selección
  validation?: FieldValidation;
  colspan?: number;     // Si la celda está combinada
  rowspan?: number;
}

export type FieldType =
  | 'text'
  | 'date'
  | 'time'
  | 'number'
  | 'checkbox'          // SI/NO/N/A
  | 'radio'
  | 'signature'
  | 'textarea'
  | 'select'
  | 'file';

export interface FieldValidation {
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  mergedRows?: number; // Para firmas en celdas combinadas verticalmente
  applyToAll?: boolean; // Para replicar la firma en múltiples ubicaciones
}

export interface FormData {
  formatId: string;
  sheets: SheetData[];
  metadata: {
    startedAt: Date;
    completedAt?: Date;
    currentStep: number;
    totalSteps: number;
  };
}

export interface SheetData {
  sheetName: string;
  sections: SectionData[];
}

export interface SectionData {
  sectionId: string;
  fields: FieldData[];
}

export interface FieldData {
  fieldId: string;
  value: any;
  completed: boolean;
}

export interface Signature {
  id: string;
  name: string;
  dataUrl: string;      // Base64 image data
  createdAt: Date;
}

// Preset para información común
export interface UserPreset {
  id: string;
  name: string;
  data: {
    realizadoPor?: string;
    cargo?: string;
    lugarZonaTrabajo?: string;
    [key: string]: any;
  };
  createdAt: Date;
  lastUsed?: Date;
}

export interface WizardStep {
  stepNumber: number;
  title: string;
  section: Section;
  isCompleted: boolean;
  isOptional: boolean;
}

// Opciones de llenado rápido
export interface QuickFillOption {
  type: 'all_yes' | 'all_no' | 'all_na' | 'skip';
  label: string;
  value: string;
  description: string;
}

// Análisis de celda detectada
export interface DetectedCell {
  ref: string;
  row: number;
  col: number;
  value: any;
  isEmpty: boolean;
  isMerged: boolean;
  mergedRange?: string;
  style?: any;
  nearbyLabel?: string; // Etiqueta cercana que indica qué es este campo
}

// Configuración del parser
export interface ParserConfig {
  detectHeaders: boolean;
  detectCheckboxes: boolean;
  detectTables: boolean;
  detectSignatures: boolean;
  maxEmptyCellsToDetect: number;
  keywordPatterns: {
    name: string[];
    date: string[];
    signature: string[];
    observations: string[];
    checkboxYes: string[];
    checkboxNo: string[];
    checkboxNA: string[];
  };
}
