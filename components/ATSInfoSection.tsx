'use client';

import { useEffect } from 'react';
import { useFormStore } from '@/store/useFormStore';
import { useDatabaseStore } from '@/store/useDatabaseStore';
import FieldRenderer from './FieldRenderer';
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
  const { updateFieldValue } = useFormStore();

  useEffect(() => {
    if (!currentUser) return;

    // Autocompletar Elaboró con el nombre del usuario actual
    updateFieldValue(sheetIndex, sectionIndex, 'elaboro_nombre', currentUser.nombre);

    // Autocompletar Cargo del usuario actual
    const worker = workers.find((w) => w.id === currentUser.id);
    if (worker) {
      updateFieldValue(sheetIndex, sectionIndex, 'elaboro_cargo', worker.cargo);
    }

    // Autocompletar fecha actual de Colombia
    updateFieldValue(sheetIndex, sectionIndex, 'elaboro_fecha', getColombiaDate());
  }, [currentUser, workers, sheetIndex, sectionIndex, updateFieldValue]);

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <FieldRenderer
          key={field.id}
          field={field}
          sheetIndex={sheetIndex}
          sectionIndex={sectionIndex}
        />
      ))}
    </div>
  );
}
