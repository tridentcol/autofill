# Datos Predeterminados

Este directorio contiene los datos predeterminados que se cargan automáticamente en la aplicación.

## Archivos

- **workers.json**: Lista de trabajadores
- **cuadrillas.json**: Lista de cuadrillas/equipos
- **camionetas.json**: Lista de vehículos camionetas
- **gruas.json**: Lista de grúas y manlifts

## Cómo Editar los Datos

### 1. Agregar un Trabajador

Edita `workers.json` y agrega un nuevo objeto:

```json
{
  "id": "worker_12",
  "nombre": "Nombre Completo",
  "cargo": "Conductor",
  "cedula": "1234567890",
  "cuadrillaId": "cuad_1",
  "signatureId": null,
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 2. Agregar una Cuadrilla

Edita `cuadrillas.json`:

```json
{
  "id": "cuad_5",
  "nombre": "CUAD70",
  "descripcion": "Cuadrilla 70",
  "workerIds": ["worker_1", "worker_2"],
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 3. Agregar una Camioneta

Edita `camionetas.json`:

```json
{
  "id": "cam_3",
  "marca": "Ford",
  "linea": "Ranger",
  "placa": "NEW123",
  "modelo": "2023",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 4. Agregar una Grúa

Edita `gruas.json`:

```json
{
  "id": "grua_3",
  "placa": "GRU999",
  "marca": "Volvo",
  "modelo": "2022",
  "linea": "FH16",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Notas Importantes

- Los IDs deben ser únicos
- Usa el formato ISO para las fechas
- `isActive: true` significa que el registro está activo
- Los cambios en estos archivos se aplicarán la próxima vez que se reinicialice la base de datos
- Los usuarios pueden hacer cambios locales que se guardan en IndexedDB
- Desde el panel de administración se puede restaurar a estos valores predeterminados

## Restaurar Datos Predeterminados

1. Inicia sesión como administrador
2. Ve a "Base de Datos" → "Configuración"
3. Click en "Restaurar Datos Predeterminados"
4. Los datos de estos archivos JSON se cargarán nuevamente
