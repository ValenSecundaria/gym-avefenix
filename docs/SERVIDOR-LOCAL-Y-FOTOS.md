# Servidor local en la notebook y fotos de los socios

## Decisión

El gimnasio opera en una única sede, con una notebook en el mostrador. El sistema corre **en esa notebook** (`http://localhost:3000`) y usa la base de **Neon** en la nube.

- **Fotos:** se guardan en el disco de la notebook, en `LOCAL_PHOTOS_PATH` (por defecto `C:\GymData\photos`). En la tabla `Member` solo se guarda el nombre del archivo (`photoFilename`, por ejemplo `member-38452120-1761500000000.webp`). No consume nada de los límites de Neon.
- **Tamaño:** cada foto queda en 400×400 WebP (~20–40 KB). 300 socios ≈ 8–10 MB.
- **Sin internet:** la foto se sirve directo del disco, sin consultar la base (la URL ya trae el nombre del archivo), y el navegador la guarda en caché. El molinete sigue mostrando fotos aunque se corte internet.
- **Backup:** el backup diario empaqueta la carpeta de fotos junto con el volcado de la base (ver `docs/BACKUPS.md`).

> **¿Por qué no Vercel para esto?** El disco de Vercel es temporal: lo que se guarda ahí se borra en cada deploy. Si el sistema corre en Vercel, el alta del socio funciona igual pero **sin foto** (se usa la imagen por defecto), para no dejar socios apuntando a archivos que ya no existen.

## Instalación (una sola vez, en la notebook)

1. Instalar [Node.js LTS](https://nodejs.org) y [Git](https://git-scm.com/download/win).
2. Clonar el proyecto, por ejemplo en `C:\GymData\app`, y copiar el `.env` con:
   ```env
   DATABASE_URL="postgresql://...neon..."
   LOCAL_PHOTOS_PATH="C:/GymData/photos"
   ```
   (más las demás variables que ya usa la app).
3. Probarlo a mano (la primera vez instala y compila, tarda unos minutos):
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts\local\start-server.ps1
   ```
   Abrir `http://localhost:3000/login`.
4. Dejarlo arrancando solo al prender la notebook:
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts\local\install-autostart.ps1
   ```
   Log en `C:\GymData\server.log`.
5. Permisos de Chrome (cámara, ventanas emergentes, segundo monitor) para que no pregunte nunca: doble clic en `scripts\local\chrome-permisos-localhost.reg` como administrador (ver `docs/PERMISOS-NAVEGADOR.md`).
6. Programar el backup diario (ver `docs/BACKUPS.md`).

## Actualizar el sistema

```powershell
git pull
powershell -ExecutionPolicy Bypass -File scripts\local\start-server.ps1 -Rebuild
```
(antes, cerrar el servidor que está corriendo: `Stop-ScheduledTask -TaskName 'AveFenix - Servidor local'`).

## Fotos que ya estaban cargadas

Las fotos subidas mientras el sistema corría en Vercel no se pueden recuperar (ese disco ya se borró). Esos socios muestran la imagen por defecto; se les puede sacar la foto de nuevo desde **Editar socio → Cambiar foto**.

## Fotos offline-first + Supabase Storage (bucket privado)

### Cómo funciona
1. **Primero en el dispositivo.** Al sacar o subir una foto (alta o "Cambiar foto"), se achica a 400×400 WebP (~30 KB) y se guarda en el navegador (IndexedDB `gym_photo_store`). Recién después se intenta subir. Si no hay internet, la foto se ve igual en el panel y en la pantalla de ingreso.
2. **Subida automática.** Al abrir el panel, al volver internet, al guardar una foto nueva y cada 30 s, las fotos pendientes se mandan al servidor (`uploadMemberPhoto`). Una sola subida a la vez aunque haya varias ventanas abiertas.
3. **Sin duplicados.** El nombre del archivo sale del DNI y del momento exacto en que se sacó la foto (`member-DNI-<ms>.webp`). Si una subida se repite (respuesta perdida, corte a mitad), se reescribe el mismo archivo y la base queda igual.
4. **Socio correcto.** La foto queda asociada por id del socio. Las fotos de altas hechas sin internet se asocian al socio real cuando el alta se sube. Una foto vieja que se sube tarde no reemplaza a una más nueva (columna `photoUpdatedAt`).
5. **Estados** de cada foto en el dispositivo: pendiente, sincronizando, sincronizada o error. La ficha del socio muestra el estado de su foto y el panel avisa cuántas faltan subir (botón "Subir ahora"). Si falla, la foto queda guardada y se reintenta cada vez más espaciado (hasta 30 min).
6. **Nunca se pierde una foto.** La copia del dispositivo se borra recién cuando el servidor confirmó que la guardó (y pasados 30 días, o si hay una foto sincronizada más nueva del mismo socio). Al reemplazar la foto de un socio, la anterior no se borra.
7. **Bucket privado.** Nadie lee el bucket directo: `/api/members/[dni]/photo` busca primero la copia en el disco de la notebook y si no está, la baja de Supabase con la clave del servidor (y en la notebook guarda una copia para verla sin internet).

### Configuración (una sola vez)
1. Crear un proyecto gratis en https://supabase.com (el plan Free alcanza: 1 GB; 300 socios ≈ 10 MB).
2. *Storage* → *New bucket* → nombre `member-photos` → **NO** marcar "Public bucket".
3. *Project Settings* → *API*: copiar la **Project URL** y la clave **service_role** (secreta: solo va en el servidor, nunca en el navegador ni en el repositorio).
4. Cargar las variables en Vercel (*Settings → Environment Variables*) y en el `.env` de la notebook:
   ```env
   SUPABASE_URL="https://xxxxxxxx.supabase.co"
   SUPABASE_SERVICE_ROLE_KEY="eyJ..."
   # Opcional, si el bucket tiene otro nombre:
   SUPABASE_PHOTOS_BUCKET="member-photos"
   ```
5. Agregar la columna nueva en la base (una sola vez, desde una PC con el `.env` de producción):
   ```powershell
   npx prisma db push
   ```
   Solo agrega `Member.photoUpdatedAt` (vacía): no toca datos existentes.
6. Volver a desplegar.

Sin Supabase configurado: con el servidor en la notebook las fotos se guardan en disco como siempre; en Vercel quedan guardadas en cada dispositivo (no se pierden) y se suben cuando se configure Supabase.
