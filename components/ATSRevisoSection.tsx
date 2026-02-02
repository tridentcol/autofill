'use client';

import { useEffect, useMemo } from 'react';
import { useFormStore } from '@/store/useFormStore';
import { useDatabaseStore } from '@/store/useDatabaseStore';
import FieldRenderer from './FieldRenderer';
import type { Field } from '@/types';

interface ATSRevisoSectionProps {
  sheetIndex: number;
  sectionIndex: number;
  fields: Field[];
}

/**
 * Sección de Reviso y Aprobó para ATS
 * Autocompleta el cargo del inspector seleccionado
 */
export default function ATSRevisoSection({ sheetIndex, sectionIndex, fields }: ATSRevisoSectionProps) {
  const { workers } = useDatabaseStore();
  const { updateFieldValue, currentFormData } = useFormStore();

  // Obtener la firma seleccionada para autocompletar el cargo
  const selectedSignatureId = useMemo(() => {
    const sectionData = currentFormData?.sheets[sheetIndex]?.sections[sectionIndex];
    const firmaField = sectionData?.fields.find((f) => f.fieldId === 'firma_inspector');
    return firmaField?.value;
  }, [currentFormData, sheetIndex, sectionIndex]);

  useEffect(() => {
    if (!selectedSignatureId) return;

    // Buscar el worker por signatureId para obtener su cargo
    const worker = workers.find((w) => w.signatureId === selectedSignatureId);
    if (worker) {
      updateFieldValue(sheetIndex, sectionIndex, 'inspector_cargo', worker.cargo);
    }
  }, [selectedSignatureId, workers, sheetIndex, sectionIndex, updateFieldValue]);

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
