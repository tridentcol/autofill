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
  const { getWorkerById, getCuadrillaById, workers } = useDatabaseStore();
  const { updateFieldValue, currentFormData } = useFormStore();

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

  // Auto-completar cuando se selecciona una cuadrilla
  const handleCuadrillaChange = (cuadrillaId: string, workers: Worker[]) => {
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

  // Manejar selección individual de trabajador
  const handleWorkerChange = (index: number, worker: Worker | null) => {
    const newWorkers = [...selectedWorkers];
    newWorkers[index] = worker;
    setSelectedWorkers(newWorkers);
    fillWorkerData(index, worker);
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
      {/* Selector de Cuadrilla */}
      <CuadrillaSelector
        value={selectedCuadrillaId}
        onChange={handleCuadrillaChange}
      />

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

          return (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
              <div className="space-y-4">
                {/* Selector de Trabajador */}
                <WorkerSelector
                  value={worker?.id}
                  onChange={(w) => handleWorkerChange(index, w)}
                  label={`Trabajador ${index + 1}${index === 0 ? ' *' : ''}`}
                  required={index === 0}
                  cuadrillaId={selectedCuadrillaId || undefined}
                />

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
