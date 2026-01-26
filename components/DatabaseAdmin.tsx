'use client';

import { useState, useMemo } from 'react';
import { useDatabaseStore } from '@/store/useDatabaseStore';
import { useFormStore } from '@/store/useFormStore';
import type { Worker, Cuadrilla } from '@/types';

type Tab = 'workers' | 'cuadrillas' | 'cargos';

export default function DatabaseAdmin() {
  const {
    workers,
    cuadrillas,
    cargos,
    isAdmin,
    addWorker,
    updateWorker,
    deleteWorker,
    addCuadrilla,
    updateCuadrilla,
    deleteCuadrilla,
    getWorkersByCuadrilla,
    addCargo,
    updateCargo,
    deleteCargo,
  } = useDatabaseStore();

  const { signatures } = useFormStore();

  const [activeTab, setActiveTab] = useState<Tab>('workers');
  const [searchQuery, setSearchQuery] = useState('');

  // Worker form state
  const [isAddingWorker, setIsAddingWorker] = useState(false);
  const [editingWorkerId, setEditingWorkerId] = useState<string | null>(null);
  const [workerForm, setWorkerForm] = useState({
    nombre: '',
    cargo: cargos[0] || 'Técnico',
    cedula: '',
    cuadrillaId: '',
    signatureId: '',
  });

  // Cuadrilla form state
  const [isAddingCuadrilla, setIsAddingCuadrilla] = useState(false);
  const [editingCuadrillaId, setEditingCuadrillaId] = useState<string | null>(null);
  const [cuadrillaForm, setCuadrillaForm] = useState({
    nombre: '',
    descripcion: '',
  });

  // Cargo form state
  const [isAddingCargo, setIsAddingCargo] = useState(false);
  const [editingCargo, setEditingCargo] = useState<string | null>(null);
  const [cargoForm, setCargoForm] = useState('');

  const activeWorkers = useMemo(() => workers.filter((w) => w.isActive), [workers]);
  const activeCuadrillas = useMemo(() => cuadrillas.filter((c) => c.isActive), [cuadrillas]);

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

  // Worker handlers
  const handleWorkerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerForm.nombre.trim()) return;

    if (editingWorkerId) {
      updateWorker(editingWorkerId, workerForm);
    } else {
      addWorker({ ...workerForm, isActive: true });
    }
    resetWorkerForm();
  };

  const handleEditWorker = (worker: Worker) => {
    setWorkerForm({
      nombre: worker.nombre,
      cargo: worker.cargo,
      cedula: worker.cedula,
      cuadrillaId: worker.cuadrillaId || '',
      signatureId: worker.signatureId || '',
    });
    setEditingWorkerId(worker.id);
    setIsAddingWorker(true);
  };

  const resetWorkerForm = () => {
    setWorkerForm({ nombre: '', cargo: cargos[0] || 'Técnico', cedula: '', cuadrillaId: '', signatureId: '' });
    setIsAddingWorker(false);
    setEditingWorkerId(null);
  };

  // Cuadrilla handlers
  const handleCuadrillaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cuadrillaForm.nombre.trim()) return;

    if (editingCuadrillaId) {
      updateCuadrilla(editingCuadrillaId, cuadrillaForm);
    } else {
      addCuadrilla({ ...cuadrillaForm, workerIds: [], isActive: true });
    }
    resetCuadrillaForm();
  };

  const handleEditCuadrilla = (cuadrilla: Cuadrilla) => {
    setCuadrillaForm({ nombre: cuadrilla.nombre, descripcion: cuadrilla.descripcion || '' });
    setEditingCuadrillaId(cuadrilla.id);
    setIsAddingCuadrilla(true);
  };

  const handleDeleteCuadrilla = (id: string) => {
    if (confirm('¿Eliminar esta cuadrilla? Los trabajadores asignados quedarán sin cuadrilla.')) {
      deleteCuadrilla(id);
    }
  };

  const resetCuadrillaForm = () => {
    setCuadrillaForm({ nombre: '', descripcion: '' });
    setIsAddingCuadrilla(false);
    setEditingCuadrillaId(null);
  };

  // Cargo handlers
  const handleCargoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cargoForm.trim()) return;

    if (editingCargo) {
      updateCargo(editingCargo, cargoForm);
    } else {
      addCargo(cargoForm);
    }
    resetCargoForm();
  };

  const handleEditCargo = (cargo: string) => {
    setCargoForm(cargo);
    setEditingCargo(cargo);
    setIsAddingCargo(true);
  };

  const handleDeleteCargo = (cargo: string) => {
    const workersWithCargo = workers.filter(w => w.cargo === cargo && w.isActive).length;
    if (workersWithCargo > 0) {
      alert(`No se puede eliminar. Hay ${workersWithCargo} trabajador(es) con este cargo.`);
      return;
    }
    if (cargos.length <= 1) {
      alert('Debe haber al menos un cargo.');
      return;
    }
    if (confirm(`¿Eliminar el cargo "${cargo}"?`)) {
      deleteCargo(cargo);
    }
  };

  const resetCargoForm = () => {
    setCargoForm('');
    setIsAddingCargo(false);
    setEditingCargo(null);
  };

  if (!isAdmin()) {
    return (
      <div className="p-6 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Acceso Restringido</h3>
          <p className="mt-2 text-sm text-gray-500">Solo administradores pueden acceder.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6 -mb-px">
          {[
            { id: 'workers' as const, label: 'Trabajadores', count: activeWorkers.length },
            { id: 'cuadrillas' as const, label: 'Cuadrillas', count: activeCuadrillas.length },
            { id: 'cargos' as const, label: 'Cargos', count: cargos.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full">{tab.count}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Workers Tab */}
      {activeTab === 'workers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por nombre, cargo o cédula..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            {!isAddingWorker && (
              <button
                onClick={() => setIsAddingWorker(true)}
                className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap"
              >
                Agregar
              </button>
            )}
          </div>

          {isAddingWorker && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                {editingWorkerId ? 'Editar Trabajador' : 'Nuevo Trabajador'}
              </h3>
              <form onSubmit={handleWorkerSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nombre *</label>
                    <input
                      type="text"
                      required
                      value={workerForm.nombre}
                      onChange={(e) => setWorkerForm({ ...workerForm, nombre: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Cargo *</label>
                    <select
                      required
                      value={workerForm.cargo}
                      onChange={(e) => setWorkerForm({ ...workerForm, cargo: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900"
                    >
                      {cargos.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Cédula</label>
                    <input
                      type="text"
                      value={workerForm.cedula}
                      onChange={(e) => setWorkerForm({ ...workerForm, cedula: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Cuadrilla</label>
                    <select
                      value={workerForm.cuadrillaId}
                      onChange={(e) => setWorkerForm({ ...workerForm, cuadrillaId: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900"
                    >
                      <option value="">Sin cuadrilla</option>
                      {activeCuadrillas.map((c) => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="px-4 py-2 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-800">
                    {editingWorkerId ? 'Actualizar' : 'Guardar'}
                  </button>
                  <button type="button" onClick={resetWorkerForm} className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cargo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Cédula</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Cuadrilla</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredWorkers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                        {searchQuery ? 'Sin resultados' : 'No hay trabajadores'}
                      </td>
                    </tr>
                  ) : (
                    filteredWorkers.map((worker) => (
                      <tr key={worker.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{worker.nombre}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{worker.cargo}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">{worker.cedula || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                          {cuadrillas.find(c => c.id === worker.cuadrillaId)?.nombre || '-'}
                        </td>
                        <td className="px-4 py-3 text-right text-sm">
                          <button onClick={() => handleEditWorker(worker)} className="text-gray-600 hover:text-gray-900 mr-3">
                            Editar
                          </button>
                          <button onClick={() => deleteWorker(worker.id)} className="text-red-600 hover:text-red-900">
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Cuadrillas Tab */}
      {activeTab === 'cuadrillas' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            {!isAddingCuadrilla && (
              <button
                onClick={() => setIsAddingCuadrilla(true)}
                className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Agregar Cuadrilla
              </button>
            )}
          </div>

          {isAddingCuadrilla && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                {editingCuadrillaId ? 'Editar Cuadrilla' : 'Nueva Cuadrilla'}
              </h3>
              <form onSubmit={handleCuadrillaSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nombre *</label>
                    <input
                      type="text"
                      required
                      value={cuadrillaForm.nombre}
                      onChange={(e) => setCuadrillaForm({ ...cuadrillaForm, nombre: e.target.value })}
                      placeholder="Ej: CUAD1"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
                    <input
                      type="text"
                      value={cuadrillaForm.descripcion}
                      onChange={(e) => setCuadrillaForm({ ...cuadrillaForm, descripcion: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="px-4 py-2 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-800">
                    {editingCuadrillaId ? 'Actualizar' : 'Guardar'}
                  </button>
                  <button type="button" onClick={resetCuadrillaForm} className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeCuadrillas.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-sm text-gray-500">
                No hay cuadrillas registradas
              </div>
            ) : (
              activeCuadrillas.map((cuadrilla) => {
                const members = getWorkersByCuadrilla(cuadrilla.id);
                return (
                  <div key={cuadrilla.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{cuadrilla.nombre}</h3>
                        {cuadrilla.descripcion && (
                          <p className="text-xs text-gray-500 mt-0.5">{cuadrilla.descripcion}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                          {members.length} miembros
                        </span>
                        <button
                          onClick={() => handleEditCuadrilla(cuadrilla)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteCuadrilla(cuadrilla.id)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {members.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">Sin miembros asignados</p>
                      ) : (
                        members.slice(0, 5).map((w) => (
                          <div key={w.id} className="text-xs text-gray-600 flex justify-between">
                            <span>{w.nombre}</span>
                            <span className="text-gray-400">{w.cargo}</span>
                          </div>
                        ))
                      )}
                      {members.length > 5 && (
                        <p className="text-xs text-gray-400">+{members.length - 5} más</p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Cargos Tab */}
      {activeTab === 'cargos' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Gestiona los cargos disponibles para los trabajadores
            </p>
            {!isAddingCargo && (
              <button
                onClick={() => setIsAddingCargo(true)}
                className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Agregar Cargo
              </button>
            )}
          </div>

          {isAddingCargo && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                {editingCargo ? 'Editar Cargo' : 'Nuevo Cargo'}
              </h3>
              <form onSubmit={handleCargoSubmit} className="flex gap-3">
                <input
                  type="text"
                  required
                  value={cargoForm}
                  onChange={(e) => setCargoForm(e.target.value)}
                  placeholder="Nombre del cargo"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900"
                />
                <button type="submit" className="px-4 py-2 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-800">
                  {editingCargo ? 'Actualizar' : 'Guardar'}
                </button>
                <button type="button" onClick={resetCargoForm} className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                  Cancelar
                </button>
              </form>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
            {cargos.map((cargo) => {
              const workersWithCargo = workers.filter(w => w.cargo === cargo && w.isActive).length;
              return (
                <div key={cargo} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{cargo}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      {workersWithCargo} trabajador{workersWithCargo !== 1 ? 'es' : ''}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEditCargo(cargo)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteCargo(cargo)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
