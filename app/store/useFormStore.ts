import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ExcelFormat,
  FormData,
  Signature,
  WizardStep,
  FieldData,
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
      }),
    }
  )
);
