'use client';

import { useEffect } from 'react';
import UserManager from './UserManager';
import { useDatabaseInit } from '@/hooks/useDatabaseInit';
import { useDatabaseStore } from '@/store/useDatabaseStore';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Inicializar la base de datos con datos predeterminados
  const { isInitialized, workersCount, cuadrillasCount } = useDatabaseInit();
  const { currentUser } = useDatabaseStore();

  return (
    <>
      {/* User Manager Modal */}
      <UserManager />

      {/* User Info Bar (si hay usuario logueado) */}
      {currentUser && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      currentUser.role === 'admin'
                        ? 'bg-purple-500'
                        : 'bg-green-500'
                    }`}
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {currentUser.nombre}
                  </span>
                  <span className="text-xs text-gray-500">
                    •{' '}
                    {currentUser.role === 'admin'
                      ? 'Administrador'
                      : 'Usuario'}
                  </span>
                </div>
              </div>
              {isInitialized && (
                <div className="text-xs text-gray-500">
                  Base de datos: {workersCount} trabajadores •{' '}
                  {cuadrillasCount} cuadrillas
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {children}
    </>
  );
}
