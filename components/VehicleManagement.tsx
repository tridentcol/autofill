'use client';

import { useState } from 'react';
import { useDatabaseStore } from '@/store/useDatabaseStore';
import type { Camioneta, Grua } from '@/types';

interface VehicleManagementProps {
  type: 'camioneta' | 'grua';
}

export default function VehicleManagement({ type }: VehicleManagementProps) {
  const {
    camionetas,
    gruas,
    addCamioneta,
    updateCamioneta,
    deleteCamioneta,
    addGrua,
    updateGrua,
    deleteGrua,
  } = useDatabaseStore();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    marca: '',
    linea: '',
    placa: '',
    modelo: '',
  });

  const vehicles = type === 'camioneta' ? camionetas : gruas;
  const activeVehicles = vehicles.filter((v) => v.isActive);

  const resetForm = () => {
    setFormData({ marca: '', linea: '', placa: '', modelo: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAdd = async () => {
    if (!formData.marca || !formData.placa) {
      alert('Por favor completa al menos la marca y placa');
      return;
    }

    if (type === 'camioneta') {
      await addCamioneta({
        marca: formData.marca,
        linea: formData.linea,
        placa: formData.placa,
        modelo: formData.modelo,
        isActive: true,
      });
    } else {
      await addGrua({
        marca: formData.marca,
        linea: formData.linea,
        placa: formData.placa,
        modelo: formData.modelo,
        isActive: true,
      });
    }

    resetForm();
  };

  const handleEdit = async (id: string) => {
    if (!formData.marca || !formData.placa) {
      alert('Por favor completa al menos la marca y placa');
      return;
    }

    if (type === 'camioneta') {
      await updateCamioneta(id, {
        marca: formData.marca,
        linea: formData.linea,
        placa: formData.placa,
        modelo: formData.modelo,
      });
    } else {
      await updateGrua(id, {
        marca: formData.marca,
        linea: formData.linea,
        placa: formData.placa,
        modelo: formData.modelo,
      });
    }

    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este vehículo?')) {
      if (type === 'camioneta') {
        await deleteCamioneta(id);
      } else {
        await deleteGrua(id);
      }
    }
  };

  const startEdit = (vehicle: Camioneta | Grua) => {
    setFormData({
      marca: vehicle.marca,
      linea: vehicle.linea,
      placa: vehicle.placa,
      modelo: vehicle.modelo,
    });
    setEditingId(vehicle.id);
    setIsAdding(false);
  };

  const title = type === 'camioneta' ? 'Camionetas' : 'Grúas';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Gestión de {title}</h3>
          <p className="text-sm text-gray-600 mt-0.5">
            Administra los {type === 'camioneta' ? 'vehículos' : 'equipos'} de la flota
          </p>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Agregar {type === 'camioneta' ? 'Camioneta' : 'Grúa'}
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6">
          <h4 className="text-sm font-medium text-gray-900 mb-4">
            {editingId ? 'Editar' : 'Agregar'} {type === 'camioneta' ? 'Camioneta' : 'Grúa'}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Marca <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                placeholder="Toyota, Hino..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Línea
              </label>
              <input
                type="text"
                value={formData.linea}
                onChange={(e) => setFormData({ ...formData, linea: e.target.value })}
                placeholder="Hilux, Serie 500..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Placa <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.placa}
                onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                placeholder="ABC123"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Modelo
              </label>
              <input
                type="text"
                value={formData.modelo}
                onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                placeholder="2022, 2020..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => (editingId ? handleEdit(editingId) : handleAdd())}
              className="px-4 py-2 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              {editingId ? 'Guardar' : 'Agregar'}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Vehicle List - Mobile Cards */}
      <div className="block sm:hidden space-y-2">
        {activeVehicles.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-sm text-gray-500">No hay {type === 'camioneta' ? 'camionetas' : 'grúas'} registradas</p>
          </div>
        ) : (
          activeVehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-gray-900">{vehicle.marca} {vehicle.linea}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                    {vehicle.placa}
                  </span>
                </div>
                {vehicle.modelo && (
                  <span className="text-xs text-gray-500">{vehicle.modelo}</span>
                )}
              </div>
              <div className="flex gap-2 text-sm">
                <button
                  onClick={() => startEdit(vehicle)}
                  className="flex-1 py-1.5 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(vehicle.id)}
                  className="flex-1 py-1.5 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Vehicle List - Desktop Table */}
      <div className="hidden sm:block bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marca</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Línea</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Placa</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modelo</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activeVehicles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                  No hay {type === 'camioneta' ? 'camionetas' : 'grúas'} registradas
                </td>
              </tr>
            ) : (
              activeVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{vehicle.marca}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{vehicle.linea || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {vehicle.placa}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{vehicle.modelo || '-'}</td>
                  <td className="px-4 py-3 text-right text-sm">
                    <button
                      onClick={() => startEdit(vehicle)}
                      className="text-gray-700 hover:text-gray-900 mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Stats */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Total activo
          </span>
          <span className="font-semibold text-gray-900">{activeVehicles.length}</span>
        </div>
      </div>
    </div>
  );
}
