import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DatabaseState, Worker, Cuadrilla, User, WorkerCargo } from '@/types';

export const useDatabaseStore = create<DatabaseState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      workers: [],
      cuadrillas: [],
      currentUser: null,

      // ==================== WORKERS CRUD ====================

      addWorker: (workerData) => {
        const newWorker: Worker = {
          ...workerData,
          id: `worker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          workers: [...state.workers, newWorker],
        }));
      },

      updateWorker: (id, updates) => {
        set((state) => ({
          workers: state.workers.map((worker) =>
            worker.id === id
              ? { ...worker, ...updates, updatedAt: new Date() }
              : worker
          ),
        }));
      },

      deleteWorker: (id) => {
        // Soft delete - marcar como inactivo
        set((state) => ({
          workers: state.workers.map((worker) =>
            worker.id === id
              ? { ...worker, isActive: false, updatedAt: new Date() }
              : worker
          ),
        }));

        // También remover de cuadrilla si está asignado
        get().removeWorkerFromCuadrilla(id);
      },

      getWorkerById: (id) => {
        return get().workers.find((w) => w.id === id && w.isActive);
      },

      getWorkersByCuadrilla: (cuadrillaId) => {
        return get().workers.filter(
          (w) => w.cuadrillaId === cuadrillaId && w.isActive
        );
      },

      getWorkersByRole: (cargo) => {
        return get().workers.filter((w) => w.cargo === cargo && w.isActive);
      },

      // ==================== CUADRILLAS CRUD ====================

      addCuadrilla: (cuadrillaData) => {
        const newCuadrilla: Cuadrilla = {
          ...cuadrillaData,
          id: `cuad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          cuadrillas: [...state.cuadrillas, newCuadrilla],
        }));
      },

      updateCuadrilla: (id, updates) => {
        set((state) => ({
          cuadrillas: state.cuadrillas.map((cuad) =>
            cuad.id === id
              ? { ...cuad, ...updates, updatedAt: new Date() }
              : cuad
          ),
        }));
      },

      deleteCuadrilla: (id) => {
        // Soft delete
        set((state) => ({
          cuadrillas: state.cuadrillas.map((cuad) =>
            cuad.id === id
              ? { ...cuad, isActive: false, updatedAt: new Date() }
              : cuad
          ),
        }));

        // Remover todos los trabajadores de esta cuadrilla
        set((state) => ({
          workers: state.workers.map((worker) =>
            worker.cuadrillaId === id
              ? { ...worker, cuadrillaId: undefined, updatedAt: new Date() }
              : worker
          ),
        }));
      },

      getCuadrillaById: (id) => {
        return get().cuadrillas.find((c) => c.id === id && c.isActive);
      },

      assignWorkerToCuadrilla: (workerId, cuadrillaId) => {
        // Actualizar el worker
        set((state) => ({
          workers: state.workers.map((worker) =>
            worker.id === workerId
              ? { ...worker, cuadrillaId, updatedAt: new Date() }
              : worker
          ),
        }));

        // Actualizar la cuadrilla
        set((state) => ({
          cuadrillas: state.cuadrillas.map((cuad) => {
            if (cuad.id === cuadrillaId) {
              const workerIds = cuad.workerIds.includes(workerId)
                ? cuad.workerIds
                : [...cuad.workerIds, workerId];
              return { ...cuad, workerIds, updatedAt: new Date() };
            }
            return cuad;
          }),
        }));
      },

      removeWorkerFromCuadrilla: (workerId) => {
        const worker = get().getWorkerById(workerId);
        if (!worker?.cuadrillaId) return;

        const cuadrillaId = worker.cuadrillaId;

        // Remover del worker
        set((state) => ({
          workers: state.workers.map((w) =>
            w.id === workerId
              ? { ...w, cuadrillaId: undefined, updatedAt: new Date() }
              : w
          ),
        }));

        // Remover de la cuadrilla
        set((state) => ({
          cuadrillas: state.cuadrillas.map((cuad) => {
            if (cuad.id === cuadrillaId) {
              return {
                ...cuad,
                workerIds: cuad.workerIds.filter((id) => id !== workerId),
                updatedAt: new Date(),
              };
            }
            return cuad;
          }),
        }));
      },

      // ==================== USER MANAGEMENT ====================

      setCurrentUser: (user) => {
        set({ currentUser: { ...user, lastLogin: new Date() } });
      },

      isAdmin: () => {
        return get().currentUser?.role === 'admin';
      },

      // ==================== INITIALIZE DEFAULT DATA ====================

      initializeDefaultData: () => {
        const existingCuadrillas = get().cuadrillas;
        const existingWorkers = get().workers;

        // Solo inicializar si está vacío
        if (existingCuadrillas.length > 0 || existingWorkers.length > 0) {
          return;
        }

        const now = new Date();

        // Crear cuadrillas predefinidas
        const cuadrillasData = [
          { nombre: 'CUAD1', descripcion: 'Cuadrilla 1' },
          { nombre: 'CUAD61', descripcion: 'Cuadrilla 61' },
          { nombre: 'CUAD64', descripcion: 'Cuadrilla 64' },
          { nombre: 'CUAD65', descripcion: 'Cuadrilla 65' },
        ];

        const cuadrillas: Cuadrilla[] = cuadrillasData.map((data, index) => ({
          id: `cuad_${index + 1}`,
          nombre: data.nombre,
          descripcion: data.descripcion,
          workerIds: [],
          createdAt: now,
          updatedAt: now,
          isActive: true,
        }));

        // Crear trabajadores predefinidos
        const workersData: Omit<Worker, 'id' | 'createdAt' | 'updatedAt'>[] = [
          // CUAD1
          {
            nombre: 'Carlos Guzmán',
            cargo: 'Conductor',
            cedula: '1143359194',
            cuadrillaId: 'cuad_1',
            signatureId: undefined,
            isActive: true,
          },
          {
            nombre: 'Kleiver Polo',
            cargo: 'Técnico',
            cedula: '9288327',
            cuadrillaId: 'cuad_1',
            signatureId: undefined,
            isActive: true,
          },
          // CUAD61
          {
            nombre: 'Luis Hernández',
            cargo: 'Conductor',
            cedula: '',
            cuadrillaId: 'cuad_2',
            signatureId: undefined,
            isActive: true,
          },
          {
            nombre: 'Jefferson Genes',
            cargo: 'Técnico',
            cedula: '1050967799',
            cuadrillaId: 'cuad_2',
            signatureId: undefined,
            isActive: true,
          },
          // CUAD64
          {
            nombre: 'Andrés Puello',
            cargo: 'Conductor',
            cedula: '1050963621',
            cuadrillaId: 'cuad_3',
            signatureId: undefined,
            isActive: true,
          },
          {
            nombre: 'Juan Carlos Romero',
            cargo: 'Técnico',
            cedula: '73228082',
            cuadrillaId: 'cuad_3',
            signatureId: undefined,
            isActive: true,
          },
          {
            nombre: 'Leonardo Torres',
            cargo: 'Supervisor',
            cedula: '1124034299',
            cuadrillaId: 'cuad_3',
            signatureId: undefined,
            isActive: true,
          },
          // CUAD65
          {
            nombre: 'Joseph Puello',
            cargo: 'Conductor',
            cedula: '9298718',
            cuadrillaId: 'cuad_4',
            signatureId: undefined,
            isActive: true,
          },
          {
            nombre: 'Remberto Martínez',
            cargo: 'Técnico',
            cedula: '1047425281',
            cuadrillaId: 'cuad_4',
            signatureId: undefined,
            isActive: true,
          },
          // Supervisores adicionales (sin cuadrilla asignada)
          {
            nombre: 'Antonio Cabarcas',
            cargo: 'Asistente técnico',
            cedula: '',
            cuadrillaId: undefined,
            signatureId: undefined,
            isActive: true,
          },
          {
            nombre: 'Deivi Zabaleta',
            cargo: 'Coordinador de zona',
            cedula: '',
            cuadrillaId: undefined,
            signatureId: undefined,
            isActive: true,
          },
        ];

        const workers: Worker[] = workersData.map((data, index) => ({
          ...data,
          id: `worker_${index + 1}`,
          createdAt: now,
          updatedAt: now,
        }));

        // Actualizar workerIds en cuadrillas
        cuadrillas.forEach((cuad) => {
          cuad.workerIds = workers
            .filter((w) => w.cuadrillaId === cuad.id)
            .map((w) => w.id);
        });

        // Establecer datos
        set({
          cuadrillas,
          workers,
        });

        console.log('✅ Base de datos inicializada con datos predeterminados');
        console.log(`   - ${cuadrillas.length} cuadrillas creadas`);
        console.log(`   - ${workers.length} trabajadores creados`);
      },

      // ==================== CLEAR ALL ====================

      clearAll: () => {
        set({
          workers: [],
          cuadrillas: [],
          currentUser: null,
        });
      },
    }),
    {
      name: 'autofill-database-storage',
      // Serializar las fechas correctamente
      partialize: (state) => ({
        workers: state.workers,
        cuadrillas: state.cuadrillas,
        currentUser: state.currentUser,
      }),
    }
  )
);
