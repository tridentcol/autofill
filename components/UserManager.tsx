'use client';

import { useState } from 'react';
import { useDatabaseStore } from '@/store/useDatabaseStore';
import type { UserRole } from '@/types';

export default function UserManager() {
  const { currentUser, setCurrentUser } = useDatabaseStore();
  const [showModal, setShowModal] = useState(!currentUser);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    role: 'user' as UserRole,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    const newUser = {
      id: `user_${Date.now()}`,
      nombre: formData.nombre,
      email: formData.email,
      role: formData.role,
      createdAt: new Date(),
      lastLogin: new Date(),
    };

    setCurrentUser(newUser);
    setShowModal(false);
  };

  const handleLogout = () => {
    if (confirm('¿Está seguro de que desea cerrar sesión?')) {
      setCurrentUser(null as any);
      setShowModal(true);
      setFormData({ nombre: '', email: '', role: 'user' });
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
            {currentUser.role === 'admin' ? 'Administrador' : 'Usuario'}
            {currentUser.email && ` • ${currentUser.email}`}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Cerrar Sesión
        </button>
      </div>
    );
  }

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Identificación de Usuario
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Por favor ingrese sus datos para continuar
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Ej: Juan Pérez"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email (opcional)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Usuario *
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as UserRole })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="user">Usuario Regular</option>
                <option value="admin">Administrador</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {formData.role === 'admin'
                  ? 'Puede editar la base de datos de trabajadores'
                  : 'Solo puede ver y seleccionar trabajadores para formularios'}
              </p>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium"
            >
              Continuar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
