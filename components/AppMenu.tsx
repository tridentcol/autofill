'use client';

import { useState, useRef, useEffect } from 'react';
import { useDatabaseStore } from '@/store/useDatabaseStore';

export default function AppMenu() {
  const { currentUser, setCurrentUser, syncFromServer } = useDatabaseStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAdmin = currentUser?.role === 'admin';
  const isWorker = currentUser && !isAdmin;

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    const success = await syncFromServer();
    setIsSyncing(false);
    if (success) {
      alert('Datos sincronizados correctamente');
    } else {
      alert('Error al sincronizar. Intente de nuevo.');
    }
    setIsOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsOpen(false);
  };

  const handleChangeWorker = () => {
    setCurrentUser(null);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Menu Button - Touch friendly size */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors min-h-[44px]"
        aria-label="Menú de usuario"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {currentUser ? (
          <>
            <div className={`w-8 h-8 sm:w-9 sm:h-9 ${isAdmin ? 'bg-purple-600' : 'bg-gray-900'} rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0`}>
              {currentUser.nombre?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-900 max-w-[100px] lg:max-w-[140px] truncate">
              {currentUser.nombre || 'Usuario'}
            </span>
          </>
        ) : (
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu - Mobile optimized */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 z-40 sm:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div className="absolute right-0 mt-2 w-72 sm:w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-[calc(100vh-80px)] overflow-y-auto">
            {/* User Info - Different display for admin vs worker */}
            {currentUser && (
              <div className="px-4 py-3 border-b border-gray-100">
                {isWorker ? (
                  <>
                    <p className="text-xs text-gray-500 mb-0.5">Identificado como</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{currentUser.nombre || 'Usuario'}</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-900 truncate">{currentUser.nombre || 'Usuario'}</p>
                    <p className="text-xs text-purple-600 font-medium">Administrador</p>
                  </>
                )}
              </div>
            )}

            {/* Menu Items */}
            <div className="py-1">
              {/* Documents Link - Available to all */}
              <a
                href="/documentos"
                className="w-full flex items-center gap-3 px-4 py-3 sm:py-2.5 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <div className="text-left min-w-0">
                  <p className="font-medium">Documentos</p>
                  <p className="text-xs text-gray-500 truncate">Ver archivos guardados</p>
                </div>
              </a>

              {/* Sync Button - Available to all */}
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="w-full flex items-center gap-3 px-4 py-3 sm:py-2.5 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg
                  className={`w-5 h-5 text-gray-500 flex-shrink-0 ${isSyncing ? 'animate-spin' : ''}`}
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
                <div className="text-left min-w-0">
                  <p className="font-medium">{isSyncing ? 'Sincronizando...' : 'Sincronizar datos'}</p>
                  <p className="text-xs text-gray-500 truncate">Actualizar desde el servidor</p>
                </div>
              </button>

              {/* Admin Panel Link - Only for admin */}
              {isAdmin && (
                <a
                  href="/admin"
                  className="w-full flex items-center gap-3 px-4 py-3 sm:py-2.5 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="text-left min-w-0">
                    <p className="font-medium">Panel de Admin</p>
                    <p className="text-xs text-gray-500">Gestionar sistema</p>
                  </div>
                </a>
              )}
            </div>

            {/* Change Worker - Only for workers (non-admin) */}
            {isWorker && (
              <div className="border-t border-gray-100 pt-1 mt-1">
                <button
                  onClick={handleChangeWorker}
                  className="w-full flex items-center gap-3 px-4 py-3 sm:py-2.5 text-sm text-blue-600 hover:bg-blue-50 active:bg-blue-100 transition-colors"
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                  <span className="font-medium">Cambiar trabajador</span>
                </button>
              </div>
            )}

            {/* Logout - Only for admin */}
            {isAdmin && (
              <div className="border-t border-gray-100 pt-1 mt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 sm:py-2.5 text-sm text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors"
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span className="font-medium">Cerrar sesión</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
