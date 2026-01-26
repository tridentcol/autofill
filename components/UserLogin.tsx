'use client';

import { useState } from 'react';
import { useDatabaseStore } from '@/store/useDatabaseStore';
import type { Worker } from '@/types';

const ADMIN_PASSWORD = 'admin123';

export default function UserLogin() {
  const { workers, currentUser, setCurrentUser } = useDatabaseStore();
  const [showModal, setShowModal] = useState(!currentUser);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const activeWorkers = workers.filter((w) => w.isActive);

  const filteredWorkers = searchQuery.trim()
    ? activeWorkers.filter(
        (w) =>
          w.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.cargo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.cedula.includes(searchQuery)
      )
    : activeWorkers;

  const handleWorkerLogin = (worker: Worker) => {
    const user = {
      id: worker.id,
      nombre: worker.nombre,
      email: worker.cedula ? `${worker.cedula}@empresa.com` : undefined,
      role: 'user' as const,
      createdAt: new Date(),
      lastLogin: new Date(),
    };

    setCurrentUser(user);
    setShowModal(false);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== ADMIN_PASSWORD) {
      setPasswordError('Contraseña incorrecta');
      return;
    }

    const adminUser = {
      id: 'admin',
      nombre: 'Administrador',
      email: 'admin@sistema.com',
      role: 'admin' as const,
      createdAt: new Date(),
      lastLogin: new Date(),
    };

    setCurrentUser(adminUser);
    setShowModal(false);
    setPassword('');
    setPasswordError('');
  };

  // Don't render if user is logged in - AppMenu handles user display now
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Iniciar Sesión</h2>
            <p className="text-sm text-gray-500">Selecciona tu perfil para continuar</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setIsAdminMode(false)}
              className={`flex-1 py-2.5 px-3 text-sm font-medium transition-colors ${
                !isAdminMode
                  ? 'border-b-2 border-gray-900 text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Trabajadores
            </button>
            <button
              onClick={() => setIsAdminMode(true)}
              className={`flex-1 py-2.5 px-3 text-sm font-medium transition-colors ${
                isAdminMode
                  ? 'border-b-2 border-gray-900 text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Administrador
            </button>
          </div>

          {/* Workers List */}
          {!isAdminMode && (
            <div className="space-y-3">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar trabajador..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                <svg className="absolute left-3 top-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Workers Grid */}
              <div className="max-h-80 overflow-y-auto space-y-2">
                {filteredWorkers.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <svg className="mx-auto w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-sm">No se encontraron trabajadores</p>
                  </div>
                ) : (
                  filteredWorkers.map((worker) => (
                    <button
                      key={worker.id}
                      onClick={() => handleWorkerLogin(worker)}
                      className="w-full p-3 border border-gray-200 rounded-md hover:border-gray-400 hover:bg-gray-50 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
                          {worker.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{worker.nombre}</p>
                          <p className="text-xs text-gray-500 truncate">{worker.cargo}</p>
                        </div>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Admin Login */}
          {isAdminMode && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Acceso Restringido</p>
                    <p className="text-xs text-gray-600 mt-0.5">Requiere privilegios de administrador</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder="Ingrese la contraseña"
                  className={`w-full px-4 py-2.5 text-sm border rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                    passwordError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {passwordError && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {passwordError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
              >
                Acceder
              </button>

              <p className="text-xs text-center text-gray-500">
                Contraseña por defecto: <code className="bg-gray-100 px-2 py-0.5 rounded">admin123</code>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
