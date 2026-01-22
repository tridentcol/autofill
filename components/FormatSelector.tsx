'use client';

import { useState } from 'react';
import { useFormStore } from '@/store/useFormStore';
import { ExcelParser, loadExcelFromURL } from '@/lib/excelParser';
import { getFormatConfig } from '@/lib/formatConfigs';
import type { ExcelFormat } from '@/types';

// Formatos predefinidos
const PREDEFINED_FORMATS = [
  {
    id: 'inspeccion-vehiculo',
    name: 'Inspección Vehículo Camioneta',
    description: 'Formulario de inspección de vehículos y camionetas',
    filePath: '/formats/INSPECCION VEHICULO CAMIONETA (4).xlsx',
    icon: '🚗',
  },
  {
    id: 'permiso-trabajo',
    name: 'Permiso de Trabajo en Alturas',
    description: 'Permiso de trabajo seguro en alturas',
    filePath: '/formats/PERMISO DE TRABAJO (8).xls',
    icon: '📋',
  },
  {
    id: 'inspeccion-herramientas',
    name: 'Inspección Herramientas y Equipos',
    description: 'Inspección de herramientas y equipos de trabajo',
    filePath: '/formats/INSPECCION HERRAMIENTAS Y O EQUIPOS (9).xlsx',
    icon: '🔧',
  },
  {
    id: 'ats',
    name: 'Análisis de Trabajo Seguro (ATS)',
    description: 'Análisis de trabajo seguro',
    filePath: '/formats/ANALISIS DE TRABAJO SEGURO (ATS) actual (15) (9).xls',
    icon: '⚠️',
  },
  {
    id: 'inspeccion-grua',
    name: 'Inspección Camión Grúa/Manlift',
    description: 'Inspección de camión grúa y plataforma elevadora',
    filePath: '/formats/INSPECCION CAMION GRUA MANLIFT (15).xlsx',
    icon: '🏗️',
  },
];

export default function FormatSelector() {
  const { setSelectedFormat, setCurrentFormData, setWizardSteps } = useFormStore();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState(false);

  const handleSelectFormat = async (formatInfo: typeof PREDEFINED_FORMATS[0]) => {
    setLoading(formatInfo.id);
    setError(null);

    try {
      // Cargar el archivo Excel
      const fileBuffer = await loadExcelFromURL(formatInfo.filePath);

      // Verificar si hay configuración específica para este formato
      const formatConfig = getFormatConfig(formatInfo.id);

      let parsedFormat: ExcelFormat;

      if (formatConfig) {
        // Usar configuración específica (más precisa)
        const sections = formatConfig();

        parsedFormat = {
          id: formatInfo.id,
          name: formatInfo.name,
          description: formatInfo.description,
          filePath: formatInfo.filePath,
          fileType: formatInfo.filePath.endsWith('.xlsx') ? 'xlsx' : 'xls',
          sheets: [
            {
              name: 'Hoja1',
              sections: sections,
              mergedCells: [],
            },
          ],
        };
      } else {
        // Usar parser automático (fallback)
        const parser = new ExcelParser();
        parsedFormat = await parser.parseExcelFile(fileBuffer, {
          id: formatInfo.id,
          name: formatInfo.name,
          description: formatInfo.description,
        });
      }

      // Guardar el buffer original para después generar el archivo rellenado
      (parsedFormat as any).originalBuffer = fileBuffer;

      // Crear wizard steps basados en las secciones detectadas
      const wizardSteps = parsedFormat.sheets.flatMap((sheet, sheetIndex) =>
        sheet.sections.map((section, sectionIndex) => ({
          stepNumber: sheetIndex * 100 + sectionIndex,
          title: `${sheet.name} - ${section.title}`,
          section,
          isCompleted: false,
          isOptional: section.type === 'observations' || section.type === 'header',
        }))
      );

      setWizardSteps(wizardSteps);

      // Inicializar FormData
      const formData = {
        formatId: parsedFormat.id,
        sheets: parsedFormat.sheets.map((sheet) => ({
          sheetName: sheet.name,
          sections: sheet.sections.map((section) => ({
            sectionId: section.id,
            fields: [],
          })),
        })),
        metadata: {
          startedAt: new Date(),
          currentStep: 0,
          totalSteps: wizardSteps.length,
        },
      };

      setCurrentFormData(formData);
      setSelectedFormat(parsedFormat);
    } catch (err) {
      console.error('Error loading format:', err);
      setError(`Error al cargar el formato: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setLoading(null);
    }
  };

  const handleUploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading('upload');
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const buffer = e.target?.result as ArrayBuffer;

        const parser = new ExcelParser();
        const parsedFormat = await parser.parseExcelFile(buffer, {
          id: `upload-${Date.now()}`,
          name: file.name,
          description: 'Formato cargado por el usuario',
        });

        (parsedFormat as any).originalBuffer = buffer;

        const wizardSteps = parsedFormat.sheets.flatMap((sheet, sheetIndex) =>
          sheet.sections.map((section, sectionIndex) => ({
            stepNumber: sheetIndex * 100 + sectionIndex,
            title: `${sheet.name} - ${section.title}`,
            section,
            isCompleted: false,
            isOptional: section.type === 'observations' || section.type === 'header',
          }))
        );

        setWizardSteps(wizardSteps);

        const formData = {
          formatId: parsedFormat.id,
          sheets: parsedFormat.sheets.map((sheet) => ({
            sheetName: sheet.name,
            sections: sheet.sections.map((section) => ({
              sectionId: section.id,
              fields: [],
            })),
          })),
          metadata: {
            startedAt: new Date(),
            currentStep: 0,
            totalSteps: wizardSteps.length,
          },
        };

        setCurrentFormData(formData);
        setSelectedFormat(parsedFormat);
      };

      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(`Error al cargar el archivo: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Selecciona un Formato
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Elige el formulario que deseas rellenar o sube tu propio archivo Excel
        </p>
      </div>

      {error && (
        <div className="mb-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Toggle entre formatos predefinidos y subir archivo */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
          <button
            onClick={() => setUploadMode(false)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              !uploadMode
                ? 'bg-primary-600 text-white'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            Formatos Predefinidos
          </button>
          <button
            onClick={() => setUploadMode(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              uploadMode
                ? 'bg-primary-600 text-white'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            Subir Archivo
          </button>
        </div>
      </div>

      {!uploadMode ? (
        /* Formatos predefinidos */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PREDEFINED_FORMATS.map((format) => (
            <div
              key={format.id}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="text-5xl mb-4 text-center">{format.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                  {format.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4 text-center min-h-[3rem]">
                  {format.description}
                </p>
                <button
                  onClick={() => handleSelectFormat(format)}
                  disabled={loading === format.id}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                >
                  {loading === format.id ? (
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
                      Cargando...
                    </>
                  ) : (
                    'Seleccionar'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Subir archivo */
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md border-2 border-dashed border-gray-300 p-12 text-center hover:border-primary-500 transition-colors">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Haz clic para subir un archivo o arrastra y suelta
                </span>
                <p className="mt-1 text-xs text-gray-500">
                  Archivos Excel (.xlsx, .xls) hasta 10MB
                </p>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept=".xlsx,.xls"
                  onChange={handleUploadFile}
                  disabled={loading === 'upload'}
                />
              </label>
            </div>
            {loading === 'upload' && (
              <div className="mt-4">
                <svg
                  className="animate-spin h-8 w-8 text-primary-600 mx-auto"
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
                <p className="mt-2 text-sm text-gray-600">Procesando archivo...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
