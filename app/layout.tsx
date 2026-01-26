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
    <html lang="es" className="light" style={{ colorScheme: 'light' }}>
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
