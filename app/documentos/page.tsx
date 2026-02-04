'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import JSZip from 'jszip';
import { useDatabaseStore } from '@/store/useDatabaseStore';

interface Document {
  url: string;
  downloadUrl: string;
  pathname: string;
  size: number;
  uploadedAt: string;
  metadata: {
    formatName: string;
    year: string;
    month: string;
    day: string;
    filename: string;
  };
}

interface DocumentsResponse {
  success: boolean;
  documents: Document[];
  hasMore: boolean;
  cursor?: string;
  filters: {
    year: string | null;
    month: string | null;
    day: string | null;
  };
  error?: string;
  message?: string;
}

export default function DocumentosPage() {
  const router = useRouter();
  const { currentUser, isAdmin } = useDatabaseStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blobNotConfigured, setBlobNotConfigured] = useState(false);
  const [deletingPathname, setDeletingPathname] = useState<string | null>(null);
  const [downloadingZip, setDownloadingZip] = useState(false);

  // Restrict to admin only
  useEffect(() => {
    if (currentUser && !isAdmin()) {
      router.push('/');
    }
  }, [currentUser, isAdmin, router]);

  // Filters
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('');

  // Available years (current year and 2 previous)
  const years = [currentYear, currentYear - 1, currentYear - 2];
  const months = [
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
  ];

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    setBlobNotConfigured(false);

    try {
      const params = new URLSearchParams();
      if (selectedYear) params.append('year', selectedYear);
      if (selectedMonth) params.append('month', selectedMonth);
      if (selectedDay) params.append('day', selectedDay);

      const response = await fetch(`/api/documents/list?${params.toString()}`);
      const data: DocumentsResponse = await response.json();

      if (!response.ok) {
        if (data.message?.includes('BLOB_READ_WRITE_TOKEN')) {
          setBlobNotConfigured(true);
        }
        throw new Error(data.message || 'Error al cargar documentos');
      }

      setDocuments(data.documents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && isAdmin()) {
      fetchDocuments();
    }
  }, [selectedYear, selectedMonth, selectedDay, currentUser, isAdmin]);

  const handleDelete = async (url: string, pathname: string) => {
    if (!confirm('¿Eliminar este documento? Esta acción no se puede deshacer.')) return;
    setDeletingPathname(pathname);
    try {
      const response = await fetch('/api/documents/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al eliminar');
      setDocuments((prev) => prev.filter((d) => d.pathname !== pathname));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar el documento');
    } finally {
      setDeletingPathname(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownloadMonthAsZip = async () => {
    if (!selectedYear || !selectedMonth) {
      alert('Seleccione año y mes para descargar.');
      return;
    }

    setDownloadingZip(true);
    try {
      const params = new URLSearchParams({ year: selectedYear, month: selectedMonth });
      const response = await fetch(`/api/documents/list?${params.toString()}&limit=500`);
      const data: DocumentsResponse = await response.json();

      if (!response.ok) throw new Error(data.message || 'Error al cargar documentos');

      const docs = data.documents;
      if (docs.length === 0) {
        alert('No hay documentos para el mes seleccionado.');
        setDownloadingZip(false);
        return;
      }

      const zip = new JSZip();
      const monthLabel = months.find((m) => m.value === selectedMonth)?.label || selectedMonth;

      for (const doc of docs) {
        const day = doc.metadata.day || '00';
        const folderPath = `Dia-${day}/`;
        const filename = doc.metadata.filename || `documento-${doc.pathname.split('/').pop()}`;

        try {
          const blobUrl = doc.downloadUrl || doc.url;
          const proxyUrl = `/api/documents/download?url=${encodeURIComponent(blobUrl)}`;
          const fileResponse = await fetch(proxyUrl);
          if (!fileResponse.ok) throw new Error(`Error al obtener ${filename}`);
          const blob = await fileResponse.blob();
          zip.file(`${folderPath}${filename}`, blob);
        } catch (err) {
          console.warn(`No se pudo incluir ${filename}:`, err);
        }
      }

      const content = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 9 } });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `documentos-${monthLabel.toLowerCase()}-${selectedYear}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al generar el archivo ZIP');
    } finally {
      setDownloadingZip(false);
    }
  };

  const canDownloadZip = selectedYear && selectedMonth;

  // Admin only: show nothing or redirect while checking
  if (!currentUser || !isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center py-12">
          <p className="text-gray-500">Acceso restringido. Solo administradores pueden ver esta página.</p>
          <Link
            href="/"
            className="mt-4 inline-block text-primary-600 hover:text-primary-700 font-medium"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  if (blobNotConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
            <div className="flex">
              <svg
                className="h-6 w-6 text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-yellow-800">
                  Vercel Blob no configurado
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p className="mb-2">
                    Para usar el almacenamiento en la nube, necesitas configurar Vercel Blob:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Ve a tu dashboard de Vercel</li>
                    <li>Crea un Blob Store en la sección Storage</li>
                    <li>Copia el token y agrégalo como variable de entorno <code className="bg-yellow-100 px-1 rounded">BLOB_READ_WRITE_TOKEN</code></li>
                  </ol>
                  <p className="mt-3">
                    <a
                      href="https://vercel.com/docs/storage/vercel-blob"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium underline hover:text-yellow-900"
                    >
                      Ver documentación de Vercel Blob →
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Documentos</h1>
              <p className="mt-2 text-sm text-gray-600">
                Archivos diligenciados guardados en la nube
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Volver
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Filtrar por fecha</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                Año
              </label>
              <select
                id="year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-2">
                Mes
              </label>
              <select
                id="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todos</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="day" className="block text-sm font-medium text-gray-700 mb-2">
                Día
              </label>
              <select
                id="day"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                disabled={!selectedMonth}
              >
                <option value="">Todos</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={String(day).padStart(2, '0')}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={() => {
                  setSelectedMonth('');
                  setSelectedDay('');
                  setSelectedYear(String(currentYear));
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Limpiar filtros
              </button>
              <button
                onClick={handleDownloadMonthAsZip}
                disabled={!canDownloadZip || downloadingZip}
                title={!canDownloadZip ? 'Seleccione año y mes para descargar' : undefined}
                className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
              >
                {downloadingZip ? (
                  <>
                    <svg
                      className="animate-spin w-5 h-5 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generando ZIP...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Descargar mes como ZIP
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Documents list */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
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
              <p className="mt-2 text-sm text-gray-500">Cargando documentos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <svg
                className="w-12 h-12 text-red-400 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-900 font-medium">Error al cargar documentos</p>
              <p className="mt-1 text-sm text-gray-500">{error}</p>
              <button
                onClick={fetchDocuments}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                Reintentar
              </button>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-900 font-medium">
                No hay documentos para mostrar
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {selectedMonth || selectedDay
                  ? 'Intenta cambiar los filtros o seleccionar un periodo diferente.'
                  : 'Los documentos que generes aparecerán aquí.'}
              </p>
              <Link
                href="/"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                Generar documento
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tamaño
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {documents.map((doc) => (
                    <tr key={doc.pathname} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <svg
                            className="w-8 h-8 text-green-600 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {doc.metadata.formatName}
                            </div>
                            <div className="text-sm text-gray-500">{doc.metadata.filename}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(doc.uploadedAt)}</div>
                        <div className="text-sm text-gray-500">
                          {doc.metadata.day}/{doc.metadata.month}/{doc.metadata.year}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatFileSize(doc.size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            Abrir
                          </a>
                          <a
                            href={doc.downloadUrl}
                            download
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
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
                            Descargar
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDelete(doc.url, doc.pathname)}
                            disabled={deletingPathname === doc.pathname}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 disabled:opacity-50"
                            title="Eliminar documento"
                          >
                            {deletingPathname === doc.pathname ? (
                              <svg
                                className="w-4 h-4 animate-spin"
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
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-4 h-4 mr-1"
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
                            )}
                            {deletingPathname === doc.pathname ? 'Eliminando...' : 'Eliminar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Documents count */}
        {!loading && !error && documents.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            Mostrando {documents.length} documento{documents.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
