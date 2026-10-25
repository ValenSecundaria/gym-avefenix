# Carteles de permisos del navegador — que pregunten una sola vez

El sistema usa 3 permisos del navegador:

| Cartel | Para qué | Cuándo aparece |
|---|---|---|
| "Gestionar ventanas en todas tus pantallas" | Abrir el Check-In en el segundo monitor (HDMI) | Al iniciar sesión, **solo si hay 2 monitores** |
| "Ventana emergente bloqueada" | Abrir la ventana del Check-In | Al iniciar sesión |
| "Usar tu cámara" | Sacar la foto del socio en el alta | Al abrir el alta |

**Chrome recuerda cada "Permitir" para siempre, pero por dirección web.** Si la dirección cambia, pregunta de nuevo.

## Causa principal: se está entrando por una dirección que cambia

Una dirección como `gym-avefenix-3r6jds5n5-valens-projects-6c195848.vercel.app` es la de **un deploy puntual de Vercel**: cada deploy genera otra distinta. Para el navegador es un sitio nuevo cada vez, y por eso vuelve a pedir todo.

**Solución:** usar siempre la dirección fija del proyecto (Vercel → proyecto → *Settings → Domains*, por ejemplo `gym-avefenix.vercel.app` o un dominio propio).
- Favoritos, accesos directos y la app instalada (PWA) tienen que apuntar a esa dirección. Si la PWA se instaló desde una dirección de deploy, desinstalarla y volver a instalarla desde la fija.

## La primera vez, en la PC del gimnasio

Con la dirección fija, aceptar una sola vez:
1. **Gestionar ventanas** → *Permitir*.
2. **Ventanas emergentes** → ícono de la barra de direcciones → *Permitir siempre ventanas emergentes y redireccionamientos de este sitio*.
3. **Cámara** → *Permitir al visitar el sitio* (no "Permitir esta vez").

Si alguno se rechazó por error: candado a la izquierda de la dirección → *Configuración del sitio* → cambiarlo a *Permitir*.

## Opcional: que no pregunte nunca (políticas de Chrome)

En la PC del gimnasio se puede dejar todo permitido de antemano con políticas de Chrome. Requiere ser administrador de Windows y **lo aplica una persona a mano** (cambia la configuración del sistema).

1. Copiar esto en un archivo `avefenix-chrome.reg` y reemplazar `https://TU-DOMINIO` por la dirección fija:
   ```reg
   Windows Registry Editor Version 5.00

   [HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Google\Chrome\WindowManagementAllowedForUrls]
   "1"="https://TU-DOMINIO"

   [HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Google\Chrome\PopupsAllowedForUrls]
   "1"="https://TU-DOMINIO"

   [HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Google\Chrome\VideoCaptureAllowedUrls]
   "1"="https://TU-DOMINIO"
   ```
2. Doble clic en el archivo → aceptar.
3. Reiniciar Chrome y verificar en `chrome://policy` que aparezcan las 3.

Para Microsoft Edge es igual, cambiando `Google\Chrome` por `Microsoft\Edge`.
Referencia: [WindowManagementAllowedForUrls (Microsoft Learn)](https://learn.microsoft.com/en-us/deployedge/microsoft-edge-browser-policies/windowmanagementallowedforurls).

## Cambio en el sistema

Si la PC tiene **un solo monitor**, el sistema ya no pide "Gestionar ventanas" (no hace falta). Tampoco lo vuelve a pedir si alguna vez se rechazó.
