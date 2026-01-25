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
  group?: string;       // Grupo al que pertenece (para headers visuales)
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
  mergedCols?: number; // Para firmas en celdas combinadas horizontalmente
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

// ============================================
// DATABASE SYSTEM - Trabajadores y Supervisores
// ============================================

export type UserRole = 'admin' | 'user';

export type WorkerCargo = 'Conductor' | 'Técnico' | 'Supervisor' | 'Coordinador de zona' | 'Asistente técnico';

export interface Worker {
  id: string;
  nombre: string;
  cargo: WorkerCargo;
  cedula: string;
  cuadrillaId?: string; // ID de la cuadrilla a la que pertenece
  signatureId?: string; // ID de la firma asignada
  signatureData?: string; // Base64 de la firma para mostrar localmente mientras se sincroniza
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean; // Para desactivar sin eliminar
}

export interface Cuadrilla {
  id: string;
  nombre: string; // CUAD1, CUAD61, etc.
  descripcion?: string;
  workerIds: string[]; // IDs de los trabajadores que pertenecen a esta cuadrilla
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface Camioneta {
  id: string;
  marca: string;
  linea: string;
  placa: string;
  modelo: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface Grua {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  linea: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface User {
  id: string;
  nombre: string;
  email?: string;
  role: UserRole;
  createdAt: Date;
  lastLogin?: Date;
}

// Estado del store de base de datos
export interface DatabaseState {
  // Data
  workers: Worker[];
  cuadrillas: Cuadrilla[];
  camionetas: Camioneta[];
  gruas: Grua[];
  currentUser: User | null;

  // Workers CRUD
  addWorker: (worker: Omit<Worker, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateWorker: (id: string, updates: Partial<Worker>) => void;
  deleteWorker: (id: string) => void;
  getWorkerById: (id: string) => Worker | undefined;
  getWorkersByCuadrilla: (cuadrillaId: string) => Worker[];
  getWorkersByRole: (cargo: WorkerCargo) => Worker[];

  // Cuadrillas CRUD
  addCuadrilla: (cuadrilla: Omit<Cuadrilla, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCuadrilla: (id: string, updates: Partial<Cuadrilla>) => void;
  deleteCuadrilla: (id: string) => void;
  getCuadrillaById: (id: string) => Cuadrilla | undefined;
  assignWorkerToCuadrilla: (workerId: string, cuadrillaId: string) => void;
  removeWorkerFromCuadrilla: (workerId: string) => void;

  // Camionetas CRUD
  addCamioneta: (camioneta: Omit<Camioneta, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCamioneta: (id: string, updates: Partial<Camioneta>) => void;
  deleteCamioneta: (id: string) => void;
  getCamionetaById: (id: string) => Camioneta | undefined;

  // Gruas CRUD
  addGrua: (grua: Omit<Grua, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateGrua: (id: string, updates: Partial<Grua>) => void;
  deleteGrua: (id: string) => void;
  getGruaById: (id: string) => Grua | undefined;

  // User management
  setCurrentUser: (user: User) => void;
  isAdmin: () => boolean;

  // Initialize with default data
  initializeDefaultData: () => void;

  // Clear all data
  clearAll: () => void;

  // Load data from IndexedDB
  loadFromDB: () => Promise<void>;
}
