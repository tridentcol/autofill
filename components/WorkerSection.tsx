'use client';

import { useState, useEffect, useMemo } from 'react';
import { useDatabaseStore } from '@/store/useDatabaseStore';
import { useFormStore } from '@/store/useFormStore';
import CuadrillaSelector from './CuadrillaSelector';
import WorkerSelector from './WorkerSelector';
import type { Worker } from '@/types';

// Tipo para firmas de trabajadores
interface WorkerSignature {
  id: string;
  name: string;
  dataUrl: string;
  workerId: string;
  cargo: string;
}

interface WorkerSectionProps {
  sheetIndex: number;
  sectionIndex: number;
}

export default function WorkerSection({ sheetIndex, sectionIndex }: WorkerSectionProps) {
  const { getWorkerById, getCuadrillaById, workers, cuadrillas, currentUser } = useDatabaseStore();
  const { updateFieldValue, currentFormData, selectedFormat } = useFormStore();

  // Verificar si es el formulario de Permiso de Trabajo y el usuario es un técnico
  const isPermisoTrabajo = selectedFormat?.id === 'permiso-trabajo';
  const isTecnico = currentUser?.cargo === 'Técnico electricista';
  const isRestrictedMode = isPermisoTrabajo && isTecnico;

  // Construir firmas disponibles desde los workers que tienen signatureId (igual que FieldRenderer)
  const availableSignatures = useMemo((): WorkerSignature[] => {
    return workers
      .filter(w => w.isActive && w.signatureId)
      .map(w => ({
        id: w.signatureId!,
        name: w.nombre,
        dataUrl: w.signatureData || `/signatures/${w.signatureId}.png`,
        workerId: w.id,
        cargo: w.cargo,
      }));
  }, [workers]);

  const [selectedCuadrillaId, setSelectedCuadrillaId] = useState<string>('');
  const [selectedWorkers, setSelectedWorkers] = useState<(Worker | null)[]>([null, null, null, null]);
  const [manualWorkerNames, setManualWorkerNames] = useState<string[]>(['', '', '', '']);
  const [hasAutoFilled, setHasAutoFilled] = useState(false);

  // Auto-completar cuadrilla del técnico cuando está en modo restringido
  useEffect(() => {
    if (isRestrictedMode && currentUser?.cuadrillaId && !hasAutoFilled) {
      const cuadrilla = getCuadrillaById(currentUser.cuadrillaId);
      if (cuadrilla) {
        // Obtener los trabajadores de la cuadrilla
        const cuadrillaWorkers = workers.filter(
          w => w.cuadrillaId === currentUser.cuadrillaId && w.isActive
        );

        // Auto-completar
        setSelectedCuadrillaId(currentUser.cuadrillaId);
        const newWorkers: (Worker | null)[] = [null, null, null, null];
        cuadrillaWorkers.slice(0, 4).forEach((worker, index) => {
          newWorkers[index] = worker;
          fillWorkerData(index, worker);
        });
        setSelectedWorkers(newWorkers);
        setHasAutoFilled(true);
      }
    }
  }, [isRestrictedMode, currentUser?.cuadrillaId, hasAutoFilled, workers]);

  // Auto-completar cuando se selecciona una cuadrilla (modo normal)
  const handleCuadrillaChange = (cuadrillaId: string, workers: Worker[]) => {
    if (isRestrictedMode) return; // No permitir cambiar cuadrilla en modo restringido

    setSelectedCuadrillaId(cuadrillaId);

    if (cuadrillaId && workers.length > 0) {
      // Auto-completar hasta 4 trabajadores
      const newWorkers: (Worker | null)[] = [null, null, null, null];
      workers.slice(0, 4).forEach((worker, index) => {
        newWorkers[index] = worker;
        fillWorkerData(index, worker);
      });
      setSelectedWorkers(newWorkers);
    } else {
      // Limpiar si se deselecciona
      setSelectedWorkers([null, null, null, null]);
      for (let i = 0; i < 4; i++) {
        clearWorkerData(i);
      }
    }
  };

  // Llenar datos del trabajador en el formulario
  const fillWorkerData = (index: number, worker: Worker | null) => {
    if (!worker) {
      clearWorkerData(index);
      return;
    }

    const row = 22 + index;

    // Nombre
    updateFieldValue(sheetIndex, sectionIndex, `trabajador${index + 1}_nombre`, worker.nombre);

    // Cargo
    updateFieldValue(sheetIndex, sectionIndex, `trabajador${index + 1}_cargo`, worker.cargo);

    // Cédula
    updateFieldValue(sheetIndex, sectionIndex, `trabajador${index + 1}_cedula`, worker.cedula);

    // Firma - usar la firma asignada en la base de datos si existe
    if (worker.signatureId) {
      // Buscar en availableSignatures (firmas de workers de la DB)
      const signature = availableSignatures.find(s => s.id === worker.signatureId);
      if (signature) {
        updateFieldValue(sheetIndex, sectionIndex, `trabajador${index + 1}_firma`, signature.id);
      } else {
        // Aún así asignar el signatureId aunque no se encontró la firma
        updateFieldValue(sheetIndex, sectionIndex, `trabajador${index + 1}_firma`, worker.signatureId);
      }
    } else {
      // Si no tiene firma asignada, buscar una firma con el nombre del trabajador
      const matchingSignature = availableSignatures.find(s =>
        s.name.toLowerCase() === worker.nombre.toLowerCase()
      );
      if (matchingSignature) {
        updateFieldValue(sheetIndex, sectionIndex, `trabajador${index + 1}_firma`, matchingSignature.id);
      }
    }
  };

  // Limpiar datos del trabajador
  const clearWorkerData = (index: number) => {
    updateFieldValue(sheetIndex, sectionIndex, `trabajador${index + 1}_nombre`, '');
    updateFieldValue(sheetIndex, sectionIndex, `trabajador${index + 1}_cargo`, '');
    updateFieldValue(sheetIndex, sectionIndex, `trabajador${index + 1}_cedula`, '');
    updateFieldValue(sheetIndex, sectionIndex, `trabajador${index + 1}_firma`, '');
  };

  // Manejar selección individual de trabajador (solo en modo normal)
  const handleWorkerChange = (index: number, worker: Worker | null) => {
    if (isRestrictedMode) return; // No permitir cambiar en modo restringido

    const newWorkers = [...selectedWorkers];
    newWorkers[index] = worker;
    setSelectedWorkers(newWorkers);
    fillWorkerData(index, worker);
  };

  // Manejar entrada manual de nombre de trabajador adicional
  const handleManualNameChange = (index: number, name: string) => {
    const newNames = [...manualWorkerNames];
    newNames[index] = name;
    setManualWorkerNames(newNames);

    // Actualizar el campo del formulario con el nombre manual
    if (name.trim()) {
      updateFieldValue(sheetIndex, sectionIndex, `trabajador${index + 1}_nombre`, name);
      // Limpiar otros campos ya que es entrada manual
      updateFieldValue(sheetIndex, sectionIndex, `trabajador${index + 1}_cargo`, '');
      updateFieldValue(sheetIndex, sectionIndex, `trabajador${index + 1}_cedula`, '');
      updateFieldValue(sheetIndex, sectionIndex, `trabajador${index + 1}_firma`, '');
    }
  };

  // Obtener valor actual de firma
  const getSignatureValue = (index: number): string => {
    if (!currentFormData || !currentFormData.sheets || !currentFormData.sheets[sheetIndex]) {
      return '';
    }
    const section = currentFormData.sheets[sheetIndex].sections[sectionIndex];
    const fieldKey = `trabajador${index + 1}_firma`;
    // fields es un array de {fieldId, value, completed}
    const field = section?.fields?.find((f: any) => f.fieldId === fieldKey);
    return field?.value || '';
  };

  return (
    <div className="space-y-6">
      {/* Mensaje de modo restringido */}
      {isRestrictedMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-800">Trabajadores de tu cuadrilla</p>
              <p className="text-xs text-blue-600 mt-0.5">
                Los trabajadores de tu cuadrilla han sido auto-completados. Puedes agregar nombres adicionales manualmente si es necesario.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Selector de Cuadrilla - Solo en modo normal */}
      {!isRestrictedMode && (
        <CuadrillaSelector
          value={selectedCuadrillaId}
          onChange={handleCuadrillaChange}
        />
      )}

      {/* Cuadrilla auto-seleccionada en modo restringido */}
      {isRestrictedMode && selectedCuadrillaId && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Cuadrilla</label>
          <div className="text-sm text-gray-900 font-medium">
            {getCuadrillaById(selectedCuadrillaId)?.nombre || 'Sin cuadrilla asignada'}
          </div>
        </div>
      )}

      {/* Selector de Trabajadores Individuales */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h4 className="text-lg font-medium text-gray-900">Trabajadores</h4>
          {selectedCuadrillaId && (
            <span className="text-xs sm:text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full self-start sm:self-auto">
              {getCuadrillaById(selectedCuadrillaId)?.nombre}
            </span>
          )}
        </div>

        {[0, 1, 2, 3].map((index) => {
          const worker = selectedWorkers[index];
          const signatureId = getSignatureValue(index);
          let signature = availableSignatures.find(s => s.id === signatureId);
          if (!signature && worker?.signatureId && worker?.signatureData) {
            signature = {
              id: worker.signatureId,
              name: worker.nombre,
              dataUrl: worker.signatureData,
              workerId: worker.id,
              cargo: worker.cargo,
            };
          }

          // En modo restringido, mostrar trabajador si existe o campo manual si no
          const showWorkerData = worker !== null;
          const showManualInput = isRestrictedMode && !showWorkerData;

          return (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
              <div className="space-y-4">
                {/* Modo normal: Selector de Trabajador */}
                {!isRestrictedMode && (
                  <WorkerSelector
                    value={worker?.id}
                    onChange={(w) => handleWorkerChange(index, w)}
                    label={`Trabajador ${index + 1}${index === 0 ? ' *' : ''}`}
                    required={index === 0}
                    cuadrillaId={selectedCuadrillaId || undefined}
                  />
                )}

                {/* Modo restringido: Mostrar trabajador o input manual */}
                {isRestrictedMode && (
                  <>
                    <label className="block text-sm font-medium text-gray-700">
                      Trabajador {index + 1}{index === 0 ? ' *' : ''}
                    </label>

                    {showWorkerData ? (
                      // Trabajador auto-completado (solo lectura)
                      <div className="px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-900">
                        {worker.nombre}
                        <span className="text-xs text-gray-500 ml-2">({worker.cargo})</span>
                      </div>
                    ) : (
                      // Input manual para trabajador adicional
                      <input
                        type="text"
                        value={manualWorkerNames[index]}
                        onChange={(e) => handleManualNameChange(index, e.target.value)}
                        placeholder="Nombre del trabajador adicional (opcional)"
                        className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                    )}
                  </>
                )}

                {/* Información Auto-completada */}
                {worker && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cargo
                      </label>
                      <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900">
                        {worker.cargo}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cédula
                      </label>
                      <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900">
                        {worker.cedula || 'Sin cédula'}
                      </div>
                    </div>

                    {/* Firma */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Firma
                      </label>
                      {signature ? (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                          <img
                            src={signature.dataUrl}
                            alt={signature.name}
                            className="h-10 sm:h-12 max-w-[150px] object-contain bg-white border border-gray-200 rounded px-2"
                          />
                          <p className="text-sm text-gray-700">
                            {signature.name}
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                          <p className="text-sm text-gray-500">
                            Sin firma asignada
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
