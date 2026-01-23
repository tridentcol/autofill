import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';

export const metadata: Metadata = {
  title: 'Autorrellenado Inteligente de Formatos',
  description: 'Sistema inteligente para rellenar formularios Excel de manera rápida y eficiente',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Autorrellenado Inteligente
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Sistema de gestión de formatos Excel
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-500">
                    v1.0.0
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Client Layout with User Manager and Database Init */}
          <ClientLayout>
            {/* Main Content */}
            <main className="flex-1">
              {children}
            </main>
          </ClientLayout>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <p className="text-center text-sm text-gray-500">
                © 2026 Autorrellenado Inteligente. Todos los derechos reservados.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
