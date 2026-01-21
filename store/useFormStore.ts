import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ExcelFormat,
  FormData,
  Signature,
  WizardStep,
  FieldData,
  UserPreset,
} from '@/types';

interface FormStore {
  // Estado del formato seleccionado
  selectedFormat: ExcelFormat | null;
  setSelectedFormat: (format: ExcelFormat | null) => void;

  // Datos del formulario en progreso
  currentFormData: FormData | null;
  setCurrentFormData: (data: FormData | null) => void;
  updateFieldValue: (
    sheetIndex: number,
    sectionIndex: number,
    fieldId: string,
    value: any
  ) => void;

  // Wizard state
  currentStep: number;
  wizardSteps: WizardStep[];
  setWizardSteps: (steps: WizardStep[]) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: number) => void;

  // Firmas guardadas
  signatures: Signature[];
  addSignature: (signature: Signature) => void;
  removeSignature: (id: string) => void;
  getSignatureById: (id: string) => Signature | undefined;

  // Presets guardados
  presets: UserPreset[];
  addPreset: (preset: UserPreset) => void;
  removePreset: (id: string) => void;
  getPresetById: (id: string) => UserPreset | undefined;
  applyPreset: (presetId: string) => void;

  // Utilidades
  resetForm: () => void;
  isFormComplete: () => boolean;
}

export const useFormStore = create<FormStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      selectedFormat: null,
      currentFormData: null,
      currentStep: 0,
      wizardSteps: [],
      signatures: [],
      presets: [],

      // Setters
      setSelectedFormat: (format) => set({ selectedFormat: format }),

      setCurrentFormData: (data) => set({ currentFormData: data }),

      updateFieldValue: (sheetIndex, sectionIndex, fieldId, value) => {
        const { currentFormData } = get();
        if (!currentFormData) return;

        const newFormData = { ...currentFormData };
        const sheet = newFormData.sheets[sheetIndex];
        if (!sheet) return;

        const section = sheet.sections[sectionIndex];
        if (!section) return;

        const fieldIndex = section.fields.findIndex((f) => f.fieldId === fieldId);
        if (fieldIndex === -1) {
          // Agregar nuevo field
          section.fields.push({
            fieldId,
            value,
            completed: value !== null && value !== undefined && value !== '',
          });
        } else {
          // Actualizar field existente
          section.fields[fieldIndex] = {
            ...section.fields[fieldIndex],
            value,
            completed: value !== null && value !== undefined && value !== '',
          };
        }

        set({ currentFormData: newFormData });
      },

      setWizardSteps: (steps) => set({ wizardSteps: steps }),

      goToNextStep: () => {
        const { currentStep, wizardSteps } = get();
        if (currentStep < wizardSteps.length - 1) {
          set({ currentStep: currentStep + 1 });
        }
      },

      goToPreviousStep: () => {
        const { currentStep } = get();
        if (currentStep > 0) {
          set({ currentStep: currentStep - 1 });
        }
      },

      goToStep: (step) => {
        const { wizardSteps } = get();
        if (step >= 0 && step < wizardSteps.length) {
          set({ currentStep: step });
        }
      },

      addSignature: (signature) => {
        const { signatures } = get();
        set({ signatures: [...signatures, signature] });
      },

      removeSignature: (id) => {
        const { signatures } = get();
        set({ signatures: signatures.filter((s) => s.id !== id) });
      },

      getSignatureById: (id) => {
        const { signatures } = get();
        return signatures.find((s) => s.id === id);
      },

      addPreset: (preset) => {
        const { presets } = get();
        set({ presets: [...presets, preset] });
      },

      removePreset: (id) => {
        const { presets } = get();
        set({ presets: presets.filter((p) => p.id !== id) });
      },

      getPresetById: (id) => {
        const { presets } = get();
        return presets.find((p) => p.id === id);
      },

      applyPreset: (presetId) => {
        const { presets, currentFormData, selectedFormat, updateFieldValue } = get();
        const preset = presets.find((p) => p.id === presetId);

        if (!preset || !currentFormData || !selectedFormat) return;

        // Buscar y rellenar campos que coincidan con los datos del preset
        for (let sheetIndex = 0; sheetIndex < selectedFormat.sheets.length; sheetIndex++) {
          const sheet = selectedFormat.sheets[sheetIndex];

          for (let sectionIndex = 0; sectionIndex < sheet.sections.length; sectionIndex++) {
            const section = sheet.sections[sectionIndex];

            for (const field of section.fields) {
              const label = field.label.toLowerCase();

              // Mapear etiquetas a datos del preset
              if (label.includes('realizado por') && preset.data.realizadoPor) {
                updateFieldValue(sheetIndex, sectionIndex, field.id, preset.data.realizadoPor);
              } else if (label.includes('cargo') && preset.data.cargo) {
                updateFieldValue(sheetIndex, sectionIndex, field.id, preset.data.cargo);
              } else if (label.includes('lugar') && preset.data.lugarZonaTrabajo) {
                updateFieldValue(sheetIndex, sectionIndex, field.id, preset.data.lugarZonaTrabajo);
              }
            }
          }
        }

        // Actualizar last used
        const updatedPresets = presets.map((p) =>
          p.id === presetId ? { ...p, lastUsed: new Date() } : p
        );
        set({ presets: updatedPresets });
      },

      resetForm: () => {
        set({
          selectedFormat: null,
          currentFormData: null,
          currentStep: 0,
          wizardSteps: [],
        });
      },

      isFormComplete: () => {
        const { currentFormData } = get();
        if (!currentFormData) return false;

        for (const sheet of currentFormData.sheets) {
          for (const section of sheet.sections) {
            for (const field of section.fields) {
              if (!field.completed) {
                return false;
              }
            }
          }
        }
        return true;
      },
    }),
    {
      name: 'autofill-storage',
      partialize: (state) => ({
        signatures: state.signatures,
        presets: state.presets,
      }),
    }
  )
);
