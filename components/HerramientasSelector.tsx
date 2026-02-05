'use client';

import { useState, useEffect } from 'react';
import { useFormStore } from '@/store/useFormStore';

interface HerramientasSelectorProps {
  sheetIndex: number;
  sectionIndex: number;
  fieldId?: string; // default: 'herramientas'
}

const HERRAMIENTAS_LIST = [
  'Agarradoras para cable',
  'Alicate aislado',
  'Barreton- Barra punta',
  'Candados',
  'Cavador (hoyadoras/paladraga)',
  'Cizalla con mangos aislados',
  'Cuchilla de exacto',
  'Cuerda de nylon',
  'Destornilladores estriados aislado',
  'Destornilladores pala aislado',
  'Diferencial tipo señorita (guaya o cadena)',
  'Flexometro',
  'Macho solo boca recta - pinza de presion',
  'Linterna de mano',
  'Llave de expansion',
  'Llave tipo Rachet',
  'Llaves mixta (corona y boca)',
  'Lima plana',
  'Machete o Rula',
  'Martillo mango aislado',
  'Pala cuadrada',
  'Segueta con marco aislado con hojas',
  'Zunchadora',
  'Pinza voltiamperimetrica',
  'Coratafrios',
  'Escalera dielectrica de dos cuerpos',
  'Escalera tipo tijera',
  'Conos de seguridad',
  'Rollo de cinta de seguridad para demarcar',
  'Llave Allen',
];

export default function HerramientasSelector({
  sheetIndex,
  sectionIndex,
  fieldId = 'herramientas',
}: HerramientasSelectorProps) {
  const { updateFieldValue, currentFormData } = useFormStore();
  const [selectedHerramientas, setSelectedHerramientas] = useState<Set<string>>(new Set());

  // Cargar valor inicial desde el store si existe
  useEffect(() => {
    if (!currentFormData) return;
    const sectionData = currentFormData.sheets[sheetIndex]?.sections[sectionIndex];
    const herramientasField = sectionData?.fields.find((f) => f.fieldId === fieldId);
    if (herramientasField?.value) {
      const items = (herramientasField.value as string)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      setSelectedHerramientas(new Set(items));
    }
  }, [currentFormData, sheetIndex, sectionIndex, fieldId]);

  const handleToggle = (herramienta: string) => {
    const newSet = new Set(selectedHerramientas);
    if (newSet.has(herramienta)) {
      newSet.delete(herramienta);
    } else {
      newSet.add(herramienta);
    }
    setSelectedHerramientas(newSet);

    // Concatenar con comas y actualizar el campo
    const concatenated = Array.from(newSet).join(', ');
    updateFieldValue(sheetIndex, sectionIndex, fieldId, concatenated);
  };

  const handleSelectAll = () => {
    const newSet = new Set(HERRAMIENTAS_LIST);
    setSelectedHerramientas(newSet);
    updateFieldValue(sheetIndex, sectionIndex, fieldId, HERRAMIENTAS_LIST.join(', '));
  };

  const handleClearAll = () => {
    setSelectedHerramientas(new Set());
    updateFieldValue(sheetIndex, sectionIndex, fieldId, '');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Herramientas a Utilizar</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-colors"
          >
            Seleccionar todas
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600 mb-3">
          Seleccione las herramientas que se utilizarán ({selectedHerramientas.size} seleccionadas)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {HERRAMIENTAS_LIST.map((herramienta) => (
            <label
              key={herramienta}
              className="flex items-start gap-2 cursor-pointer group p-2 hover:bg-white rounded-md transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedHerramientas.has(herramienta)}
                onChange={() => handleToggle(herramienta)}
                className="mt-0.5 w-4 h-4 border-2 border-gray-300 rounded text-primary-600 focus:ring-2 focus:ring-primary-500 cursor-pointer flex-shrink-0"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900 leading-tight">
                {herramienta}
              </span>
            </label>
          ))}
        </div>
      </div>

      {selectedHerramientas.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs font-medium text-blue-900 mb-1">Herramientas seleccionadas:</p>
          <p className="text-sm text-blue-800">
            {Array.from(selectedHerramientas).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
