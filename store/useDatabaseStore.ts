import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '@/lib/db';
import { syncWorkersToServer, syncCuadrillasToServer, syncCamionetasToServer, syncGruasToServer, syncCargosToServer, syncZonasToServer } from '@/lib/dataSync';
import { loadAllDefaultData } from '@/lib/dataLoader';
import type { DatabaseState, Worker, Cuadrilla, User, Camioneta, Grua } from '@/types';
import { DEFAULT_CARGOS } from '@/types';

const DEFAULT_ZONAS = [
  'Clemencia',
  'Arjona',
  'Turbaco',
  'Turbana',
  'San Estanislao',
  'Santa Rosa de Lima',
  'Villanueva',
];

export const useDatabaseStore = create<DatabaseState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      workers: [],
      cuadrillas: [],
      camionetas: [],
      gruas: [],
      cargos: [...DEFAULT_CARGOS],
      zonas: [...DEFAULT_ZONAS],
      currentUser: null,

      // ==================== WORKERS CRUD ====================

      addWorker: async (workerData) => {
        const newWorker: Worker = {
          ...workerData,
          id: `worker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await db.workers.add(newWorker);

        set((state) => ({
          workers: [...state.workers, newWorker],
        }));

        // Sync to server if admin
        if (get().isAdmin()) {
          await syncWorkersToServer(get().workers);
        }
      },

      updateWorker: async (id, updates) => {
        await db.workers.update(id, { ...updates, updatedAt: new Date() });

        set((state) => ({
          workers: state.workers.map((worker) =>
            worker.id === id
              ? { ...worker, ...updates, updatedAt: new Date() }
              : worker
          ),
        }));

        // Sync to server if admin
        if (get().isAdmin()) {
          await syncWorkersToServer(get().workers);
        }
      },

      deleteWorker: async (id) => {
        // Soft delete - marcar como inactivo
        await db.workers.update(id, { isActive: false, updatedAt: new Date() });

        set((state) => ({
          workers: state.workers.map((worker) =>
            worker.id === id
              ? { ...worker, isActive: false, updatedAt: new Date() }
              : worker
          ),
        }));

        // También remover de cuadrilla si está asignado
        await get().removeWorkerFromCuadrilla(id);

        // Sync to server if admin
        if (get().isAdmin()) {
          await syncWorkersToServer(get().workers);
        }
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

      addCuadrilla: async (cuadrillaData) => {
        const newCuadrilla: Cuadrilla = {
          ...cuadrillaData,
          id: `cuad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await db.cuadrillas.add(newCuadrilla);

        set((state) => ({
          cuadrillas: [...state.cuadrillas, newCuadrilla],
        }));

        // Sync to server if admin
        if (get().isAdmin()) {
          await syncCuadrillasToServer(get().cuadrillas);
        }
      },

      updateCuadrilla: async (id, updates) => {
        await db.cuadrillas.update(id, { ...updates, updatedAt: new Date() });

        set((state) => ({
          cuadrillas: state.cuadrillas.map((cuad) =>
            cuad.id === id
              ? { ...cuad, ...updates, updatedAt: new Date() }
              : cuad
          ),
        }));

        // Sync to server if admin
        if (get().isAdmin()) {
          await syncCuadrillasToServer(get().cuadrillas);
        }
      },

      deleteCuadrilla: async (id) => {
        // Soft delete
        await db.cuadrillas.update(id, { isActive: false, updatedAt: new Date() });

        set((state) => ({
          cuadrillas: state.cuadrillas.map((cuad) =>
            cuad.id === id
              ? { ...cuad, isActive: false, updatedAt: new Date() }
              : cuad
          ),
        }));

        // Remover todos los trabajadores de esta cuadrilla
        const workers = get().workers.filter(w => w.cuadrillaId === id);
        for (const worker of workers) {
          await db.workers.update(worker.id, { cuadrillaId: undefined, updatedAt: new Date() });
        }

        set((state) => ({
          workers: state.workers.map((worker) =>
            worker.cuadrillaId === id
              ? { ...worker, cuadrillaId: undefined, updatedAt: new Date() }
              : worker
          ),
        }));

        // Sync to server if admin (both cuadrillas and workers were modified)
        if (get().isAdmin()) {
          await syncCuadrillasToServer(get().cuadrillas);
          await syncWorkersToServer(get().workers);
        }
      },

      getCuadrillaById: (id) => {
        return get().cuadrillas.find((c) => c.id === id && c.isActive);
      },

      assignWorkerToCuadrilla: async (workerId, cuadrillaId) => {
        // Actualizar el worker en la base de datos
        await db.workers.update(workerId, { cuadrillaId, updatedAt: new Date() });

        // Actualizar el worker en el estado
        set((state) => ({
          workers: state.workers.map((worker) =>
            worker.id === workerId
              ? { ...worker, cuadrillaId, updatedAt: new Date() }
              : worker
          ),
        }));

        // Actualizar la cuadrilla en la base de datos
        const cuadrilla = get().getCuadrillaById(cuadrillaId);
        if (cuadrilla) {
          const workerIds = cuadrilla.workerIds.includes(workerId)
            ? cuadrilla.workerIds
            : [...cuadrilla.workerIds, workerId];

          await db.cuadrillas.update(cuadrillaId, { workerIds, updatedAt: new Date() });

          // Actualizar en el estado
          set((state) => ({
            cuadrillas: state.cuadrillas.map((cuad) => {
              if (cuad.id === cuadrillaId) {
                return { ...cuad, workerIds, updatedAt: new Date() };
              }
              return cuad;
            }),
          }));
        }

        // Sync to server if admin (both workers and cuadrillas were modified)
        if (get().isAdmin()) {
          await syncWorkersToServer(get().workers);
          await syncCuadrillasToServer(get().cuadrillas);
        }
      },

      removeWorkerFromCuadrilla: async (workerId) => {
        const worker = get().getWorkerById(workerId);
        if (!worker?.cuadrillaId) return;

        const cuadrillaId = worker.cuadrillaId;

        // Remover del worker en la base de datos
        await db.workers.update(workerId, { cuadrillaId: undefined, updatedAt: new Date() });

        // Remover del worker en el estado
        set((state) => ({
          workers: state.workers.map((w) =>
            w.id === workerId
              ? { ...w, cuadrillaId: undefined, updatedAt: new Date() }
              : w
          ),
        }));

        // Remover de la cuadrilla en la base de datos
        const cuadrilla = get().getCuadrillaById(cuadrillaId);
        if (cuadrilla) {
          const workerIds = cuadrilla.workerIds.filter((id) => id !== workerId);
          await db.cuadrillas.update(cuadrillaId, { workerIds, updatedAt: new Date() });

          // Remover de la cuadrilla en el estado
          set((state) => ({
            cuadrillas: state.cuadrillas.map((cuad) => {
              if (cuad.id === cuadrillaId) {
                return {
                  ...cuad,
                  workerIds,
                  updatedAt: new Date(),
                };
              }
              return cuad;
            }),
          }));
        }

        // Sync to server if admin (both workers and cuadrillas were modified)
        if (get().isAdmin()) {
          await syncWorkersToServer(get().workers);
          await syncCuadrillasToServer(get().cuadrillas);
        }
      },

      // ==================== CAMIONETAS CRUD ====================

      addCamioneta: async (camionetaData) => {
        const newCamioneta: Camioneta = {
          ...camionetaData,
          id: `cam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await db.camionetas.add(newCamioneta);

        set((state) => ({
          camionetas: [...state.camionetas, newCamioneta],
        }));

        // Sync to server if admin
        if (get().isAdmin()) {
          await syncCamionetasToServer(get().camionetas);
        }
      },

      updateCamioneta: async (id, updates) => {
        await db.camionetas.update(id, { ...updates, updatedAt: new Date() });

        set((state) => ({
          camionetas: state.camionetas.map((cam) =>
            cam.id === id
              ? { ...cam, ...updates, updatedAt: new Date() }
              : cam
          ),
        }));

        // Sync to server if admin
        if (get().isAdmin()) {
          await syncCamionetasToServer(get().camionetas);
        }
      },

      deleteCamioneta: async (id) => {
        // Soft delete
        await db.camionetas.update(id, { isActive: false, updatedAt: new Date() });

        set((state) => ({
          camionetas: state.camionetas.map((cam) =>
            cam.id === id
              ? { ...cam, isActive: false, updatedAt: new Date() }
              : cam
          ),
        }));

        // Sync to server if admin
        if (get().isAdmin()) {
          await syncCamionetasToServer(get().camionetas);
        }
      },

      getCamionetaById: (id) => {
        return get().camionetas.find((c) => c.id === id && c.isActive);
      },

      // ==================== GRUAS CRUD ====================

      addGrua: async (gruaData) => {
        const newGrua: Grua = {
          ...gruaData,
          id: `grua_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await db.gruas.add(newGrua);

        set((state) => ({
          gruas: [...state.gruas, newGrua],
        }));

        // Sync to server if admin
        if (get().isAdmin()) {
          await syncGruasToServer(get().gruas);
        }
      },

      updateGrua: async (id, updates) => {
        await db.gruas.update(id, { ...updates, updatedAt: new Date() });

        set((state) => ({
          gruas: state.gruas.map((grua) =>
            grua.id === id
              ? { ...grua, ...updates, updatedAt: new Date() }
              : grua
          ),
        }));

        // Sync to server if admin
        if (get().isAdmin()) {
          await syncGruasToServer(get().gruas);
        }
      },

      deleteGrua: async (id) => {
        // Soft delete
        await db.gruas.update(id, { isActive: false, updatedAt: new Date() });

        set((state) => ({
          gruas: state.gruas.map((grua) =>
            grua.id === id
              ? { ...grua, isActive: false, updatedAt: new Date() }
              : grua
          ),
        }));

        // Sync to server if admin
        if (get().isAdmin()) {
          await syncGruasToServer(get().gruas);
        }
      },

      getGruaById: (id) => {
        return get().gruas.find((g) => g.id === id && g.isActive);
      },

      // ==================== CARGOS CRUD ====================

      addCargo: async (cargo) => {
        const trimmed = cargo.trim();
        if (!trimmed) return;

        const currentCargos = get().cargos;
        if (currentCargos.includes(trimmed)) return; // Already exists

        const newCargos = [...currentCargos, trimmed];
        set({ cargos: newCargos });

        // Sync to server if admin
        if (get().isAdmin()) {
          await syncCargosToServer(newCargos);
        }
      },

      updateCargo: async (oldCargo, newCargo) => {
        const trimmedNew = newCargo.trim();
        if (!trimmedNew || oldCargo === trimmedNew) return;

        const currentCargos = get().cargos;
        if (currentCargos.includes(trimmedNew)) return; // New name already exists

        const newCargos = currentCargos.map(c => c === oldCargo ? trimmedNew : c);
        const updatedWorkers = get().workers.map(w =>
          w.cargo === oldCargo ? { ...w, cargo: trimmedNew, updatedAt: new Date() } : w
        );

        // Update the cargo in the list
        set({
          cargos: newCargos,
          // Also update any workers that have this cargo
          workers: updatedWorkers,
        });

        // Sync to server if admin (both cargos and workers were modified)
        if (get().isAdmin()) {
          await syncCargosToServer(newCargos);
          // Also sync workers since their cargo field was updated
          if (updatedWorkers.some(w => w.cargo === trimmedNew)) {
            await syncWorkersToServer(updatedWorkers);
          }
        }
      },

      deleteCargo: async (cargo) => {
        const currentCargos = get().cargos;
        if (currentCargos.length <= 1) return; // Keep at least one cargo

        const newCargos = currentCargos.filter(c => c !== cargo);
        set({ cargos: newCargos });

        // Sync to server if admin
        if (get().isAdmin()) {
          await syncCargosToServer(newCargos);
        }
      },

      // ==================== ZONAS CRUD ====================

      addZona: async (zona) => {
        const trimmed = zona.trim();
        if (!trimmed) return;

        const currentZonas = get().zonas;
        if (currentZonas.includes(trimmed)) return; // Already exists

        const newZonas = [...currentZonas, trimmed];
        set({ zonas: newZonas });

        // Sync to server if admin
        if (get().isAdmin()) {
          await syncZonasToServer(newZonas);
        }
      },

      updateZona: async (oldZona, newZona) => {
        const trimmedNew = newZona.trim();
        if (!trimmedNew || oldZona === trimmedNew) return;

        const currentZonas = get().zonas;
        if (currentZonas.includes(trimmedNew)) return; // New name already exists

        const newZonas = currentZonas.map(z => z === oldZona ? trimmedNew : z);
        set({ zonas: newZonas });

        // Sync to server if admin
        if (get().isAdmin()) {
          await syncZonasToServer(newZonas);
        }
      },

      deleteZona: async (zona) => {
        const currentZonas = get().zonas;
        if (currentZonas.length <= 1) return; // Keep at least one zona

        const newZonas = currentZonas.filter(z => z !== zona);
        set({ zonas: newZonas });

        // Sync to server if admin
        if (get().isAdmin()) {
          await syncZonasToServer(newZonas);
        }
      },

      // ==================== USER MANAGEMENT ====================

      setCurrentUser: (user) => {
        if (user === null) {
          set({ currentUser: null });
        } else {
          set({ currentUser: { ...user, lastLogin: new Date() } });
        }
      },

      isAdmin: () => {
        return get().currentUser?.role === 'admin';
      },

      // ==================== LOAD FROM DATABASE ====================

      loadFromDB: async () => {
        try {
          const [workers, cuadrillas, camionetas, gruas] = await Promise.all([
            db.workers.toArray(),
            db.cuadrillas.toArray(),
            db.camionetas.toArray(),
            db.gruas.toArray(),
          ]);

          set({
            workers,
            cuadrillas,
            camionetas,
            gruas,
          });

          console.log('✅ Datos cargados desde IndexedDB');
          console.log(`   - ${workers.length} trabajadores`);
          console.log(`   - ${cuadrillas.length} cuadrillas`);
          console.log(`   - ${camionetas.length} camionetas`);
          console.log(`   - ${gruas.length} grúas`);
        } catch (error) {
          console.error('❌ Error al cargar datos desde IndexedDB:', error);
        }
      },

      // ==================== INITIALIZE DEFAULT DATA ====================

      initializeDefaultData: async () => {
        // Verificar si ya hay datos en IndexedDB
        const workersCount = await db.workers.count();
        const cuadrillasCount = await db.cuadrillas.count();

        if (workersCount > 0 || cuadrillasCount > 0) {
          console.log('✅ La base de datos ya tiene datos, cargando...');
          await get().loadFromDB();
          return;
        }

        console.log('🔄 Inicializando base de datos con datos predeterminados...');

        // La base de datos se inicializa automáticamente en db.ts
        // Solo necesitamos cargar los datos
        await get().loadFromDB();
      },

      // ==================== CLEAR ALL ====================

      clearAll: async () => {
        await db.clearAll();

        set({
          workers: [],
          cuadrillas: [],
          camionetas: [],
          gruas: [],
          currentUser: null,
        });

        console.log('🗑️ Todos los datos eliminados');
      },

      // ==================== SYNC FROM SERVER ====================

      syncFromServer: async () => {
        try {
          console.log('🔄 Sincronizando desde el servidor...');

          // Load fresh data from server
          const serverData = await loadAllDefaultData();

          if (serverData.workers.length === 0 && serverData.cuadrillas.length === 0) {
            console.warn('⚠️ No se encontraron datos en el servidor');
            return false;
          }

          // Clear local IndexedDB
          await db.clearAll();

          // Save server data to IndexedDB
          if (serverData.workers.length > 0) {
            await db.workers.bulkAdd(serverData.workers);
          }
          if (serverData.cuadrillas.length > 0) {
            await db.cuadrillas.bulkAdd(serverData.cuadrillas);
          }
          if (serverData.camionetas.length > 0) {
            await db.camionetas.bulkAdd(serverData.camionetas);
          }
          if (serverData.gruas.length > 0) {
            await db.gruas.bulkAdd(serverData.gruas);
          }

          // Update Zustand state (including cargos and zonas from server)
          set({
            workers: serverData.workers,
            cuadrillas: serverData.cuadrillas,
            camionetas: serverData.camionetas,
            gruas: serverData.gruas,
            cargos: serverData.cargos.length > 0 ? serverData.cargos : get().cargos,
            zonas: serverData.zonas.length > 0 ? serverData.zonas : get().zonas,
          });

          console.log('✅ Sincronización completada');
          console.log(`   - ${serverData.workers.length} trabajadores`);
          console.log(`   - ${serverData.cuadrillas.length} cuadrillas`);
          console.log(`   - ${serverData.camionetas.length} camionetas`);
          console.log(`   - ${serverData.gruas.length} grúas`);
          console.log(`   - ${serverData.cargos.length} cargos`);
          console.log(`   - ${serverData.zonas.length} zonas`);

          return true;
        } catch (error) {
          console.error('❌ Error al sincronizar desde el servidor:', error);
          return false;
        }
      },
    }),
    {
      name: 'autofill-database-storage',
      // Solo persistir el usuario actual en localStorage
      partialize: (state) => ({
        currentUser: state.currentUser,
        cargos: state.cargos,
        zonas: state.zonas,
      }),
    }
  )
);
