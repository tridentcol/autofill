'use client';

import { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { useDatabaseStore } from '@/store/useDatabaseStore';
import { uploadSignature } from '@/lib/signatureSync';
import type { Worker } from '@/types';

export default function WorkerSignatureManager() {
  const { workers, updateWorker } = useDatabaseStore();
  const [selectedWorker, setSelectedWorker] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const signatureRef = useRef<SignatureCanvas>(null);

  const activeWorkers = workers.filter((w) => w.isActive);

  const handleSaveSignature = async () => {
    if (!selectedWorker) {
      alert('Por favor seleccione un trabajador');
      return;
    }

    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      alert('Por favor dibuje una firma primero');
      return;
    }

    const worker = workers.find((w) => w.id === selectedWorker);
    if (!worker) {
      alert('Trabajador no encontrado');
      return;
    }

    setIsUploading(true);

    try {
      // Get PNG data with transparent background
      const imageData = signatureRef.current.toDataURL('image/png');

      // Upload signature to repository
      const success = await uploadSignature({
        signatureId: worker.id,
        imageData,
        workerName: worker.nombre,
      });

      if (!success) {
        throw new Error('Failed to upload signature');
      }

      // Update worker with signature ID
      await updateWorker(worker.id, {
        signatureId: worker.id,
      });

      // Clear canvas
      signatureRef.current.clear();
      setIsDrawing(false);
      setSelectedWorker('');

      alert(`Firma guardada exitosamente para ${worker.nombre}!`);
    } catch (error) {
      console.error('Error saving signature:', error);
      alert('Error al guardar la firma. Por favor intente nuevamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!selectedWorker) {
      alert('Por favor seleccione un trabajador primero');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Por favor seleccione un archivo de imagen');
      return;
    }

    const worker = workers.find((w) => w.id === selectedWorker);
    if (!worker) {
      alert('Trabajador no encontrado');
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;

        // Upload signature to repository
        const success = await uploadSignature({
          signatureId: worker.id,
          imageData,
          workerName: worker.nombre,
        });

        if (!success) {
          throw new Error('Failed to upload signature');
        }

        // Update worker with signature ID
        await updateWorker(worker.id, {
          signatureId: worker.id,
        });

        setSelectedWorker('');
        alert(`Firma cargada exitosamente para ${worker.nombre}!`);
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading signature:', error);
      alert('Error al cargar la firma. Por favor intente nuevamente.');
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    signatureRef.current?.clear();
  };

  const handleRemoveSignature = async (workerId: string) => {
    const worker = workers.find((w) => w.id === workerId);
    if (!worker) return;

    if (confirm(`¿Está seguro de que desea remover la firma de ${worker.nombre}?`)) {
      try {
        await updateWorker(workerId, {
          signatureId: undefined,
        });
        alert('Firma removida exitosamente');
      } catch (error) {
        console.error('Error removing signature:', error);
        alert('Error al remover la firma');
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Asignar nueva firma */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Asignar Firma a Trabajador
        </h3>

        <div className="space-y-4">
          {/* Seleccionar trabajador */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Trabajador
            </label>
            <select
              value={selectedWorker}
              onChange={(e) => setSelectedWorker(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isUploading}
            >
              <option value="">-- Seleccione un trabajador --</option>
              {activeWorkers.map((worker) => (
                <option key={worker.id} value={worker.id}>
                  {worker.nombre} - {worker.cargo}
                  {worker.signatureId ? ' ✓' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Opciones: Dibujar o subir */}
          {selectedWorker && (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setIsDrawing(true)}
                disabled={isUploading}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isDrawing
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Dibujar Firma
              </button>
              <label className={`cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadImage}
                  className="sr-only"
                  disabled={isUploading}
                />
                <div className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md text-sm font-medium text-center transition-colors">
                  Subir Imagen
                </div>
              </label>
            </div>
          )}

          {/* Canvas para dibujar */}
          {isDrawing && selectedWorker && (
            <div className="space-y-3">
              <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <SignatureCanvas
                  ref={signatureRef}
                  canvasProps={{
                    className: 'signature-canvas w-full h-48',
                  }}
                  backgroundColor="rgba(0,0,0,0)"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleClear}
                  disabled={isUploading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Limpiar
                </button>
                <button
                  onClick={handleSaveSignature}
                  disabled={isUploading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Guardando...' : 'Guardar Firma'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lista de trabajadores con firmas */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Firmas Asignadas ({activeWorkers.filter((w) => w.signatureId).length})
        </h3>

        {activeWorkers.filter((w) => w.signatureId).length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-500">
              No hay firmas asignadas
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Seleccione un trabajador y cree una firma usando las opciones de arriba
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeWorkers
              .filter((w) => w.signatureId)
              .map((worker) => (
                <div
                  key={worker.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {worker.nombre}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {worker.cargo}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveSignature(worker.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                      title="Remover firma"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded p-2 flex items-center justify-center min-h-[100px]">
                    {worker.signatureId ? (
                      <img
                        src={`/signatures/${worker.signatureId}.png`}
                        alt={`Firma de ${worker.nombre}`}
                        className="max-h-24 max-w-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';
                          (e.target as HTMLImageElement).alt = 'Firma no disponible';
                        }}
                      />
                    ) : (
                      <p className="text-sm text-gray-400">Sin firma</p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
