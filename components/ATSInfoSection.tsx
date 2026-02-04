'use client';

import { useEffect, useMemo } from 'react';
import { useFormStore } from '@/store/useFormStore';
import { useDatabaseStore } from '@/store/useDatabaseStore';
import type { Field } from '@/types';

interface ATSInfoSectionProps {
  sheetIndex: number;
  sectionIndex: number;
  fields: Field[];
}

/**
 * Obtener fecha actual de Colombia en formato DD/MM/AAAA
 */
function getColombiaDate(): string {
  const now = new Date();
  const colombiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
  const day = String(colombiaTime.getDate()).padStart(2, '0');
  const month = String(colombiaTime.getMonth() + 1).padStart(2, '0');
  const year = colombiaTime.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Sección de Elaborado Por para ATS
 * Autocompleta: nombre, cargo del usuario actual, y fecha Colombia
 */
export default function ATSInfoSection({ sheetIndex, sectionIndex, fields }: ATSInfoSectionProps) {
  const { currentUser, workers } = useDatabaseStore();
  const { updateFieldValue, currentFormData } = useFormStore();

  // Autocompletar al montar
  useEffect(() => {
    // Autocompletar fecha actual de Colombia (siempre)
    updateFieldValue(sheetIndex, sectionIndex, 'elaboro_fecha', getColombiaDate());

    if (!currentUser) return;

    // Autocompletar Elaboró con el nombre del usuario actual
    updateFieldValue(sheetIndex, sectionIndex, 'elaboro_nombre', currentUser.nombre);

    // Autocompletar Cargo del usuario actual
    const worker = workers.find((w) => w.id === currentUser.id);
    if (worker) {
      updateFieldValue(sheetIndex, sectionIndex, 'elaboro_cargo', worker.cargo);
    }
  }, [currentUser, workers, sheetIndex, sectionIndex, updateFieldValue]);

  // Obtener valores actuales del store
  const currentNombre = useMemo(() => {
    const sectionData = currentFormData?.sheets[sheetIndex]?.sections[sectionIndex];
    return sectionData?.fields.find((f) => f.fieldId === 'elaboro_nombre')?.value || currentUser?.nombre || '';
  }, [currentFormData, sheetIndex, sectionIndex, currentUser]);

  const currentCargo = useMemo(() => {
    const sectionData = currentFormData?.sheets[sheetIndex]?.sections[sectionIndex];
    const val = sectionData?.fields.find((f) => f.fieldId === 'elaboro_cargo')?.value;
    if (val) return val;
    const worker = workers.find((w) => w.id === currentUser?.id);
    return worker?.cargo || '';
  }, [currentFormData, sheetIndex, sectionIndex, currentUser, workers]);

  const currentFecha = useMemo(() => {
    const sectionData = currentFormData?.sheets[sheetIndex]?.sections[sectionIndex];
    return sectionData?.fields.find((f) => f.fieldId === 'elaboro_fecha')?.value || getColombiaDate();
  }, [currentFormData, sheetIndex, sectionIndex]);

  return (
    <div className="space-y-4">
      {/* Elaboró - Nombre (solo lectura, autocompletado con usuario actual) */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Elaboró <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={currentNombre}
          readOnly
          className="w-full px-4 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700"
          placeholder="Se autocompleta con el usuario actual"
        />
        <p className="text-xs text-gray-500">Se autocompleta con el usuario de la sesión actual</p>
      </div>

      {/* Cargo (solo lectura, autocompletado) */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Cargo <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={currentCargo}
          readOnly
          className="w-full px-4 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700"
          placeholder="Se autocompleta con el cargo del usuario"
        />
      </div>

      {/* Fecha (solo lectura, autocompletada) */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Fecha <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={currentFecha}
          readOnly
          className="w-full px-4 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700"
        />
        <p className="text-xs text-gray-500">Fecha actual de Colombia</p>
      </div>
    </div>
  );
}
