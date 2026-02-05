'use client';

import { useState, useEffect } from 'react';
import { useDatabaseStore } from '@/store/useDatabaseStore';
import type { Worker } from '@/types';

const ADMIN_PASSWORD = 'admin123';

export default function UserLogin() {
  const { workers, currentUser, setCurrentUser, syncFromServer } = useDatabaseStore();
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);

  // Estado para el modal de contraseña de trabajador
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [workerPassword, setWorkerPassword] = useState('');
  const [workerPasswordError, setWorkerPasswordError] = useState('');

  // Wait for store to hydrate from localStorage before showing modal
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Auto-sync workers from server when modal shows and workers are empty
  useEffect(() => {
    if (isHydrated && !currentUser && workers.length === 0 && !hasSynced && !isSyncing) {
      handleSync();
    }
  }, [isHydrated, currentUser, workers.length, hasSynced, isSyncing]);

  const activeWorkers = workers.filter((w) => w.isActive);

  const filteredWorkers = searchQuery.trim()
    ? activeWorkers.filter(
        (w) =>
          w.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.cargo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.cedula.includes(searchQuery)
      )
    : activeWorkers;

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncFromServer();
      setHasSynced(true);
    } catch (error) {
      console.error('Error syncing:', error);
    }
    setIsSyncing(false);
  };

  const handleWorkerSelect = (worker: Worker) => {
    setSelectedWorker(worker);
    setWorkerPassword('');
    setWorkerPasswordError('');
  };

  const handleWorkerLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedWorker) return;

    // Verificar contraseña
    const workerPasswordFromDB = selectedWorker.password || '1234'; // Default password

    if (workerPassword !== workerPasswordFromDB) {
      setWorkerPasswordError('Contraseña incorrecta');
      return;
    }

    const user = {
      id: selectedWorker.id,
      nombre: selectedWorker.nombre,
      email: selectedWorker.cedula ? `${selectedWorker.cedula}@empresa.com` : undefined,
      role: 'user' as const,
      cargo: selectedWorker.cargo,
      cuadrillaId: selectedWorker.cuadrillaId,
      createdAt: new Date(),
      lastLogin: new Date(),
    };

    setCurrentUser(user);
    setSelectedWorker(null);
    setWorkerPassword('');
  };

  const handleCancelWorkerLogin = () => {
    setSelectedWorker(null);
    setWorkerPassword('');
    setWorkerPasswordError('');
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
    setPassword('');
    setPasswordError('');
  };

  // Don't render while hydrating (prevents flash)
  if (!isHydrated) return null;

  // Don't render if user is logged in - AppMenu handles user display
  if (currentUser) return null;

  // Modal de contraseña para trabajador seleccionado
  if (selectedWorker) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl font-semibold text-gray-700">
                  {selectedWorker.nombre.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">{selectedWorker.nombre}</h2>
              <p className="text-sm text-gray-500">{selectedWorker.cargo}</p>
            </div>

            <form onSubmit={handleWorkerLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={workerPassword}
                  onChange={(e) => {
                    setWorkerPassword(e.target.value);
                    setWorkerPasswordError('');
                  }}
                  placeholder="Ingrese su contraseña"
                  className={`w-full px-4 py-2.5 text-sm border rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                    workerPasswordError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                  autoFocus
                />
                {workerPasswordError && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {workerPasswordError}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancelWorkerLogin}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
                >
                  Ingresar
                </button>
              </div>
            </form>

            <p className="text-xs text-center text-gray-400 mt-4">
              Si olvidaste tu contraseña, contacta al administrador
            </p>
          </div>
        </div>
      </div>
    );
  }

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
                {isSyncing ? (
                  <div className="text-center py-12 text-gray-400">
                    <svg className="mx-auto w-12 h-12 mb-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <p className="text-sm">Cargando trabajadores...</p>
                  </div>
                ) : filteredWorkers.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <svg className="mx-auto w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-sm">No se encontraron trabajadores</p>
                    <button
                      onClick={handleSync}
                      className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Sincronizar datos
                    </button>
                  </div>
                ) : (
                  filteredWorkers.map((worker) => (
                    <button
                      key={worker.id}
                      onClick={() => handleWorkerSelect(worker)}
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
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
            </form>
          )}

          {/* Sync Button */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {isSyncing ? 'Sincronizando...' : 'Sincronizar datos'}
            </button>
            <p className="text-xs text-center text-gray-400 mt-2">
              Actualiza la lista de trabajadores desde el servidor
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
