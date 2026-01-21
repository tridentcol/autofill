'use client';

import { useState, useEffect } from 'react';
import { useFormStore } from '@/store/useFormStore';
import type { Field } from '@/types';

interface FieldRendererProps {
  field: Field;
  sheetIndex: number;
  sectionIndex: number;
}

export default function FieldRenderer({
  field,
  sheetIndex,
  sectionIndex,
}: FieldRendererProps) {
  const { currentFormData, updateFieldValue, signatures } = useFormStore();
  const [value, setValue] = useState<any>(field.value || '');

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
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder={`Ingrese ${field.label.toLowerCase()}`}
            required={field.required}
          />
        );

      case 'checkbox':
        return (
          <div className="flex gap-4">
            {(field.options || ['SI', 'NO', 'N/A']).map((option) => (
              <label
                key={option}
                className={`flex items-center justify-center px-6 py-3 border-2 rounded-md cursor-pointer transition-all ${
                  value === option
                    ? option === 'SI'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : option === 'NO'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-500 bg-gray-50 text-gray-700'
                    : 'border-gray-300 hover:border-gray-400'
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
                <span className="font-medium">{option}</span>
                {value === option && (
                  <svg
                    className="w-5 h-5 ml-2"
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
            <div className="flex items-center gap-3">
              <select
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required={field.required}
              >
                <option value="">Seleccione una firma</option>
                {signatures.map((sig) => (
                  <option key={sig.id} value={sig.id}>
                    {sig.name}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-500">
                {signatures.length} firma(s) disponible(s)
              </span>
            </div>
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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <span className="text-xs text-gray-500 font-mono">{field.cellRef}</span>
      </div>
      {renderField()}
      {field.validation && (
        <p className="text-xs text-gray-500">
          {field.validation.minLength && `Mínimo ${field.validation.minLength} caracteres. `}
          {field.validation.maxLength && `Máximo ${field.validation.maxLength} caracteres. `}
          {field.validation.pattern && `Patrón: ${field.validation.pattern}`}
        </p>
      )}
    </div>
  );
}
