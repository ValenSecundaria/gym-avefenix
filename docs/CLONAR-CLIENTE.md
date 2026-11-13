# Guía Rápida de Despliegue para Nuevos Clientes (White-Label)

Esta plantilla permite desplegar una nueva instancia totalmente personalizada para cualquier gimnasio en menos de 10 minutos sin tocar la lógica de negocio ni la arquitectura dual-screen.

---

### Paso 1: Duplicar el Repositorio / Crear Nueva Rama

Crea una rama o clona el repositorio en el entorno del nuevo cliente:
```bash
git checkout -b cliente-[nombre-gimnasio]
```

---

### Paso 2: Reemplazar Activos Visuales en `/public/brand`

Coloca los archivos de marca del nuevo cliente en:
- `public/brand/logo.png` (Logo principal en Navbar, Login y Footer)
- `public/brand/hero-cover.png` (Portada principal / OpenGraph de la landing)
- `public/brand/gallery/` (Fotos del sector de musculación, staff y equipamiento)
- `public/icons/` (Íconos PWA 192x192 y 512x512 si se desean personalizar)

---

### Paso 3: Configurar Identidad en `src/config/brand.config.ts`

Edita los campos de `GYM_BRAND_CONFIG`:
1. **Identidad**: Nombre, nombre corto, títulos del Hero y bajadas.
2. **Contacto**: Número de WhatsApp institucional (formato internacional, ej: `54911...`), dirección, link a Google Maps y redes sociales.
3. **Horarios**: Días y rangos de atención del gimnasio.
4. **Colores (Opcional)**: Cambia `theme.primary` y `theme.warning` si el gimnasio tiene una paleta distinta (los tokens se reflejan automáticamente en CSS).

---

### Paso 4: Configurar Variables de Entorno en `.env`

Copia `.env.example` o configura tu archivo `.env`:
```env
# Conexión a la base de datos PostgreSQL (Neon u otro proveedor)
DATABASE_URL="postgresql://usuario:password@ep-xyz.neon.tech/gym_db?sslmode=require"

# Secreto de sesión y JWT
AUTH_SECRET="clave-secreta-aleatoria-de-64-caracteres"

# Almacenamiento local de fotos en la máquina de recepción
LOCAL_PHOTOS_PATH="C:/gym-data/photos"

# Credenciales del Administrador Inicial para el Seed
SEED_ADMIN_USER="admin"
SEED_ADMIN_PASS="GimnasioSeguro2026!"
SEED_ADMIN_NAME="Administración General"
SEED_GYM_PHONE="5491122334455"
```

---

### Paso 5: Inicializar Base de Datos y Semilla

Ejecuta las migraciones y el script de inicialización limpia:
```bash
# 1. Crear las tablas en Neon / PostgreSQL
npx prisma db push

# 2. Inicializar usuario administrador y planes base
node prisma/seed-client.mjs
```

---

### Paso 6: Compilación y Puesta en Marcha

```bash
# Modo desarrollo
npm run dev

# Modo producción
npm run build
npm run start
```
Listo. El sistema queda 100% operativo con la identidad del nuevo cliente y el motor de doble pantalla intacto.
