'use client';

import { useState, useEffect } from 'react';
import { useDatabaseStore } from '@/store/useDatabaseStore';
import { useFormStore } from '@/store/useFormStore';
import type { Worker, WorkerCargo } from '@/types';

interface WorkerSelectorProps {
  value?: string; // Worker ID
  onChange: (worker: Worker | null) => void;
  cuadrillaId?: string; // Filtrar por cuadrilla específica
  filterByRole?: WorkerCargo; // Filtrar por cargo
  label?: string;
  required?: boolean;
  placeholder?: string;
}

export default function WorkerSelector({
  value,
  onChange,
  cuadrillaId,
  filterByRole,
  label = 'Seleccionar Trabajador',
  required = false,
  placeholder = 'Buscar trabajador...',
}: WorkerSelectorProps) {
  const { workers, getWorkersByCuadrilla, getWorkersByRole, getWorkerById } =
    useDatabaseStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Obtener trabajadores filtrados
  const getFilteredWorkers = (): Worker[] => {
    let filtered = workers.filter((w) => w.isActive);

    // Filtrar por cuadrilla si está especificado
    if (cuadrillaId) {
      filtered = getWorkersByCuadrilla(cuadrillaId);
    }

    // Filtrar por rol si está especificado
    if (filterByRole) {
      filtered = filtered.filter((w) => w.cargo === filterByRole);
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (w) =>
          w.nombre.toLowerCase().includes(query) ||
          w.cargo.toLowerCase().includes(query) ||
          w.cedula.includes(query)
      );
    }

    return filtered;
  };

  const filteredWorkers = getFilteredWorkers();
  const selectedWorker = value ? getWorkerById(value) : null;

  const handleSelect = (worker: Worker) => {
    onChange(worker);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    onChange(null);
    setSearchQuery('');
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Selected Worker Display */}
      {selectedWorker && !isOpen ? (
        <div className="flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {selectedWorker.nombre}
            </p>
            <p className="text-xs text-gray-500">
              {selectedWorker.cargo}
              {selectedWorker.cedula && ` • CC ${selectedWorker.cedula}`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Cambiar
            </button>
            {!required && (
              <button
                type="button"
                onClick={handleClear}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Quitar
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <svg
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Dropdown List */}
          {isOpen && (
            <>
              {/* Backdrop to close dropdown */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />

              {/* Dropdown */}
              <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredWorkers.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    {searchQuery
                      ? 'No se encontraron trabajadores'
                      : 'No hay trabajadores disponibles'}
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {filteredWorkers.map((worker) => (
                      <li key={worker.id}>
                        <button
                          type="button"
                          onClick={() => handleSelect(worker)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                        >
                          <p className="text-sm font-medium text-gray-900">
                            {worker.nombre}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {worker.cargo}
                            {worker.cedula && ` • CC ${worker.cedula}`}
                          </p>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
