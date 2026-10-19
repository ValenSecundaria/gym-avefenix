# Propuesta: socios extranjeros (pendiente, no implementado)

## Situación actual

- **Extranjero residente con DNI argentino** (DNI de extranjero, 8 dígitos, suele empezar en 9x.xxx.xxx): **ya funciona**, se carga como cualquier DNI.
- **Turista / extranjero sin DNI, solo con pasaporte: no se puede cargar.**
  - Los pasaportes suelen tener letras (ej. `AAB123456`); el alta y el teclado del molinete aceptan solo números.
  - El alta (`NewMemberModal.tsx`) y el teclado (`KeypadInput.tsx`) cortan en 8 dígitos, mientras que el servidor (`member.schema.ts`, `checkin.schema.ts`) acepta 6 a 10: las validaciones no están alineadas.

## Propuesta: "código de socio" para quien no tiene DNI

1. En el alta, casilla **"Extranjero sin DNI"**. Al marcarla se cargan pasaporte y nacionalidad (solo como dato).
2. El sistema genera un **código numérico de 9 dígitos que empieza con 1** y lo guarda en el campo `dni`.
   Nunca choca con un DNI real (los DNI tienen como máximo 8 dígitos).
3. El código se muestra en recepción (para anotarlo o sacarle foto) y el socio lo usa en el teclado del molinete como si fuera su DNI.
   Check-in, cuotas y métricas funcionan sin cambios.

### Cambios necesarios
- Casilla + campos de pasaporte/nacionalidad en el alta; generación del código único en el servidor.
- Teclado del molinete y alta: aceptar hasta 9 dígitos; alinear las validaciones del cliente y del servidor.
- Base de datos: 2 columnas nuevas en `Member` (`passportNumber`, `nationality`) → requiere migración en Neon.

### Alternativas descartadas
- **Teclado con letras para el pasaporte**: complica el molinete para todos por un caso poco frecuente.
- **Usar solo los números del pasaporte**: puede coincidir con el DNI de otra persona.
