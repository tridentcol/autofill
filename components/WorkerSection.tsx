'use client';

import { useState, useEffect } from 'react';
import { useDatabaseStore } from '@/store/useDatabaseStore';
import { useFormStore } from '@/store/useFormStore';
import CuadrillaSelector from './CuadrillaSelector';
import WorkerSelector from './WorkerSelector';
import type { Worker } from '@/types';

interface WorkerSectionProps {
  sheetIndex: number;
  sectionIndex: number;
}

export default function WorkerSection({ sheetIndex, sectionIndex }: WorkerSectionProps) {
  const { getWorkerById, getCuadrillaById } = useDatabaseStore();
  const { updateFieldValue, currentFormData, signatures } = useFormStore();

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
      const signature = signatures.find(s => s.id === worker.signatureId);
      if (signature) {
        updateFieldValue(sheetIndex, sectionIndex, `trabajador${index + 1}_firma`, signature.id);
      }
    } else {
      // Si no tiene firma asignada, buscar una firma con el nombre del trabajador
      const matchingSignature = signatures.find(s =>
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
    return (section?.fields as Record<string, any>)?.[fieldKey] || '';
  };

  return (
    <div className="space-y-6">
      {/* Selector de Cuadrilla */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <CuadrillaSelector
          value={selectedCuadrillaId}
          onChange={handleCuadrillaChange}
        />
      </div>

      {/* Selector de Trabajadores Individuales */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-medium text-gray-900">Trabajadores</h4>
          {selectedCuadrillaId && (
            <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
              Auto-completado desde {getCuadrillaById(selectedCuadrillaId)?.nombre}
            </span>
          )}
        </div>

        {[0, 1, 2, 3].map((index) => {
          const worker = selectedWorkers[index];
          const signatureId = getSignatureValue(index);
          const signature = signatures.find(s => s.id === signatureId);

          return (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Selector de Trabajador */}
                <div className="md:col-span-2">
                  <WorkerSelector
                    value={worker?.id}
                    onChange={(w) => handleWorkerChange(index, w)}
                    label={`Trabajador ${index + 1}${index === 0 ? ' *' : ''}`}
                    required={index === 0}
                    cuadrillaId={selectedCuadrillaId || undefined}
                  />
                </div>

                {/* Información Auto-completada */}
                {worker && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cargo
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900">
                        {worker.cargo}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cédula
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900">
                        {worker.cedula || 'Sin cédula'}
                      </div>
                    </div>

                    {/* Firma */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Firma
                      </label>
                      {signature ? (
                        <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-md">
                          <img
                            src={signature.dataUrl}
                            alt={signature.name}
                            className="h-12 bg-white border border-gray-200 rounded px-2"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-900">
                              {signature.name}
                            </p>
                            <p className="text-xs text-green-700">
                              Firma asignada automáticamente
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-sm text-yellow-800">
                            ⚠️ No hay firma asignada. Por favor cree una firma con el nombre "{worker.nombre}" o asigne una firma en la base de datos.
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ayuda */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h5 className="text-sm font-medium text-gray-900 mb-2">💡 Consejos:</h5>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li>Usa el selector de cuadrilla para auto-completar todos los trabajadores de un equipo</li>
          <li>Puedes cambiar trabajadores individuales después de seleccionar una cuadrilla</li>
          <li>Las firmas se asignan automáticamente si el trabajador tiene una en la base de datos</li>
          <li>El primer trabajador es obligatorio, los demás son opcionales</li>
        </ul>
      </div>
    </div>
  );
}
