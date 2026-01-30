'use client';

import { useEffect } from 'react';
import { useDatabaseStore } from '@/store/useDatabaseStore';
import { useFormStore } from '@/store/useFormStore';
import FieldRenderer from './FieldRenderer';
import type { Field } from '@/types';

interface HerramientasInfoSectionProps {
  sheetIndex: number;
  sectionIndex: number;
  fields: Field[];
}

export default function HerramientasInfoSection({ sheetIndex, sectionIndex, fields }: HerramientasInfoSectionProps) {
  const { currentUser, workers } = useDatabaseStore();
  const { updateFieldValue } = useFormStore();

  // Auto-fill user data on mount
  useEffect(() => {
    if (currentUser) {
      // Nombre del usuario
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

  return (
    <div className="space-y-4">
      {/* Notice de auto-completado */}
      {currentUser && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-green-800">
            Se auto-completaron: <span className="font-medium">Realizado por, Cargo y Fecha</span> con los datos de la sesión actual.
          </p>
        </div>
      )}

      {/* Campos del formulario */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => (
          <FieldRenderer
            key={field.id}
            field={field}
            sheetIndex={sheetIndex}
            sectionIndex={sectionIndex}
          />
        ))}
      </div>
    </div>
  );
}
