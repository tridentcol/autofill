'use client';

import { useState } from 'react';
import { useDatabaseStore } from '@/store/useDatabaseStore';
import { useFormStore } from '@/store/useFormStore';
import DatabaseAdmin from './DatabaseAdmin';
import SignatureManager from './SignatureManager';
import VehicleManagement from './VehicleManagement';

type DashboardTab = 'overview' | 'workers' | 'cuadrillas' | 'camionetas' | 'gruas' | 'signatures' | 'settings';

export default function AdminDashboard() {
  const { workers, cuadrillas, camionetas, gruas, isAdmin, currentUser } = useDatabaseStore();
  const { signatures } = useFormStore();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  if (!isAdmin()) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <svg
            className="mx-auto h-12 w-12 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Acceso Denegado
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Se requieren privilegios de administrador para acceder al dashboard.
          </p>
        </div>
      </div>
    );
  }

  const activeWorkers = workers.filter(w => w.isActive);
  const activeCuadrillas = cuadrillas.filter(c => c.isActive);
  const activeCamionetas = camionetas.filter(c => c.isActive);
  const activeGruas = gruas.filter(g => g.isActive);

  const stats = [
    {
      name: 'Trabajadores Activos',
      value: activeWorkers.length,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
    },
    {
      name: 'Cuadrillas',
      value: activeCuadrillas.length,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
        </svg>
      ),
      color: 'bg-green-500',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
    },
    {
      name: 'Camionetas',
      value: activeCamionetas.length,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
        </svg>
      ),
      color: 'bg-orange-500',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
    },
    {
      name: 'Grúas/Manlifts',
      value: activeGruas.length,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
        </svg>
      ),
      color: 'bg-red-500',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
    },
    {
      name: 'Firmas Guardadas',
      value: signatures.length,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
        </svg>
      ),
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
    },
    {
      name: 'Con Firma Asignada',
      value: activeWorkers.filter(w => w.signatureId).length,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
    },
  ];

  const tabs = [
    { id: 'overview' as const, name: 'Vista General', icon: '📊' },
    { id: 'workers' as const, name: 'Trabajadores', icon: '👥' },
    { id: 'cuadrillas' as const, name: 'Cuadrillas', icon: '🏢' },
    { id: 'camionetas' as const, name: 'Camionetas', icon: '🚗' },
    { id: 'gruas' as const, name: 'Grúas/Manlifts', icon: '🏗️' },
    { id: 'signatures' as const, name: 'Firmas', icon: '✍️' },
    { id: 'settings' as const, name: 'Configuración', icon: '⚙️' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
            <p className="text-purple-100">
              Bienvenido, {currentUser?.nombre} • Gestiona toda la información del sistema
            </p>
          </div>
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.name}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <div className={stat.textColor}>{stat.icon}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">
                  🎯 Acciones Rápidas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab('workers')}
                    className="p-4 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="text-2xl mb-2">👤</div>
                    <h4 className="font-medium text-gray-900">Agregar Trabajador</h4>
                    <p className="text-sm text-gray-600 mt-1">Crear nuevo perfil de trabajador</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('signatures')}
                    className="p-4 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="text-2xl mb-2">✍️</div>
                    <h4 className="font-medium text-gray-900">Nueva Firma</h4>
                    <p className="text-sm text-gray-600 mt-1">Crear y asignar firmas</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('cuadrillas')}
                    className="p-4 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="text-2xl mb-2">🏢</div>
                    <h4 className="font-medium text-gray-900">Ver Cuadrillas</h4>
                    <p className="text-sm text-gray-600 mt-1">Gestionar equipos de trabajo</p>
                  </button>
                </div>
              </div>

              {/* Recent Activity or Summary */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📋 Resumen del Sistema
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between p-3 bg-white rounded border">
                    <span className="text-gray-700">Total de Trabajadores:</span>
                    <span className="font-semibold text-gray-900">{workers.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded border">
                    <span className="text-gray-700">Trabajadores Activos:</span>
                    <span className="font-semibold text-green-600">{activeWorkers.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded border">
                    <span className="text-gray-700">Trabajadores sin Firma:</span>
                    <span className="font-semibold text-yellow-600">
                      {activeWorkers.filter(w => !w.signatureId).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded border">
                    <span className="text-gray-700">Cuadrillas Activas:</span>
                    <span className="font-semibold text-blue-600">{activeCuadrillas.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'workers' || activeTab === 'cuadrillas') && (
            <DatabaseAdmin />
          )}

          {activeTab === 'camionetas' && (
            <VehicleManagement type="camioneta" />
          )}

          {activeTab === 'gruas' && (
            <VehicleManagement type="grua" />
          )}

          {activeTab === 'signatures' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Gestión de Firmas
                </h3>
                <p className="text-sm text-gray-600">
                  Crea y gestiona firmas digitales. Asigna firmas a trabajadores desde la pestaña de Trabajadores.
                </p>
              </div>
              <SignatureManager />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Configuración del Sistema
                </h3>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h4 className="font-medium text-yellow-900 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Contraseña de Administrador
                </h4>
                <p className="text-sm text-yellow-800 mb-4">
                  Contraseña actual: <code className="bg-yellow-100 px-2 py-1 rounded">admin123</code>
                </p>
                <p className="text-xs text-yellow-700">
                  💡 Para producción, debes cambiar esta contraseña en el archivo <code>UserLogin.tsx</code>
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-medium text-blue-900 mb-2">
                  💾 Almacenamiento de Datos
                </h4>
                <p className="text-sm text-blue-800 mb-4">
                  Todos los datos se almacenan localmente en el navegador usando localStorage.
                </p>
                <button
                  onClick={() => {
                    if (confirm('¿Estás seguro de que quieres reinicializar la base de datos? Esto eliminará todos los cambios y restaurará los datos predeterminados.')) {
                      useDatabaseStore.getState().clearAll();
                      useDatabaseStore.getState().initializeDefaultData();
                      alert('Base de datos reinicializada correctamente');
                      window.location.reload();
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Reinicializar Base de Datos
                </button>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">
                  📊 Información del Sistema
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Versión:</span>
                    <span className="font-medium">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Usuario:</span>
                    <span className="font-medium">{currentUser?.nombre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rol:</span>
                    <span className="font-medium text-purple-600">Administrador</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Último acceso:</span>
                    <span className="font-medium">
                      {currentUser?.lastLogin ? new Date(currentUser.lastLogin).toLocaleString('es-CO') : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
