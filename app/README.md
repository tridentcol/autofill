# Sistema de Autorrellenado Inteligente de Formatos Excel

Sistema web inteligente para rellenar formularios Excel de manera rápida y eficiente, con detección automática de campos, gestión de firmas digitales y generación de archivos rellenados.

## Características

- ✅ **Detección Inteligente de Campos**: Analiza automáticamente archivos Excel y detecta campos a rellenar
- ✅ **Wizard Paso a Paso**: Interfaz guiada para rellenar formularios de manera organizada
- ✅ **Gestión de Firmas**: Crear, guardar y reutilizar firmas digitales
- ✅ **Llenado Rápido**: Opciones para marcar múltiples checkboxes de una vez
- ✅ **Formatos Precargados**: 5 formatos predefinidos listos para usar
- ✅ **Carga de Formatos Personalizados**: Sube tus propios archivos Excel
- ✅ **Generación de Excel**: Descarga el archivo rellenado preservando el formato original

## Formatos Incluidos

1. **Inspección Vehículo Camioneta** - Formulario de inspección de vehículos
2. **Permiso de Trabajo en Alturas** - Permiso de trabajo seguro en alturas
3. **Inspección Herramientas y Equipos** - Inspección de herramientas de trabajo
4. **Análisis de Trabajo Seguro (ATS)** - Análisis de trabajo seguro
5. **Inspección Camión Grúa/Manlift** - Inspección de camión grúa y plataforma

## Tecnologías Utilizadas

- **Next.js 16** - Framework de React para producción
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de estilos
- **ExcelJS** - Manipulación de archivos Excel
- **Zustand** - Gestión de estado
- **React Hook Form** - Manejo de formularios
- **React Signature Canvas** - Firmas digitales

## Instalación

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

## Estructura del Proyecto

```
app/
├── app/                    # Páginas de Next.js
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
│   └── index.ts          # Definiciones de tipos
└── public/               # Archivos estáticos
    └── formats/          # Formatos Excel precargados
```

## Uso

1. **Seleccionar Formato**: Elige un formato predefinido o sube tu propio archivo Excel
2. **Rellenar Campos**: Sigue el wizard paso a paso para completar todos los campos
3. **Agregar Firmas**: Gestiona firmas digitales desde el botón "Gestionar Firmas"
4. **Generar Excel**: Al finalizar, descarga el archivo Excel rellenado

## Características Avanzadas

### Detección Inteligente

El sistema detecta automáticamente:
- Campos de texto (nombre, cargo, lugar, etc.)
- Fechas y horas
- Checkboxes (SI/NO/N/A)
- Áreas de observaciones
- Campos de firma
- Tablas dinámicas

### Llenado Rápido

Para formularios tipo checklist:
- **Marcar todo SI**: Marca todos los checkboxes como SI
- **Marcar todo NO**: Marca todos los checkboxes como NO
- **Marcar todo N/A**: Marca todos los checkboxes como N/A

### Persistencia de Datos

- Las firmas se guardan en localStorage para reutilización
- El progreso del formulario se mantiene durante la sesión

## Deployment en Vercel

Este proyecto está optimizado para deployment en Vercel:

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

O conecta tu repositorio de GitHub a Vercel para deployment automático.

## Configuración de Vercel

Variables de entorno no requeridas. El proyecto funciona sin configuración adicional.

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto es privado y propietario.

## Autor

Desarrollado para automatizar el proceso de rellenado de formatos de inspección y trabajo seguro.

## Soporte

Para soporte o preguntas, contacta al equipo de desarrollo.
