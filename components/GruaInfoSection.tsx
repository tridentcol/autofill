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
  const { currentUser } = useDatabaseStore();
  const { updateFieldValue } = useFormStore();
  const [selectedGrua, setSelectedGrua] = useState<Grua | null>(null);

  // Auto-fill user data on mount
  useEffect(() => {
    if (currentUser) {
      // Auto-fill REALIZADO POR (A6)
      updateFieldValue(sheetIndex, sectionIndex, 'basic_A6', currentUser.nombre);

      // Auto-fill CARGO (A7)
      const worker = currentUser as any;
      if (worker.cargo) {
        updateFieldValue(sheetIndex, sectionIndex, 'basic_A7', worker.cargo);
      }
    }

    // Auto-fill current date (P7)
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    updateFieldValue(sheetIndex, sectionIndex, 'basic_P7', currentDate);
  }, [currentUser, sheetIndex, sectionIndex, updateFieldValue]);

  // Handle crane selection
  const handleGruaChange = (grua: Grua | null) => {
    setSelectedGrua(grua);

    if (grua) {
      // Auto-fill PLACA (H7)
      updateFieldValue(sheetIndex, sectionIndex, 'basic_H7', grua.placa);

      // Auto-fill MARCA (I6)
      updateFieldValue(sheetIndex, sectionIndex, 'basic_I6', grua.marca);

      // Auto-fill MODELO (I7)
      updateFieldValue(sheetIndex, sectionIndex, 'basic_I7', grua.modelo);

      // Auto-fill LINEA (P6)
      updateFieldValue(sheetIndex, sectionIndex, 'basic_P6', grua.linea);
    } else {
      // Clear vehicle fields
      updateFieldValue(sheetIndex, sectionIndex, 'basic_H7', '');
      updateFieldValue(sheetIndex, sectionIndex, 'basic_I6', '');
      updateFieldValue(sheetIndex, sectionIndex, 'basic_I7', '');
      updateFieldValue(sheetIndex, sectionIndex, 'basic_P6', '');
    }
  };

  return (
    <div className="space-y-6">
      {/* Grua Selector */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <GruaSelector
          value={selectedGrua?.id}
          onChange={handleGruaChange}
          label="Seleccionar Grúa/Manlift"
          placeholder="Buscar por marca, línea, placa o modelo..."
        />

        {selectedGrua && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm font-medium text-green-900 mb-2">
              ✓ Datos del equipo auto-completados
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
              <div><strong>Placa:</strong> {selectedGrua.placa}</div>
              <div><strong>Marca:</strong> {selectedGrua.marca}</div>
              <div><strong>Modelo:</strong> {selectedGrua.modelo}</div>
              <div><strong>Línea:</strong> {selectedGrua.linea}</div>
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
          <li>Selecciona una grúa/manlift de la base de datos para auto-completar los datos del equipo</li>
          <li>Los datos del usuario (nombre, cargo) y la fecha se completan automáticamente</li>
          <li>Puedes cambiar manualmente cualquier dato si es necesario</li>
        </ul>
      </div>
    </div>
  );
}
