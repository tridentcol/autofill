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
 * Sección de información básica para ATS
 * Autocompleta: Elaboró (nombre y cargo del usuario actual)
 */
export default function ATSInfoSection({ sheetIndex, sectionIndex, fields }: ATSInfoSectionProps) {
  const { currentUser } = useDatabaseStore();
  const { workers } = useDatabaseStore();
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

    // Autocompletar fecha actual (ya tiene valor por defecto en formatConfigs)
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
