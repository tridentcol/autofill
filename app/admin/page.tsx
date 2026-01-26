'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboard from '@/components/AdminDashboard';
import { useDatabaseStore } from '@/store/useDatabaseStore';

export default function AdminPage() {
  const router = useRouter();
  const { currentUser, isAdmin } = useDatabaseStore();

  useEffect(() => {
    // Redirect non-admin users to home
    if (currentUser && !isAdmin()) {
      router.push('/');
    }
  }, [currentUser, isAdmin, router]);

  // Show nothing while checking auth or if not admin
  if (!currentUser || !isAdmin()) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Acceso restringido. Inicia sesión como administrador.</p>
          <a href="/" className="mt-4 inline-block text-blue-600 hover:underline">
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <a
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al inicio
        </a>
      </div>
      <AdminDashboard />
    </div>
  );
}
