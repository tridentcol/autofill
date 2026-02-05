'use client';

import { useState, useEffect } from 'react';
import { useFormStore } from '@/store/useFormStore';

interface TurnoSelectorProps {
  sheetIndex: number;
  sectionIndex: number;
}

const TURNOS = {
  manana: {
    label: 'Mañana',
    horaInicio: '07:00',
    horaFin: '15:00',
    descripcion: '7:00 AM - 3:00 PM'
  },
  noche: {
    label: 'Noche',
    horaInicio: '15:00',
    horaFin: '23:00',
    descripcion: '3:00 PM - 11:00 PM'
  }
};

export default function TurnoSelector({ sheetIndex, sectionIndex }: TurnoSelectorProps) {
  const { updateFieldValue, currentFormData } = useFormStore();
  const [selectedTurno, setSelectedTurno] = useState<'manana' | 'noche' | 'personalizado'>('manana');
  const [showCustom, setShowCustom] = useState(false);

  // Fecha actual en Colombia
  const now = new Date();
  const colombiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
  const defaultDate = colombiaTime.toISOString().split('T')[0];

  const [fechaInicio, setFechaInicio] = useState(defaultDate);
  const [horaInicio, setHoraInicio] = useState('07:00');
  const [fechaFin, setFechaFin] = useState(defaultDate);
  const [horaFin, setHoraFin] = useState('15:00');

  // Inicializar con turno mañana
  useEffect(() => {
    updateValues('manana');
  }, []);

  const updateValues = (turno: 'manana' | 'noche' | 'personalizado') => {
    let newHoraInicio = horaInicio;
    let newHoraFin = horaFin;

    if (turno !== 'personalizado') {
      newHoraInicio = TURNOS[turno].horaInicio;
      newHoraFin = TURNOS[turno].horaFin;
      setHoraInicio(newHoraInicio);
      setHoraFin(newHoraFin);
    }

    // Actualizar valores en el store
    updateFieldValue(sheetIndex, sectionIndex, 'turno_select', turno === 'manana' ? 'Mañana' : turno === 'noche' ? 'Noche' : 'Personalizado');
    updateFieldValue(sheetIndex, sectionIndex, 'desde_fecha', fechaInicio);
    updateFieldValue(sheetIndex, sectionIndex, 'desde_hora', newHoraInicio);
    updateFieldValue(sheetIndex, sectionIndex, 'hasta_fecha', fechaFin);
    updateFieldValue(sheetIndex, sectionIndex, 'hasta_hora', newHoraFin);
  };

  const handleTurnoChange = (turno: 'manana' | 'noche' | 'personalizado') => {
    setSelectedTurno(turno);
    setShowCustom(turno === 'personalizado');
    updateValues(turno);
  };

  const handleCustomChange = (field: 'fechaInicio' | 'horaInicio' | 'fechaFin' | 'horaFin', value: string) => {
    switch (field) {
      case 'fechaInicio':
        setFechaInicio(value);
        updateFieldValue(sheetIndex, sectionIndex, 'desde_fecha', value);
        break;
      case 'horaInicio':
        setHoraInicio(value);
        updateFieldValue(sheetIndex, sectionIndex, 'desde_hora', value);
        break;
      case 'fechaFin':
        setFechaFin(value);
        updateFieldValue(sheetIndex, sectionIndex, 'hasta_fecha', value);
        break;
      case 'horaFin':
        setHoraFin(value);
        updateFieldValue(sheetIndex, sectionIndex, 'hasta_hora', value);
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Botones de turno */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Seleccionar Turno
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleTurnoChange('manana')}
            className={`flex-1 min-w-[140px] px-6 py-4 rounded-lg border-2 transition-all ${
              selectedTurno === 'manana'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white hover:border-gray-400'
            }`}
          >
            <div className="font-semibold">Mañana</div>
            <div className="text-sm text-gray-500">7:00 AM - 3:00 PM</div>
          </button>

          <button
            type="button"
            onClick={() => handleTurnoChange('noche')}
            className={`flex-1 min-w-[140px] px-6 py-4 rounded-lg border-2 transition-all ${
              selectedTurno === 'noche'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white hover:border-gray-400'
            }`}
          >
            <div className="font-semibold">Noche</div>
            <div className="text-sm text-gray-500">3:00 PM - 11:00 PM</div>
          </button>

          <button
            type="button"
            onClick={() => handleTurnoChange('personalizado')}
            className={`flex-1 min-w-[140px] px-6 py-4 rounded-lg border-2 transition-all ${
              selectedTurno === 'personalizado'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white hover:border-gray-400'
            }`}
          >
            <div className="font-semibold">Personalizado</div>
            <div className="text-sm text-gray-500">Definir horario</div>
          </button>
        </div>
      </div>

      {/* Campos personalizados */}
      {showCustom && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DESDE */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Inicio
              </h4>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => handleCustomChange('fechaInicio', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="w-28">
                  <label className="block text-xs text-gray-500 mb-1">Hora</label>
                  <input
                    type="time"
                    value={horaInicio}
                    onChange={(e) => handleCustomChange('horaInicio', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* HASTA */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Fin
              </h4>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => handleCustomChange('fechaFin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="w-28">
                  <label className="block text-xs text-gray-500 mb-1">Hora</label>
                  <input
                    type="time"
                    value={horaFin}
                    onChange={(e) => handleCustomChange('horaFin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resumen */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <span className="font-medium">Período seleccionado:</span>{' '}
          {selectedTurno === 'personalizado' ? (
            <>
              {fechaInicio} {horaInicio} - {fechaFin} {horaFin}
            </>
          ) : (
            <>
              {fechaInicio} {TURNOS[selectedTurno].horaInicio} - {fechaFin} {TURNOS[selectedTurno].horaFin}
            </>
          )}
        </p>
      </div>
    </div>
  );
}
