'use client';

import { useState } from 'react';
import { useDatabaseStore } from '@/store/useDatabaseStore';
import type { Zona } from '@/types';

export default function ZonaManagement() {
  const { zonas, addZona, updateZona, deleteZona } = useDatabaseStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form state for adding/editing
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
  });

  // Filter active zonas
  const activeZonas = zonas.filter(z => z.isActive);

  // Filter by search term
  const filteredZonas = activeZonas.filter(z =>
    z.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (z.descripcion && z.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAdd = async () => {
    if (!formData.nombre.trim()) {
      alert('El nombre de la zona es obligatorio');
      return;
    }

    // Check if zona already exists
    if (activeZonas.some(z => z.nombre.toLowerCase() === formData.nombre.trim().toLowerCase())) {
      alert('Ya existe una zona con ese nombre');
      return;
    }

    setIsLoading(true);
    try {
      await addZona({
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || undefined,
        isActive: true,
      });

      setFormData({ nombre: '', descripcion: '' });
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding zona:', error);
      alert('Error al agregar la zona');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editingId || !formData.nombre.trim()) {
      alert('El nombre de la zona es obligatorio');
      return;
    }

    // Check if another zona already has this name
    if (activeZonas.some(z => z.id !== editingId && z.nombre.toLowerCase() === formData.nombre.trim().toLowerCase())) {
      alert('Ya existe otra zona con ese nombre');
      return;
    }

    setIsLoading(true);
    try {
      await updateZona(editingId, {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || undefined,
      });

      setFormData({ nombre: '', descripcion: '' });
      setEditingId(null);
    } catch (error) {
      console.error('Error updating zona:', error);
      alert('Error al actualizar la zona');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro que desea eliminar esta zona?')) return;

    setIsLoading(true);
    try {
      await deleteZona(id);
    } catch (error) {
      console.error('Error deleting zona:', error);
      alert('Error al eliminar la zona');
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (zona: Zona) => {
    setEditingId(zona.id);
    setFormData({
      nombre: zona.nombre,
      descripcion: zona.descripcion || '',
    });
    setIsAdding(false);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ nombre: '', descripcion: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Gestión de Zonas</h3>
          <p className="text-sm text-gray-600 mt-1">
            Administra las zonas de trabajo disponibles para los formularios
          </p>
        </div>
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
            setFormData({ nombre: '', descripcion: '' });
          }}
          disabled={isAdding || editingId !== null}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Agregar Zona
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar zona..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 pl-10 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId !== null) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-4">
            {isAdding ? 'Nueva Zona' : 'Editar Zona'}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Turbaco"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <input
                type="text"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Ej: Municipio de Turbaco, Bolivar"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={cancelEditing}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={isAdding ? handleAdd : handleEdit}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Guardando...' : (isAdding ? 'Agregar' : 'Guardar')}
            </button>
          </div>
        </div>
      )}

      {/* Zonas List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zona
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredZonas.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-500">
                    {searchTerm ? 'No se encontraron zonas con ese criterio' : 'No hay zonas registradas'}
                  </td>
                </tr>
              ) : (
                filteredZonas.map((zona) => (
                  <tr key={zona.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900">{zona.nombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{zona.descripcion || '-'}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => startEditing(zona)}
                          disabled={isLoading || editingId !== null || isAdding}
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(zona.id)}
                          disabled={isLoading}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Eliminar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer info */}
      <div className="text-xs text-gray-500 text-center">
        {activeZonas.length} zona{activeZonas.length !== 1 ? 's' : ''} activa{activeZonas.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
