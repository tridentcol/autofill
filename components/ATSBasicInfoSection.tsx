'use client';

import { useEffect, useState, useMemo } from 'react';
import { useFormStore } from '@/store/useFormStore';
import { useDatabaseStore } from '@/store/useDatabaseStore';
import FieldRenderer from './FieldRenderer';
import type { Field } from '@/types';

interface ATSBasicInfoSectionProps {
  sheetIndex: number;
  sectionIndex: number;
  fields: Field[];
}

/**
 * Sección de información básica para ATS
 * - Ubicación: usa selector de zonas (manejado por FieldRenderer)
 * - Equipo que Elabora: selector de cuadrillas que pone los nombres de integrantes
 * - Para Técnico electricista: auto-rellena con su cuadrilla asignada (solo lectura)
 */
export default function ATSBasicInfoSection({ sheetIndex, sectionIndex, fields }: ATSBasicInfoSectionProps) {
  const { cuadrillas, workers, getWorkerById, currentUser } = useDatabaseStore();
  const { updateFieldValue, currentFormData } = useFormStore();
  const [selectedCuadrillaId, setSelectedCuadrillaId] = useState<string>('');
  const [hasAutoFilled, setHasAutoFilled] = useState(false);

  // Verificar si es Técnico electricista
  const isTecnico = currentUser?.cargo === 'Técnico electricista';

  // Cuadrillas activas
  const activeCuadrillas = useMemo(() => {
    return cuadrillas.filter((c) => c.isActive);
  }, [cuadrillas]);

  // Auto-rellenar para Técnico electricista
  useEffect(() => {
    if (hasAutoFilled) return;
    if (!isTecnico || !currentUser?.cuadrillaId) return;

    const cuadrilla = activeCuadrillas.find((c) => c.id === currentUser.cuadrillaId);
    if (cuadrilla) {
      setSelectedCuadrillaId(cuadrilla.id);

      // Obtener nombres de los integrantes separados por guión
      const memberNames = cuadrilla.workerIds
        .map((wId) => getWorkerById(wId))
        .filter(Boolean)
        .map((w) => w!.nombre)
        .join(' - ');

      updateFieldValue(sheetIndex, sectionIndex, 'equipo_elabora', memberNames);
      setHasAutoFilled(true);
    }
  }, [isTecnico, currentUser?.cuadrillaId, activeCuadrillas, hasAutoFilled, getWorkerById, sheetIndex, sectionIndex, updateFieldValue]);

  // Obtener valor actual del campo equipo_elabora (para usuarios no técnicos)
  useEffect(() => {
    if (isTecnico) return; // No necesario para técnicos ya que auto-rellenamos
    if (!currentFormData) return;
    const sectionData = currentFormData.sheets[sheetIndex]?.sections[sectionIndex];
    const equipoField = sectionData?.fields.find((f) => f.fieldId === 'equipo_elabora');

    // Si ya hay un valor y coincide con una cuadrilla, pre-seleccionar
    if (equipoField?.value) {
      const matchingCuadrilla = activeCuadrillas.find((c) => {
        const memberNames = c.workerIds
          .map((wId) => getWorkerById(wId))
          .filter(Boolean)
          .map((w) => w!.nombre)
          .join(' - ');
        return memberNames === equipoField.value;
      });
      if (matchingCuadrilla) {
        setSelectedCuadrillaId(matchingCuadrilla.id);
      }
    }
  }, [currentFormData, sheetIndex, sectionIndex, activeCuadrillas, getWorkerById, isTecnico]);

  const handleCuadrillaChange = (cuadrillaId: string) => {
    setSelectedCuadrillaId(cuadrillaId);

    if (!cuadrillaId) {
      updateFieldValue(sheetIndex, sectionIndex, 'equipo_elabora', '');
      return;
    }

    const cuadrilla = activeCuadrillas.find((c) => c.id === cuadrillaId);
    if (!cuadrilla) return;

    // Obtener nombres de los integrantes separados por guión
    const memberNames = cuadrilla.workerIds
      .map((wId) => getWorkerById(wId))
      .filter(Boolean)
      .map((w) => w!.nombre)
      .join(' - ');

    updateFieldValue(sheetIndex, sectionIndex, 'equipo_elabora', memberNames);
  };

  // Obtener los nombres actuales de la cuadrilla seleccionada
  const selectedCuadrillaNames = useMemo(() => {
    if (!selectedCuadrillaId) return '';
    const cuadrilla = activeCuadrillas.find((c) => c.id === selectedCuadrillaId);
    if (!cuadrilla) return '';
    return cuadrilla.workerIds
      .map((wId) => getWorkerById(wId))
      .filter(Boolean)
      .map((w) => w!.nombre)
      .join(' - ');
  }, [selectedCuadrillaId, activeCuadrillas, getWorkerById]);

  return (
    <div className="space-y-4">
      {fields.map((field) => {
        // Renderizado especial para el campo de equipo (selector de cuadrilla)
        if (field.id === 'equipo_elabora') {
          // Para Técnico electricista: mostrar solo lectura con su cuadrilla
          if (isTecnico) {
            const cuadrilla = activeCuadrillas.find((c) => c.id === currentUser?.cuadrillaId);
            return (
              <div key={field.id} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Equipo que Elabora ATS <span className="text-red-500">*</span>
                </label>
                <div className="px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-900">
                  {cuadrilla?.nombre || 'Sin cuadrilla asignada'}
                </div>
                {selectedCuadrillaNames && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-xs font-medium text-blue-900 mb-1">Integrantes del equipo:</p>
                    <p className="text-sm text-blue-800">{selectedCuadrillaNames}</p>
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Este campo se auto-completa con tu cuadrilla asignada
                </p>
              </div>
            );
          }

          // Para otros usuarios: selector de cuadrilla editable
          return (
            <div key={field.id} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Equipo que Elabora ATS <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCuadrillaId}
                onChange={(e) => handleCuadrillaChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">Seleccione una cuadrilla</option>
                {activeCuadrillas.map((cuadrilla) => (
                  <option key={cuadrilla.id} value={cuadrilla.id}>
                    {cuadrilla.nombre}
                  </option>
                ))}
              </select>
              {selectedCuadrillaNames && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-xs font-medium text-blue-900 mb-1">Integrantes del equipo:</p>
                  <p className="text-sm text-blue-800">{selectedCuadrillaNames}</p>
                </div>
              )}
            </div>
          );
        }

        // Renderizado normal para otros campos (incluyendo zona que FieldRenderer maneja)
        return (
          <FieldRenderer
            key={field.id}
            field={field}
            sheetIndex={sheetIndex}
            sectionIndex={sectionIndex}
          />
        );
      })}
    </div>
  );
}
