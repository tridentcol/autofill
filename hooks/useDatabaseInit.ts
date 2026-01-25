import { useEffect, useState } from 'react';
import { useDatabaseStore } from '@/store/useDatabaseStore';

/**
 * Hook para inicializar la base de datos desde IndexedDB
 * Carga los datos y los sincroniza con Zustand
 */
export function useDatabaseInit() {
  const { workers, cuadrillas, camionetas, gruas, initializeDefaultData } = useDatabaseStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initDatabase = async () => {
      try {
        console.log('🔄 Cargando datos desde IndexedDB...');
        await initializeDefaultData();
        setIsLoading(false);
      } catch (error) {
        console.error('❌ Error al inicializar base de datos:', error);
        setIsLoading(false);
      }
    };

    initDatabase();
  }, []); // Solo ejecutar una vez al montar

  return {
    isInitialized: !isLoading && (workers.length > 0 || cuadrillas.length > 0),
    isLoading,
    workersCount: workers.filter(w => w.isActive).length,
    cuadrillasCount: cuadrillas.filter(c => c.isActive).length,
    camionetasCount: camionetas.filter(c => c.isActive).length,
    gruasCount: gruas.filter(g => g.isActive).length,
  };
}
