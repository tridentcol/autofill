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

      <div className="space-y-3">
        {/* Cuadrilla Selector */}
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

        {/* Preview de trabajadores de la cuadrilla */}
        {selectedCuadrilla && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">
              Trabajadores de {selectedCuadrilla.nombre}:
            </p>
            <div className="space-y-1">
              {getWorkersByCuadrilla(selectedCuadrilla.id).map((worker) => (
                <div
                  key={worker.id}
                  className="text-sm text-blue-700 flex items-center gap-2"
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {worker.nombre} - {worker.cargo}
                  {worker.cedula && ` (CC ${worker.cedula})`}
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-blue-600">
              💡 Los campos de trabajadores se auto-completarán con esta
              cuadrilla
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
