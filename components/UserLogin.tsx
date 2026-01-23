'use client';

import { useState } from 'react';
import { useDatabaseStore } from '@/store/useDatabaseStore';
import type { Worker } from '@/types';

const ADMIN_PASSWORD = 'admin123'; // TODO: Cambiar por algo más seguro en producción

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
      nombre: 'Administrador del Sistema',
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

  const handleLogout = () => {
    if (confirm('¿Está seguro de que desea cerrar sesión?')) {
      setCurrentUser(null as any);
      setShowModal(true);
      setIsAdminMode(false);
      setPassword('');
      setPasswordError('');
      setSearchQuery('');
    }
  };

  if (!showModal && currentUser) {
    return (
      <div className="flex items-center gap-4 px-4 py-2 bg-white border-b border-gray-200">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">
            {currentUser.nombre}
          </p>
          <p className="text-xs text-gray-500">
            {currentUser.role === 'admin' ? '👑 Administrador' : '👤 Trabajador'}
            {currentUser.email && ` • ${currentUser.email}`}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    );
  }

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Bienvenido
            </h2>
            <p className="text-gray-600">
              Selecciona tu perfil para continuar
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setIsAdminMode(false)}
              className={`flex-1 py-3 px-4 font-medium text-sm transition-colors ${
                !isAdminMode
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              👤 Trabajadores
            </button>
            <button
              onClick={() => setIsAdminMode(true)}
              className={`flex-1 py-3 px-4 font-medium text-sm transition-colors ${
                isAdminMode
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              👑 Administrador
            </button>
          </div>

          {/* Workers List */}
          {!isAdminMode && (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por nombre, cargo o cédula..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
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

              {/* Workers Grid */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredWorkers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No se encontraron trabajadores</p>
                  </div>
                ) : (
                  filteredWorkers.map((worker) => (
                    <button
                      key={worker.id}
                      onClick={() => handleWorkerLogin(worker)}
                      className="w-full p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-lg font-semibold text-gray-700 group-hover:bg-primary-100 group-hover:text-primary-700 transition-colors">
                          {worker.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {worker.nombre}
                          </p>
                          <p className="text-sm text-gray-500">
                            {worker.cargo}
                            {worker.cedula && ` • CC ${worker.cedula}`}
                          </p>
                        </div>
                        <svg
                          className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
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
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                  <svg
                    className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-purple-900">
                      Acceso Restringido
                    </p>
                    <p className="text-xs text-purple-700 mt-1">
                      Esta sección requiere privilegios de administrador
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña de Administrador
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder="Ingrese la contraseña"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    passwordError
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  required
                />
                {passwordError && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {passwordError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors flex items-center justify-center gap-2"
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
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                Acceder como Administrador
              </button>

              <p className="text-xs text-center text-gray-500">
                💡 Contraseña por defecto: <code className="bg-gray-100 px-2 py-1 rounded">admin123</code>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
