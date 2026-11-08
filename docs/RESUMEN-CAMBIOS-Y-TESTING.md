# Guía Completa de Cambios y Plan de Testing (Sesión Actual)

Este documento detalla todas las funcionalidades, correcciones y ajustes implementados en el sistema durante esta sesión de trabajo, junto con sus casos de prueba paso a paso para verificar el correcto funcionamiento.

---

## 📋 Resumen de Puntos Realizados

1. **Recorte y Encuadre Interactivo de Fotos (Cámara / Carga de Archivo)**
2. **Sincronización de Fotos Biométricas con Supabase Storage (Nube & Local)**
3. **Corrección de Inconsistencia en Base de Datos (`photoUpdatedAt`)**
4. **Botón Temporal de Regularización de Cuota (+30 Días Sin Cobro)**
5. **Modificación de Plan al Editar Socio sin Impacto en Cobros Ni Caja**
6. **Documentación del Flujo y Arquitectura de WhatsApp**
7. **Botón y Tarjeta de Tutoriales del Sistema (YouTube) en Configuración (2 Columnas)**

---

## 1. Recorte y Encuadre Interactivo de Fotos

### ¿Qué se modificó?
- **Archivo:** `src/components/admin/WebcamCapture.tsx`
- **Problema previo:** Al subir una imagen o sacar foto, al centrar o mover la cabeza se producía un zoom excesivo e involuntario, impidiendo encuadrar libremente el cuadro y deformando el recorte.
- **Solución:**
  - Se rediseñó el lienzo de recorte manteniendo una relación de aspecto fija 1:1 (cuadrada).
  - Se habilitó arrastrar para centrar (drag & drop) sin saltos.
  - Se agregó control de zoom explícito (slider de zoom proporcional) y cálculo exacto de coordenadas entre el tamaño visual en pantalla y la resolución nativa de la imagen.
  - Se unificó el comportamiento tanto para cámara web como para imágenes subidas desde archivo.

### 🧪 Plan de Testing:
1. Ir a **Administración** o **Profesores** y abrir el modal de **Nuevo Socio** (o editar foto de un socio existente).
2. Hacer clic en **"Subir foto"** y seleccionar una foto vertical o panorámica desde tu PC.
3. Arrastrar la imagen para posicionar la cara en el centro del cuadro guía.
4. Ajustar el zoom con el deslizador o controles.
5. Hacer clic en **"Confirmar recorte"**.
6. **Verificación:** La vista previa debe mostrar exactamente el área seleccionada, sin hacer un zoom inesperado ni recortar de más.

---

## 2. Subida de Fotos a Supabase Storage y Respaldo Local

### ¿Qué se modificó?
- **Archivos:** `src/lib/photo-storage.ts`, `.env`, `src/lib/supabase.ts`.
- **Problema previo:** Las fotos quedaban como pendientes de subir ("2 fotos guardadas en esta PC pendientes de subir") arrojando error 404 / 400 `Bucket not found` y `EPERM mkdir C:\GymData`.
- **Solución:**
  - Se configuró la clave secreta `SUPABASE_SERVICE_ROLE_KEY` con permisos de escritura directa en Supabase Storage.
  - Se fijó la ruta local de fotos a `./public/photos` para evitar errores de permisos de disco en Windows.
  - Se verificó la existencia del bucket `member-photos`.

### 🧪 Plan de Testing:
1. Tomar o subir una foto a un socio y guardar.
2. Observar la consola y el panel superior.
3. **Verificación:** No debe aparecer el cartel rojo o amarillo de "fotos pendientes de subir".
4. Verificar en el panel de Supabase (`Storage > Buckets > member-photos`) que el archivo `.webp` aparezca subido.
5. Si no hay internet, verificar que la foto se guarde localmente en `public/photos/` y se visualice en el sistema sin romperse.

---

## 3. Corrección de Inconsistencia Prisma (`photoUpdatedAt`)

### ¿Qué se modificó?
- **Archivos:** `prisma/schema.prisma`, `src/actions/members.actions.ts`, `src/actions/member-photos.actions.ts`.
- **Problema previo:** La aplicación arrojaba error 500 al listar socios porque el esquema de Prisma consultaba la columna `photoUpdatedAt` que no existía en la base de datos física de producción.
- **Solución:** Se retiró el campo del modelo y de los selectores de Prisma, regenerando el cliente (`npx prisma generate`) para que las consultas a `Member` funcionen sin requerir migraciones destructivas.

### 🧪 Plan de Testing:
1. Abrir la pestaña **Socios** en el Panel de Administración.
2. **Verificación:** La tabla carga inmediatamente todos los socios sin errores 500 en consola ni pantallas en blanco.

---

## 4. Botón Temporal de Regularización de Cuota (+30 Días Sin Cobro)

### ¿Qué se modificó?
- **Archivos:**
  - `src/components/shared/temporary-sync-period-button.tsx`
  - `src/actions/transition-sync.actions.ts`
  - `src/components/admin/LiveFeedTable.tsx`
  - `src/components/profesor/TeacherLiveFeedTable.tsx`
  - `src/components/profesor/StaffClientsTable.tsx`
  - Documentación: `docs/BOTON-REGULARIZAR-CUOTA-TEMPORAL.md`
