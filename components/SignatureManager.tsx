'use client';

import { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { useFormStore } from '@/store/useFormStore';
import type { Signature } from '@/types';

export default function SignatureManager() {
  const { signatures, addSignature, removeSignature } = useFormStore();
  const [signatureName, setSignatureName] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const signatureRef = useRef<SignatureCanvas>(null);

  const handleSaveSignature = () => {
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      alert('Por favor dibuje una firma primero');
      return;
    }

    if (!signatureName.trim()) {
      alert('Por favor ingrese un nombre para la firma');
      return;
    }

    const dataUrl = signatureRef.current.toDataURL();

    const newSignature: Signature = {
      id: `sig_${Date.now()}`,
      name: signatureName,
      dataUrl,
      createdAt: new Date(),
    };

    addSignature(newSignature);
    setSignatureName('');
    signatureRef.current.clear();
    setIsDrawing(false);

    alert('Firma guardada exitosamente!');
  };

  const handleClear = () => {
    signatureRef.current?.clear();
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar esta firma?')) {
      removeSignature(id);
    }
  };

  const handleUploadImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor seleccione un archivo de imagen');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;

      const name = prompt('Ingrese un nombre para esta firma:');
      if (!name) return;

      const newSignature: Signature = {
        id: `sig_${Date.now()}`,
        name: name.trim(),
        dataUrl,
        createdAt: new Date(),
      };

      addSignature(newSignature);
      alert('Firma cargada exitosamente!');
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8">
      {/* Crear nueva firma */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Crear Nueva Firma
        </h3>

        <div className="space-y-4">
          {/* Nombre de la firma */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la firma
            </label>
            <input
              type="text"
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value)}
              placeholder="Ej: Juan Pérez - Ingeniero"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Opciones: Dibujar o subir */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setIsDrawing(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isDrawing
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Dibujar Firma
            </button>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadImage}
                className="sr-only"
              />
              <div className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md text-sm font-medium text-center transition-colors">
                Subir Imagen
              </div>
            </label>
          </div>

          {/* Canvas para dibujar */}
          {isDrawing && (
            <div className="space-y-3">
              <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white">
                <SignatureCanvas
                  ref={signatureRef}
                  canvasProps={{
                    className: 'signature-canvas w-full h-48',
                  }}
                  backgroundColor="white"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleClear}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Limpiar
                </button>
                <button
                  onClick={handleSaveSignature}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
                >
                  Guardar Firma
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lista de firmas guardadas */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Firmas Guardadas ({signatures.length})
        </h3>

        {signatures.length === 0 ? (
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
              No hay firmas guardadas
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Crea una nueva firma usando las opciones de arriba
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {signatures.map((signature) => (
              <div
                key={signature.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {signature.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {new Date(signature.createdAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(signature.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                    title="Eliminar firma"
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
                  <img
                    src={signature.dataUrl}
                    alt={signature.name}
                    className="max-h-24 max-w-full"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
