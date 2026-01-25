# Directorio de Firmas

Este directorio almacena las firmas digitales de trabajadores y supervisores.

## Formato

- **Tipo de archivo**: PNG con fondo transparente
- **Naming convention**: `{workerId}.png` o `signature_{timestamp}.png`
- **Dimensiones**: Variable (manteniendo aspect ratio del canvas)

## Gestión

- Las firmas son creadas por el administrador en el dashboard
- Se guardan automáticamente en el repositorio vía auto-commit
- Todos los usuarios tienen acceso a las firmas a través del repositorio
- Las firmas se vinculan a trabajadores mediante el campo `signatureId` en workers.json

## Estructura de Datos

En `workers.json`, cada trabajador tiene un campo `signatureId`:

```json
{
  "id": "worker_1",
  "nombre": "Carlos Guzmán",
  "signatureId": "worker_1",  // <- Vincula a /signatures/worker_1.png
  ...
}
```

Si `signatureId` es `null`, el trabajador no tiene firma asignada.
