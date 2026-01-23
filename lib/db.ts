import Dexie, { Table } from 'dexie';
import type { Worker, Cuadrilla, Signature } from '@/types';

// Tipos adicionales para las nuevas tablas
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

export interface DBSignature extends Signature {
  userId?: string; // Para asociar firma con usuario
}

// Definición de la base de datos
export class AutofillDatabase extends Dexie {
  workers!: Table<Worker, string>;
  cuadrillas!: Table<Cuadrilla, string>;
  camionetas!: Table<Camioneta, string>;
  gruas!: Table<Grua, string>;
  signatures!: Table<DBSignature, string>;

  constructor() {
    super('AutofillDatabase');

    // Definir el esquema de la base de datos
    this.version(1).stores({
      workers: 'id, nombre, cargo, cedula, cuadrillaId, isActive',
      cuadrillas: 'id, nombre, isActive',
      camionetas: 'id, placa, marca, modelo, isActive',
      gruas: 'id, placa, marca, modelo, isActive',
      signatures: 'id, name, userId, createdAt',
    });
  }

  // Método para inicializar datos por defecto
  async initializeDefaultData() {
    const workersCount = await this.workers.count();

    if (workersCount > 0) {
      console.log('✅ Base de datos ya tiene datos');
      return;
    }

    console.log('🔄 Inicializando base de datos con datos predeterminados...');

    const now = new Date();

    // Crear cuadrillas
    const cuadrillas: Cuadrilla[] = [
      {
        id: 'cuad_1',
        nombre: 'CUAD1',
        descripcion: 'Cuadrilla 1',
        workerIds: [],
        createdAt: now,
        updatedAt: now,
        isActive: true,
      },
      {
        id: 'cuad_2',
        nombre: 'CUAD61',
        descripcion: 'Cuadrilla 61',
        workerIds: [],
        createdAt: now,
        updatedAt: now,
        isActive: true,
      },
      {
        id: 'cuad_3',
        nombre: 'CUAD64',
        descripcion: 'Cuadrilla 64',
        workerIds: [],
        createdAt: now,
        updatedAt: now,
        isActive: true,
      },
      {
        id: 'cuad_4',
        nombre: 'CUAD65',
        descripcion: 'Cuadrilla 65',
        workerIds: [],
        createdAt: now,
        updatedAt: now,
        isActive: true,
      },
    ];

    await this.cuadrillas.bulkAdd(cuadrillas);

    // Crear trabajadores
    const workers: Worker[] = [
      // CUAD1
      { id: 'worker_1', nombre: 'Carlos Guzmán', cargo: 'Conductor', cedula: '1143359194', cuadrillaId: 'cuad_1', signatureId: undefined, createdAt: now, updatedAt: now, isActive: true },
      { id: 'worker_2', nombre: 'Kleiver Polo', cargo: 'Técnico', cedula: '9288327', cuadrillaId: 'cuad_1', signatureId: undefined, createdAt: now, updatedAt: now, isActive: true },
      // CUAD61
      { id: 'worker_3', nombre: 'Luis Hernández', cargo: 'Conductor', cedula: '', cuadrillaId: 'cuad_2', signatureId: undefined, createdAt: now, updatedAt: now, isActive: true },
      { id: 'worker_4', nombre: 'Jefferson Genes', cargo: 'Técnico', cedula: '1050967799', cuadrillaId: 'cuad_2', signatureId: undefined, createdAt: now, updatedAt: now, isActive: true },
      // CUAD64
      { id: 'worker_5', nombre: 'Andrés Puello', cargo: 'Conductor', cedula: '1050963621', cuadrillaId: 'cuad_3', signatureId: undefined, createdAt: now, updatedAt: now, isActive: true },
      { id: 'worker_6', nombre: 'Juan Carlos Romero', cargo: 'Técnico', cedula: '73228082', cuadrillaId: 'cuad_3', signatureId: undefined, createdAt: now, updatedAt: now, isActive: true },
      { id: 'worker_7', nombre: 'Leonardo Torres', cargo: 'Supervisor', cedula: '1124034299', cuadrillaId: 'cuad_3', signatureId: undefined, createdAt: now, updatedAt: now, isActive: true },
      // CUAD65
      { id: 'worker_8', nombre: 'Joseph Puello', cargo: 'Conductor', cedula: '9298718', cuadrillaId: 'cuad_4', signatureId: undefined, createdAt: now, updatedAt: now, isActive: true },
      { id: 'worker_9', nombre: 'Remberto Martínez', cargo: 'Técnico', cedula: '1047425281', cuadrillaId: 'cuad_4', signatureId: undefined, createdAt: now, updatedAt: now, isActive: true },
      // Supervisores adicionales
      { id: 'worker_10', nombre: 'Antonio Cabarcas', cargo: 'Asistente técnico', cedula: '', cuadrillaId: undefined, signatureId: undefined, createdAt: now, updatedAt: now, isActive: true },
      { id: 'worker_11', nombre: 'Deivi Zabaleta', cargo: 'Coordinador de zona', cedula: '', cuadrillaId: undefined, signatureId: undefined, createdAt: now, updatedAt: now, isActive: true },
    ];

    await this.workers.bulkAdd(workers);

    // Actualizar workerIds en cuadrillas
    for (const cuad of cuadrillas) {
      const cuadWorkers = workers.filter(w => w.cuadrillaId === cuad.id).map(w => w.id);
      await this.cuadrillas.update(cuad.id, { workerIds: cuadWorkers });
    }

    // Crear camionetas de ejemplo
    const camionetas: Camioneta[] = [
      {
        id: 'cam_1',
        marca: 'Toyota',
        linea: 'Hilux',
        placa: 'ABC123',
        modelo: '2022',
        createdAt: now,
        updatedAt: now,
        isActive: true,
      },
      {
        id: 'cam_2',
        marca: 'Chevrolet',
        linea: 'D-MAX',
        placa: 'DEF456',
        modelo: '2021',
        createdAt: now,
        updatedAt: now,
        isActive: true,
      },
    ];

    await this.camionetas.bulkAdd(camionetas);

    // Crear grúas de ejemplo
    const gruas: Grua[] = [
      {
        id: 'grua_1',
        placa: 'GHI789',
        marca: 'Hino',
        modelo: '2020',
        linea: 'Serie 500',
        createdAt: now,
        updatedAt: now,
        isActive: true,
      },
      {
        id: 'grua_2',
        placa: 'JKL012',
        marca: 'Kenworth',
        modelo: '2019',
        linea: 'T800',
        createdAt: now,
        updatedAt: now,
        isActive: true,
      },
    ];

    await this.gruas.bulkAdd(gruas);

    console.log('✅ Base de datos inicializada correctamente');
    console.log(`   - ${workers.length} trabajadores`);
    console.log(`   - ${cuadrillas.length} cuadrillas`);
    console.log(`   - ${camionetas.length} camionetas`);
    console.log(`   - ${gruas.length} grúas`);
  }

  // Método para limpiar todos los datos
  async clearAll() {
    await Promise.all([
      this.workers.clear(),
      this.cuadrillas.clear(),
      this.camionetas.clear(),
      this.gruas.clear(),
      this.signatures.clear(),
    ]);
    console.log('🗑️ Base de datos limpiada');
  }
}

// Instancia única de la base de datos
export const db = new AutofillDatabase();

// Inicializar automáticamente
db.on('ready', () => {
  db.initializeDefaultData();
});
