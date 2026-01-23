'use client';

import { useState, useEffect } from 'react';
import { useDatabaseStore } from '@/store/useDatabaseStore';
import { useFormStore } from '@/store/useFormStore';
import CamionetaSelector from './CamionetaSelector';
import type { Camioneta } from '@/types';

interface VehicleInfoSectionProps {
  sheetIndex: number;
  sectionIndex: number;
}

export default function VehicleInfoSection({ sheetIndex, sectionIndex }: VehicleInfoSectionProps) {
  const { currentUser } = useDatabaseStore();
  const { updateFieldValue } = useFormStore();
  const [selectedCamioneta, setSelectedCamioneta] = useState<Camioneta | null>(null);

  // Auto-fill user data on mount
  useEffect(() => {
    if (currentUser) {
      // Auto-fill REALIZADO POR (A5)
      updateFieldValue(sheetIndex, sectionIndex, 'basic_A5', currentUser.nombre);

      // Auto-fill CARGO (A6) - Assume workers have cargo property
      const worker = currentUser as any;
      if (worker.cargo) {
        updateFieldValue(sheetIndex, sectionIndex, 'basic_A6', worker.cargo);
      }
    }

    // Auto-fill current date (F6)
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    updateFieldValue(sheetIndex, sectionIndex, 'basic_F6', currentDate);
  }, [currentUser, sheetIndex, sectionIndex, updateFieldValue]);

  // Handle vehicle selection
  const handleVehicleChange = (camioneta: Camioneta | null) => {
    setSelectedCamioneta(camioneta);

    if (camioneta) {
      // Auto-fill MARCA (A7)
      updateFieldValue(sheetIndex, sectionIndex, 'basic_A7', camioneta.marca);

      // Auto-fill LINEA (D7)
      updateFieldValue(sheetIndex, sectionIndex, 'basic_D7', camioneta.linea);

      // Auto-fill PLACA (F7)
      updateFieldValue(sheetIndex, sectionIndex, 'basic_F7', camioneta.placa);

      // Auto-fill MODELO (J7)
      updateFieldValue(sheetIndex, sectionIndex, 'basic_J7', camioneta.modelo);
    } else {
      // Clear vehicle fields
      updateFieldValue(sheetIndex, sectionIndex, 'basic_A7', '');
      updateFieldValue(sheetIndex, sectionIndex, 'basic_D7', '');
      updateFieldValue(sheetIndex, sectionIndex, 'basic_F7', '');
      updateFieldValue(sheetIndex, sectionIndex, 'basic_J7', '');
    }
  };

  return (
    <div className="space-y-6">
      {/* Vehicle Selector */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <CamionetaSelector
          value={selectedCamioneta?.id}
          onChange={handleVehicleChange}
          label="Seleccionar Vehículo"
          placeholder="Buscar por marca, línea, placa o modelo..."
        />

        {selectedCamioneta && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm font-medium text-green-900 mb-2">
              ✓ Datos del vehículo auto-completados
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
              <div><strong>Marca:</strong> {selectedCamioneta.marca}</div>
              <div><strong>Línea:</strong> {selectedCamioneta.linea}</div>
              <div><strong>Placa:</strong> {selectedCamioneta.placa}</div>
              <div><strong>Modelo:</strong> {selectedCamioneta.modelo}</div>
            </div>
          </div>
        )}
      </div>

      {/* User Info Auto-filled */}
      {currentUser && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-900 mb-2">
            ℹ️ Información auto-completada
          </p>
          <div className="text-xs text-gray-600 space-y-1">
            <div><strong>Realizado por:</strong> {currentUser.nombre}</div>
            <div><strong>Cargo:</strong> {(currentUser as any).cargo || 'N/A'}</div>
            <div><strong>Fecha:</strong> {new Date().toLocaleDateString('es-CO')}</div>
          </div>
        </div>
      )}

      {/* Help */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h5 className="text-sm font-medium text-gray-900 mb-2">💡 Consejos:</h5>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li>Selecciona un vehículo de la base de datos para auto-completar marca, línea, placa y modelo</li>
          <li>Los datos del usuario (nombre, cargo) y la fecha se completan automáticamente</li>
          <li>Puedes cambiar manualmente cualquier dato si es necesario</li>
        </ul>
      </div>
    </div>
  );
}
