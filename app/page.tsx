'use client';

import FormatSelector from '@/components/FormatSelector';
import FormWizard from '@/components/FormWizard';
import { useFormStore } from '@/store/useFormStore';

export default function Home() {
  const { selectedFormat, resetForm } = useFormStore();

  const handleBack = () => {
    if (confirm('¿Estás seguro de que quieres volver? Se perderá el progreso actual.')) {
      resetForm();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Back button when in form */}
      {selectedFormat && (
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
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
        </div>
      )}

      {/* Main content */}
      {!selectedFormat ? (
        <FormatSelector />
      ) : (
        <FormWizard />
      )}
    </div>
  );
}
