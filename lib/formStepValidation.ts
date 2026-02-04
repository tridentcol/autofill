import type { FormData, Section, SectionData, ExcelFormat } from '@/types';

/**
 * Get the section form data (fields with values) for a given step index.
 * Steps are flattened: sheet0.sections[0], sheet0.sections[1], ..., sheet1.sections[0], ...
 */
export function getSectionFormDataAtStep(
  formData: FormData,
  stepIndex: number
): SectionData | null {
  let idx = 0;
  for (const sheet of formData.sheets) {
    for (const section of sheet.sections) {
      if (idx === stepIndex) return section;
      idx++;
    }
  }
  return null;
}

function getSectionData(formData: FormData, sectionId: string): SectionData | null {
  for (const sheet of formData.sheets) {
    const sec = sheet.sections.find((s) => s.sectionId === sectionId);
    if (sec) return sec;
  }
  return null;
}

/**
 * Get value for a field in section form data.
 */
function getFieldValue(sectionData: SectionData, fieldId: string): any {
  const f = sectionData.fields.find((x) => x.fieldId === fieldId);
  return f?.value;
}

function isEmpty(v: any): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  return false;
}

/** Checkbox/option value counts as "filled" (sistema_acceso, epp). */
function hasCheckOrText(v: any, field: { type: string }): boolean {
  if (field.type === 'checkbox') return v === true || v === 'true' || v === 'X' || v === 1;
  return !isEmpty(v);
}

/**
 * Check if all required signature fields are selected.
 * Only considers sections of type 'signatures' (final signature steps), not worker_list.
 */
export function allSignaturesSelected(formData: FormData, format: ExcelFormat): boolean {
  for (const sheet of format.sheets) {
    for (const section of sheet.sections) {
      if (section.type !== 'signatures') continue; // solo pasos de firma final, no trabajadores
      const sectionData = getSectionData(formData, section.id);
      if (!sectionData) return false; // sección de firmas debe existir
      for (const field of section.fields) {
        if (field.type === 'signature') {
          const val = getFieldValue(sectionData, field.id);
          if (isEmpty(val)) return false;
        }
      }
    }
  }
  return true;
}

export type ValidationResult = { valid: boolean; message?: string };

/**
 * Validate current step for navigation (Siguiente).
 * Returns { valid: true } or { valid: false, message: string }.
 */
