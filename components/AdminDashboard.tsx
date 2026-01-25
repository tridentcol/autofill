'use client';

import { useState } from 'react';
import { useDatabaseStore } from '@/store/useDatabaseStore';
import { useFormStore } from '@/store/useFormStore';
import DatabaseAdmin from './DatabaseAdmin';
import SignatureManager from './SignatureManager';
import WorkerSignatureManager from './WorkerSignatureManager';
import VehicleManagement from './VehicleManagement';

type DashboardTab = 'overview' | 'workers' | 'cuadrillas' | 'camionetas' | 'gruas' | 'signatures' | 'settings';

export default function AdminDashboard() {
  const { workers, cuadrillas, camionetas, gruas, isAdmin, currentUser } = useDatabaseStore();
  const { signatures } = useFormStore();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8 max-w-md w-full text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Acceso Denegado</h3>
          <p className="text-sm text-gray-600">
            Se requieren privilegios de administrador para acceder al panel.
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
      name: 'Trabajadores',
      value: activeWorkers.length,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
    },
    {
      name: 'Cuadrillas',
      value: activeCuadrillas.length,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
        </svg>
      ),
    },
    {
      name: 'Camionetas',
      value: activeCamionetas.length,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
        </svg>
      ),
    },
    {
      name: 'Grúas',
      value: activeGruas.length,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
        </svg>
      ),
    },
  ];

  const tabs = [
    { id: 'overview' as const, name: 'General' },
    { id: 'workers' as const, name: 'Trabajadores' },
    { id: 'cuadrillas' as const, name: 'Cuadrillas' },
    { id: 'camionetas' as const, name: 'Camionetas' },
    { id: 'gruas' as const, name: 'Grúas' },
    { id: 'signatures' as const, name: 'Firmas' },
    { id: 'settings' as const, name: 'Configuración' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Panel de Administración</h1>
              <p className="mt-1 text-sm text-gray-600">
                Bienvenido, {currentUser?.nombre}
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span>Administrador</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <div key={stat.name} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-lg text-gray-600">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-600">{stat.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white border border-gray-200 rounded-lg">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto scrollbar-hide -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Quick Actions */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Acciones Rápidas</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => setActiveTab('workers')}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <h4 className="text-sm font-medium text-gray-900">Trabajadores</h4>
                      <p className="text-xs text-gray-600 mt-1">Gestionar personal</p>
                    </button>
                    <button
                      onClick={() => setActiveTab('camionetas')}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <h4 className="text-sm font-medium text-gray-900">Vehículos</h4>
                      <p className="text-xs text-gray-600 mt-1">Gestionar flota</p>
                    </button>
                    <button
                      onClick={() => setActiveTab('signatures')}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <h4 className="text-sm font-medium text-gray-900">Firmas</h4>
                      <p className="text-xs text-gray-600 mt-1">Gestionar firmas</p>
                    </button>
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Resumen</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Trabajadores</span>
                        <span className="font-medium text-gray-900">{workers.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trabajadores Activos</span>
                        <span className="font-medium text-gray-900">{activeWorkers.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sin Firma Asignada</span>
                        <span className="font-medium text-gray-900">
                          {activeWorkers.filter(w => !w.signatureId).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Firmas Guardadas</span>
                        <span className="font-medium text-gray-900">{signatures.length}</span>
                      </div>
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
              <div className="space-y-8">
                <div>
                  <div className="mb-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-1">Firmas de Trabajadores</h3>
                    <p className="text-sm text-gray-600">
                      Gestiona firmas permanentes para trabajadores. Estas firmas se guardan en el repositorio y están disponibles para todos los usuarios.
                    </p>
                  </div>
                  <WorkerSignatureManager />
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <div className="mb-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-1">Firmas Temporales</h3>
                    <p className="text-sm text-gray-600">
                      Firmas locales para uso temporal en formularios. Estas firmas solo están disponibles en este dispositivo.
                    </p>
                  </div>
                  <SignatureManager />
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Configuración del Sistema</h3>
                </div>

                {/* Admin Password */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Contraseña de Administrador</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Contraseña actual: <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">admin123</code>
                  </p>
                  <p className="text-xs text-gray-500">
                    Para cambiarla, modifica el valor en el archivo <code className="bg-gray-100 px-1 py-0.5 rounded">UserLogin.tsx</code>
                  </p>
                </div>

                {/* Database */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Base de Datos</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Los datos predeterminados se cargan desde archivos JSON en el repositorio.
                    Los cambios se guardan localmente en IndexedDB.
                  </p>
                  <button
                    onClick={async () => {
                      if (confirm('¿Seguro? Esto eliminará todos los cambios y restaurará datos predeterminados desde el repositorio.')) {
                        const { db } = await import('@/lib/db');
                        await db.resetToDefaults();
                        alert('Base de datos reinicializada');
                        window.location.reload();
                      }
                    }}
                    className="px-4 py-2 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
                  >
                    Restaurar Datos Predeterminados
                  </button>
                </div>

                {/* System Info */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Información del Sistema</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Versión</span>
                      <span className="font-medium text-gray-900">1.0.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Usuario</span>
                      <span className="font-medium text-gray-900">{currentUser?.nombre}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rol</span>
                      <span className="font-medium text-gray-900">Administrador</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Último acceso</span>
                      <span className="font-medium text-gray-900">
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
    </div>
  );
}
