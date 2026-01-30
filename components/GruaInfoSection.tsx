'use client';

import { useState, useEffect } from 'react';
import { useDatabaseStore } from '@/store/useDatabaseStore';
import { useFormStore } from '@/store/useFormStore';
import GruaSelector from './GruaSelector';
import type { Grua } from '@/types';

interface GruaInfoSectionProps {
  sheetIndex: number;
  sectionIndex: number;
}

export default function GruaInfoSection({ sheetIndex, sectionIndex }: GruaInfoSectionProps) {
  const { currentUser, workers } = useDatabaseStore();
  const { updateFieldValue } = useFormStore();
  const [selectedGrua, setSelectedGrua] = useState<Grua | null>(null);

  // Auto-fill user data on mount
  useEffect(() => {
    if (currentUser) {
      updateFieldValue(sheetIndex, sectionIndex, 'basic_A6', currentUser.nombre);

      // Buscar el cargo del trabajador en la base de datos
      const worker = workers.find(w => w.nombre === currentUser.nombre && w.isActive);
      if (worker?.cargo) {
        updateFieldValue(sheetIndex, sectionIndex, 'basic_A7', worker.cargo);
      }
    }

    // Fecha actual en zona horaria Colombia
    const now = new Date();
    const colombiaDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
    const currentDate = colombiaDate.toISOString().split('T')[0];
    updateFieldValue(sheetIndex, sectionIndex, 'basic_P7', currentDate);
  }, [currentUser, workers, sheetIndex, sectionIndex, updateFieldValue]);

  // Handle crane selection
  const handleGruaChange = (grua: Grua | null) => {
    setSelectedGrua(grua);

    if (grua) {
      updateFieldValue(sheetIndex, sectionIndex, 'basic_H7', grua.placa);
      updateFieldValue(sheetIndex, sectionIndex, 'basic_I6', grua.marca);
      updateFieldValue(sheetIndex, sectionIndex, 'basic_I7', grua.modelo);
      updateFieldValue(sheetIndex, sectionIndex, 'basic_P6', grua.linea);
    } else {
      updateFieldValue(sheetIndex, sectionIndex, 'basic_H7', '');
      updateFieldValue(sheetIndex, sectionIndex, 'basic_I6', '');
      updateFieldValue(sheetIndex, sectionIndex, 'basic_I7', '');
      updateFieldValue(sheetIndex, sectionIndex, 'basic_P6', '');
    }
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Grua Selector */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <GruaSelector
          value={selectedGrua?.id}
          onChange={handleGruaChange}
          label="Seleccionar Grúa/Manlift"
          placeholder="Buscar por marca, línea, placa o modelo..."
        />

        {selectedGrua && (
          <div className="mt-3 p-3 bg-white border border-gray-200 rounded-md">
            <p className="text-xs font-medium text-gray-900 mb-2">Datos auto-completados:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div><span className="font-medium">Placa:</span> {selectedGrua.placa}</div>
              <div><span className="font-medium">Marca:</span> {selectedGrua.marca}</div>
              <div><span className="font-medium">Modelo:</span> {selectedGrua.modelo}</div>
              <div><span className="font-medium">Línea:</span> {selectedGrua.linea}</div>
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
