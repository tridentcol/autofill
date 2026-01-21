/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración vacía de Turbopack para silenciar el warning
  turbopack: {},
  webpack: (config) => {
    // Para manejar archivos Excel en el cliente
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

module.exports = nextConfig;
