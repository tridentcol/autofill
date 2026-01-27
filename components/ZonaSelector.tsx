'use client';

import { useState, useEffect, useRef } from 'react';
import { useDatabaseStore } from '@/store/useDatabaseStore';
import type { Zona } from '@/types';

interface ZonaSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function ZonaSelector({
  value,
  onChange,
  placeholder = 'Seleccionar zona...',
  disabled = false,
  className = '',
}: ZonaSelectorProps) {
  const { zonas } = useDatabaseStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter active zonas
  const activeZonas = zonas.filter(z => z.isActive);

  // Filter by search term
  const filteredZonas = activeZonas.filter(z =>
    z.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected zona
  const selectedZona = activeZonas.find(z => z.nombre === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (zona: Zona) => {
    onChange(zona.nombre);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);

    // If typing, also update the value
    onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filteredZonas.length > 0) {
      e.preventDefault();
      handleSelect(filteredZonas[0]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchTerm : value}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-2 pr-10 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
        >
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredZonas.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              {searchTerm ? 'No se encontraron zonas' : 'No hay zonas disponibles'}
            </div>
          ) : (
            <ul className="py-1">
              {filteredZonas.map((zona) => (
                <li key={zona.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(zona)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center gap-2 ${
                      selectedZona?.id === zona.id ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                    }`}
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>{zona.nombre}</span>
                    {selectedZona?.id === zona.id && (
                      <svg className="w-4 h-4 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
