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
 * Autocompleta el cargo del inspector seleccionado y la fecha
 */
export default function ATSRevisoSection({ sheetIndex, sectionIndex, fields }: ATSRevisoSectionProps) {
  const { workers } = useDatabaseStore();
  const { updateFieldValue, currentFormData } = useFormStore();

  // Autocompletar fecha al montar
  useEffect(() => {
    updateFieldValue(sheetIndex, sectionIndex, 'inspector_fecha', getColombiaDate());
  }, [sheetIndex, sectionIndex, updateFieldValue]);

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
