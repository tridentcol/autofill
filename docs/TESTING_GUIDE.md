# Guía de Pruebas - Sistema de Auto-Commit y Firmas

Esta guía te ayudará a probar todo el sistema de auto-commit y gestión de firmas.

## Servidor de Desarrollo

El servidor ya está corriendo en:
- **Local:** http://localhost:3000
- **Network:** http://21.0.0.70:3000

## 1. Probar Auto-Commit de Datos

### Paso 1: Acceder como Administrador

1. Abre http://localhost:3000
2. Haz clic en "Acceder como Administrador"
3. Contraseña: `admin123`

### Paso 2: Agregar un Trabajador

1. Ve a la pestaña **"Trabajadores"**
2. Haz clic en **"Agregar Trabajador"**
3. Completa el formulario:
   - Nombre: `Juan Prueba`
   - Cargo: `Técnico`
   - Cédula: `123456789`
   - Cuadrilla: (opcional)
4. Haz clic en **"Guardar"**

### Paso 3: Verificar Auto-Commit

1. **En la consola del navegador** (F12 → Console), deberías ver:
   ```
   ✅ Workers synced to local files
   ✅ Changes committed and pushed to repository: {commit-sha}
   ```

2. **En el archivo workers.json**:
   - Abre `/home/user/autofill/public/data/workers.json`
   - Deberías ver el nuevo trabajador agregado

3. **En GitHub**:
   - Ve al repositorio en GitHub
   - Branch: `claude/intelligent-form-autofill-MV3cI`
   - Deberías ver un nuevo commit con mensaje:
     ```
     chore: Update workers data - {timestamp}
     ```

### Paso 4: Probar Modificación

1. Edita el trabajador que acabas de crear
2. Cambia el cargo a `Conductor`
3. Guarda los cambios
4. Verifica nuevamente la consola y GitHub

### Paso 5: Probar Eliminación (Soft Delete)

1. Elimina un trabajador
2. Verifica que se marca como `isActive: false` en workers.json
3. Verifica el nuevo commit en GitHub

## 2. Probar Sistema de Firmas

### Paso 1: Acceder a Gestión de Firmas

1. En el panel de administración
2. Ve a la pestaña **"Firmas"**
3. Verás dos secciones:
   - **Firmas de Trabajadores** (permanentes, en el repositorio)
   - **Firmas Temporales** (locales, solo este dispositivo)

### Paso 2: Crear Firma para un Trabajador

**Opción A: Dibujar Firma**

1. En **"Firmas de Trabajadores"**
2. Selecciona un trabajador del dropdown
3. Haz clic en **"Dibujar Firma"**
4. Dibuja una firma en el canvas
5. Haz clic en **"Guardar Firma"**

**Opción B: Subir Imagen**

1. Selecciona un trabajador
2. Haz clic en **"Subir Imagen"**
3. Elige una imagen PNG (idealmente con fondo transparente)
4. La firma se subirá automáticamente

### Paso 3: Verificar Firma Guardada

1. **En la consola del navegador**, deberías ver:
   ```
   ✅ Signature uploaded: /signatures/{workerId}.png
   ✅ Signature committed to repository
   ```

2. **En el archivo del trabajador**:
   - Abre `public/data/workers.json`
   - Busca el trabajador
   - Verifica que tiene `signatureId: "{workerId}"`

3. **En la carpeta de firmas**:
   - Abre `public/signatures/`
   - Deberías ver `{workerId}.png`

4. **En GitHub**:
   - Verifica el nuevo commit con mensaje:
     ```
     chore: Add signature for {worker-name} - {timestamp}
     ```

### Paso 4: Verificar Firma en la Galería

1. Desplázate a la sección **"Firmas Asignadas"**
2. Deberías ver una tarjeta con:
   - Nombre del trabajador
   - Cargo
   - Vista previa de la firma
   - Botón para remover

### Paso 5: Probar Remoción de Firma

