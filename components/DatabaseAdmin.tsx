'use client';

import { useState, useMemo } from 'react';
import { useDatabaseStore } from '@/store/useDatabaseStore';
import { useFormStore } from '@/store/useFormStore';
import type { Worker, WorkerCargo } from '@/types';

type Tab = 'workers' | 'cuadrillas';

export default function DatabaseAdmin() {
  const {
    workers,
    cuadrillas,
    currentUser,
    isAdmin,
    addWorker,
    updateWorker,
    deleteWorker,
    getWorkersByCuadrilla,
    assignWorkerToCuadrilla,
    removeWorkerFromCuadrilla,
    initializeDefaultData,
  } = useDatabaseStore();

  const { signatures } = useFormStore();

  const [activeTab, setActiveTab] = useState<Tab>('workers');
  const [isAddingWorker, setIsAddingWorker] = useState(false);
  const [editingWorkerId, setEditingWorkerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state para nuevo/editar trabajador
  const [formData, setFormData] = useState({
    nombre: '',
    cargo: 'Técnico' as WorkerCargo,
    cedula: '',
    cuadrillaId: '',
    signatureId: '',
  });

  const activeWorkers = useMemo(
    () => workers.filter((w) => w.isActive),
    [workers]
  );

  const filteredWorkers = useMemo(() => {
    if (!searchQuery.trim()) return activeWorkers;

    const query = searchQuery.toLowerCase();
    return activeWorkers.filter(
      (w) =>
        w.nombre.toLowerCase().includes(query) ||
        w.cargo.toLowerCase().includes(query) ||
        w.cedula.includes(query)
    );
  }, [activeWorkers, searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    if (editingWorkerId) {
      // Update existing worker
      updateWorker(editingWorkerId, formData);
      setEditingWorkerId(null);
    } else {
      // Add new worker
      addWorker({
        ...formData,
        isActive: true,
      });
    }

    // Reset form
    setFormData({
      nombre: '',
      cargo: 'Técnico',
      cedula: '',
      cuadrillaId: '',
      signatureId: '',
    });
    setIsAddingWorker(false);
  };

  const handleEdit = (worker: Worker) => {
    setFormData({
      nombre: worker.nombre,
      cargo: worker.cargo,
      cedula: worker.cedula,
      cuadrillaId: worker.cuadrillaId || '',
      signatureId: worker.signatureId || '',
    });
    setEditingWorkerId(worker.id);
    setIsAddingWorker(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este trabajador?')) {
      deleteWorker(id);
    }
  };

  const handleCancel = () => {
    setIsAddingWorker(false);
    setEditingWorkerId(null);
    setFormData({
      nombre: '',
      cargo: 'Técnico',
      cedula: '',
      cuadrillaId: '',
      signatureId: '',
    });
  };

  if (!isAdmin()) {
    return (
      <div className="p-6 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <svg
            className="mx-auto h-12 w-12 text-yellow-400"
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
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Acceso Restringido
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Solo los administradores pueden acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Administración de Base de Datos
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona trabajadores, supervisores y cuadrillas
          </p>
        </div>
        <button
          onClick={initializeDefaultData}
          className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Inicializar Datos
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('workers')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'workers'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Trabajadores ({activeWorkers.length})
          </button>
          <button
            onClick={() => setActiveTab('cuadrillas')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'cuadrillas'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Cuadrillas ({cuadrillas.filter((c) => c.isActive).length})
          </button>
        </nav>
      </div>

      {/* Workers Tab */}
      {activeTab === 'workers' && (
        <div className="space-y-4">
          {/* Search and Add */}
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por nombre, cargo o cédula..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            {!isAddingWorker && (
              <button
                onClick={() => setIsAddingWorker(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 whitespace-nowrap"
              >
                + Agregar Trabajador
              </button>
            )}
          </div>

          {/* Add/Edit Form */}
          {isAddingWorker && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingWorkerId ? 'Editar Trabajador' : 'Nuevo Trabajador'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nombre}
                      onChange={(e) =>
                        setFormData({ ...formData, nombre: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cargo *
                    </label>
                    <select
                      required
                      value={formData.cargo}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cargo: e.target.value as WorkerCargo,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="Conductor">Conductor</option>
                      <option value="Técnico">Técnico</option>
                      <option value="Supervisor">Supervisor</option>
                      <option value="Coordinador de zona">
                        Coordinador de zona
                      </option>
                      <option value="Asistente técnico">
                        Asistente técnico
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cédula
                    </label>
                    <input
                      type="text"
                      value={formData.cedula}
                      onChange={(e) =>
                        setFormData({ ...formData, cedula: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cuadrilla
                    </label>
                    <select
                      value={formData.cuadrillaId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cuadrillaId: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Sin cuadrilla</option>
                      {cuadrillas
                        .filter((c) => c.isActive)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nombre}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Firma Asignada
                    </label>
                    <select
                      value={formData.signatureId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          signatureId: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Sin firma asignada</option>
                      {signatures.map((sig) => (
                        <option key={sig.id} value={sig.id}>
                          {sig.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    {editingWorkerId ? 'Actualizar' : 'Guardar'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Workers List */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cargo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cédula
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cuadrilla
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Firma
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredWorkers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <p className="text-gray-500">
                        {searchQuery
                          ? 'No se encontraron trabajadores'
                          : 'No hay trabajadores registrados'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredWorkers.map((worker) => {
                    const cuadrilla = cuadrillas.find(
                      (c) => c.id === worker.cuadrillaId
                    );
                    const signature = signatures.find(
                      (s) => s.id === worker.signatureId
                    );

                    return (
                      <tr key={worker.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {worker.nombre}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {worker.cargo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {worker.cedula || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {cuadrilla?.nombre || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {signature?.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(worker)}
                            className="text-primary-600 hover:text-primary-900 mr-4"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(worker.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cuadrillas Tab */}
      {activeTab === 'cuadrillas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cuadrillas
            .filter((c) => c.isActive)
            .map((cuadrilla) => {
              const cuadrillaWorkers = getWorkersByCuadrilla(cuadrilla.id);

              return (
                <div
                  key={cuadrilla.id}
                  className="bg-white border border-gray-200 rounded-lg p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {cuadrilla.nombre}
                      </h3>
                      {cuadrilla.descripcion && (
                        <p className="text-sm text-gray-500">
                          {cuadrilla.descripcion}
                        </p>
                      )}
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {cuadrillaWorkers.length} miembros
                    </span>
                  </div>

                  <div className="space-y-2">
                    {cuadrillaWorkers.length === 0 ? (
                      <p className="text-sm text-gray-400 italic">
                        Sin trabajadores asignados
                      </p>
                    ) : (
                      cuadrillaWorkers.map((worker) => (
                        <div
                          key={worker.id}
                          className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {worker.nombre}
                            </p>
                            <p className="text-xs text-gray-500">
                              {worker.cargo}
                              {worker.cedula && ` • CC ${worker.cedula}`}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
