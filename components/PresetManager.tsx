'use client';

import { useState } from 'react';
import { useFormStore } from '@/store/useFormStore';
import type { UserPreset } from '@/types';

export default function PresetManager() {
  const { presets, addPreset, removePreset, applyPreset } = useFormStore();
  const [presetName, setPresetName] = useState('');
  const [realizadoPor, setRealizadoPor] = useState('');
  const [cargo, setCargo] = useState('');
  const [lugarZonaTrabajo, setLugarZonaTrabajo] = useState('');

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      alert('Por favor ingrese un nombre para el preset');
      return;
    }

    if (!realizadoPor.trim() && !cargo.trim() && !lugarZonaTrabajo.trim()) {
      alert('Por favor ingrese al menos un dato para el preset');
      return;
    }

    const newPreset: UserPreset = {
      id: `preset_${Date.now()}`,
      name: presetName.trim(),
      data: {
        realizadoPor: realizadoPor.trim() || undefined,
        cargo: cargo.trim() || undefined,
        lugarZonaTrabajo: lugarZonaTrabajo.trim() || undefined,
      },
      createdAt: new Date(),
    };

    addPreset(newPreset);

    // Limpiar formulario
    setPresetName('');
    setRealizadoPor('');
    setCargo('');
    setLugarZonaTrabajo('');

    alert('Preset guardado exitosamente!');
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este preset?')) {
      removePreset(id);
    }
  };

  const handleApply = (id: string) => {
    applyPreset(id);
    alert('Preset aplicado! Los campos correspondientes han sido rellenados.');
  };

  return (
    <div className="space-y-8">
      {/* Crear nuevo preset */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Crear Nuevo Preset
        </h3>

        <div className="space-y-4">
          {/* Nombre del preset */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Preset *
            </label>
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Ej: Juan Pérez - Supervisor"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Realizado Por */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Realizado Por
            </label>
            <input
              type="text"
              value={realizadoPor}
              onChange={(e) => setRealizadoPor(e.target.value)}
              placeholder="Nombre completo"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Cargo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cargo
            </label>
            <input
              type="text"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              placeholder="Ej: Supervisor de Seguridad"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Lugar/Zona de Trabajo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lugar / Zona de Trabajo
            </label>
            <input
              type="text"
              value={lugarZonaTrabajo}
              onChange={(e) => setLugarZonaTrabajo(e.target.value)}
              placeholder="Ej: Zona Industrial Norte"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleSavePreset}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
          >
            Guardar Preset
          </button>
        </div>
      </div>

      {/* Lista de presets guardados */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Presets Guardados ({presets.length})
        </h3>

        {presets.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-500">
              No hay presets guardados
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Crea un nuevo preset usando el formulario de arriba
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {preset.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      Creado: {new Date(preset.createdAt).toLocaleDateString('es-ES')}
                    </p>
                    {preset.lastUsed && (
                      <p className="text-xs text-gray-400">
                        Último uso: {new Date(preset.lastUsed).toLocaleDateString('es-ES')}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(preset.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                    title="Eliminar preset"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-1 text-sm mb-3">
                  {preset.data.realizadoPor && (
                    <p className="text-gray-600">
                      <span className="font-medium">Realizado por:</span> {preset.data.realizadoPor}
                    </p>
                  )}
                  {preset.data.cargo && (
                    <p className="text-gray-600">
                      <span className="font-medium">Cargo:</span> {preset.data.cargo}
                    </p>
                  )}
                  {preset.data.lugarZonaTrabajo && (
                    <p className="text-gray-600">
                      <span className="font-medium">Lugar:</span> {preset.data.lugarZonaTrabajo}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleApply(preset.id)}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors"
                >
                  Aplicar Preset
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
