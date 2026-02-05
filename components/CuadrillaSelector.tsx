'use client';

import { useDatabaseStore } from '@/store/useDatabaseStore';
import type { Worker } from '@/types';

interface CuadrillaSelectorProps {
  value?: string; // Cuadrilla ID
  onChange: (cuadrillaId: string, workers: Worker[]) => void;
  label?: string;
}

export default function CuadrillaSelector({
  value,
  onChange,
  label = 'Seleccionar Cuadrilla',
}: CuadrillaSelectorProps) {
  const { cuadrillas, getWorkersByCuadrilla, getCuadrillaById } =
    useDatabaseStore();

  const activeCuadrillas = cuadrillas.filter((c) => c.isActive);
  const selectedCuadrilla = value ? getCuadrillaById(value) : null;

  const handleChange = (cuadrillaId: string) => {
    if (!cuadrillaId) {
      onChange('', []);
      return;
    }

    const workers = getWorkersByCuadrilla(cuadrillaId);
    onChange(cuadrillaId, workers);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <select
        value={value || ''}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      >
        <option value="">Selección Manual</option>
        {activeCuadrillas.map((cuad) => {
          const workers = getWorkersByCuadrilla(cuad.id);
          return (
            <option key={cuad.id} value={cuad.id}>
              {cuad.nombre} ({workers.length} trabajadores)
            </option>
          );
        })}
      </select>
    </div>
  );
}
