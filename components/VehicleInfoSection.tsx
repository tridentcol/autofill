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
      <CamionetaSelector
        value={selectedCamioneta?.id}
        onChange={handleVehicleChange}
        label="Seleccionar Vehículo"
        placeholder="Buscar por marca, línea, placa o modelo..."
      />
    </div>
  );
}
