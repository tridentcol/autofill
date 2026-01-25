import { useEffect, useState, useCallback } from 'react';
import { useDatabaseStore } from '@/store/useDatabaseStore';
import { db } from '@/lib/db';
import { loadAllDefaultData } from '@/lib/dataLoader';

/**
 * Hook para sincronizar datos desde el repositorio
 * Permite detectar y cargar cambios hechos por otros dispositivos
 */
export function useDataSync(options?: {
  enablePolling?: boolean;
  pollingInterval?: number; // en milisegundos
  enableVisibilitySync?: boolean;
}) {
  const {
    enablePolling = false,
    pollingInterval = 60000, // 60 segundos por defecto
    enableVisibilitySync = true,
  } = options || {};

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const store = useDatabaseStore();

  /**
   * Sincroniza datos desde el repositorio Git
   * Recarga los archivos JSON y actualiza IndexedDB y el store
   */
  const syncFromRepository = useCallback(async () => {
    setIsSyncing(true);
    setSyncError(null);

    try {
      console.log('🔄 Sincronizando datos desde repositorio...');

      // Agregar timestamp para evitar cache
      const timestamp = Date.now();

      // Cargar datos frescos desde el servidor (esto bypasea el cache del navegador)
      const [workersRes, cuadrillasRes, camionetasRes, gruasRes] = await Promise.all([
        fetch(`/data/workers.json?t=${timestamp}`),
        fetch(`/data/cuadrillas.json?t=${timestamp}`),
        fetch(`/data/camionetas.json?t=${timestamp}`),
        fetch(`/data/gruas.json?t=${timestamp}`),
      ]);

      if (!workersRes.ok || !cuadrillasRes.ok || !camionetasRes.ok || !gruasRes.ok) {
        throw new Error('Failed to fetch data from repository');
      }

      const [workersData, cuadrillasData, camionetasData, gruasData] = await Promise.all([
        workersRes.json(),
        cuadrillasRes.json(),
        camionetasRes.json(),
        gruasRes.json(),
      ]);

      // Convertir fechas y limpiar datos
      const workers = workersData.map((worker: any) => ({
        ...worker,
        cuadrillaId: worker.cuadrillaId || undefined,
        signatureId: worker.signatureId || undefined,
        createdAt: new Date(worker.createdAt),
        updatedAt: new Date(worker.updatedAt),
      }));

      const cuadrillas = cuadrillasData.map((cuadrilla: any) => ({
        ...cuadrilla,
        createdAt: new Date(cuadrilla.createdAt),
        updatedAt: new Date(cuadrilla.updatedAt),
      }));

      const camionetas = camionetasData.map((camioneta: any) => ({
        ...camioneta,
        createdAt: new Date(camioneta.createdAt),
        updatedAt: new Date(camioneta.updatedAt),
      }));

      const gruas = gruasData.map((grua: any) => ({
        ...grua,
        createdAt: new Date(grua.createdAt),
        updatedAt: new Date(grua.updatedAt),
      }));

      // Actualizar IndexedDB
      await db.transaction('rw', [db.workers, db.cuadrillas, db.camionetas, db.gruas], async () => {
        await db.workers.clear();
        await db.cuadrillas.clear();
        await db.camionetas.clear();
        await db.gruas.clear();

        await db.workers.bulkAdd(workers);
        await db.cuadrillas.bulkAdd(cuadrillas);
        await db.camionetas.bulkAdd(camionetas);
        await db.gruas.bulkAdd(gruas);
      });

      // Actualizar el store de Zustand
      store.loadFromDB();

      setLastSyncTime(new Date());
      console.log('✅ Datos sincronizados correctamente');

      return true;
    } catch (error) {
      console.error('❌ Error sincronizando datos:', error);
      setSyncError(error instanceof Error ? error.message : 'Error desconocido');
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [store]);

  // Sincronización cuando la pestaña vuelve a estar visible
  useEffect(() => {
    if (!enableVisibilitySync) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Pestaña visible, sincronizando datos...');
        syncFromRepository();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enableVisibilitySync, syncFromRepository]);

  // Polling periódico (opcional)
  useEffect(() => {
    if (!enablePolling) return;

    const interval = setInterval(() => {
      console.log('⏰ Polling: sincronizando datos...');
      syncFromRepository();
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [enablePolling, pollingInterval, syncFromRepository]);

  return {
    syncFromRepository,
    isSyncing,
    lastSyncTime,
    syncError,
  };
}
