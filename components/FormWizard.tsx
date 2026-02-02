'use client';

import { useState, useEffect } from 'react';
import { useFormStore } from '@/store/useFormStore';
import FieldRenderer from './FieldRenderer';
import WorkerSection from './WorkerSection';
import VehicleInfoSection from './VehicleInfoSection';
import GruaInfoSection from './GruaInfoSection';
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
    updateFieldValue,
  } = useFormStore();

  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
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
      // Construir URL absoluta si es relativa
      let absoluteUrl = url;
      if (url.startsWith('/') && typeof window !== 'undefined') {
        absoluteUrl = `${window.location.origin}${url}`;
      }

      console.log(`[Firma] Cargando imagen: ${absoluteUrl}`);

      const response = await fetch(absoluteUrl, {
        cache: 'no-cache',  // Evitar problemas de caché
      });

      if (!response.ok) {
        console.error(`[Firma] Error HTTP ${response.status} para: ${absoluteUrl}`);
        throw new Error(`Failed to fetch image: HTTP ${response.status}`);
      }

      const blob = await response.blob();
      console.log(`[Firma] Imagen cargada, tamaño: ${blob.size} bytes`);

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          console.log(`[Firma] Convertida a base64, longitud: ${result.length}`);
          resolve(result);
        };
        reader.onerror = (error) => {
          console.error('[Firma] Error al leer blob:', error);
          reject(error);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('[Firma] Error cargando imagen:', url, error);
      throw error;
    }
  };

  // Generar el Blob del Excel (compartido entre download y upload)
  const generateExcelBlob = async (): Promise<Blob> => {
    if (!selectedFormat || !currentFormData) {
      throw new Error('No hay formato o datos seleccionados');
    }

    // Verificar si el archivo es .xls (no soportado)
    if (selectedFormat.fileType === 'xls') {
      throw new Error('El formato .xls no es compatible con la exportación automática. Por favor contacta al administrador para convertir el archivo a .xlsx');
    }

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
    console.log(`[Firmas] Procesando ${signatures.length} firmas...`);
    const loadedSignatures = [];

    for (const sig of signatures) {
      if (sig.dataUrl.startsWith('data:')) {
        // Ya es base64
        console.log(`[Firma] ${sig.name} ya es base64`);
        loadedSignatures.push(sig);
      } else {
        // Es una URL, cargar y convertir
        try {
          const base64 = await loadImageAsBase64(sig.dataUrl);
          loadedSignatures.push({ ...sig, dataUrl: base64 });
          console.log(`[Firma] ${sig.name} cargada exitosamente`);
        } catch (error) {
          console.error(`[Firma] Error cargando firma para ${sig.name}:`, error);
          // NO incluir firmas que no se pudieron cargar
          console.warn(`[Firma] ${sig.name} será omitida del Excel`);
        }
      }
    }

    console.log(`[Firmas] ${loadedSignatures.length}/${signatures.length} firmas cargadas exitosamente`);

    // Convertir signatures array a Map
    const signaturesMap = new Map(loadedSignatures.map((sig) => [sig.id, sig]));

    return await generator.generateFilledExcel(
      originalBuffer,
      currentFormData,
      signaturesMap,
      selectedFormat
    );
  };

  // Generar y descargar Excel
  const handleGenerateExcel = async () => {
    if (!selectedFormat || !currentFormData) return;

    // Verificar si el archivo es .xls (no soportado)
    if (selectedFormat.fileType === 'xls') {
      alert('El formato .xls no es compatible con la exportación automática. Por favor contacta al administrador para convertir el archivo a .xlsx');
      return;
    }

    setGenerating(true);
    try {
      const blob = await generateExcelBlob();
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

  // Subir a la nube (Vercel Blob)
  const handleUploadToCloud = async () => {
    if (!selectedFormat || !currentFormData) return;

    setUploading(true);
    setUploadSuccess(false);
    setUploadUrl(null);

    try {
      // Generate Excel blob
      const blob = await generateExcelBlob();
      
      // Create FormData
      const formData = new FormData();
      const fileName = `${selectedFormat.name}_rellenado_${new Date().toISOString().slice(0, 10)}.xlsx`;
      const file = new File([blob], fileName, { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      formData.append('file', file);
      formData.append('formatName', selectedFormat.name);
      formData.append('formatId', selectedFormat.id);

      // Upload to API
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al subir el archivo');
      }

      setUploadSuccess(true);
      setUploadUrl(result.blob.url);
      alert('¡Archivo guardado en la nube exitosamente!');
    } catch (error) {
      console.error('Error uploading to cloud:', error);
      alert(`Error al subir a la nube: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setUploading(false);
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
            <>
              {/* Upload to Cloud button */}
              <button
                onClick={handleUploadToCloud}
                disabled={uploading || generating}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {uploading ? (
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
                    Subiendo...
                  </>
                ) : uploadSuccess ? (
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Guardado en la nube
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
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    Guardar en la nube
                  </>
                )}
              </button>

              {/* Download Excel button */}
              <button
                onClick={handleGenerateExcel}
                disabled={generating || uploading}
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
                    Descargar Excel
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Success message when uploaded */}
      {uploadSuccess && uploadUrl && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start">
            <svg
              className="w-6 h-6 text-green-600 mr-3 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-green-800">
                Documento guardado en la nube
              </h3>
              <p className="mt-1 text-sm text-green-700">
                El archivo se guardó correctamente y está disponible en la sección de Documentos.
              </p>
              <div className="mt-3 flex gap-3">
                <a
                  href="/documentos"
                  className="text-sm font-medium text-green-800 hover:text-green-900 underline"
                >
                  Ver todos los documentos
                </a>
                <a
                  href={uploadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-green-800 hover:text-green-900 underline"
                >
                  Abrir documento
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
