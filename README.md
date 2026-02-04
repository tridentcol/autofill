# Sistema de Autorrellenado Inteligente de Formatos Excel

Sistema web inteligente para rellenar formularios Excel de manera rápida y eficiente, con detección automática de campos, gestión de firmas digitales y generación de archivos rellenados.

## 🚀 Características

- ✅ **Detección Inteligente de Campos**: Analiza automáticamente archivos Excel y detecta campos a rellenar
- ✅ **Wizard Paso a Paso**: Interfaz guiada para rellenar formularios de manera organizada
- ✅ **Gestión de Firmas**: Crear, guardar y reutilizar firmas digitales
- ✅ **Llenado Rápido**: Opciones para marcar múltiples checkboxes de una vez
- ✅ **Formatos Precargados**: 5 formatos predefinidos listos para usar
- ✅ **Carga de Formatos Personalizados**: Sube tus propios archivos Excel
- ✅ **Generación de Excel**: Descarga el archivo rellenado preservando el formato original
- ✅ **Almacenamiento en la Nube**: Guarda documentos automáticamente en Vercel Blob
- ✅ **Gestión de Documentos**: Navega, filtra y accede a archivos por fecha

## 📁 Formatos Incluidos

1. **Inspección Vehículo Camioneta** - Formulario de inspección de vehículos
2. **Permiso de Trabajo en Alturas** - Permiso de trabajo seguro en alturas
3. **Inspección Herramientas y Equipos** - Inspección de herramientas de trabajo
4. **Análisis de Trabajo Seguro (ATS)** - Análisis de trabajo seguro
5. **Inspección Camión Grúa/Manlift** - Inspección de camión grúa y plataforma

## 🛠️ Tecnologías Utilizadas

- **Next.js 16** - Framework de React para producción
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de estilos
- **ExcelJS** - Manipulación de archivos Excel
- **Zustand** - Gestión de estado
- **React Signature Canvas** - Firmas digitales
- **Vercel Blob** - Almacenamiento en la nube

## 📦 Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar en producción
npm start
```

## 🌐 Deployment en Vercel

Este proyecto está configurado para deployarse automáticamente en Vercel.

### Opción 1: Vercel CLI
```bash
npm i -g vercel
vercel
```

### Opción 2: GitHub Integration (Recomendado)
1. Ve a [vercel.com](https://vercel.com)
2. Conecta tu repositorio de GitHub
3. Vercel detectará automáticamente Next.js
4. Deploy automático en cada push

### Configuración

**Variables de Entorno (Opcionales):**

Para habilitar el almacenamiento en la nube:
- `BLOB_READ_WRITE_TOKEN` - Token de Vercel Blob (requerido para guardar documentos en la nube)

Ver [docs/CLOUD_STORAGE.md](docs/CLOUD_STORAGE.md) para más detalles.

**Build Settings:**
- ✅ Framework: Next.js (auto-detectado)
- ✅ Build Command: `npm run build`
- ✅ Output Directory: `.next`
- ✅ Root Directory: `/` (raíz del proyecto)

## 📂 Estructura del Proyecto

```
/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página de inicio
│   └── globals.css        # Estilos globales
├── components/            # Componentes React
│   ├── FormatSelector.tsx # Selector de formatos
│   ├── FormWizard.tsx     # Wizard paso a paso
│   ├── FieldRenderer.tsx  # Renderizador de campos
│   └── SignatureManager.tsx # Gestor de firmas
├── lib/                   # Lógica de negocio
│   ├── excelParser.ts    # Parser de Excel
│   └── excelGenerator.ts # Generador de Excel
├── store/                 # Estado global
│   └── useFormStore.ts   # Store de Zustand
├── types/                 # Tipos TypeScript
│   └── index.ts          # Definiciones
├── public/               # Archivos estáticos
│   └── formats/          # Formatos Excel precargados
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── vercel.json
```

## 🎯 Cómo Usar

1. **Seleccionar Formato**: Elige un formato predefinido o sube tu propio archivo Excel
2. **Gestionar Firmas** (opcional): Crea y guarda firmas para reutilizar
3. **Rellenar Paso a Paso**: Navega por el wizard completando cada sección
4. **Guardar Documento**: 
   - **Guardar en la nube**: El archivo queda disponible online sin descargas
   - **Descargar Excel**: Guarda el archivo en tu dispositivo
5. **Acceder a Documentos**: Ve a Documentos desde el menú para ver todos tus archivos guardados

## ✨ Características Destacadas

### Detección Inteligente
El parser analiza automáticamente:
- Campos de texto (nombre, cargo, lugar, etc.)
- Fechas y horas
- Checkboxes (SI/NO/N/A)
- Áreas de observaciones
- Campos de firma
- Tablas dinámicas

### Llenado Rápido
Para checklists:
- **Marcar todo SI**: Todos los items OK
- **Marcar todo NO**: Detectar fallas
- **Marcar todo N/A**: Items no aplicables

### Persistencia
- Firmas guardadas en localStorage
- Disponibles para futuros formularios
- No requiere base de datos

## 📄 Licencia

Proyecto privado y propietario.
