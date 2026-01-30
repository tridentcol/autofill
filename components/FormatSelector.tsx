'use client';

import { useState } from 'react';
import { useFormStore } from '@/store/useFormStore';
import { ExcelParser, loadExcelFromURL, getFirstSheetName } from '@/lib/excelParser';
import { getFormatConfig } from '@/lib/formatConfigs';
import type { ExcelFormat } from '@/types';

// Formatos predefinidos con iconos SVG
const PREDEFINED_FORMATS = [
  {
    id: 'inspeccion-vehiculo',
    name: 'Inspección Vehículo',
    description: 'Formulario de inspección de vehículos y camionetas',
    filePath: '/formats/INSPECCION VEHICULO CAMIONETA (4).xlsx',
    iconType: 'vehicle',
  },
  {
    id: 'permiso-trabajo',
    name: 'Permiso de Trabajo',
    description: 'Permiso de trabajo seguro en alturas',
    filePath: '/formats/PERMISO DE TRABAJO (8).xlsx',
    iconType: 'document',
  },
  {
    id: 'inspeccion-herramientas',
    name: 'Inspección Herramientas',
    description: 'Inspección de herramientas y equipos de trabajo',
    filePath: '/formats/INSPECCION HERRAMIENTAS Y O EQUIPOS (9).xlsx',
    iconType: 'tools',
  },
  {
    id: 'ats',
    name: 'Análisis de Trabajo Seguro',
    description: 'Análisis de trabajo seguro (ATS)',
    filePath: '/formats/ANALISIS DE TRABAJO SEGURO (ATS) actual (15) (9).xlsx',
    iconType: 'warning',
  },
  {
    id: 'inspeccion-grua',
    name: 'Inspección Grúa/Manlift',
    description: 'Inspección de camión grúa y plataforma elevadora',
    filePath: '/formats/INSPECCION CAMION GRUA MANLIFT (15).xlsx',
    iconType: 'crane',
  },
];

// Icon components
const FormatIcon = ({ type, className = "w-6 h-6" }: { type: string; className?: string }) => {
  switch (type) {
    case 'vehicle':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
        </svg>
      );
    case 'document':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case 'tools':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case 'warning':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    case 'crane':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
    default:
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
  }
};

export default function FormatSelector() {
  const { setSelectedFormat, setCurrentFormData, setWizardSteps } = useFormStore();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'formats' | 'upload'>('formats');

  const handleSelectFormat = async (formatInfo: typeof PREDEFINED_FORMATS[0]) => {
    setLoading(formatInfo.id);
    setError(null);

    try {
      const fileBuffer = await loadExcelFromURL(formatInfo.filePath);
      const formatConfig = getFormatConfig(formatInfo.id);

      let parsedFormat: ExcelFormat;

      if (formatConfig) {
        const sections = formatConfig();
        // Obtener el nombre real de la primera hoja con contenido
        const sheetName = await getFirstSheetName(fileBuffer);
        parsedFormat = {
          id: formatInfo.id,
          name: formatInfo.name,
          description: formatInfo.description,
          filePath: formatInfo.filePath,
          fileType: formatInfo.filePath.endsWith('.xlsx') ? 'xlsx' : 'xls',
          sheets: [
            {
              name: sheetName,
              sections: sections,
              mergedCells: [],
            },
          ],
        };
      } else {
        const parser = new ExcelParser();
        parsedFormat = await parser.parseExcelFile(fileBuffer, {
          id: formatInfo.id,
          name: formatInfo.name,
          description: formatInfo.description,
        });
      }

      const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
      };

      (parsedFormat as any).originalBuffer = arrayBufferToBase64(fileBuffer);

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

        const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
          const bytes = new Uint8Array(buffer);
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          return btoa(binary);
        };

        (parsedFormat as any).originalBuffer = arrayBufferToBase64(buffer);

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
    <div className="min-h-[60vh]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Seleccionar Formato</h1>
        <p className="mt-1 text-sm text-gray-600">
          Elige un formulario predefinido o sube tu propio archivo Excel
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Content Card */}
      <div className="bg-white border border-gray-200 rounded-lg">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('formats')}
              className={`flex-1 sm:flex-none px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'formats'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Formatos Predefinidos
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 sm:flex-none px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'upload'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Subir Archivo
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {activeTab === 'formats' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PREDEFINED_FORMATS.map((format) => (
                <button
                  key={format.id}
                  onClick={() => handleSelectFormat(format)}
                  disabled={loading === format.id}
                  className="group p-4 border border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 group-hover:bg-gray-200 transition-colors flex-shrink-0">
                      {loading === format.id ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <FormatIcon type={format.iconType} className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                        {format.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {format.description}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="max-w-lg mx-auto">
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                {loading === 'upload' ? (
                  <div className="text-center">
                    <svg className="w-10 h-10 text-gray-400 mx-auto animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="mt-3 text-sm text-gray-600">Procesando archivo...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <svg className="w-10 h-10 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mt-3 text-sm font-medium text-gray-900">
                      Haz clic para subir un archivo
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Excel (.xlsx, .xls) hasta 10MB
                    </p>
                  </div>
                )}
                <input
                  id="file-upload"
                  type="file"
                  className="sr-only"
                  accept=".xlsx,.xls"
                  onChange={handleUploadFile}
                  disabled={loading === 'upload'}
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
          <span>{PREDEFINED_FORMATS.length} formatos disponibles</span>
        </div>
      </div>
    </div>
  );
}
