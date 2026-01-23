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

  const title = type === 'camioneta' ? 'Camionetas' : 'Grúas/Manlifts';
  const icon = type === 'camioneta' ? '🚗' : '🏗️';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {icon} Gestión de {title}
          </h3>
          <p className="text-sm text-gray-600">
            Administra los {type === 'camioneta' ? 'vehículos' : 'equipos'} de la flota
          </p>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            + Agregar {type === 'camioneta' ? 'Camioneta' : 'Grúa'}
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            {editingId ? 'Editar' : 'Agregar'} {type === 'camioneta' ? 'Camioneta' : 'Grúa'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marca <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                placeholder="Ej: Toyota, Hino, Kenworth"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Línea
              </label>
              <input
                type="text"
                value={formData.linea}
                onChange={(e) => setFormData({ ...formData, linea: e.target.value })}
                placeholder="Ej: Hilux, Serie 500"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Placa <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.placa}
                onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                placeholder="Ej: ABC123"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modelo
              </label>
              <input
                type="text"
                value={formData.modelo}
                onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                placeholder="Ej: 2022, 2020"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => (editingId ? handleEdit(editingId) : handleAdd())}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {editingId ? 'Guardar Cambios' : 'Agregar'}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Vehicle List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Marca
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Línea
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Placa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Modelo
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activeVehicles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  No hay {type === 'camioneta' ? 'camionetas' : 'grúas'} registradas
                </td>
              </tr>
            ) : (
              activeVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {vehicle.marca}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vehicle.linea || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {vehicle.placa}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vehicle.modelo || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => startEdit(vehicle)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
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
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">
            Total de {type === 'camioneta' ? 'camionetas' : 'grúas'} activas:
          </span>
          <span className="text-lg font-semibold text-gray-900">{activeVehicles.length}</span>
        </div>
      </div>
    </div>
  );
}
