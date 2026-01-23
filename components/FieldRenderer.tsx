'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFormStore } from '@/store/useFormStore';
import { useDatabaseStore } from '@/store/useDatabaseStore';
import type { Field } from '@/types';

interface FieldRendererProps {
  field: Field;
  sheetIndex: number;
  sectionIndex: number;
  hideLabel?: boolean;
  compact?: boolean;
}

export default function FieldRenderer({
  field,
  sheetIndex,
  sectionIndex,
  hideLabel = false,
  compact = false,
}: FieldRendererProps) {
  const { currentFormData, updateFieldValue, signatures } = useFormStore();
  const { workers } = useDatabaseStore();
  const [value, setValue] = useState<any>(field.value || '');

  // Filtrar firmas por rol si es necesario
  const filteredSignatures = useMemo(() => {
    if (field.type !== 'signature' || !field.validation?.pattern) {
      return signatures;
    }

    const pattern = field.validation.pattern;

    if (pattern === 'supervisor_only') {
      // Solo supervisores: Supervisor, Coordinador de zona, Asistente técnico
      const supervisorRoles = ['Supervisor', 'Coordinador de zona', 'Asistente técnico'];
      const supervisorWorkerIds = workers
        .filter(w => w.isActive && supervisorRoles.includes(w.cargo) && w.signatureId)
        .map(w => w.signatureId);

      return signatures.filter(sig => supervisorWorkerIds.includes(sig.id));
    } else if (pattern === 'conductor_only') {
      // Solo conductores
      const conductorWorkerIds = workers
        .filter(w => w.isActive && w.cargo === 'Conductor' && w.signatureId)
        .map(w => w.signatureId);

      return signatures.filter(sig => conductorWorkerIds.includes(sig.id));
    }

    return signatures;
  }, [field.type, field.validation?.pattern, signatures, workers]);

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

  const renderField = () => {
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
        // Checkbox simple: solo marcar/desmarcar (para Pasos 7 y 8)
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
        // Radio buttons SI/NO/N/A (para Paso 6)
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
            {field.validation?.pattern && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-2 mb-2">
                <p className="text-xs text-blue-800">
                  {field.validation.pattern === 'supervisor_only' && '👤 Solo supervisores pueden firmar aquí'}
                  {field.validation.pattern === 'conductor_only' && '🚗 Solo conductores pueden firmar aquí'}
                </p>
              </div>
            )}
            <div className="flex items-center gap-3">
              <select
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required={field.required}
              >
                <option value="">Seleccione una firma</option>
                {filteredSignatures.map((sig) => (
                  <option key={sig.id} value={sig.id}>
                    {sig.name}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-500">
                {filteredSignatures.length} firma(s) disponible(s)
              </span>
            </div>
            {filteredSignatures.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ No hay firmas disponibles con el rol requerido. Por favor asigna firmas a los trabajadores en la base de datos.
                </p>
              </div>
            )}
            {value && (() => {
              const selectedSig = signatures.find((s) => s.id === value);
              return selectedSig ? (
                <div className="border border-gray-300 rounded-md p-2 bg-gray-50">
                  <img
                    src={selectedSig.dataUrl}
                    alt={selectedSig.name}
                    className="max-h-24 mx-auto"
                  />
                  <p className="text-xs text-center text-gray-600 mt-1">
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

  return (
    <div className={compact ? '' : 'space-y-2'}>
      {!hideLabel && (
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {!compact && <span className="text-xs text-gray-500 font-mono">{field.cellRef}</span>}
        </div>
      )}
      {renderField()}
      {!compact && field.validation && (
        <p className="text-xs text-gray-500">
          {field.validation.minLength && `Mínimo ${field.validation.minLength} caracteres. `}
          {field.validation.maxLength && `Máximo ${field.validation.maxLength} caracteres. `}
          {field.validation.pattern && `Patrón: ${field.validation.pattern}`}
        </p>
      )}
    </div>
  );
}
