'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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

// Tipo para trabajador adicional manual
interface ManualWorker {
  nombre: string;
  cargo: string;
  cedula: string;
  firmaDataUrl: string;
}

interface WorkerSectionProps {
  sheetIndex: number;
  sectionIndex: number;
}

// Componente para dibujar firma
function SignatureCanvas({
  onSave,
  onCancel
}: {
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;

    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div className="space-y-3">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-white">
        <canvas
          ref={canvasRef}
          width={300}
          height={150}
          className="w-full touch-none cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={clearCanvas}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Limpiar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={saveSignature}
          disabled={!hasDrawn}
          className="flex-1 px-3 py-2 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Guardar
        </button>
      </div>
    </div>
  );
}

export default function WorkerSection({ sheetIndex, sectionIndex }: WorkerSectionProps) {
  const { getWorkerById, getCuadrillaById, workers, cuadrillas, currentUser, cargos } = useDatabaseStore();
  const { updateFieldValue, currentFormData, selectedFormat, addSignature } = useFormStore();

  // Verificar si es el formulario de Permiso de Trabajo y el usuario es un técnico
  const isPermisoTrabajo = selectedFormat?.id === 'permiso-trabajo';
  const isTecnico = currentUser?.cargo === 'Técnico electricista';
  const isRestrictedMode = isPermisoTrabajo && isTecnico;

  // Construir firmas disponibles desde los workers que tienen signatureId
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
  const [hasAutoFilled, setHasAutoFilled] = useState(false);

  // Estado para trabajadores adicionales en modo restringido
  const [additionalWorkersCount, setAdditionalWorkersCount] = useState(0);
  const [manualWorkers, setManualWorkers] = useState<ManualWorker[]>([
    { nombre: '', cargo: '', cedula: '', firmaDataUrl: '' },
    { nombre: '', cargo: '', cedula: '', firmaDataUrl: '' },
  ]);
  const [drawingSignatureFor, setDrawingSignatureFor] = useState<number | null>(null);

  // Contar cuántos trabajadores de la cuadrilla hay
  const cuadrillaWorkersCount = useMemo(() => {
    if (!isRestrictedMode || !currentUser?.cuadrillaId) return 0;
    return workers.filter(
      w => w.cuadrillaId === currentUser.cuadrillaId && w.isActive
    ).length;
  }, [isRestrictedMode, currentUser?.cuadrillaId, workers]);

  // Máximo de trabajadores adicionales que se pueden agregar
  const maxAdditionalWorkers = Math.max(0, 4 - Math.min(cuadrillaWorkersCount, 4));

  // Auto-completar cuadrilla del técnico cuando está en modo restringido
  useEffect(() => {
    if (isRestrictedMode && currentUser?.cuadrillaId && !hasAutoFilled) {
      const cuadrilla = getCuadrillaById(currentUser.cuadrillaId);
      if (cuadrilla) {
        const cuadrillaWorkers = workers.filter(
          w => w.cuadrillaId === currentUser.cuadrillaId && w.isActive
        );

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
  const handleCuadrillaChange = (cuadrillaId: string, cuadWorkers: Worker[]) => {
    if (isRestrictedMode) return;

    setSelectedCuadrillaId(cuadrillaId);

    if (cuadrillaId && cuadWorkers.length > 0) {
      const newWorkers: (Worker | null)[] = [null, null, null, null];
      cuadWorkers.slice(0, 4).forEach((worker, index) => {
        newWorkers[index] = worker;
        fillWorkerData(index, worker);
      });
      setSelectedWorkers(newWorkers);
    } else {
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

    updateFieldValue(sheetIndex, sectionIndex, `trabajador${index + 1}_nombre`, worker.nombre);
    updateFieldValue(sheetIndex, sectionIndex, `trabajador${index + 1}_cargo`, worker.cargo);
    updateFieldValue(sheetIndex, sectionIndex, `trabajador${index + 1}_cedula`, worker.cedula);

    if (worker.signatureId) {
      const signature = availableSignatures.find(s => s.id === worker.signatureId);
      if (signature) {
        updateFieldValue(sheetIndex, sectionIndex, `trabajador${index + 1}_firma`, signature.id);
      } else {
        updateFieldValue(sheetIndex, sectionIndex, `trabajador${index + 1}_firma`, worker.signatureId);
      }
    } else {
      const matchingSignature = availableSignatures.find(s =>
        s.name.toLowerCase() === worker.nombre.toLowerCase()
      );
      if (matchingSignature) {
        updateFieldValue(sheetIndex, sectionIndex, `trabajador${index + 1}_firma`, matchingSignature.id);
      }
    }
  };

  // Llenar datos de trabajador manual
  const fillManualWorkerData = (additionalIndex: number, data: ManualWorker) => {
    const actualIndex = cuadrillaWorkersCount + additionalIndex;
    if (actualIndex >= 4) return;

    updateFieldValue(sheetIndex, sectionIndex, `trabajador${actualIndex + 1}_nombre`, data.nombre);
    updateFieldValue(sheetIndex, sectionIndex, `trabajador${actualIndex + 1}_cargo`, data.cargo);
    updateFieldValue(sheetIndex, sectionIndex, `trabajador${actualIndex + 1}_cedula`, data.cedula);

    if (data.firmaDataUrl) {
      // Crear una firma temporal y guardarla
      const sigId = `manual_sig_${Date.now()}_${additionalIndex}`;
      addSignature({
        id: sigId,
        name: data.nombre || `Trabajador ${actualIndex + 1}`,
        dataUrl: data.firmaDataUrl,
        createdAt: new Date(),
      });
      updateFieldValue(sheetIndex, sectionIndex, `trabajador${actualIndex + 1}_firma`, sigId);
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
    if (isRestrictedMode) return;

    const newWorkers = [...selectedWorkers];
    newWorkers[index] = worker;
    setSelectedWorkers(newWorkers);
    fillWorkerData(index, worker);
  };

  // Manejar cambios en trabajador manual adicional
  const handleManualWorkerChange = (additionalIndex: number, field: keyof ManualWorker, value: string) => {
    const newManualWorkers = [...manualWorkers];
    newManualWorkers[additionalIndex] = {
      ...newManualWorkers[additionalIndex],
      [field]: value,
    };
    setManualWorkers(newManualWorkers);
    fillManualWorkerData(additionalIndex, newManualWorkers[additionalIndex]);
  };

  // Guardar firma dibujada
  const handleSaveSignature = (additionalIndex: number, dataUrl: string) => {
    const newManualWorkers = [...manualWorkers];
    newManualWorkers[additionalIndex] = {
      ...newManualWorkers[additionalIndex],
      firmaDataUrl: dataUrl,
    };
    setManualWorkers(newManualWorkers);
    fillManualWorkerData(additionalIndex, newManualWorkers[additionalIndex]);
    setDrawingSignatureFor(null);
  };

  // Agregar trabajador adicional
  const handleAddWorker = () => {
    if (additionalWorkersCount < maxAdditionalWorkers) {
      setAdditionalWorkersCount(prev => prev + 1);
    }
  };

  // Eliminar trabajador adicional
  const handleRemoveWorker = (additionalIndex: number) => {
    // Limpiar datos del formulario
    const actualIndex = cuadrillaWorkersCount + additionalIndex;
    clearWorkerData(actualIndex);

    // Limpiar datos manuales
    const newManualWorkers = [...manualWorkers];
    newManualWorkers[additionalIndex] = { nombre: '', cargo: '', cedula: '', firmaDataUrl: '' };
    setManualWorkers(newManualWorkers);

    // Reducir contador solo si es el último
    if (additionalIndex === additionalWorkersCount - 1) {
      setAdditionalWorkersCount(prev => prev - 1);
    }
  };

  // Obtener valor actual de firma
  const getSignatureValue = (index: number): string => {
    if (!currentFormData || !currentFormData.sheets || !currentFormData.sheets[sheetIndex]) {
      return '';
    }
    const section = currentFormData.sheets[sheetIndex].sections[sectionIndex];
    const fieldKey = `trabajador${index + 1}_firma`;
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
                Los trabajadores de tu cuadrilla se muestran automáticamente. Puedes agregar hasta {maxAdditionalWorkers} trabajador(es) adicional(es).
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

      {/* Trabajadores */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h4 className="text-lg font-medium text-gray-900">Trabajadores</h4>
          {selectedCuadrillaId && (
            <span className="text-xs sm:text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full self-start sm:self-auto">
              {getCuadrillaById(selectedCuadrillaId)?.nombre}
            </span>
          )}
        </div>

        {/* Modo normal: mostrar todos los 4 slots */}
        {!isRestrictedMode && [0, 1, 2, 3].map((index) => {
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
                <WorkerSelector
                  value={worker?.id}
                  onChange={(w) => handleWorkerChange(index, w)}
                  label={`Trabajador ${index + 1}${index === 0 ? ' *' : ''}`}
                  required={index === 0}
                  cuadrillaId={selectedCuadrillaId || undefined}
                />

                {worker && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                      <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900">
                        {worker.cargo}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cédula</label>
                      <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900">
                        {worker.cedula || 'Sin cédula'}
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Firma</label>
                      {signature ? (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                          <img
                            src={signature.dataUrl}
                            alt={signature.name}
                            className="h-10 sm:h-12 max-w-[150px] object-contain bg-white border border-gray-200 rounded px-2"
                          />
                          <p className="text-sm text-gray-700">{signature.name}</p>
                        </div>
                      ) : (
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                          <p className="text-sm text-gray-500">Sin firma asignada</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Modo restringido: trabajadores de la cuadrilla (solo lectura) */}
        {isRestrictedMode && selectedWorkers.slice(0, cuadrillaWorkersCount).map((worker, index) => {
          if (!worker) return null;
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trabajador {index + 1}{index === 0 ? ' *' : ''}
                  </label>
                  <div className="px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-900">
                    {worker.nombre}
                    <span className="text-xs text-gray-500 ml-2">({worker.cargo})</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                    <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900">
                      {worker.cargo}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cédula</label>
                    <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900">
                      {worker.cedula || 'Sin cédula'}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Firma</label>
                    {signature ? (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                        <img
                          src={signature.dataUrl}
                          alt={signature.name}
                          className="h-10 sm:h-12 max-w-[150px] object-contain bg-white border border-gray-200 rounded px-2"
                        />
                        <p className="text-sm text-gray-700">{signature.name}</p>
                      </div>
                    ) : (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                        <p className="text-sm text-gray-500">Sin firma asignada</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Modo restringido: trabajadores adicionales manuales */}
        {isRestrictedMode && Array.from({ length: additionalWorkersCount }).map((_, additionalIndex) => {
          const actualIndex = cuadrillaWorkersCount + additionalIndex;
          const manualWorker = manualWorkers[additionalIndex];

          return (
            <div key={`additional-${additionalIndex}`} className="bg-white border border-blue-200 rounded-lg p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Trabajador {actualIndex + 1} (adicional)
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveWorker(additionalIndex)}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nombre *</label>
                    <input
                      type="text"
                      value={manualWorker.nombre}
                      onChange={(e) => handleManualWorkerChange(additionalIndex, 'nombre', e.target.value)}
                      placeholder="Nombre completo"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Cargo</label>
                    <select
                      value={manualWorker.cargo}
                      onChange={(e) => handleManualWorkerChange(additionalIndex, 'cargo', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    >
                      <option value="">Seleccionar cargo</option>
                      {cargos.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Cédula</label>
                    <input
                      type="text"
                      value={manualWorker.cedula}
                      onChange={(e) => handleManualWorkerChange(additionalIndex, 'cedula', e.target.value)}
                      placeholder="Número de cédula"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-2">Firma</label>
                    {drawingSignatureFor === additionalIndex ? (
                      <SignatureCanvas
                        onSave={(dataUrl) => handleSaveSignature(additionalIndex, dataUrl)}
                        onCancel={() => setDrawingSignatureFor(null)}
                      />
                    ) : manualWorker.firmaDataUrl ? (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                        <img
                          src={manualWorker.firmaDataUrl}
                          alt="Firma"
                          className="h-12 max-w-[150px] object-contain bg-white border border-gray-200 rounded px-2"
                        />
                        <button
                          type="button"
                          onClick={() => setDrawingSignatureFor(additionalIndex)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Cambiar
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDrawingSignatureFor(additionalIndex)}
                        className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-md text-sm text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Dibujar firma
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Botón para agregar trabajador adicional */}
        {isRestrictedMode && additionalWorkersCount < maxAdditionalWorkers && (
          <button
            type="button"
            onClick={handleAddWorker}
            className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Agregar trabajador adicional ({additionalWorkersCount}/{maxAdditionalWorkers})
          </button>
        )}
      </div>
    </div>
  );
}
