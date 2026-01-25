'use client';

import UserLogin from './UserLogin';
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
      {/* User Login Modal/Bar */}
      <UserLogin />

      {/* Database Status (si hay usuario logueado) */}
      {currentUser && isInitialized && (
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5">
            <div className="flex items-center justify-center gap-6 text-xs text-gray-600">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span>{workersCount} trabajadores</span>
              </div>
              <div className="w-px h-3 bg-gray-300"></div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                <span>{cuadrillasCount} cuadrillas</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {children}
    </>
  );
}
