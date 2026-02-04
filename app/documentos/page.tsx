'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import JSZip from 'jszip';
import { useDatabaseStore } from '@/store/useDatabaseStore';

// Tipos de documentos
const DOCUMENT_TYPES = [
  { id: 'all', name: 'Todos los documentos' },
  { id: 'inspeccion-herramientas', name: 'Inspección de Herramientas' },
  { id: 'inspeccion-vehiculo', name: 'Inspección de Vehículo' },
  { id: 'permiso-trabajo', name: 'Permiso de Trabajo' },
  { id: 'ats', name: 'ATS (Análisis de Trabajo Seguro)' },
  { id: 'inspeccion-grua', name: 'Inspección de Grúa' },
];

type DownloadPeriod = 'day' | 'week' | 'month' | 'custom';

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
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Estado para rango personalizado
  const [showCustomRangeModal, setShowCustomRangeModal] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Restrict to admin only
  useEffect(() => {
    if (currentUser && !isAdmin()) {
      router.push('/');
    }
  }, [currentUser, isAdmin, router]);

  // Obtener fecha actual en Colombia
  const getColombiaDate = () => {
    const now = new Date();
    const colombiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
    return colombiaTime;
  };

  // Filtros - inicializar con fecha actual de Colombia
  const colombiaToday = getColombiaDate();
  const [selectedYear, setSelectedYear] = useState<string>(String(colombiaToday.getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState<string>(String(colombiaToday.getMonth() + 1).padStart(2, '0'));
  const [selectedDay, setSelectedDay] = useState<string>(String(colombiaToday.getDate()).padStart(2, '0'));
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Available years (current year and 2 previous)
  const currentYear = colombiaToday.getFullYear();
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

  // Filtrar documentos por tipo y búsqueda
  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    // Filtrar por tipo de documento
    if (documentTypeFilter !== 'all') {
      filtered = filtered.filter(doc => doc.metadata.formatName === documentTypeFilter);
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.metadata.filename.toLowerCase().includes(query) ||
        doc.metadata.formatName.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [documents, documentTypeFilter, searchQuery]);

  // Selección de documentos
  const toggleDocumentSelection = (pathname: string) => {
    const newSelection = new Set(selectedDocuments);
    if (newSelection.has(pathname)) {
      newSelection.delete(pathname);
    } else {
      newSelection.add(pathname);
    }
    setSelectedDocuments(newSelection);
  };

  const selectAll = () => {
    setSelectedDocuments(new Set(filteredDocuments.map(doc => doc.pathname)));
  };

  const selectNone = () => {
    setSelectedDocuments(new Set());
  };

  // Selección rápida por período
  const selectByPeriod = (period: DownloadPeriod) => {
    const targetDate = new Date(`${selectedYear}-${selectedMonth}-${selectedDay || '01'}`);
    const docsInPeriod = getDocumentsForPeriod(period, targetDate);
    setSelectedDocuments(new Set(docsInPeriod.map(doc => doc.pathname)));
  };

  // Obtener documentos para un período específico
  const getDocumentsForPeriod = (period: DownloadPeriod, date: Date, customStart?: Date, customEnd?: Date) => {
    if (period === 'custom' && customStart && customEnd) {
      return documents.filter(doc => {
        const docDate = new Date(`${doc.metadata.year}-${doc.metadata.month}-${doc.metadata.day}`);
        return docDate >= customStart && docDate <= customEnd;
      });
    } else if (period === 'day') {
      return documents.filter(doc =>
        doc.metadata.year === String(date.getFullYear()) &&
        doc.metadata.month === String(date.getMonth() + 1).padStart(2, '0') &&
        doc.metadata.day === String(date.getDate()).padStart(2, '0')
      );
    } else if (period === 'week') {
      const startOfWeek = new Date(date);
      const day = startOfWeek.getDay();
      startOfWeek.setDate(date.getDate() - day);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      return documents.filter(doc => {
        const docDate = new Date(`${doc.metadata.year}-${doc.metadata.month}-${doc.metadata.day}`);
        return docDate >= startOfWeek && docDate <= endOfWeek;
      });
    } else { // month
      return documents.filter(doc =>
        doc.metadata.year === String(date.getFullYear()) &&
        doc.metadata.month === String(date.getMonth() + 1).padStart(2, '0')
      );
    }
  };

  // Eliminar documentos seleccionados
  const deleteSelected = async () => {
    if (selectedDocuments.size === 0) {
      alert('No hay documentos seleccionados');
      return;
    }

    if (!confirm(`¿Eliminar ${selectedDocuments.size} documento(s)? Esta acción no se puede deshacer.`)) {
      return;
    }

    setDeleting(true);
    try {
      const deletePromises = Array.from(selectedDocuments).map(pathname => {
        const doc = documents.find(d => d.pathname === pathname);
        if (!doc) return Promise.resolve();

        return fetch('/api/documents/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: doc.url })
        });
      });

      await Promise.all(deletePromises);

      // Recargar documentos
      await fetchDocuments();
      setSelectedDocuments(new Set());

      alert('Documentos eliminados exitosamente');
    } catch (error) {
      console.error('Error deleting documents:', error);
      alert('Error al eliminar documentos');
    } finally {
      setDeleting(false);
    }
  };

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

  // Manejar selección del período de descarga
  const handleDownloadPeriod = (period: DownloadPeriod) => {
    if (period === 'custom') {
      // Abrir modal para seleccionar rango personalizado
      setShowDownloadMenu(false);
      setShowCustomRangeModal(true);
    } else {
      // Descargar directamente
      downloadAsZip(period);
    }
  };

  // Descargar documentos como ZIP con rango personalizado
  const downloadCustomRange = async () => {
    if (!customStartDate || !customEndDate) {
      alert('Debes seleccionar ambas fechas');
      return;
    }

    const startDate = new Date(customStartDate);
    const endDate = new Date(customEndDate);

    if (startDate > endDate) {
      alert('La fecha de inicio no puede ser posterior a la fecha de fin');
      return;
    }

    setShowCustomRangeModal(false);
    await downloadAsZip('custom', startDate, endDate);
  };

  // Descargar documentos como ZIP
  const downloadAsZip = async (period: DownloadPeriod, customStart?: Date, customEnd?: Date) => {
    setDownloadingZip(true);
    setShowDownloadMenu(false);

    try {
      const targetDate = new Date(`${selectedYear}-${selectedMonth}-${selectedDay || '01'}`);
      const docsToDownload = getDocumentsForPeriod(period, targetDate, customStart, customEnd);

      if (docsToDownload.length === 0) {
        alert('No hay documentos para descargar en el período seleccionado');
        setDownloadingZip(false);
        return;
      }

      const zip = new JSZip();

      // Descargar cada documento y agregarlo al ZIP
      for (const doc of docsToDownload) {
        try {
          const day = doc.metadata.day || '00';
          const folderPath = period === 'day' ? '' : `Dia-${day}/`;
          const filename = doc.metadata.filename || `documento-${doc.pathname.split('/').pop()}`;

          const blobUrl = doc.downloadUrl || doc.url;
          const proxyUrl = `/api/documents/download?url=${encodeURIComponent(blobUrl)}`;
          const fileResponse = await fetch(proxyUrl);

          if (!fileResponse.ok) {
            console.warn(`Error al obtener ${filename}`);
            continue;
          }

          const blob = await fileResponse.blob();
          zip.file(`${folderPath}${filename}`, blob);
        } catch (error) {
          console.error(`Error downloading ${doc.metadata.filename}:`, error);
        }
      }

      // Generar ZIP
      const content = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 }
      });

      // Descargar
      const url = window.URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;

      let filename: string;
      if (period === 'custom' && customStart && customEnd) {
        const startStr = `${customStart.getDate().toString().padStart(2, '0')}-${(customStart.getMonth() + 1).toString().padStart(2, '0')}-${customStart.getFullYear()}`;
        const endStr = `${customEnd.getDate().toString().padStart(2, '0')}-${(customEnd.getMonth() + 1).toString().padStart(2, '0')}-${customEnd.getFullYear()}`;
        filename = `documentos-${startStr}_a_${endStr}.zip`;
      } else {
        const periodNames = {
          day: `dia-${selectedDay}`,
          week: `semana`,
          month: months.find(m => m.value === selectedMonth)?.label.toLowerCase() || selectedMonth,
          custom: 'personalizado'
        };
        filename = `documentos-${periodNames[period]}-${selectedYear}.zip`;
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert(`Descargados ${docsToDownload.length} documentos`);
    } catch (error) {
      console.error('Error creating ZIP:', error);
      alert('Error al crear el archivo ZIP');
    } finally {
      setDownloadingZip(false);
    }
  };

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Documentos</h1>
              <p className="mt-2 text-sm text-gray-600">
                Archivos diligenciados guardados en la nube (filtrado por día actual)
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchDocuments}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <svg
                  className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Actualizar
              </button>
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
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Filtrar documentos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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

            <div>
              <label htmlFor="docType" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Documento
              </label>
              <select
                id="docType"
                value={documentTypeFilter}
                onChange={(e) => setDocumentTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                {DOCUMENT_TYPES.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                const today = getColombiaDate();
                setSelectedYear(String(today.getFullYear()));
                setSelectedMonth(String(today.getMonth() + 1).padStart(2, '0'));
                setSelectedDay(String(today.getDate()).padStart(2, '0'));
                setDocumentTypeFilter('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Selección rápida */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 flex items-center">Selección:</span>
              <button
                onClick={selectAll}
                className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Todos
              </button>
              <button
                onClick={selectNone}
                className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Ninguno
              </button>
              <button
                onClick={() => selectByPeriod('day')}
                className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Día Actual
              </button>
              <button
                onClick={() => selectByPeriod('week')}
                className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Semana
              </button>
              <button
                onClick={() => selectByPeriod('month')}
                className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Mes
              </button>
            </div>

            <div className="flex-1"></div>

            {/* Acciones */}
            <div className="flex gap-2">
              {/* Descargar como ZIP */}
              <div className="relative">
                <button
                  onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                  disabled={downloadingZip}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {downloadingZip ? 'Descargando...' : 'Descargar ZIP'}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showDownloadMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => handleDownloadPeriod('day')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                    >
                      Descargar Día
                    </button>
                    <button
                      onClick={() => handleDownloadPeriod('week')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Descargar Semana
                    </button>
                    <button
                      onClick={() => handleDownloadPeriod('month')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Descargar Mes
                    </button>
                    <button
                      onClick={() => handleDownloadPeriod('custom')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg border-t border-gray-100"
                    >
                      Rango Personalizado...
                    </button>
                  </div>
                )}
              </div>

              {/* Eliminar seleccionados */}
              <button
                onClick={deleteSelected}
                disabled={selectedDocuments.size === 0 || deleting}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar ({selectedDocuments.size})
              </button>
            </div>
          </div>
        </div>

        {/* Documents list */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <p className="text-sm text-gray-600">
              {filteredDocuments.length} documento(s) encontrado(s)
              {selectedDocuments.size > 0 && ` • ${selectedDocuments.size} seleccionado(s)`}
            </p>
          </div>
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
          ) : filteredDocuments.length === 0 ? (
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
                {selectedMonth || selectedDay || documentTypeFilter !== 'all' || searchQuery
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.size === filteredDocuments.length && filteredDocuments.length > 0}
                        onChange={() => selectedDocuments.size === filteredDocuments.length ? selectNone() : selectAll()}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Tamaño
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.pathname} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedDocuments.has(doc.pathname)}
                          onChange={() => toggleDocumentSelection(doc.pathname)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </td>
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
                      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        <div className="text-sm text-gray-900">{formatDate(doc.uploadedAt)}</div>
                        <div className="text-sm text-gray-500">
                          {doc.metadata.day}/{doc.metadata.month}/{doc.metadata.year}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
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

        {/* Modal de Rango Personalizado */}
        {showCustomRangeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Seleccionar Rango de Fechas
              </h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Fin
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowCustomRangeModal(false);
                    setCustomStartDate('');
                    setCustomEndDate('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={downloadCustomRange}
                  disabled={!customStartDate || !customEndDate || downloadingZip}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloadingZip ? 'Descargando...' : 'Descargar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
