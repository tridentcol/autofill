import Dexie, { Table } from 'dexie';
import type { Worker, Cuadrilla, Signature, Zona } from '@/types';
import { loadAllDefaultData } from './dataLoader';

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
  userId?: string;
}

// Definición de la base de datos
export class AutofillDatabase extends Dexie {
  workers!: Table<Worker, string>;
  cuadrillas!: Table<Cuadrilla, string>;
  camionetas!: Table<Camioneta, string>;
  gruas!: Table<Grua, string>;
  zonas!: Table<Zona, string>;
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

    // Versión 2: Agregar tabla de zonas
    this.version(2).stores({
      workers: 'id, nombre, cargo, cedula, cuadrillaId, isActive',
      cuadrillas: 'id, nombre, isActive',
      camionetas: 'id, placa, marca, modelo, isActive',
      gruas: 'id, placa, marca, modelo, isActive',
      zonas: 'id, nombre, isActive',
      signatures: 'id, name, userId, createdAt',
    });
  }

  /**
   * Inicializa la base de datos cargando datos desde archivos JSON
   * Los datos se cargan desde /public/data/*.json
   */
  async initializeDefaultData() {
    const workersCount = await this.workers.count();

    if (workersCount > 0) {
      console.log('Base de datos ya tiene datos');
      return;
    }

    console.log('Cargando datos desde repositorio...');

    try {
      // Cargar datos desde archivos JSON
      const { workers, cuadrillas, camionetas, gruas, zonas } = await loadAllDefaultData();

      if (workers.length === 0) {
        console.error('No se pudieron cargar los datos desde JSON');
        return;
      }

      // Insertar datos en IndexedDB
      await this.cuadrillas.bulkAdd(cuadrillas);
      await this.workers.bulkAdd(workers);
      await this.camionetas.bulkAdd(camionetas);
      await this.gruas.bulkAdd(gruas);
      if (zonas.length > 0) {
        await this.zonas.bulkAdd(zonas);
      }

      console.log('Datos cargados correctamente');
      console.log(`  ${workers.length} trabajadores`);
      console.log(`  ${cuadrillas.length} cuadrillas`);
      console.log(`  ${camionetas.length} camionetas`);
      console.log(`  ${gruas.length} grúas`);
      console.log(`  ${zonas.length} zonas`);
    } catch (error) {
      console.error('Error al inicializar datos:', error);
    }
  }

  /**
   * Limpia todos los datos de la base de datos
   */
  async clearAll() {
    await Promise.all([
      this.workers.clear(),
      this.cuadrillas.clear(),
      this.camionetas.clear(),
      this.gruas.clear(),
      this.zonas.clear(),
      this.signatures.clear(),
    ]);
    console.log('Base de datos limpiada');
  }

  /**
   * Resetea la base de datos a los valores predeterminados del repositorio
   */
  async resetToDefaults() {
    console.log('Reseteando a datos predeterminados...');
    await this.clearAll();
    await this.initializeDefaultData();
    console.log('Datos reseteados correctamente');
  }
}

// Instancia única de la base de datos
export const db = new AutofillDatabase();

// Inicializar automáticamente cuando la base de datos esté lista
db.on('ready', () => {
  db.initializeDefaultData();
});
