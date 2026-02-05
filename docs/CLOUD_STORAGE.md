# Almacenamiento en la Nube con Vercel Blob

Esta funcionalidad permite guardar los documentos Excel diligenciados automáticamente en la nube, sin necesidad de descargarlos manualmente. Los archivos se organizan por fecha y son accesibles desde cualquier lugar.

## 🚀 Características

- **Subida automática**: Los documentos se guardan directamente en Vercel Blob al finalizar el formulario
- **Organización por fecha**: Los archivos se organizan en carpetas por año/mes/día
- **Fácil acceso**: Interfaz web para navegar, filtrar y descargar documentos
- **Dos opciones**: Puedes "Guardar en la nube" o "Descargar Excel" (o ambas)
- **Sin descargas obligatorias**: El archivo queda disponible en la nube sin pasar por tu dispositivo

## 📋 Configuración

### 1. Crear Blob Store en Vercel

1. Ve a tu [Dashboard de Vercel](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a la pestaña **Storage**
4. Clic en **Create Database** → **Blob**
5. Elige un nombre para tu store (ej: `autofill-documents`)
6. Selecciona la región más cercana a tus usuarios
7. Clic en **Create**

### 2. Obtener el Token

1. En la página de tu Blob Store, ve a la pestaña **.env.local**
2. Copia el valor de `BLOB_READ_WRITE_TOKEN`
3. Agrégalo como variable de entorno en tu proyecto:

**Local (desarrollo):**
Crea un archivo `.env.local` en la raíz del proyecto:

```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxx
```

**Producción (Vercel):**
El token se configura automáticamente al crear el Blob Store, pero si necesitas agregarlo manualmente:

1. Ve a **Settings** → **Environment Variables**
2. Agrega `BLOB_READ_WRITE_TOKEN` con el valor del token
3. Selecciona los entornos donde aplicará (Production, Preview, Development)
4. Clic en **Save**

### 3. Instalar Dependencias

```bash
npm install @vercel/blob
```

## 🎯 Uso

### Para el Usuario Final

1. **Diligenciar formulario**: Completa todos los pasos del formulario como siempre
2. **Guardar en la nube**: En el último paso, verás dos botones:
   - **Guardar en la nube**: Sube el archivo a Vercel Blob (recomendado)
   - **Descargar Excel**: Descarga el archivo a tu dispositivo (opcional)
3. **Acceder a documentos**: 
   - Clic en el menú de usuario (arriba derecha)
   - Selecciona **Documentos**
   - Filtra por año, mes y día
   - Abre o descarga cualquier documento

### Para Administradores

Los administradores pueden acceder a todos los documentos desde:
- Menú de usuario → **Documentos**
- Filtrar por fecha para encontrar documentos específicos
- Ver, abrir o descargar cualquier archivo

## 📁 Estructura de Archivos

Los documentos se organizan automáticamente en esta estructura:

```
documentos/
├── 2025/
│   ├── 01/
│   │   ├── 15/
│   │   │   ├── inspeccion-vehiculo-1736956800000.xlsx
│   │   │   └── permiso-trabajo-1736957400000.xlsx
│   │   └── 20/
│   │       └── analisis-trabajo-seguro-1737388800000.xlsx
│   └── 02/
│       └── 03/
│           └── inspeccion-herramientas-1738540800000.xlsx
```

**Convenciones:**
- Año (YYYY) / Mes (MM) / Día (DD) / nombre-formato-timestamp.xlsx
- El timestamp asegura que no haya colisiones de nombres
- Los nombres se limpian automáticamente (minúsculas, sin espacios ni caracteres especiales)

## 🔒 Seguridad

- **Acceso público**: Los archivos tienen URLs públicas pero son "imprevisibles" (incluyen timestamp)
- **Token seguro**: El `BLOB_READ_WRITE_TOKEN` permite leer y escribir, guárdalo como secreto
- **Sin indexación**: Vercel Blob no indexa los archivos por defecto en buscadores

## 💰 Límites y Costos

### Plan Hobby (Gratis)
- **Almacenamiento**: 1 GB incluido
- **Operaciones avanzadas**: 2,000/mes (subidas, listados)
- **Operaciones simples**: 10,000/mes (descargas, primeras vistas)
- **Transferencia de datos**: 10 GB/mes

### Estimaciones
- **Excel promedio**: ~500 KB - 2 MB
- **Capacidad aproximada**: 500-2,000 documentos en 1 GB
- **Vistas/descargas**: ~10,000 accesos únicos por mes

Si excedes los límites del plan Hobby, Vercel Blob dejará de funcionar hasta el próximo ciclo (no hay cobros sorpresa).

### Optimizaciones
Para maximizar el tier gratuito:
- Considera almacenar metadatos en base de datos (opcional)
- Cachea los listados en el frontend
- Usa la página de Documentos para navegar (en lugar de hacer `list()` frecuentemente)

## 🔧 API Endpoints

### POST `/api/documents/upload`
Sube un documento a Vercel Blob.

**Body (FormData):**
```javascript
{
  file: File,           // Archivo Excel
  formatName: string,   // Nombre del formato
  formatId: string      // ID del formato
}
```

**Respuesta:**
```json
{
  "success": true,
  "blob": {
    "url": "https://xxx.public.blob.vercel-storage.com/...",
    "downloadUrl": "https://xxx.public.blob.vercel-storage.com/...",
    "pathname": "documentos/2025/01/15/inspeccion-vehiculo-1736956800000.xlsx",
    "size": 524288
  },
  "metadata": {
    "formatName": "Inspección Vehículo",
    "formatId": "inspeccion-vehiculo",
    "uploadedAt": "2025-01-15T14:30:00.000Z",
    "year": "2025",
    "month": "01",
    "day": "15"
  }
}
```

### GET `/api/documents/list`
Lista documentos filtrados por fecha.

**Query params:**
- `year` (opcional): Año (YYYY)
- `month` (opcional): Mes (MM)
- `day` (opcional): Día (DD)
- `limit` (opcional): Número máximo de resultados (default: 100)
- `cursor` (opcional): Para paginación

**Respuesta:**
```json
{
  "success": true,
  "documents": [
    {
      "url": "https://...",
      "downloadUrl": "https://...",
      "pathname": "documentos/2025/01/15/inspeccion-vehiculo-1736956800000.xlsx",
      "size": 524288,
      "uploadedAt": "2025-01-15T14:30:00.000Z",
      "metadata": {
        "formatName": "Inspección Vehículo",
        "year": "2025",
        "month": "01",
        "day": "15",
        "filename": "inspeccion-vehiculo-1736956800000.xlsx"
      }
    }
  ],
  "hasMore": false,
  "cursor": null,
  "filters": {
    "year": "2025",
    "month": "01",
    "day": null
  }
}
```

## 🐛 Troubleshooting

### "Vercel Blob not configured"
- Verifica que `BLOB_READ_WRITE_TOKEN` esté en tus variables de entorno
- En desarrollo: archivo `.env.local`
- En producción: Variables de entorno en Vercel Dashboard

### "Failed to upload file"
- Revisa que el token sea válido
- Verifica que no hayas excedido los límites del plan
- Revisa los logs en Vercel Dashboard

### Los documentos no aparecen en la lista
- Espera unos segundos y refresca la página
- Verifica los filtros de fecha
- Revisa que el upload haya sido exitoso (mensaje verde)

## 📚 Recursos

- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [Vercel Blob Pricing](https://vercel.com/docs/storage/vercel-blob/usage-and-pricing)
- [Vercel Blob SDK](https://vercel.com/docs/storage/vercel-blob/using-blob-sdk)

## 🎨 Próximas Mejoras

Posibles mejoras futuras:
- [ ] Exportar a PDF además de Excel
- [ ] Búsqueda por nombre de formato
- [ ] Filtros adicionales (por usuario, por tipo)
- [ ] Descarga masiva (múltiples documentos)
- [ ] Previsualización en el navegador
- [ ] Notificaciones al guardar documentos
