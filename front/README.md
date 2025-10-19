# UTP+Report - Sistema de Reportes de Seguridad

## 📋 Índice
- [Descripción General](#descripción-general)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Instalación y Configuración](#instalación-y-configuración)
- [Autenticación y Control de Acceso](#autenticación-y-control-de-acceso)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Componentes Principales](#componentes-principales)
- [Servicios](#servicios)
- [Guards y Seguridad](#guards-y-seguridad)
- [Configuración de Páginas por Rol](#configuración-de-páginas-por-rol)
- [Sistema de Reportes](#sistema-de-reportes)
- [Estado de Zonas](#estado-de-zonas)
- [Interfaz de Usuario](#interfaz-de-usuario)
- [Despliegue](#despliegue)
- [Endpoints del Backend](#endpoints-del-backend)
- [Consideraciones de Seguridad](#consideraciones-de-seguridad)
- [Futuras Mejoras](#futuras-mejoras)

## 🎯 Descripción General

UTP+Report es un sistema integral de reportes de seguridad desarrollado para la Universidad Tecnológica de Panamá. La aplicación permite a estudiantes, docentes y personal administrativo reportar incidentes de seguridad, monitorear el estado de las zonas del campus y gestionar usuarios y permisos de manera eficiente.

### Características Principales:
- **Reporte de Incidentes**: Sistema intuitivo para reportar incidentes con límite diario de 3 reportes por usuario
- **Monitoreo de Zonas**: Visualización en tiempo real del estado de seguridad de las zonas del campus
- **Gestión de Usuarios**: Administración completa de usuarios con diferentes roles y permisos
- **Autenticación JWT**: Sistema seguro de autenticación con tokens JWT y expiración automática
- **Interfaz Responsiva**: Diseño adaptable para dispositivos móviles y desktop
- **Sistema de Roles**: Cinco tipos de usuarios con diferentes niveles de acceso

## 🏗️ Arquitectura del Sistema

### Arquitectura Frontend
```
front/
├── src/
│   ├── app/
│   │   ├── Admin/           # Módulo de Administrador
│   │   ├── Usuario/         # Módulo de Usuario
│   │   ├── SuperAdmin/      # Módulo de Super Administrador
│   │   ├── Seguridad/       # Módulo de Seguridad
│   │   ├── Login/           # Módulo de Autenticación
│   │   ├── shared/          # Componentes compartidos
│   │   ├── services/        # Servicios de la aplicación
│   │   ├── guards/           # Guards de seguridad
│   │   ├── constants/       # Constantes y configuraciones
│   │   └── interceptors/     # Interceptores HTTP
│   ├── styles.scss          # Estilos globales
│   └── main.ts             # Punto de entrada
├── angular.json            # Configuración de Angular
└── package.json            # Dependencias del proyecto
```

### Flujo de Autenticación
1. Usuario ingresa credenciales en el login
2. Backend valida y retorna JWT con roles
3. Frontend almacena token y roles en localStorage
4. Guards verifican roles para acceso a rutas
5. Token expira automáticamente después de 10 horas
6. Sistema programa logout automático 5 segundos antes de expiración

## 🛠️ Tecnologías Utilizadas

### Framework Principal
- **Angular 20.0.0**: Framework de aplicaciones web modernas
- **TypeScript 5.8.2**: Lenguaje de programación con tipado estático
- **RxJS 7.8.0**: Programación reactiva y manejo de observables

### Dependencias Principales
- **@angular/animations**: Animaciones y transiciones
- **@angular/forms**: Manejo de formularios reactivos
- **@angular/router**: Sistema de rutas y navegación
- **ngx-toastr**: Notificaciones toast
- **driver.js**: Tours guiados de la aplicación

### Herramientas de Desarrollo
- **Angular CLI 20.0.1**: Herramientas de línea de comandos
- **Karma**: Framework de pruebas unitarias
- **Jasmine**: Framework de pruebas de comportamiento

## 🔧 Instalación y Configuración

### Requisitos Previos
```bash
Node.js >= 18.0.0
npm >= 9.0.0
Angular CLI >= 20.0.0
```

### Instalación
```bash
# Clonar el repositorio
git clone [url-del-repositorio]

# Navegar al directorio del frontend
cd front

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
ng serve

# Construir para producción
ng build --configuration production
```

### Configuración de Entorno
Crear archivo `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  tokenExpiration: 36000 // 10 horas en segundos
};
```

## 🔐 Autenticación y Control de Acceso

### Sistema de Roles

| Rol Backend | Descripción Frontend | Acceso |
|-------------|---------------------|---------|
| ROLE_SUPERADMIN | Super Administrador | Acceso completo a todos los módulos |
| ROLE_ADMIN | Administrador | Acceso a administración y puede actuar como usuario |
| ROLE_USUARIO | Usuario Estudiante/Docente | Acceso limitado a reportes y zonas |
| ROLE_SEGURIDAD | Personal de Seguridad | Panel especializado de seguridad |

### Flujo de Login
```json
{
  "token": "<JWT>",
  "tipoToken": "Bearer",
  "roles": ["ROLE_ADMIN", "ROLE_USUARIO"]
}
```

### Redirecciones Post-Login
- **SuperAdmin**: `/superadmin/dashboard`
- **Admin**: `/select-role` (selector de rol)
- **Seguridad**: `/seguridad`
- **Usuario**: `/usuario`

### Selector de Rol (Admin)
Los administradores con doble rol (ADMIN + USUARIO) son redirigidos a `/select-role` donde pueden elegir:
- **Usuario**: Navega a `/usuario` con `adminActingAsUser=true`
- **Administrador**: Navega a `/admin`

### Prefijos de Nombre
| Contexto | Formato |
|----------|---------|
| Alumno | `Alum. Nombre Apellido` |
| Docente | `Doc. Nombre Apellido` |
| Admin (vista usuario) | `Admin. Nombre Apellido` |
| Admin (vista admin) | `Admin. Nombre Apellido` |
| SuperAdmin | `Super Admin` |

## 📁 Estructura del Proyecto

### Módulos Principales

#### Admin Module (`src/app/Admin/`)
- **inicio/**: Dashboard principal de administrador
- **select-rol/**: Selector de rol para administradores
- **reportes/**: Gestión de reportes administrativos

#### Usuario Module (`src/app/Usuario/`)
- **inicio/**: Dashboard principal de usuario
- **reporta-ahora/**: Componente de reporte de incidentes
- **detalle-reporte/**: Detalles de reportes del usuario
- **Estado_zonas/**: Visualización de estado de zonas
- **guia-page/**: Guía de usuario

#### SuperAdmin Module (`src/app/SuperAdmin/`)
- **inicio/**: Dashboard principal de super administrador
- **gestor-usuario/**: Gestión completa de usuarios
- **reportes-sensibles/**: Reportes de alta sensibilidad
- **sedes/**: Gestión de sedes
- **tipo-incidentes/**: Gestión de tipos de incidentes
- **paginas/**: Configuración de páginas por rol
- **feed-back/**: Gestión de retroalimentación

#### Seguridad Module (`src/app/Seguridad/`)
- **inicio/**: Dashboard especializado de seguridad

### Servicios (`src/app/services/`)
- **auth.service.ts**: Autenticación y manejo de JWT
- **perfil.service.ts**: Gestión de perfiles de usuario
- **reporte.service.ts**: Gestión de reportes
- **usuario-rol.service.ts**: Gestión de usuarios y roles
- **sede.service.ts**: Gestión de sedes
- **zona.service.ts**: Gestión de zonas
- **incidente.service.ts**: Gestión de tipos de incidentes
- **page-config.service.ts**: Configuración de páginas por rol
- **time.service.ts**: Sincronización de tiempo con servidor

### Guards (`src/app/guards/`)
- **role.guard.ts**: Verificación de roles para acceso a rutas
- **guest.guard.ts**: Prevención de acceso a usuarios autenticados

## 🧩 Componentes Principales

### Login Component (`InicioSesion`)
- Formulario de autenticación con validaciones
- Sistema de bloqueo por intentos fallidos
- Límite de caracteres (username: 19, password: 12)
- Timeout de 10 segundos para peticiones
- Botón SOS para emergencias

### Navbar Component (`NavbarComponent`)
- Navegación dinámica según rol
- Prefijos de nombre según tipo de usuario
- Iconos diferenciados por rol
- Tour guiado de la aplicación
- Notificaciones y acciones rápidas

### User Layout Component
- Barra de navegación reutilizable
- Envoltura para rutas de usuario
- Gestión de estado de usuario

## 🔧 Servicios

### AuthService
```typescript
// Métodos principales
login(username: string, password: string): Observable<JwtResponse>
logout(): void
hasRole(role: string): boolean
isAdminAsUser(): boolean
buildDisplayName(nombreCompleto: string, tipoUsuario?: string): string
```

### PerfilService
```typescript
// Métodos principales
cargarPerfil(): void
perfil(): Signal<PerfilUsuario | null>
```

### ReporteService
```typescript
// Métodos principales
getAll(): Observable<ReporteDTO[]>
crear(reporte: ReporteDTO): Observable<ReporteDTO>
```

### PageConfigService
```typescript
// Métodos principales
isEnabled(role: string, page: PageKey): boolean
setEnabled(role: string, page: PageKey, enabled: boolean): void
```

## 🛡️ Guards y Seguridad

### RoleGuard
Verifica que el usuario tenga los roles necesarios para acceder a una ruta:
```typescript
{
  path: 'admin',
  component: InicioAdmin,
  canActivate: [roleGuard],
  data: { roles: ['ROLE_ADMIN'] }
}
```

### GuestGuard
Previene que usuarios autenticados accedan a rutas de invitados:
```typescript
{
  path: 'login',
  component: InicioSesion,
  canActivate: [guestGuard]
}
```

## ⚙️ Configuración de Páginas por Rol

El SuperAdmin puede configurar qué páginas están disponibles para cada rol:

### Páginas Configurables
- **home**: Página principal
- **zonas**: Estado de zonas
- **reportes**: Gestión de reportes
- **usuarios**: Gestión de usuarios
- **sensibles**: Reportes sensibles
- **guia**: Guía de usuario

### Ejemplo de Configuración
```typescript
// Habilitar página de zonas para usuarios
pageConfig.setEnabled('ROLE_USUARIO', 'zonas', true);

// Deshabilitar página de reportes para usuarios
pageConfig.setEnabled('ROLE_USUARIO', 'reportes', false);
```

## 📋 Sistema de Reportes

### Límites y Restricciones
- **Máximo 3 reportes por día por usuario**
- **Reseteo diario automático** basado en fecha del servidor
- **Validación de fecha** para prevenir fraude de tiempo

### Tipos de Reporte
- Incidentes de seguridad
- Condiciones peligrosas
- Mantenimiento requerido
- Emergencias médicas

### Estados de Reporte
- **En Investigación**: Reporte recibido y en proceso
- **En Proceso**: Trabajo en curso
- **Resuelto**: Incidente resuelto
- **Cerrado**: Caso cerrado definitivamente

## 🗺️ Estado de Zonas

### Códigos de Color
- **🟢 Verde**: Zona segura
- **🟡 Amarillo**: Precaución requerida
- **🔴 Rojo**: Zona peligrosa

### Actualización de Estado
- Actualización en tiempo real
- Basado en reportes recientes
- Validación por administradores
- Historial de cambios

## 🎨 Interfaz de Usuario

### Sistema de Diseño
- **Tipografía**: Poppins (Google Fonts)
- **Colores Primarios**: Rojo UTP (#FF395C)
- **Colores Secundarios**: Negro (#000000)
- **Fondo**: Blanco (#ffffff)

### Variables CSS
```scss
:root {
  --primary: #FF395C;
  --secondary: #000000;
  --background: #ffffff;
  --muted: #ececf0;
  --destructive: #FF395C;
}
```

### Responsive Design
- Breakpoints para móviles, tablets y desktop
- Navbar adaptable
- Menú hamburguesa en móviles
- Cards y grids flexibles

## 🚀 Despliegue

### Construcción para Producción
```bash
# Construir proyecto
ng build --configuration production

# Verificar bundle size
ng build --stats-json
npx webpack-bundle-analyzer dist/stats.json
```

### Optimizaciones
- Tree shaking activado
- Lazy loading de módulos
- Compresión de assets
- Minificación de código

### Variables de Entorno
```typescript
// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.utpreport.edu.pa',
  tokenExpiration: 36000
};
```

## 🔗 Endpoints del Backend

### Autenticación
```
POST /api/auth/login
Body: { usernameOrCorreo: string, password: string }
Response: { token: string, tipoToken: string, roles: string[] }
```

### Usuarios
```
GET /api/usuarios
GET /api/usuarios/:id
POST /api/usuarios
PUT /api/usuarios/:id
DELETE /api/usuarios/:id
```

### Reportes
```
GET /api/reportes
GET /api/reportes/usuario/:id
POST /api/reportes
PUT /api/reportes/:id
```

### Zonas
```
GET /api/zonas
GET /api/zonas/:id
PUT /api/zonas/:id/estado
```

### Sedes
```
GET /api/sedes
POST /api/sedes
PUT /api/sedes/:id
```

## 🔒 Consideraciones de Seguridad

### JWT y Tokens
- Tokens con expiración de 10 horas
- Logout automático antes de expiración
- Validación de firma en cada petición
- Refresh token implementable

### Prevención de Ataques
- **XSS**: Sanitización de entradas
- **CSRF**: Tokens de seguridad
- **SQL Injection**: Uso de prepared statements
- **Brute Force**: Límite de intentos y bloqueo temporal

### Validaciones
- Longitud máxima de campos
- Validación de formato de email
- Validación de teléfono (9 dígitos)
- Validación de contraseña (mínimo 6 caracteres)

### Encriptación
- HTTPS en producción
- Contraseñas hasheadas en backend
- Información sensible encriptada

## 📈 Futuras Mejoras

### Funcionalidades Planificadas
1. **Refresco de Token**: Implementar refresh tokens para sesiones extendidas
2. **Notificaciones Push**: Sistema de notificaciones en tiempo real
3. **Chat en Vivo**: Comunicación directa con seguridad
4. **Estadísticas Avanzadas**: Dashboard analítico para administradores
5. **Integración con SMS**: Notificaciones por mensaje de texto
6. **App Móvil**: Versión nativa para iOS y Android
7. **Geolocalización**: Ubicación exacta de incidentes
8. **Fotos y Videos**: Adjuntar evidencia multimedia
9. **Exportación de Reportes**: Generación de PDFs y Excel
10. **Inteligencia Artificial**: Detección automática de patrones

### Mejoras Técnicas
- Implementación de PWA (Progressive Web App)
- Optimización de rendimiento con Web Workers
- Implementación de GraphQL
- Microservicios con NestJS
- Containerización con Docker
- CI/CD con GitHub Actions

### Escalabilidad
- Base de datos distribuida
- Caché con Redis
- CDN para assets estáticos
- Load balancing
- Monitoreo con Prometheus y Grafana

## 📞 Soporte y Contacto

### Equipo de Desarrollo
- **Frontend**: Angular 20 con TypeScript
- **Backend**: Spring Boot (Java)
- **Base de Datos**: PostgreSQL
- **Infraestructura**: AWS/Azure

### Documentación Adicional
- Documentación del Backend: `[url-backend-docs]`
- Manual de Usuario: `[url-user-manual]`
- Videos Tutoriales: `[url-tutorials]`

### Reporte de Bugs
Los bugs y problemas técnicos pueden reportarse a través de:
- Sistema de tickets interno
- Email: soporte@utpreport.edu.pa
- Teléfono: +507-560-0000

---

**© 2024 Universidad Tecnológica de Panamá - Todos los derechos reservados**