export function validateStep(
  formatId: string,
  section: Section,
  sectionData: SectionData | null,
  _formData: FormData
): ValidationResult {
  if (!sectionData) return { valid: false, message: 'Datos del paso no encontrados.' };

  const getVal = (fieldId: string) => getFieldValue(sectionData, fieldId);

  // --- Inspección de Vehículo ---
  if (formatId === 'inspeccion-vehiculo') {
    if (section.id === 'basic_info') {
      // All fields required except vehicle selector (selector is UI only; we validate the actual fields)
      for (const field of section.fields) {
        if (field.type === 'textarea' && field.id.startsWith('obs_')) continue;
        const v = getVal(field.id);
        if (isEmpty(v)) return { valid: false, message: `Complete el campo "${field.label}".` };
      }
      return { valid: true };
    }
    if (section.id === 'checklist') {
      const radioFields = section.fields.filter((f) => f.type === 'radio');
      for (const field of radioFields) {
        const v = getVal(field.id);
        if (v !== 'SI' && v !== 'NO' && v !== 'N/A')
          return { valid: false, message: `Debe marcar todos los ítems. Falta: "${field.label}".` };
      }
      return { valid: true };
    }
    if (section.id === 'observations') return { valid: true }; // optional
  }

  // --- Permiso de trabajo ---
  if (formatId === 'permiso-trabajo') {
    if (section.id === 'fecha_diligenciamiento') {
      for (const field of section.fields) {
        const v = getVal(field.id);
        if (isEmpty(v)) return { valid: false, message: `Complete el campo "${field.label}".` };
      }
      return { valid: true };
    }
    if (section.id === 'riesgo_otro_descripcion' || section.id === 'lugar_zona' || section.id === 'lugar_zona_trabajo') return { valid: true }; // step 2 optional
    if (section.id === 'evaluacion_riesgos') return { valid: true }; // opcional
    if (section.id === 'cuadrilla_select') return { valid: true }; // opcional
    if (section.id === 'trabajadores') {
      const atLeastOne = [1, 2, 3, 4].some((i) => !isEmpty(getVal(`trabajador${i}_nombre`)));
      if (!atLeastOne) return { valid: false, message: 'Debe haber al menos un trabajador seleccionado.' };
      return { valid: true };
    }
    if (section.id === 'actividad_altura') {
      for (const field of section.fields) {
        const v = getVal(field.id);
        if (isEmpty(v)) return { valid: false, message: `Complete el campo "${field.label}".` };
      }
      return { valid: true };
    }
    if (section.id === 'periodo_validez') {
      const turno = getVal('turno_select');
      if (isEmpty(turno)) return { valid: false, message: 'Debe seleccionar un turno.' };
      return { valid: true };
    }
    if (section.id === 'preparacion_area') {
      const radioFields = section.fields.filter((f) => f.type === 'radio');
      for (const field of radioFields) {
        const v = getVal(field.id);
        if (v !== 'SI' && v !== 'NO' && v !== 'N/A')
          return { valid: false, message: `Debe marcar todos los ítems de preparación del área.` };
      }
      return { valid: true };
    }
    if (section.id === 'sistema_acceso') {
      const hasAny = section.fields.some((f) => hasCheckOrText(getVal(f.id), f));
      if (!hasAny) return { valid: false, message: 'Debe marcar uno de los sistemas de acceso o escribir en Otro.' };
      return { valid: true };
    }
    if (section.id === 'epp') {
      const hasAny = section.fields.some((f) => hasCheckOrText(getVal(f.id), f));
      if (!hasAny) return { valid: false, message: 'Debe marcar al menos un elemento de EPP o especificar en Otro(s).' };
      return { valid: true };
    }
    if (section.id === 'herramientas_observaciones') {
      const herramientas = getVal('herramientas');
      if (isEmpty(herramientas)) return { valid: false, message: 'Herramientas a utilizar es obligatorio.' };
      return { valid: true }; // observaciones optional
    }
    if (section.id === 'firmas_autorizacion') {
      const firmaInspector = getVal('firma_inspector');
      const firmaPlan = getVal('firma_plan_emergencia');
      if (isEmpty(firmaInspector)) return { valid: false, message: 'Debe seleccionar la firma del Inspector.' };
      if (isEmpty(firmaPlan)) return { valid: false, message: 'Debe seleccionar la firma de Activa Plan de Emergencia.' };
      return { valid: true };
    }
  }

  // --- Inspección de herramientas ---
  if (formatId === 'inspeccion-herramientas') {
    if (section.id === 'basic_info') {
      for (const field of section.fields) {
        const v = getVal(field.id);
        if (isEmpty(v)) return { valid: false, message: `Complete el campo "${field.label}".` };
      }
      return { valid: true };
    }
    if (section.id === 'checklist') {
      const radioFields = section.fields.filter((f) => f.type === 'radio');
      for (const field of radioFields) {
        const v = getVal(field.id);
        if (v !== 'SI' && v !== 'NO' && v !== 'N/A')
          return { valid: false, message: `Debe marcar todos los ítems.` };
      }
      return { valid: true };
    }
    // inspeccion-herramientas: sin paso de firma; se inserta automáticamente según sesión
    if (section.id === 'observations') return { valid: true };
  }

  // --- ATS (Análisis de Trabajo Seguro) ---
  if (formatId === 'ats') {
    if (section.id === 'basic_info') {
      for (const field of section.fields) {
        const v = getVal(field.id);
        if (isEmpty(v)) return { valid: false, message: `Complete el campo "${field.label}".` };
      }
      return { valid: true };
    }
    if (section.id === 'herramientas') {
      const herramientas = getVal('herramientas');
      if (isEmpty(herramientas)) return { valid: false, message: 'Debe seleccionar al menos una herramienta.' };
      return { valid: true };
    }
    if (section.id === 'elaboro_info') {
      for (const field of section.fields) {
        const v = getVal(field.id);
        if (isEmpty(v)) return { valid: false, message: `Complete el campo "${field.label}".` };
      }
      return { valid: true };
    }
    if (section.id === 'reviso_aprobo') {
      const inspectorNombre = getVal('inspector_nombre');
      if (isEmpty(inspectorNombre)) return { valid: false, message: 'Debe seleccionar un inspector.' };
      return { valid: true };
    }
  }

  // --- Inspección Grúa/Manlift ---
  if (formatId === 'inspeccion-grua') {
    if (section.id === 'basic_info') {
      for (const field of section.fields) {
        const v = getVal(field.id);
        if (isEmpty(v)) return { valid: false, message: `Complete el campo "${field.label}".` };
      }
      return { valid: true };
    }
    if (section.id === 'checklist' || section.id === 'checklist_left' || section.id === 'checklist_right') {
      const radioFields = section.fields.filter((f) => f.type === 'radio');
      for (const field of radioFields) {
        const v = getVal(field.id);
        if (v !== 'SI' && v !== 'NO' && v !== 'N/A')
          return { valid: false, message: `Debe marcar todos los ítems.` };
      }
      return { valid: true };
    }
    // inspeccion-grua: sin paso de firma; el nombre REALIZADO POR se autocompleta
  }

  // Default: allow
  return { valid: true };
}

/**
 * Validate all steps (for submit to cloud). Returns first error or valid.
 */
export function validateAllSteps(
  formatId: string,
  formData: FormData,
  wizardSteps: { section: Section }[]
): ValidationResult {
  for (let stepIndex = 0; stepIndex < wizardSteps.length; stepIndex++) {
    const { section } = wizardSteps[stepIndex];
    const sectionData = getSectionFormDataAtStep(formData, stepIndex);
    const result = validateStep(formatId, section, sectionData, formData);
    if (!result.valid) return { valid: false, message: `Paso ${stepIndex + 1}: ${result.message}` };
  }
  return { valid: true };
}
