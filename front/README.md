# Front

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.0.1.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Autenticación y Roles

El flujo de login consume `POST /api/auth/login` y recibe un objeto:

```json
{
	"token": "<JWT>",
	"tipoToken": "Bearer",
	"roles": ["ROLE_ADMIN", "ROLE_USUARIO"]
}
```

Roles soportados:

| Rol Backend        | Descripción Front |
|--------------------|-------------------|
| ROLE_SUPERADMIN    | Acceso directo a `/superadmin/dashboard` |
| ROLE_ADMIN         | Redirige a `/select-role` para elegir vista Usuario o Administrador |
| ROLE_USUARIO       | Vista usuario `/usuario` (usa `UserLayout`) |
| ROLE_SEGURIDAD     | Panel seguridad `/seguridad` |

### Selector de rol (Admin)
Un admin con doble rol (ADMIN + USUARIO) es redirigido a `/select-role`. Al elegir:
- Usuario: se navega a `/usuario` y se marca internamente `adminActingAsUser=true` para prefijos de nombre.
- Administrador: se navega a `/admin`.

### Layout Usuario
`UserLayoutComponent` proporciona la barra de navegación reutilizable y envuelve el contenido de rutas hijas.

Prefijos de nombre mostrados en el navbar:

| Contexto | Formato |
|----------|---------|
| Alumno   | `Alum. Nombre Apellido` |
| Docente  | `Doc. Nombre Apellido` |
| Admin (vista usuario) | `Admin. Nombre Apellido` |
| Admin (vista admin) | `Admin. Nombre Apellido` |
| SuperAdmin | `Super Admin` |

### Guards
El guard genérico `roleGuard` valida autenticación y presencia de al menos uno de los roles requeridos en `data.roles`.

### Expiración del Token
El backend emite JWT con `exp` (10 horas). El `AuthService` decodifica el token y programa un cierre de sesión automático 5 segundos antes de su expiración real. Si al cargar la aplicación el token ya venció, se fuerza logout inmediatamente.

### Extensiones futuras
1. Consumir endpoint de perfil para obtener `nombreCompleto` y `tipoUsuario` reales.
2. Refrescar token y expiración JWT.
3. Añadir componente de reportes / zonas dentro de rutas hijas de usuario.
4. Sustituir placeholders por dashboards reales.
