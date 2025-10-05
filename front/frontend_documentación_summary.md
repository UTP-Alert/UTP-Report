# Documentación del Frontend - Resumen

Este documento resume la documentación añadida a los archivos clave del frontend de la aplicación, enfocándose en su propósito y funcionamiento principal.

## Archivos Documentados

### `src/app/app.ts`
Este archivo define el componente raíz de la aplicación Angular (`App`). Configura el selector, indica que es un componente autónomo (`standalone`), importa módulos esenciales como `RouterOutlet` para el enrutamiento y `CommonModule` para directivas comunes, y especifica las rutas a su plantilla HTML y estilos SCSS.

### `src/app/app.config.ts`
Este archivo contiene la configuración principal de la aplicación Angular. Define los proveedores de servicios globales, incluyendo:
- `provideBrowserGlobalErrorListeners()`: Para escuchar errores globales del navegador.
- `provideZoneChangeDetection()`: Configura la detección de cambios de zona para optimizar el rendimiento.
- `provideRouter(routes)`: Configura el enrutador de la aplicación con las rutas definidas en `app.routes.ts`.
- `provideHttpClient(withInterceptors([authInterceptor]))`: Configura el cliente HTTP y registra el `authInterceptor` para añadir tokens de autenticación a las peticiones.
- `provideAnimations()`: Habilita el módulo de animaciones, necesario para librerías como NgxToastr.
- `provideToastr()`: Configura el servicio de notificaciones NgxToastr con opciones como tiempo de espera y posición.

### `src/app/app.routes.ts`
Este archivo define todas las rutas de la aplicación. Incluye rutas protegidas por guards (`guestGuard` y `roleGuard`) para controlar el acceso basado en el estado de autenticación y los roles del usuario. Las rutas principales son:
- `/login`: Para el inicio de sesión, accesible solo para invitados.
- `/superadmin/dashboard`: Dashboard para SuperAdministradores.
- `/select-role`: Permite a los administradores seleccionar su rol (como admin o como usuario).
- `/usuario`: Layout y dashboard para usuarios regulares y administradores que actúan como usuarios.
- `/admin`: Dashboard para administradores.
- `/seguridad`: Dashboard para personal de seguridad.
También define rutas por defecto y comodín para redirecciones.

### `src/app/services/auth.service.ts`
Este servicio gestiona la autenticación de usuarios en la aplicación. Sus funcionalidades clave incluyen:
- **`login(username, password)`**: Envía credenciales al backend, almacena el token JWT y los roles en `localStorage`, y actualiza el estado de autenticación.
- **`logout()`**: Elimina los datos de autenticación de `localStorage` y redirige al usuario a la página de login.
- **`getToken()`**: Recupera el token de autenticación.
- **`loadFromStorage()`**: Carga el estado de autenticación y roles desde `localStorage` al iniciar la aplicación.
- **`hasRole(role)`**: Verifica si el usuario autenticado tiene un rol específico.
- **`setAdminActingAsUser(value)` / `isAdminAsUser()`**: Gestiona si un administrador está operando temporalmente como usuario.
- **`setAdminRoleSelected(value)` / `isAdminRoleSelected()`**: Indica si un administrador ya ha seleccionado un rol en el selector.
- **`buildDisplayName(nombreCompleto, tipoUsuario)`**: Formatea el nombre a mostrar en la interfaz según el rol y tipo de usuario.
- **`decodeToken(token)`**: Decodifica un token JWT para extraer su payload.
- **`scheduleTokenExpiration(token)`**: Programa el cierre de sesión automático cuando el token JWT expira.

### `src/app/interceptors/auth.interceptor.ts`
Este interceptor HTTP se encarga de añadir automáticamente el token JWT a las cabeceras de todas las peticiones salientes. Si un token (`auth_token`) existe en `localStorage`, se incluye en la cabecera `Authorization` con el prefijo `Bearer`. Esto asegura que las peticiones a la API estén autenticadas sin necesidad de añadir el token manualmente en cada solicitud.

### `src/app/guards/guest.guard.ts`
Este guard de ruta previene que usuarios ya autenticados accedan a rutas designadas para "invitados" (como la página de login). Si un usuario autenticado intenta acceder a una de estas rutas, el guard lo redirige automáticamente a su dashboard correspondiente según su rol (SuperAdmin, Admin, Usuario, Seguridad).

### `src/app/guards/role.guard.ts`
Este guard de ruta protege el acceso a ciertas rutas basándose en los roles del usuario. Se configura en la definición de la ruta (`data: { roles: ['ROLE_ESPERADO'] }`). Si un usuario no está autenticado, es redirigido al login. Si está autenticado pero no posee ninguno de los roles requeridos para la ruta, es redirigido a su dashboard por defecto.

### `src/app/constants/roles.ts`
Este archivo define un objeto `ROLES` que contiene las constantes de cadena para los diferentes roles de usuario en la aplicación (SuperAdmin, Admin, Usuario, Seguridad). También exporta un tipo `RoleKey` para las claves de estos roles y un array `ALL_ROLES` con todos los valores de los roles, facilitando su uso y mantenimiento en toda la aplicación.

### `src/app/Login/inicio-sesion/inicio-sesion.ts`
Este componente gestiona la interfaz y lógica para el inicio de sesión de usuarios. Utiliza formularios reactivos para la entrada de credenciales, interactúa con `AuthService` para la autenticación y `ToastrService` para mostrar notificaciones. Redirige al usuario a diferentes dashboards según su rol después de un inicio de sesión exitoso. También incluye una funcionalidad `onSOS` como placeholder para acciones de emergencia.

### `src/app/services/perfil.service.ts`
Este servicio se encarga de cargar y gestionar el perfil del usuario autenticado. Realiza una petición HTTP al backend para obtener los datos del perfil (`username`, `nombreCompleto`, `tipoUsuario`, `roles`) y los almacena en una señal reactiva. Solo intenta cargar el perfil si existe un token de autenticación.

### `src/app/Admin/select-rol/select-rol.ts`
Este componente permite a los usuarios con rol de administrador elegir si desean acceder a la aplicación como un usuario regular o como un administrador. Utiliza `AuthService` para establecer el estado de "actuar como usuario" y `Router` para la navegación. Muestra notificaciones `Toastr` para confirmar la selección del rol y la redirección. También ofrece una opción para cerrar sesión.

## Conclusión

La documentación de estos archivos proporciona una comprensión clara de la estructura fundamental del frontend, cómo se maneja la autenticación y autorización, y cómo se configuran las rutas y los servicios principales. Esto facilita el mantenimiento, la depuración y el desarrollo futuro de la aplicación.
