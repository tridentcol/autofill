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
  const { currentUser, workers } = useDatabaseStore();
  const { updateFieldValue } = useFormStore();
  const [selectedCamioneta, setSelectedCamioneta] = useState<Camioneta | null>(null);

  // Auto-fill user data on mount
  useEffect(() => {
    if (currentUser) {
      updateFieldValue(sheetIndex, sectionIndex, 'basic_A5', currentUser.nombre);

      // Buscar el cargo del trabajador en la base de datos
      const worker = workers.find(w => w.nombre === currentUser.nombre && w.isActive);
      if (worker?.cargo) {
        updateFieldValue(sheetIndex, sectionIndex, 'basic_A6', worker.cargo);
      }
    }

    // Fecha actual en zona horaria Colombia
    const now = new Date();
    const colombiaDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
    const currentDate = colombiaDate.toISOString().split('T')[0];
    updateFieldValue(sheetIndex, sectionIndex, 'basic_F6', currentDate);
  }, [currentUser, workers, sheetIndex, sectionIndex, updateFieldValue]);

  // Handle vehicle selection
  const handleVehicleChange = (camioneta: Camioneta | null) => {
    setSelectedCamioneta(camioneta);

    if (camioneta) {
      updateFieldValue(sheetIndex, sectionIndex, 'basic_A7', camioneta.marca);
      updateFieldValue(sheetIndex, sectionIndex, 'basic_D7', camioneta.linea);
      updateFieldValue(sheetIndex, sectionIndex, 'basic_F7', camioneta.placa);
      updateFieldValue(sheetIndex, sectionIndex, 'basic_J7', camioneta.modelo);
    } else {
      updateFieldValue(sheetIndex, sectionIndex, 'basic_A7', '');
      updateFieldValue(sheetIndex, sectionIndex, 'basic_D7', '');
      updateFieldValue(sheetIndex, sectionIndex, 'basic_F7', '');
      updateFieldValue(sheetIndex, sectionIndex, 'basic_J7', '');
    }
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Vehicle Selector */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <CamionetaSelector
          value={selectedCamioneta?.id}
          onChange={handleVehicleChange}
          label="Seleccionar Vehículo"
          placeholder="Buscar por marca, línea, placa o modelo..."
        />

        {selectedCamioneta && (
          <div className="mt-3 p-3 bg-white border border-gray-200 rounded-md">
            <p className="text-xs font-medium text-gray-900 mb-2">Datos auto-completados:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div><span className="font-medium">Marca:</span> {selectedCamioneta.marca}</div>
              <div><span className="font-medium">Línea:</span> {selectedCamioneta.linea}</div>
              <div><span className="font-medium">Placa:</span> {selectedCamioneta.placa}</div>
              <div><span className="font-medium">Modelo:</span> {selectedCamioneta.modelo}</div>
            </div>
          </div>
        )}
      </div>

      {/* Auto-filled Info Notice */}
      {currentUser && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-600">
            Se auto-completaron: <span className="font-medium">Realizado por, Cargo y Fecha</span>
          </p>
        </div>
      )}
    </div>
  );
}
