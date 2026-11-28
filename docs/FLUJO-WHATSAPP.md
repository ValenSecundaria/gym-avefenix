# Arquitectura y Flujo de Trabajo de WhatsApp en Gym Ave Fénix

Este documento describe en detalle técnico y funcional cómo funciona actualmente el sistema de avisos por WhatsApp, los componentes involucrados, sus limitaciones y los caminos recomendados para automatizarlo a futuro.

---

## 1. Visión General de la Arquitectura Actual

Actualmente, el sistema **no utiliza una API de mensajería automatizada de backend** (como WhatsApp Cloud API o Twilio), sino una **solución asistida por el operador basada en Esquemas de URL (Deep Links / Protocol Handlers) en el navegador del cliente**.

```
┌─────────────────┐       ┌──────────────────────┐       ┌────────────────────────┐
│  Tabla/Sección  │ ───>  │  WhatsAppEditModal   │ ───>  │  whatsapp-dispatcher   │
│ (Ej: Deudores)  │       │ (Previsualiza y edita│       │                        │
└─────────────────┘       │      el texto)       │       └───────────┬────────────┘
                          └──────────────────────┘                   │
                                                                     ▼
                                                   ┌───────────────────────────────────┐
                                                   │ Modo configurado (localStorage):  │
                                                   ├───────────────────────────────────┤
                                                   │ 1. WEB:  web.whatsapp.com/send... │
                                                   │ 2. APP:  whatsapp://send...       │
                                                   │ 3. AUTO: wa.me/...                │
                                                   └───────────────────────────────────┘
```

### ¿Qué significa esto en la práctica?
1. El sistema prepara el mensaje con los datos del socio (nombre, plan, fecha de vencimiento).
2. Se le muestra una ventana emergente (`WhatsAppEditModal`) al usuario del gimnasio para que confirme o modifique el mensaje.
3. Al dar clic en "Abrir WhatsApp", el navegador ejecuta un enlace directo que abre WhatsApp Web o la App de Windows con el chat del socio abierto y el texto ya cargado en el cuadro de escritura.
4. **El usuario del gimnasio presiona Enter / Enviar en WhatsApp.**

---

## 2. Puntos de Entrada y Disparadores en la Aplicación

El envío de WhatsApp está implementado en tres áreas principales del sistema:

### A. Tabla de Deudores (`src/components/admin/DebtorsTable.tsx`)
- **Ubicación:** Panel de Administración > Pestaña Finanzas / Deudores.
- **Caso de uso:** Avisar a un socio que su cuota está vencida.
- **Mensaje por defecto:**
  ```text
  ¡Hola [Nombre]! Te escribimos de Gimnasio Ave Fénix para recordarte que tu cuota del plan [NombrePlan] venció el [Fecha]. ¡Te esperamos en recepción para renovarla!
  ```

### B. Edición de Socios (`src/components/admin/MemberEditModal.tsx`)
- **Ubicación:** Clic en "Editar" en cualquier socio dentro de Administración o Staff.
- **Caso de uso:** Contacto directo y rápido con el socio desde su ficha técnica.
- **Mensaje por defecto:**
  - Si tiene cuota vencida: recordatorio de pago con nombre del plan y fecha.
  - Si está al día o sin plan: saludo institucional genérico de recepción.

### C. Listado de Socios (`src/components/admin/MembersSection.tsx`)
- **Ubicación:** Tabla general de socios en el panel de Administración.
- **Caso de uso:** Botón de acción rápida con icono de WhatsApp junto al teléfono del socio.

---

## 3. Componentes y Lógica de Código

### 3.1 Despachador (`src/lib/whatsapp-dispatcher.ts`)
Módulo sin dependencias que concentra toda la lógica de enlaces:

- **`normalizeWhatsAppPhone(phone)`**: lleva el teléfono cargado a mano al formato internacional argentino
  `549 + código de área + número` (solo dígitos). Quita espacios, guiones, paréntesis, `+54`, el `0` del
  código de área y el `15`. Devuelve `null` si quedan menos de 10 dígitos (sin código de área), sobran
  dígitos o hay letras u otros caracteres inválidos.
- **`buildWhatsAppUrl(phone, message, target)`**: URL codificada según el destino:
  - `'web'`: `https://web.whatsapp.com/send?phone={telefono}&text={mensaje}`
  - `'app'`: `whatsapp://send?phone={telefono}&text={mensaje}`
  - `'auto'`: `https://wa.me/{telefono}?text={mensaje}` (abre la app si está instalada; si no, deriva a WhatsApp Web)
- **`dispatchWhatsApp(phone, message, target)`**: abre el chat.
  - `web`: reutiliza siempre la misma pestaña (nombre fijo `avefenix_whatsapp_web`).
  - `app`: dispara el protocolo desde un iframe oculto. No se navega la ventana del panel porque eso
    dispararía `beforeunload`, que cierra la pantalla de ingreso del segundo monitor.

El sistema **nunca envía el mensaje**: termina cuando el chat queda abierto con el texto cargado.

