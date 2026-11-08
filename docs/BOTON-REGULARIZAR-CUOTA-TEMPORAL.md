# Documentación: Botón Temporal de Regularización de Período (+30 Días Sin Cobro)

> **Marca de Trazabilidad:** `TODO [TEMPORARY-TRANSITION]`  
> **Propósito:** Regularizar la fecha de cuota de socios que tenían desfasajes del mes inicial o abonaron previamente, permitiendo extender su vigencia por 30 días sin asentar cobro en caja ni duplicar ingresos en `Payment`.  
> **Vigencia Recomendada:** Primer mes de operación del gimnasio (período de transición). Pasado este plazo, debe removerse o desactivarse.

---

## 1. ¿Cómo Funciona el Botón?

### Comportamiento Operativo
1. **Ubicación en la Interfaz:**
   - **Panel de Profesores (`/profesor`):**
     - En la nueva pestaña **"Ingresos de Hoy"** (`TeacherLiveFeedTable`), al lado de cada socio que entra con cuota vencida o al día.
     - En la pestaña **"Clientes"** (`StaffClientsTable`), al lado del botón *"Registrar pago"*.
   - **Panel de Administración (`/admin`):**
     - En la tabla de **"Ingresos de Hoy"** (`LiveFeedTable`), tanto en versión escritorio como móvil.
2. **Acción al Presionarlo:**
   - Se abre un modal de confirmación táctil:
     > *"¿Confirmar extensión de 30 días a [Nombre Socio] sin cobro en caja?"*
3. **Efectos al Confirmar:**
   - **Fecha nueva:** `Math.max(validUntil, hoy) + 30 días`. Si ya estaba vencida, arranca desde hoy + 30 días. Si aún vencía dentro de 3 días, suma 30 días a ese vencimiento.
   - **Estado:** La membresía pasa a `ACTIVA` y el socio queda `isActive = true`.
   - **Caja intacta:** **Cero impacto en caja**. No se crea ningún registro en la tabla `Payment`.
   - **Apertura inmediata del molinete:** Emite eventos en tiempo real (`BroadcastChannel('gym_channel')`) y actualiza la base local IndexedDB (`saveMembersToCache`). Si el socio está frente al molinete o monitor público, pasa inmediatamente a estado **HABILITADO**.

---

## 2. Mapa Completo de Archivos Creados y Modificados

