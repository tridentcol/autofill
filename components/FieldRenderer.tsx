'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFormStore } from '@/store/useFormStore';
import { useDatabaseStore } from '@/store/useDatabaseStore';
import type { Field, Signature } from '@/types';

interface FieldRendererProps {
  field: Field;
  sheetIndex: number;
  sectionIndex: number;
  hideLabel?: boolean;
  compact?: boolean;
}

// Interfaz para las firmas derivadas de workers
interface WorkerSignature {
  id: string;
  name: string;
  dataUrl: string;
  workerId: string;
  cargo: string;
}

export default function FieldRenderer({
  field,
  sheetIndex,
  sectionIndex,
  hideLabel = false,
  compact = false,
}: FieldRendererProps) {
  const { currentFormData, updateFieldValue, selectedFormat } = useFormStore();
  const { workers, zonas, currentUser, getCuadrillaById } = useDatabaseStore();
  const [value, setValue] = useState<any>(field.value || '');
  const [hasAutoFilled, setHasAutoFilled] = useState(false);

  // Verificar si es Técnico electricista para auto-rellenar campos
  const isTecnico = currentUser?.cargo === 'Técnico electricista';
  const isPermisoTrabajo = selectedFormat?.id === 'permiso-trabajo';
  const isATS = selectedFormat?.id === 'ats';

  // Construir firmas disponibles desde los workers que tienen signatureId
  const availableSignatures = useMemo((): WorkerSignature[] => {
    return workers
      .filter(w => w.isActive && w.signatureId)
      .map(w => ({
        id: w.signatureId!,
        name: w.nombre,
        dataUrl: w.signatureData || `/signatures/${w.signatureId}.png`,
        workerId: w.id,
        cargo: w.cargo,
      }));
  }, [workers]);

  // Detectar si es un campo de zona de trabajo (solo para campos de texto)
  const isZonaField = useMemo(() => {
    if (field.type !== 'text') return false;
    const label = field.label.toLowerCase();
    return (label.includes('lugar') && label.includes('zona')) ||
           (label.includes('zona') && label.includes('trabajo'));
  }, [field.label, field.type]);

  // Detectar si es el campo "Equipo que Elabora ATS" para auto-rellenar cuadrilla
  const isEquipoElaboraField = field.id === 'equipo_elabora';

  // Detectar si es el campo "Activa el Plan de Emergencia" para auto-rellenar
  const isPlanEmergenciaField = field.id === 'firma_plan_emergencia';

  // Obtener el conductor ayudante de la cuadrilla del usuario actual
  const conductorAyudante = useMemo(() => {
    if (!currentUser?.cuadrillaId) return null;
    return workers.find(
      w => w.cuadrillaId === currentUser.cuadrillaId &&
           w.isActive &&
           w.cargo === 'Conductor ayudante'
    );
  }, [workers, currentUser?.cuadrillaId]);

  // Obtener la firma del conductor ayudante
  const conductorAyudanteSignature = useMemo((): WorkerSignature | null => {
    if (!conductorAyudante?.signatureId) return null;
    return availableSignatures.find(s => s.id === conductorAyudante.signatureId) || null;
  }, [conductorAyudante, availableSignatures]);

  // Filtrar firmas por rol si es necesario
  const filteredSignatures = useMemo(() => {
    if (field.type !== 'signature') {
      return availableSignatures;
    }

    const pattern = field.validation?.pattern;
    if (!pattern) {
      return availableSignatures;
    }

    if (pattern === 'supervisor_only') {
      const supervisorRoles = [
        'supervisor', 'coordinador', 'asistente técnico', 'asistente tecnico'
      ];
      return availableSignatures.filter(sig =>
        supervisorRoles.some(role => sig.cargo.toLowerCase().includes(role))
      );
    } else if (pattern === 'conductor_only') {
      return availableSignatures.filter(sig =>
        sig.cargo.toLowerCase().includes('conductor') &&
        !sig.cargo.toLowerCase().includes('ayudante')
      );
    } else if (pattern === 'tecnico_conductor') {
      return availableSignatures.filter(sig =>
        sig.cargo.toLowerCase().includes('técnico') ||
        sig.cargo.toLowerCase().includes('tecnico') ||
        (sig.cargo.toLowerCase().includes('conductor') && sig.cargo.toLowerCase().includes('ayudante'))
      );
    } else if (pattern === 'conductor_ayudante') {
      return availableSignatures.filter(sig =>
        sig.cargo.toLowerCase().includes('conductor') &&
        sig.cargo.toLowerCase().includes('ayudante')
      );
    }

    return availableSignatures;
  }, [field.type, field.validation?.pattern, availableSignatures]);

  // Auto-rellenar campos especiales para Técnico electricista
  useEffect(() => {
    if (hasAutoFilled) return;

    // Auto-rellenar "Equipo que Elabora ATS" con la cuadrilla del técnico
    if (isATS && isTecnico && isEquipoElaboraField && currentUser?.cuadrillaId) {
      const cuadrilla = getCuadrillaById(currentUser.cuadrillaId);
      if (cuadrilla) {
        setValue(cuadrilla.nombre);
        updateFieldValue(sheetIndex, sectionIndex, field.id, cuadrilla.nombre);
        setHasAutoFilled(true);
      }
    }

    // Auto-rellenar "Activa el Plan de Emergencia" con el Conductor ayudante de la cuadrilla
    if (isPermisoTrabajo && isTecnico && isPlanEmergenciaField && conductorAyudanteSignature) {
      setValue(conductorAyudanteSignature.id);
      updateFieldValue(sheetIndex, sectionIndex, field.id, conductorAyudanteSignature.id);
      setHasAutoFilled(true);
    }
  }, [isATS, isPermisoTrabajo, isTecnico, isEquipoElaboraField, isPlanEmergenciaField, currentUser?.cuadrillaId, conductorAyudanteSignature, hasAutoFilled]);

  // Cargar valor existente del store
  useEffect(() => {
    if (!currentFormData) return;

    const sheet = currentFormData.sheets[sheetIndex];
    if (!sheet) return;

    const section = sheet.sections[sectionIndex];
    if (!section) return;

    const fieldData = section.fields.find((f) => f.fieldId === field.id);
    if (fieldData) {
      setValue(fieldData.value);
    }
  }, [currentFormData, field.id, sheetIndex, sectionIndex]);

  const handleChange = (newValue: any) => {
    setValue(newValue);
    updateFieldValue(sheetIndex, sectionIndex, field.id, newValue);
  };

  // Determinar si el campo debe ser de solo lectura
  const isReadOnly = useMemo(() => {
    // "Equipo que Elabora ATS" es de solo lectura para técnicos
    if (isATS && isTecnico && isEquipoElaboraField) return true;
    // "Activa el Plan de Emergencia" es de solo lectura para técnicos
    if (isPermisoTrabajo && isTecnico && isPlanEmergenciaField) return true;
    return false;
  }, [isATS, isPermisoTrabajo, isTecnico, isEquipoElaboraField, isPlanEmergenciaField]);

  const renderField = () => {
    // Campos de zona de trabajo usan select con zonas de la base de datos
    if (isZonaField && zonas.length > 0) {
      return (
        <select
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          required={field.required}
        >
          <option value="">Seleccione una zona</option>
          {zonas.map((zona) => (
            <option key={zona} value={zona}>
              {zona}
            </option>
          ))}
        </select>
      );
    }

    // Campo "Equipo que Elabora ATS" - solo lectura para técnicos
    if (isEquipoElaboraField && isReadOnly) {
      return (
        <div className="space-y-2">
          <div className="px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-900">
            {value || 'Sin cuadrilla asignada'}
          </div>
          <p className="text-xs text-gray-500">
            Este campo se auto-completa con tu cuadrilla asignada
          </p>
        </div>
      );
    }

    // Campo "Activa el Plan de Emergencia" - solo lectura para técnicos
    if (isPlanEmergenciaField && isReadOnly) {
      const signature = conductorAyudanteSignature || filteredSignatures.find(s => s.id === value);
      return (
        <div className="space-y-2">
          {signature ? (
            <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
              <img
                src={signature.dataUrl}
                alt={signature.name}
                className="max-h-20 mx-auto"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.startsWith('data:')) {
                    target.src = `/signatures/${signature.id}.png`;
                  }
                }}
              />
              <p className="text-xs text-center text-gray-600 mt-2">
                {signature.name} ({signature.cargo})
              </p>
            </div>
          ) : (
            <div className="px-4 py-2.5 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-700">
              No hay Conductor ayudante con firma en tu cuadrilla
            </div>
          )}
          <p className="text-xs text-gray-500">
            Este campo se auto-completa con el Conductor ayudante de tu cuadrilla
          </p>
        </div>
      );
    }

    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder={`Ingrese ${field.label.toLowerCase()}`}
            required={field.required}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required={field.required}
          />
        );

      case 'time':
        return (
          <input
            type="time"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required={field.required}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            rows={compact ? 2 : 4}
            className={`w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              compact ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'
            }`}
            placeholder={compact ? 'Agregar observaciones...' : `Ingrese ${field.label.toLowerCase()}`}
            required={field.required}
          />
        );

      case 'checkbox':
        return (
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={value === true || value === 'true' || value === 'X'}
                onChange={(e) => handleChange(e.target.checked ? 'X' : '')}
                className="w-5 h-5 border-2 border-gray-300 rounded text-primary-600 focus:ring-2 focus:ring-primary-500 cursor-pointer"
              />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
              {field.label}
            </span>
          </label>
        );

      case 'radio':
        return (
          <div className="flex gap-3">
            {(field.options || ['SI', 'NO', 'N/A']).map((option) => (
              <label
                key={option}
                className={`flex items-center justify-center px-6 py-3 border-2 rounded-md cursor-pointer transition-all ${
                  value === option
                    ? option === 'SI'
                      ? 'border-green-500 bg-green-50 text-green-700 font-semibold'
                      : option === 'NO'
                      ? 'border-red-500 bg-red-50 text-red-700 font-semibold'
                      : 'border-gray-500 bg-gray-50 text-gray-700 font-semibold'
                    : 'border-gray-300 hover:border-gray-400 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleChange(e.target.value)}
                  className="sr-only"
                />
                <span className="font-medium text-sm">{option}</span>
                {value === option && (
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </label>
            ))}
          </div>
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required={field.required}
          >
            <option value="">Seleccione una opción</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'signature':
        return (
          <div className="space-y-3">
            <select
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required={field.required}
            >
              <option value="">Seleccione una firma</option>
              {filteredSignatures.map((sig) => (
                <option key={sig.id} value={sig.id}>
                  {sig.name} ({sig.cargo})
                </option>
              ))}
            </select>
            {value && (() => {
              const selectedSig = filteredSignatures.find((s) => s.id === value) || availableSignatures.find((s) => s.id === value);
              return selectedSig ? (
                <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
                  <img
                    src={selectedSig.dataUrl}
                    alt={selectedSig.name}
                    className="max-h-20 mx-auto"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.startsWith('data:')) {
                        target.src = `/signatures/${selectedSig.id}.png`;
                      }
                    }}
                  />
                  <p className="text-xs text-center text-gray-600 mt-2">
                    {selectedSig.name}
                  </p>
                </div>
              ) : null;
            })()}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder={`Ingrese ${field.label.toLowerCase()}`}
            required={field.required}
          />
        );
    }
  };

  // Para checkboxes el label ya está incluido dentro del componente
  const shouldHideLabel = hideLabel || field.type === 'checkbox';

  return (
    <div className={compact ? '' : 'space-y-2'}>
      {!shouldHideLabel && (
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>
      )}
      {renderField()}
    </div>
  );
}
