'use client';

import { useState } from 'react';
import FormatSelector from '@/components/FormatSelector';
import FormWizard from '@/components/FormWizard';
import SignatureManager from '@/components/SignatureManager';
import { useFormStore } from '@/store/useFormStore';

export default function Home() {
  const { selectedFormat, resetForm } = useFormStore();
  const [showSignatureManager, setShowSignatureManager] = useState(false);

  const handleBack = () => {
    if (confirm('¿Estás seguro de que quieres volver? Se perderá el progreso actual.')) {
      resetForm();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Barra de acciones */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          {selectedFormat && (
            <button
              onClick={handleBack}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Volver a selección de formatos
            </button>
          )}
        </div>
        <button
          onClick={() => setShowSignatureManager(!showSignatureManager)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <svg
            className="w-4 h-4 mr-2"
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
          Gestionar Firmas
        </button>
      </div>

      {/* Gestor de firmas (modal) */}
      {showSignatureManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Gestión de Firmas
                </h2>
                <button
                  onClick={() => setShowSignatureManager(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <SignatureManager />
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      {!selectedFormat ? (
        <FormatSelector />
      ) : (
        <FormWizard />
      )}
    </div>
  );
}
