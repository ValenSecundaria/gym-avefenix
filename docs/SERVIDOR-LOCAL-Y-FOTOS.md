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
