'use client';

import { useState, useEffect } from 'react';
import { useFormStore } from '@/store/useFormStore';
import FieldRenderer from './FieldRenderer';
import { ExcelGenerator, downloadExcelFile } from '@/lib/excelGenerator';
import type { Field } from '@/types';

export default function FormWizard() {
  const {
    selectedFormat,
    currentFormData,
    currentStep,
    wizardSteps,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    signatures,
  } = useFormStore();

  const [generating, setGenerating] = useState(false);
  const [quickFillMode, setQuickFillMode] = useState<'all_yes' | 'all_no' | 'all_na' | null>(null);

  const currentWizardStep = wizardSteps[currentStep];
  const isLastStep = currentStep === wizardSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const progressPercentage = ((currentStep + 1) / wizardSteps.length) * 100;

  // Aplicar llenado rápido
  const applyQuickFill = (value: string) => {
    if (!currentWizardStep || !currentFormData || !selectedFormat) return;

    // Encontrar índices de sheet y section actual
    let targetSheetIndex = 0;
    let targetSectionIndex = 0;

    for (let sheetIndex = 0; sheetIndex < selectedFormat.sheets.length; sheetIndex++) {
      const sheet = selectedFormat.sheets[sheetIndex];
      const sectionIndex = sheet.sections.findIndex(
        (s) => s.id === currentWizardStep.section.id
      );

      if (sectionIndex !== -1) {
        targetSheetIndex = sheetIndex;
        targetSectionIndex = sectionIndex;
        break;
      }
    }

    // Filtrar solo los campos radio/checkbox (no observaciones)
    const radioFields = currentWizardStep.section.fields.filter(
      (f) => f.type === 'radio' || f.type === 'checkbox'
    );

    // Aplicar el valor a todos los campos
    radioFields.forEach((field) => {
      updateFieldValue(targetSheetIndex, targetSectionIndex, field.id, value);
    });

    alert(`Se han marcado ${radioFields.length} items como "${value}"`);
  };

  // Generar archivo Excel rellenado
  const handleGenerateExcel = async () => {
    if (!selectedFormat || !currentFormData) return;

    setGenerating(true);
    try {
      const generator = new ExcelGenerator();
      const originalBuffer = (selectedFormat as any).originalBuffer;

      if (!originalBuffer) {
        throw new Error('No se encontró el archivo original');
      }

      // Convertir signatures array a Map
      const signaturesMap = new Map(signatures.map((sig) => [sig.id, sig]));

      const blob = await generator.generateFilledExcel(
        originalBuffer,
        currentFormData,
        signaturesMap,
        selectedFormat
      );

      const fileName = `${selectedFormat.name}_rellenado_${new Date().toISOString().slice(0, 10)}.xlsx`;
      downloadExcelFile(blob, fileName);

      alert('Archivo generado exitosamente!');
    } catch (error) {
      console.error('Error generating Excel:', error);
      alert(`Error al generar el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setGenerating(false);
    }
  };

  if (!currentWizardStep || !selectedFormat) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-medium text-gray-700">
            Paso {currentStep + 1} de {wizardSteps.length}
          </h2>
          <span className="text-sm text-gray-500">
            {Math.round(progressPercentage)}% completado
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Step navigation */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-2 pb-2">
          {wizardSteps.map((step, index) => (
            <button
              key={step.stepNumber}
              onClick={() => goToStep(index)}
              className={`flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                index === currentStep
                  ? 'bg-primary-600 text-white'
                  : step.isCompleted
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {index + 1}. {step.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main form area */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {currentWizardStep.title}
          </h3>
          <p className="text-sm text-gray-600">
            Tipo: <span className="font-medium">{currentWizardStep.section.type}</span>
            {currentWizardStep.isOptional && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Opcional
              </span>
            )}
          </p>
        </div>

        {/* Quick fill options for checklists */}
        {currentWizardStep.section.type === 'checklist' && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-3">
              Opciones de llenado rápido:
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => applyQuickFill('SI')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                Marcar todo SI
              </button>
              <button
                onClick={() => applyQuickFill('NO')}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                Marcar todo NO
              </button>
              <button
                onClick={() => applyQuickFill('N/A')}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                Marcar todo N/A
              </button>
            </div>
          </div>
        )}

        {/* Fields */}
        <div className="space-y-6">
          {currentWizardStep.section.fields.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No se detectaron campos para rellenar en esta sección.</p>
              <p className="text-sm mt-2">
                Esta sección puede ser informativa o de solo lectura.
              </p>
            </div>
          ) : (
            currentWizardStep.section.fields.map((field) => (
              <FieldRenderer
                key={field.id}
                field={field}
                sheetIndex={0} // TODO: Calcular índice correcto
                sectionIndex={currentStep}
              />
            ))
          )}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={goToPreviousStep}
          disabled={isFirstStep}
          className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Anterior
        </button>

        <div className="flex gap-3">
          {currentWizardStep.isOptional && (
            <button
              onClick={goToNextStep}
              className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Saltar
            </button>
          )}

          {!isLastStep ? (
            <button
              onClick={goToNextStep}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Siguiente
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleGenerateExcel}
              disabled={generating}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generando...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Generar Excel
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