- **Objetivo:** Permitir tanto al Administrador como a los Profesores regularizar socios de transición cuyo cobro ya fue registrado previamente en mano o en otro mes, extendiendo su cuota 30 días a partir de hoy **sin registrar pagos en `Payment` ni alterar la caja**.

### 🧪 Plan de Testing:
1. Iniciar sesión como Profesor o Administrador.
2. En la tabla de **"Ingresos de Hoy"** (Live Feed) o en la lista de socios, ubicar a un socio con cuota vencida.
3. Presionar el botón **"⏱️ Regularizar (+30 Días)"**.
4. Confirmar la acción en el diálogo de seguridad.
5. **Verificación:**
   - La membresía del socio se extiende por 30 días desde hoy y pasa a estado **HABILITADO / ACTIVA**.
   - Ir a la pestaña **Caja / Finanzas**: verificar que el total recaudado del día **NO** aumentó y que **NO** se creó ningún recibo en el historial de cobros.

---

## 5. Cambio de Plan al Editar un Socio (Sin Cobro ni Caja)

### ¿Qué se modificó?
- **Archivos:**
  - `src/components/admin/MemberEditModal.tsx`
  - `src/actions/members.actions.ts`
  - `src/lib/validations/member.schema.ts`
- **Requerimiento:** Al editar un socio, poder cambiarle el plan (ej. de "Gimnasio Libre" a "CrossFit") sin que esto signifique un cobro en ese instante. El socio mantiene sus días restantes de membresía y el nuevo valor del plan solo se cobrará cuando renueve al vencerse.
- **Solución:**
  - Se agregó el campo `planId` al formulario de edición del socio en `MemberEditModal`.
  - Se incluyó `planId` opcional en el esquema Zod `editMemberSchema`.
  - La Server Action `updateMemberAction` actualiza el `planId` en la membresía activa del socio sin crear ningún registro de `Payment`.

### 🧪 Plan de Testing:
1. Abrir la lista de socios y hacer clic en **"Editar"** en un socio que tenga días a favor (por ejemplo, le quedan 5 días de "Musculación").
2. En el desplegable de **Plan**, cambiarlo a otro plan (ej. "CrossFit").
3. Hacer clic en **"Guardar Cambios"**.
4. **Verificación:**
   - La ficha del socio ahora muestra el nuevo plan.
   - La fecha de vencimiento (`validUntil`) **no** se modificó; sigue teniendo sus 5 días restantes.
   - Ir a **Caja**: el saldo en caja se mantiene intacto (cero cobro).
   - Simular una renovación cuando venza: el modal de renovación precargará el monto correspondiente al nuevo plan.

---

## 6. Documentación del Flujo de WhatsApp

### ¿Qué se realizó?
- **Archivo:** `docs/FLUJO-WHATSAPP.md`
- **Contenido:**
  - Explicación de la arquitectura actual basada en Deep Links / Esquemas de URL (asistida por operador, $0 costo, sin riesgo de baneo).
  - Reglas de normalización de números telefónicos (+54 9 para Argentina).
  - Modos de apertura: Automático (`wa.me`), WhatsApp Web (con reutilización de pestaña única) y WhatsApp Desktop (`whatsapp://`).
  - Modal previo de confirmación y edición de texto antes de disparar.
  - Alternativas futuras para automatización completa (Meta Cloud API, Baileys/Evolution API, sistema de logs).

---

## 7. Botón de Tutoriales del Sistema (YouTube) en Configuración (2 Columnas)

### ¿Qué se modificó?
- **Archivos:**
  - `src/components/admin/SystemTutorialsCard.tsx` (Nuevo componente modular)
  - `src/components/admin/AdminDashboardClient.tsx`
  - `src/components/admin/gym-phone-settings.tsx`
- **Requerimiento:** Agregar un acceso directo a la playlist de tutoriales del sistema (`https://www.youtube.com/playlist?list=PLTYOY-m8hANk`) al lado de WhatsApp Institucional en dos columnas para capacitar a los usuarios ante cualquier duda.
- **Solución:**
  - Se creó la tarjeta `SystemTutorialsCard` con botón directo, icono descriptivo y apertura en pestaña nueva segura (`target="_blank"`, `rel="noopener noreferrer"`).
  - Se organizó la sección superior de Configuración en una grilla de dos columnas (`grid-cols-1 lg:grid-cols-2 gap-8 items-start`).

### 🧪 Plan de Testing:
1. Ingresar al Panel de Administración con rol ADMIN.
2. Hacer clic en la pestaña **Configuración**.
3. **Verificación:**
   - En pantalla de PC/Laptop se aprecian dos columnas paralelas: a la izquierda **"WhatsApp Institucional del Gimnasio"** y a la derecha **"Tutoriales del Sistema"**.
   - En celulares o pantallas angostas, ambas tarjetas se apilan verticalmente de manera prolija.
   - Hacer clic en el botón rojo **"Ver Playlist en YouTube"**: debe abrir en una nueva pestaña del navegador la playlist con los tutoriales del sistema.