### 3.2 Preferencia por computadora (`src/lib/whatsapp-preference.ts`)
- Se guarda en `localStorage` (clave `gym_whatsapp_mode_v1`), una por equipo.
- **Por defecto: `web`** (WhatsApp Web en el navegador de recepción, Chrome o Edge).

### 3.3 Mensajes prearmados (`src/lib/whatsapp-messages.ts`)
- Deudores: nombre, plan, valor de la cuota y fecha de vencimiento.
- Ausentes: nombre y días sin asistir.

### 3.4 Modal de Edición Previa (`src/components/admin/WhatsAppEditModal.tsx`)
- Muestra el destinatario y el número ya normalizado, con un `textarea` editable.
- Si el número es inválido bloquea "Continuar a WhatsApp" y muestra
  "Número telefónico incompleto o inválido para WhatsApp".
- Si ya se despachó un aviso a ese socio hoy, lo advierte (no bloquea).
- Al continuar abre WhatsApp, guarda la fecha en `Member.lastNotifiedAt`
  (acción `markWhatsAppNotified`) y el panel muestra "Aviso despachado a WhatsApp".
  Las tablas de Deudores y Ausentes marcan la fila con "Avisado hoy HH:MM".

### 3.5 Selector de Modo en Configuración (`src/components/admin/WhatsAppModeSettings.tsx`)
- **Ubicación:** Panel de Administración > Pestaña Configuración.
- Opciones: **WhatsApp Web** (por defecto), **App de Windows** y **Automático** (wa.me).

### 3.6 Doble pantalla
Mientras WhatsApp tiene el foco, el teclado numérico escribe en WhatsApp. Al volver a la ventana del
panel (con el modal ya cerrado) las teclas del numpad se reenvían otra vez a la pantalla de ingreso.

---

## 4. Limitaciones del Sistema Actual

| Característica | Estado Actual | Observaciones |
| :--- | :--- | :--- |
| **Intervención humana** | Requerida | El operador debe hacer clic en "Abrir" y luego "Enviar" en WhatsApp. |
| **Envío masivo automático** | No soportado | No hay un botón de "Enviar a todos los deudores a la vez". |
| **Disparadores desatendidos (Cron)** | No soportado | No se envían mensajes en la madrugada o a las 8 AM automáticamente si nadie está en la PC. |
| **Registro de entrega / lectura** | Parcial | Se guarda cuándo se abrió el chat (`lastNotifiedAt`), no si el mensaje se envió o se leyó. |
| **Costo** | $0 USD | Completamente gratuito; no requiere pagar números comerciales de Meta ni servicios de terceros. |
| **Riesgo de baneo** | Cero | Al enviarse desde la app nativa o web del operador humano, Meta no lo detecta como spam automatizado. |

---

## 5. Hoja de Ruta para Mejoras Futuras

Si a futuro se desea dar un salto cualitativo hacia la **automatización total de avisos**, existen tres alternativas de arquitectura:

### Opción 1: API Oficial (WhatsApp Cloud API de Meta / Twilio)
- **Cómo funcionaría:**
  Un servicio en segundo plano (Cron Job en Node.js/Next.js) se ejecuta diariamente (ej. 9:00 AM), consulta los socios con `Membership.validUntil < hoy` y envía un mensaje mediante llamada HTTP directa a la API de WhatsApp Graph.
- **Ventajas:** 100% legal, garantizado por Meta, permite botones interactivos de pago ("Renovar ahora"), webhooks de confirmación de entrega y lectura.
- **Desventajas:** Requiere registrar una Empresa en Meta Business Manager y los mensajes de plantilla salientes tienen costo por conversación (aprox. 0.04 a 0.07 USD por mensaje).

### Opción 2: Servidor Microservicio con Baileys / WPPConnect / Evolution API
- **Cómo funcionaría:**
  Se conecta una instancia de Node.js a un número del gimnasio escaneando un código QR una sola vez. Cuando el sistema detecta vencimientos o ingresos, hace un `POST http://localhost:8080/message/sendText` y el mensaje sale solo.
- **Ventajas:** Sin costos por mensaje de Meta, 100% automatizable sin intervención de los profesores.
- **Desventajas:** Requiere mantener un proceso Node.js corriendo permanentemente en un servidor o VPS; si se envían demasiados mensajes en poco tiempo a números desconocidos existe riesgo de bloqueo por spam de WhatsApp.

### Opción 3: Flujo Híbrido con Plantillas Predefinidas y Registro en Base de Datos (Evolución recomendada a corto plazo)
- Agregar un modelo en Prisma: `WhatsAppLog` (`id`, `memberId`, `phone`, `messageType`, `sentAt`, `sentByUserId`).
- Crear un selector de plantillas en `WhatsAppEditModal`:
  - *Recordatorio 3 días antes de vencer.*
  - *Aviso de vencimiento hoy.*
  - *Deudor con más de 7 días.*
  - *Bienvenida a nuevo socio.*
- Esto mantiene el costo en $0 y permite saber qué socios ya fueron notificados hoy para no volver a escribirles dos veces.
