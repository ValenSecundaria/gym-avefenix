# 🦅 Gimnasio Ave Fénix — Sistema Integral de Gestión

Plataforma web integral desarrollada a medida para el **Gimnasio Ave Fénix**, orientada a digitalizar y optimizar la administración, el control de acceso de socios, el seguimiento de membresías y la presencia digital del gimnasio.

---

## 🏋️‍♂️ Acerca del Gimnasio Ave Fénix

**Ave Fénix** es un centro de entrenamiento integral enfocado en fuerza, musculación, acondicionamiento metabólico y rendimiento deportivo, ubicado en **Ingeniero White** (Buenos Aires, Argentina).

* **Filosofía**: *"Forjá tu mejor versión. Renacé más fuerte."* Un espacio pensado tanto para atletas avanzados como para quienes inician su camino en el entrenamiento de fuerza y salud.
* **Disciplinas y Espacios**:
  * **Sala de Musculación y Fuerza**: Área de peso libre, mancuernas, racks olímpicos y equipamiento biomecánico guiado.
  * **Entrenamiento Funcional y Circuitos**: Circuitos metabólicos orientados a potencia, agilidad, resistencia cardiovascular y core.
  * **Sector Cardio & HIIT**: Equipamiento aeróbico para desarrollo de resistencia pulmonar y gasto calórico.
  * **Acompañamiento Profesional**: Profesores certificados en sala con seguimiento continuo y rutinas personalizadas.

---

## 💻 Acerca de la Plataforma

El sistema es una solución centralizada y progresiva (PWA) que conecta la experiencia pública de los socios con las operaciones diarias del staff y la recepción del gimnasio.

### Módulos Principales

1. **🌐 Portal Público / Landing Page**
   * Información institucional de la marca y filosofía del gimnasio.
   * Catálogo de disciplinas, planes vigentes y modalidades de entrenamiento.
   * Horarios de atención y canales de contacto directo (WhatsApp, redes sociales y ubicación).

2. **⏱️ Terminal de Check-in y Control de Acceso**
   * Sistema de ingreso rápido en recepción mediante DNI.
   * Validación automática en tiempo real del estado de membresía:
     * **Habilitado**: socio activo con cuota al día.
     * **Cuota Vencida**: alerta visual para regularización de pago.
     * **Límite Alcanzado**: control de asistencias para planes con días semanales definidos.
   * Registro histórico de asistencias con trazabilidad horaria.

3. **👥 Gestión de Socios y Membresías**
   * Padrón digitalizado de socios con datos de contacto, notas y foto de perfil.
   * Asignación y renovación flexible de planes (mensuales libres, días semanales, pases diarios).
   * Cálculo automático de vigencias y fechas de vencimiento.

4. **💳 Registro de Cobros y Pagos**
   * Registro de transacciones operativas por múltiples medios de pago (efectivo, transferencia).
   * Vinculación de pagos a membresías activas y trazabilidad de quién registró cada cobro.

5. **🛡️ Control de Roles y Accesos (RBAC)**
   * **Administrador**: Acceso total al sistema, configuración de planes, métricas globales, ingresos y administración de usuarios.
   * **Profesor / Staff de Sala**: Acceso operativo para consulta de socios, validación de estado y altas en sala sin exposición de reportes financieros globales.

6. **📱 Experiencia Progresiva (PWA)**
   * Soporte como Progressive Web App instalable en dispositivos móviles o terminales táctiles de recepción.
   * Interfaz optimizada en modo oscuro de alto contraste y respuesta ágil.

---

## 🛠️ Stack Tecnológico

* **Frontend & Framework**: [Next.js](https://nextjs.org/) (App Router, Server & Client Components) con [React](https://react.dev/).
* **Lenguaje**: [TypeScript](https://www.typescriptlang.org/) para un desarrollo con tipado estricto.
* **Estilos & UI**: [Tailwind CSS](https://tailwindcss.com/) e iconografía con [Lucide React](https://lucide.dev/).
* **Gráficos & Métricas**: [Recharts](https://recharts.org/).
* **Base de Datos & ORM**: PostgreSQL gestionado mediante [Prisma ORM](https://www.prisma.io/).
* **Seguridad & Autenticación**: Encriptación con Bcrypt, manejo seguro de sesiones mediante cookies HTTP-only y esquemas de validación con Zod.

---

## 🚀 Puesta en Marcha en Entorno de Desarrollo

### Requisitos Previos

* **Node.js** (versión 20 o superior recomendada)
* Gestor de paquetes (**npm**, **pnpm** o **yarn**)
* Instancia local o remota de base de datos **PostgreSQL**

### Instalación

1. **Clonar el repositorio e ingresar al directorio**:
   ```bash
   git clone <url-del-repositorio>
   cd gym-avefenix
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar las variables de entorno**:
   Crear un archivo `.env` en la raíz del proyecto tomando como referencia las variables requeridas (utilizar valores propios para el entorno local):
   ```env
   # Cadena de conexión a base de datos PostgreSQL local
   DATABASE_URL="postgresql://usuario:password@localhost:5432/avefenix_dev?schema=public"

   # Clave secreta para firma de sesiones / cookies
   AUTH_SECRET="tu-secreto-seguro-para-desarrollo"
   ```

4. **Inicializar la base de datos**:
   ```bash
   npx prisma db push
   # o bien: npx prisma migrate dev
   ```

5. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

   La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

---

## 🔒 Privacidad y Seguridad

* Este repositorio y su documentación no contienen contraseñas por defecto, datos personales de socios ni cadenas de conexión a entornos productivos.
* Las configuraciones sensibles y llaves de acceso deben gestionarse exclusivamente a través de variables de entorno no versionadas (`.env`).
