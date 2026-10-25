# Backups y restauración — Gimnasio Ave Fénix

Objetivo: si algo se rompe o se borra, volver a tener el sistema andando **en minutos** y sin perder socios.

## Qué hay que respaldar

| Dato | Dónde vive | Cómo se respalda |
|---|---|---|
| Base de datos (socios, membresías, pagos, ingresos, usuarios) | Neon (PostgreSQL en la nube) | Historial de Neon + `pg_dump` diario propio |
| Fotos de los socios | Disco, en `LOCAL_PHOTOS_PATH` (por defecto `C:\GymData\photos`) | Zip diario junto con el dump |

## Capa 1 — Lo que Neon ya trae (gratis, cero configuración)

Neon guarda un historial de cambios y permite **volver la base a cualquier momento** dentro de esa ventana (*Instant restore*, panel de Neon → Backup & Restore).

| Plan Neon | Ventana para volver atrás | Snapshots manuales | Backups programados |
|---|---|---|---|
| Free | **6 horas** | 1 | No |
| Launch | hasta 7 días | 100 | Sí |
| Scale | hasta 30 días | 100 | Sí |

Fuente: https://neon.com/docs/introduction/plans (consultado el 19/10/2026).

En plan Free, 6 horas no alcanza (un error se descubre al otro día), por eso existe la capa 2.

## Capa 2 — Backup propio diario (`scripts/backup`)

- `backup-db.ps1` → genera `C:\GymData\backups\db-AAAAMMDD-HHmm.dump` + `fotos-AAAAMMDD-HHmm.zip`, y borra los de más de 30 días.
- `restore-db.ps1` → restaura un dump (y opcionalmente las fotos). Pide escribir `RESTAURAR` antes de tocar nada.
- `schedule-backup.ps1` → lo deja programado todos los días en Windows.

### Instalación (una sola vez, en la PC del gimnasio)

1. Instalar las herramientas de PostgreSQL (alcanza con *Command Line Tools*): https://www.postgresql.org/download/windows/ — versión 17 o más nueva.
2. Tener el `.env` del proyecto con `DATABASE_URL` (el mismo que usa la app).
3. Programar el backup diario:
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts\backup\schedule-backup.ps1 -At 03:00
   ```
   Si la PC está apagada a esa hora, corre apenas se prende. Log en `C:\GymData\backups\backup.log`.
4. Probarlo una vez a mano:
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts\backup\backup-db.ps1
   ```

**Copia fuera de la PC:** si la PC se rompe, se pierden también los backups. Lo más simple es que la carpeta de backups quede dentro de OneDrive/Google Drive:
```powershell
powershell -ExecutionPolicy Bypass -File scripts\backup\backup-db.ps1 -BackupDir "$env:USERPROFILE\OneDrive\AveFenix-Backups"
```
(para la tarea programada, editar el argumento en `schedule-backup.ps1`).

> Los backups contienen datos personales de socios (DNI, teléfono, fotos). No compartirlos ni subirlos a carpetas públicas.

## Qué hacer según el problema

**A. Se borró o modificó algo por error hace menos de 6 horas (plan Free)**
Neon → proyecto → *Backup & Restore* → elegir fecha/hora anterior al error → restaurar. Listo; la app sigue apuntando a la misma base.

**B. El error es más viejo que la ventana de Neon**
1. En Neon crear una base o branch **nueva y vacía** y copiar su connection string.
2. Restaurar el último backup bueno:
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts\backup\restore-db.ps1 -DumpFile C:\GymData\backups\db-AAAAMMDD-HHmm.dump -TargetUrl "postgresql://...nueva..."
   ```
3. Revisar que estén los datos y recién ahí cambiar `DATABASE_URL` de la app a la base nueva.

(Para pisar la base actual en lugar de crear una nueva: agregar `-Clean`. Borra lo que haya en el destino.)

**C. Se perdieron las fotos**
```powershell
powershell -ExecutionPolicy Bypass -File scripts\backup\restore-db.ps1 -DumpFile <dump> -TargetUrl <url> -PhotosZip C:\GymData\backups\fotos-AAAAMMDD-HHmm.zip
```

**D. Neon caído / sin servicio**
Restaurar el último dump en un PostgreSQL local (el mismo instalador del paso 1 trae el servidor), apuntar `DATABASE_URL` a `postgresql://postgres@localhost:5432/gym` y correr la app localmente.

## Verificado

Probado el 19/10/2026 contra una base de prueba local: backup → restauración en base nueva → mismos conteos (20 socios / 20 membresías / 20 pagos / 3 planes / 1 usuario), fotos restauradas, restauración con `-Clean` sin duplicar, y cancelación si no se escribe `RESTAURAR`. **No se probó todavía contra la base real de Neon.**
