'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFormStore } from '@/store/useFormStore';
import { useDatabaseStore } from '@/store/useDatabaseStore';
import type { Field } from '@/types';

interface ATSRevisoSectionProps {
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
 * Sección de Reviso y Aprobó para ATS
 * Selector de inspector (nombre), autocompleta cargo y fecha
 */
export default function ATSRevisoSection({ sheetIndex, sectionIndex, fields }: ATSRevisoSectionProps) {
  const { workers } = useDatabaseStore();
  const { updateFieldValue, currentFormData } = useFormStore();
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');

  // Filtrar solo supervisores (Asistente técnico, Coordinador, Supervisor)
  const supervisors = useMemo(() => {
    const supervisorRoles = ['supervisor', 'coordinador', 'asistente técnico', 'asistente tecnico'];
    return workers.filter(
      (w) => w.isActive && supervisorRoles.some((role) => w.cargo.toLowerCase().includes(role))
    );
  }, [workers]);

  // Autocompletar fecha al montar
  useEffect(() => {
    const fechaActual = getColombiaDate();
    updateFieldValue(sheetIndex, sectionIndex, 'inspector_fecha', fechaActual);
  }, [sheetIndex, sectionIndex, updateFieldValue]);

  // Cargar valor actual si existe
  useEffect(() => {
    if (!currentFormData) return;
    const sectionData = currentFormData.sheets[sheetIndex]?.sections[sectionIndex];
    const nombreField = sectionData?.fields.find((f) => f.fieldId === 'inspector_nombre');
    if (nombreField?.value) {
      // Buscar worker por nombre
      const worker = supervisors.find((w) => w.nombre === nombreField.value);
      if (worker) {
        setSelectedWorkerId(worker.id);
      }
    }
  }, [currentFormData, sheetIndex, sectionIndex, supervisors]);

  const handleInspectorChange = (workerId: string) => {
    setSelectedWorkerId(workerId);

    if (!workerId) {
      updateFieldValue(sheetIndex, sectionIndex, 'inspector_nombre', '');
      updateFieldValue(sheetIndex, sectionIndex, 'inspector_cargo', '');
      return;
    }

    const worker = supervisors.find((w) => w.id === workerId);
    if (worker) {
      updateFieldValue(sheetIndex, sectionIndex, 'inspector_nombre', worker.nombre);
      updateFieldValue(sheetIndex, sectionIndex, 'inspector_cargo', worker.cargo);
    }
  };

  // Obtener valores actuales
  const currentCargo = useMemo(() => {
    const sectionData = currentFormData?.sheets[sheetIndex]?.sections[sectionIndex];
    return sectionData?.fields.find((f) => f.fieldId === 'inspector_cargo')?.value || '';
  }, [currentFormData, sheetIndex, sectionIndex]);

  const currentFecha = useMemo(() => {
    const sectionData = currentFormData?.sheets[sheetIndex]?.sections[sectionIndex];
    return sectionData?.fields.find((f) => f.fieldId === 'inspector_fecha')?.value || getColombiaDate();
  }, [currentFormData, sheetIndex, sectionIndex]);

  return (
    <div className="space-y-4">
      {/* Selector de Inspector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Reviso y Aprobó <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedWorkerId}
          onChange={(e) => handleInspectorChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          required
        >
          <option value="">Seleccione un inspector</option>
          {supervisors.map((worker) => (
            <option key={worker.id} value={worker.id}>
              {worker.nombre} - {worker.cargo}
            </option>
          ))}
        </select>
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
          placeholder="Se autocompleta al seleccionar inspector"
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
      </div>
    </div>
  );
}