| Tipo | Archivo | Líneas | Rol / Función |
| :--- | :--- | :--- | :--- |
| **Backend (Action)** | [`src/actions/transition-sync.actions.ts`](file:///c:/Users/gemet/OneDrive/Documentos/Programación/avefenix-gym/gym-avefenix/src/actions/transition-sync.actions.ts) | 95 | Server Action `syncInitialMemberPeriodAction`. Extiende 30 días la membresía sin crear pago. Apto para `ADMIN`, `PROFESOR` y `RECEPCION`. |
| **UI (Componente)** | [`src/components/shared/temporary-sync-period-button.tsx`](file:///c:/Users/gemet/OneDrive/Documentos/Programación/avefenix-gym/gym-avefenix/src/components/shared/temporary-sync-period-button.tsx) | 90 | Componente React reutilizable con modal de confirmación y eventos de broadcast a pantalla pública e IndexedDB. |
| **UI (Profesor)** | [`src/components/profesor/TeacherLiveFeedTable.tsx`](file:///c:/Users/gemet/OneDrive/Documentos/Programación/avefenix-gym/gym-avefenix/src/components/profesor/TeacherLiveFeedTable.tsx) | 101 | Tabla de ingresos de la jornada para el profesor, con fotos, estados y el botón de regularización rápida. |
| **UI Hook (Profesor)** | [`src/components/profesor/use-teacher-live-feed.ts`](file:///c:/Users/gemet/OneDrive/Documentos/Programación/avefenix-gym/gym-avefenix/src/components/profesor/use-teacher-live-feed.ts) | 50 | Hook que escucha ingresos en vivo (locales y remotos) y los deduplica. |
| **Helper** | [`src/lib/local-checkins.ts`](file:///c:/Users/gemet/OneDrive/Documentos/Programación/avefenix-gym/gym-avefenix/src/lib/local-checkins.ts) | 26 | Helper desacoplado para consultar la cola de ingresos pendientes en IndexedDB sin duplicar código. |
| **Modificado** | [`src/components/profesor/ProfessorDashboardClient.tsx`](file:///c:/Users/gemet/OneDrive/Documentos/Programación/avefenix-gym/gym-avefenix/src/components/profesor/ProfessorDashboardClient.tsx) | 150 | Integra la pestaña *"Ingresos de Hoy"* (`TeacherLiveFeedTable`) junto a *"Clientes"* y *"Métricas"*. |
| **Modificado** | [`src/components/profesor/StaffClientsTable.tsx`](file:///c:/Users/gemet/OneDrive/Documentos/Programación/avefenix-gym/gym-avefenix/src/components/profesor/StaffClientsTable.tsx) | 115 | Integra el botón de regularización en el listado de clientes del profesor. |
| **Modificado** | [`src/components/admin/LiveFeedTable.tsx`](file:///c:/Users/gemet/OneDrive/Documentos/Programación/avefenix-gym/gym-avefenix/src/components/admin/LiveFeedTable.tsx) | 168 | Integra el botón de regularización en la tabla de ingresos del panel de administración. |
| **Modificado** | [`src/actions/checkin.actions.ts`](file:///c:/Users/gemet/OneDrive/Documentos/Programación/avefenix-gym/gym-avefenix/src/actions/checkin.actions.ts) | 43 | Permite que las cuentas con rol `PROFESOR` consulten `getTodayCheckIns()` (antes solo `ADMIN`). |

---

## 3. ¿Cuándo y Por Qué Debes Desactivarlo?

- **Momento:** Cuando finalice el primer mes de uso real del sistema (o cuando todos los socios antiguos ya tengan su fecha de cuota regularizada y sincronizada con sus días reales de pago).
- **Razón:** El gimnasio debe operar normalmente cobrando las cuotas mediante el flujo oficial de caja (`registerPayment` o renovación rápida con cobro). Mantener este botón indefinidamente permitiría que un usuario extienda cuotas sin asentar ingresos de dinero.

---

## 4. Guía Paso a Paso para Desactivarlo o Eliminarlo

Cuando decidas retirarlo, puedes buscar en todo el proyecto la etiqueta:
```text
TODO [TEMPORARY-TRANSITION]
```

### Opción Rápida (Desactivarlo sin borrar archivos):
Si solo quieres ocultar el botón para que nadie lo pueda usar:
1. En [`src/components/shared/temporary-sync-period-button.tsx`](file:///c:/Users/gemet/OneDrive/Documentos/Programación/avefenix-gym/gym-avefenix/src/components/shared/temporary-sync-period-button.tsx), agrega un `return null;` en la primera línea de la función. El botón desaparecerá instantáneamente de todas las tablas:
   ```tsx
   export function TemporarySyncPeriodButton(...) {
     return null; // <-- Desactivado
     ...
   ```
2. En [`src/actions/transition-sync.actions.ts`](file:///c:/Users/gemet/OneDrive/Documentos/Programación/avefenix-gym/gym-avefenix/src/actions/transition-sync.actions.ts), puedes devolver un error para que la acción quede bloqueada:
   ```tsx
   return { success: false, error: "El período de regularización inicial ha finalizado." };
   ```

### Opción Limpia (Eliminación definitiva del código temporal):
1. **Quitar las llamadas al botón en las tablas:**
   - En [`src/components/admin/LiveFeedTable.tsx`](file:///c:/Users/gemet/OneDrive/Documentos/Programación/avefenix-gym/gym-avefenix/src/components/admin/LiveFeedTable.tsx): borrar el `<TemporarySyncPeriodButton ... />` y su `import`.
   - En [`src/components/profesor/StaffClientsTable.tsx`](file:///c:/Users/gemet/OneDrive/Documentos/Programación/avefenix-gym/gym-avefenix/src/components/profesor/StaffClientsTable.tsx): borrar el `<TemporarySyncPeriodButton ... />` y su `import`.
   - En [`src/components/profesor/TeacherLiveFeedTable.tsx`](file:///c:/Users/gemet/OneDrive/Documentos/Programación/avefenix-gym/gym-avefenix/src/components/profesor/TeacherLiveFeedTable.tsx): quitar el botón de la fila de check-in (o conservar la tabla de ingresos para los profesores sin el botón).
2. **Borrar los archivos temporales:**
   - Eliminar `src/components/shared/temporary-sync-period-button.tsx`.
   - Eliminar `src/actions/transition-sync.actions.ts`.
3. **Verificar que no queden errores:**
   ```bash
   npx tsc --noEmit
   ```
