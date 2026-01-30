'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFormStore } from '@/store/useFormStore';
import { useDatabaseStore } from '@/store/useDatabaseStore';
import FieldRenderer from './FieldRenderer';
import WorkerSection from './WorkerSection';
import VehicleInfoSection from './VehicleInfoSection';
import GruaInfoSection from './GruaInfoSection';
import TurnoSelector from './TurnoSelector';
import HerramientasInfoSection from './HerramientasInfoSection';
import { ExcelGenerator, downloadExcelFile } from '@/lib/excelGenerator';
import type { Field, Signature } from '@/types';

export default function FormWizard() {
  const {
    selectedFormat,
    currentFormData,
    currentStep,
    wizardSteps,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    updateFieldValue,
  } = useFormStore();

  const { workers } = useDatabaseStore();

  // Construir firmas desde los workers que tienen signatureId
  const signatures = useMemo((): Signature[] => {
    return workers
      .filter(w => w.isActive && w.signatureId)
      .map(w => ({
        id: w.signatureId!,
        name: w.nombre,
        dataUrl: w.signatureData || `/signatures/${w.signatureId}.png`,
        createdAt: new Date(),
      }));
  }, [workers]);

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

  // Función para convertir URL de imagen a base64
  const loadImageAsBase64 = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch image');
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error loading image:', error);
      throw error;
    }
  };

  // Generar archivo Excel rellenado
  const handleGenerateExcel = async () => {
    if (!selectedFormat || !currentFormData) return;

    // Verificar si el archivo es .xls (no soportado)
    if (selectedFormat.fileType === 'xls') {
      alert('El formato .xls no es compatible con la exportación automática. Por favor contacta al administrador para convertir el archivo a .xlsx');
      return;
    }

    setGenerating(true);
    try {
      const generator = new ExcelGenerator();
      const originalBufferBase64 = (selectedFormat as any).originalBuffer;

      if (!originalBufferBase64) {
        throw new Error('No se encontró el archivo original');
      }

      // Convertir de base64 de vuelta a ArrayBuffer
      const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
      };

      const originalBuffer = base64ToArrayBuffer(originalBufferBase64);

      // Cargar firmas que son URLs (no base64) y convertirlas
      const loadedSignatures: Signature[] = await Promise.all(
        signatures.map(async (sig) => {
          if (sig.dataUrl.startsWith('data:')) {
            // Ya es base64
            return sig;
          } else {
            // Es una URL, cargar y convertir
            try {
              const base64 = await loadImageAsBase64(sig.dataUrl);
              return { ...sig, dataUrl: base64 };
            } catch (error) {
              console.error(`Error loading signature for ${sig.name}:`, error);
              return sig; // Devolver sin cambios si falla
            }
          }
        })
      );

      // Convertir signatures array a Map
      const signaturesMap = new Map(loadedSignatures.map((sig) => [sig.id, sig]));

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

        {/* Quick fill options for checklists - solo si tiene campos tipo radio (SI/NO/N/A) */}
        {currentWizardStep.section.type === 'checklist' &&
         currentWizardStep.section.fields.some(f => f.type === 'radio') && (
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
        <div className={currentWizardStep.section.type === 'checklist' ? 'space-y-3' : 'space-y-6'}>
          {currentWizardStep.section.fields.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No se detectaron campos para rellenar en esta sección.</p>
              <p className="text-sm mt-2">
                Esta sección puede ser informativa o de solo lectura.
              </p>
            </div>
          ) : currentWizardStep.section.type === 'checklist' ? (
            // Renderizado especial para checklists: agrupar radio + observaciones
            (() => {
              // Agrupar campos por fila (radio con su observación)
              const groupedFields: Array<{ radio: Field; observation?: Field }> = [];
              const processedIds = new Set<string>();

              currentWizardStep.section.fields.forEach((field) => {
                if (processedIds.has(field.id)) return;

                if (field.type === 'radio') {
                  // Buscar observación correspondiente
                  const rowMatch = field.id.match(/item_(\d+)/);
                  if (rowMatch) {
                    const row = rowMatch[1];
                    // Buscar observación con cualquier prefijo (obs_I, obs_H, obs_P)
                    const obsField = currentWizardStep.section.fields.find(
                      (f) => (f.id === `obs_I${row}` || f.id === `obs_H${row}` || f.id === `obs_P${row}`) && f.type === 'textarea'
                    );

                    groupedFields.push({ radio: field, observation: obsField });
                    processedIds.add(field.id);
                    if (obsField) processedIds.add(obsField.id);
                  } else {
                    groupedFields.push({ radio: field });
                    processedIds.add(field.id);
                  }
                } else if (field.type !== 'textarea' || !(field.id.startsWith('obs_I') || field.id.startsWith('obs_H') || field.id.startsWith('obs_P'))) {
                  // Otros campos que no son observaciones
                  groupedFields.push({ radio: field });
                  processedIds.add(field.id);
                }
              });

              // Colores simples para cada grupo
              const groupColors: Record<string, string> = {
                'DOCUMENTACION DEL EQUIPO': 'bg-gray-100 border-gray-400 text-gray-800',
                'LUCES': 'bg-gray-100 border-gray-400 text-gray-800',
                'NEUMATICOS': 'bg-gray-100 border-gray-400 text-gray-800',
                'ESPEJOS': 'bg-gray-100 border-gray-400 text-gray-800',
                'OPERADOR': 'bg-gray-100 border-gray-400 text-gray-800',
                'ACCESORIO Y SEGURIDAD': 'bg-gray-100 border-gray-400 text-gray-800',
                'GENERAL': 'bg-gray-100 border-gray-400 text-gray-800',
                'VIDRIOS': 'bg-gray-100 border-gray-400 text-gray-800',
              };

              // Renderizar con headers de grupo
              const elements: React.ReactNode[] = [];
              let currentGroup: string | undefined = undefined;
              let itemCounter = 0;

              groupedFields.forEach((group, index) => {
                const fieldGroup = group.radio.group;

                // Mostrar header si cambia el grupo
                if (fieldGroup && fieldGroup !== currentGroup) {
                  currentGroup = fieldGroup;
                  itemCounter = 0;
                  const colorClass = groupColors[fieldGroup] || 'bg-gray-100 border-gray-300 text-gray-900';

                  elements.push(
                    <div
                      key={`header-${fieldGroup}`}
                      className={`${colorClass} border-2 rounded-lg px-6 py-4 mb-3 mt-6 first:mt-0`}
                    >
                      <h4 className="font-bold text-base uppercase tracking-wide">
                        📋 {fieldGroup}
                      </h4>
                    </div>
                  );
                }

                itemCounter++;

                elements.push(
                  <div
                    key={group.radio.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors bg-white"
                  >
                    <div className="flex flex-col lg:flex-row gap-4 items-start">
                      {/* Columna izquierda: Nombre y botones */}
                      <div className="flex-1 min-w-0">
                        <label className="block text-sm font-medium text-gray-900 mb-3">
                          {itemCounter}. {group.radio.label}
                        </label>
                        <FieldRenderer
                          field={group.radio}
                          sheetIndex={0}
                          sectionIndex={currentStep}
                          hideLabel={true}
                        />
                      </div>

                      {/* Columna derecha: Observaciones (más pequeña) */}
                      {group.observation && (
                        <div className="w-full lg:w-72 flex-shrink-0">
                          <label className="block text-xs font-medium text-gray-600 mb-2">
                            Observaciones
                          </label>
                          <FieldRenderer
                            field={group.observation}
                            sheetIndex={0}
                            sectionIndex={currentStep}
                            hideLabel={true}
                            compact={true}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              });

              return <>{elements}</>;
            })()
          ) : currentWizardStep.section.type === 'worker_list' ? (
            // Renderizado especial para la sección de trabajadores
            <WorkerSection
              sheetIndex={0} // TODO: Calcular índice correcto
              sectionIndex={currentStep}
            />
          ) : selectedFormat?.id === 'inspeccion-vehiculo' && currentWizardStep.section.id === 'basic_info' ? (
            // Renderizado especial para la sección de información básica del vehículo
            <>
              <VehicleInfoSection
                sheetIndex={0}
                sectionIndex={currentStep}
              />
              <div className="mt-6 space-y-4">
                {currentWizardStep.section.fields.map((field) => (
                  <FieldRenderer
                    key={field.id}
                    field={field}
                    sheetIndex={0}
                    sectionIndex={currentStep}
                  />
                ))}
              </div>
            </>
          ) : selectedFormat?.id === 'inspeccion-grua' && currentWizardStep.section.id === 'basic_info' ? (
            // Renderizado especial para la sección de información básica de la grúa
            <>
              <GruaInfoSection
                sheetIndex={0}
                sectionIndex={currentStep}
              />
              <div className="mt-6 space-y-4">
                {currentWizardStep.section.fields.map((field) => (
                  <FieldRenderer
                    key={field.id}
                    field={field}
                    sheetIndex={0}
                    sectionIndex={currentStep}
                  />
                ))}
              </div>
            </>
          ) : selectedFormat?.id === 'permiso-trabajo' && currentWizardStep.section.id === 'periodo_validez' ? (
            // Renderizado especial para el período de validez con selector de turno
            <TurnoSelector
              sheetIndex={0}
              sectionIndex={currentStep}
            />
          ) : selectedFormat?.id === 'inspeccion-herramientas' && currentWizardStep.section.id === 'basic_info' ? (
            // Renderizado especial para la información básica de inspección de herramientas
            <HerramientasInfoSection
              sheetIndex={0}
              sectionIndex={currentStep}
              fields={currentWizardStep.section.fields}
            />
          ) : (
            // Renderizado normal para otras secciones
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
