import { useEffect } from 'react';
import { useDatabaseStore } from '@/store/useDatabaseStore';

/**
 * Hook para inicializar la base de datos con datos predeterminados
 * Solo se ejecuta una vez cuando la aplicación carga por primera vez
 */
export function useDatabaseInit() {
  const { workers, cuadrillas, initializeDefaultData } = useDatabaseStore();

  useEffect(() => {
    // Solo inicializar si no hay datos
    if (workers.length === 0 && cuadrillas.length === 0) {
      console.log('🔄 Inicializando base de datos con datos predeterminados...');
      initializeDefaultData();
    } else {
      console.log('✅ Base de datos ya inicializada');
      console.log(`   - ${workers.filter(w => w.isActive).length} trabajadores activos`);
      console.log(`   - ${cuadrillas.filter(c => c.isActive).length} cuadrillas activas`);
    }
  }, []); // Solo ejecutar una vez al montar

  return {
    isInitialized: workers.length > 0 || cuadrillas.length > 0,
    workersCount: workers.filter(w => w.isActive).length,
    cuadrillasCount: cuadrillas.filter(c => c.isActive).length,
  };
}