1. Haz clic en el ícono de eliminar (🗑️)
2. Confirma la acción
3. La firma se desvincula del trabajador (el archivo permanece en el repositorio)
4. Verifica el commit en GitHub

## 3. Probar Otros Tipos de Datos

### Camionetas

1. Ve a la pestaña **"Camionetas"**
2. Agrega una nueva camioneta
3. Verifica auto-commit en `public/data/camionetas.json`

### Grúas

1. Ve a la pestaña **"Grúas"**
2. Agrega una nueva grúa
3. Verifica auto-commit en `public/data/gruas.json`

### Cuadrillas

1. Ve a la pestaña **"Trabajadores"** (tiene una sub-tab de Cuadrillas)
2. Crea una nueva cuadrilla
3. Asigna trabajadores
4. Verifica auto-commit en `public/data/cuadrillas.json`

## 4. Verificar Comportamiento Multi-Usuario

### Simulación de Otro Usuario

1. Abre el navegador en **modo incógnito** o usa otro navegador
2. Ve a http://localhost:3000
3. **NO inicies sesión como admin**, solo navega como usuario normal
4. Los datos que modificaste como admin deberían estar disponibles
5. Las firmas de trabajadores deberían ser visibles

### Nota Importante

En producción (cuando se despliegue), los usuarios necesitarán **recargar la página** para ver los cambios más recientes del repositorio. Considera implementar:
- Polling automático cada X minutos
- WebSockets para actualizaciones en tiempo real
- Botón "Sincronizar" manual

## 5. Solución de Problemas

### "GITHUB_TOKEN not configured"

- Verifica que `.env.local` existe y tiene el token correcto
- Reinicia el servidor de desarrollo

### Las firmas no se muestran

1. Verifica que el archivo existe en `public/signatures/{workerId}.png`
2. Abre la URL directamente: `http://localhost:3000/signatures/{workerId}.png`
3. Revisa la consola del navegador para errores

### Los commits no aparecen en GitHub

1. Verifica que el token tenga permisos de **Contents: Read and write**
2. Revisa la consola del navegador para errores
3. Verifica que el branch en `.env.local` es correcto

### Los cambios no persisten

- Los cambios se guardan en IndexedDB localmente
- El auto-commit guarda en el repositorio
- Si eliminas IndexedDB, los datos se recargarán del repositorio

## 6. Comandos Útiles

```bash
# Ver logs del servidor
tail -f /tmp/claude/-home-user-autofill/tasks/b568877.output

# Ver commits recientes
git log --oneline -10

# Ver cambios en workers.json
git diff HEAD~1 public/data/workers.json

# Ver archivos de firmas
ls -la public/signatures/

# Reiniciar servidor (si es necesario)
# Detener: Ctrl+C en la terminal del servidor
# Iniciar: npm run dev
```

## 7. Checklist de Pruebas

- [ ] Agregar trabajador → Ver commit en GitHub
- [ ] Modificar trabajador → Ver commit en GitHub
- [ ] Eliminar trabajador → Ver commit en GitHub
- [ ] Dibujar firma para trabajador → Ver commit en GitHub
- [ ] Subir imagen de firma → Ver commit en GitHub
- [ ] Remover firma de trabajador → Ver commit en GitHub
- [ ] Agregar camioneta → Ver commit en GitHub
- [ ] Agregar grúa → Ver commit en GitHub
- [ ] Crear cuadrilla → Ver commit en GitHub
- [ ] Verificar datos como usuario no-admin

## 8. Próximos Pasos

Después de verificar que todo funciona correctamente:

1. **Deployment a producción** (Vercel/Netlify)
   - Configura las variables de entorno en Vercel
   - El auto-commit funcionará automáticamente

2. **Rediseño de UI** (Tema pendiente)
   - Estilo Apple, limpio y moderno
   - Responsive design
   - Mejoras visuales generales

3. **Mejoras futuras**
   - Auto-refresh de datos
   - Notificaciones de cambios
   - Historial de commits
   - Resolución de conflictos
