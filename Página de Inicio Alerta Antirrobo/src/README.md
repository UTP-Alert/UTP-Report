# Sistema de Alertas Antirrobo Universitario - Angular

Este es el sistema completo de alertas antirrobo universitario migrado de React a Angular, manteniendo exactamente el mismo diseño, colores y funcionalidad.

## 🚀 Características

- **Sistema de Roles**: Público, Usuario, y Administrador con funcionalidades específicas
- **Selector de Roles para Admin**: Los administradores pueden elegir entre acceso de usuario o admin
- **Diseño Responsive**: Funciona perfectamente en desktop y móvil
- **Sistema de Reportes**: Modal completo para reportar incidentes con opciones anónimas
- **Monitoreo de Zonas**: Vista en tiempo real del estado de seguridad del campus
- **Botón SOS**: Funcionalidad de emergencia inmediata
- **Soporte Completo**: Centro de ayuda y contacto

## 🎨 Paleta de Colores

- **Rojo Principal**: #FF395C
- **Negro Secundario**: #000000
- **Diseño accesible** siguiendo principios de UI/UX

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Instalar Angular CLI globalmente (si no lo tienes)
npm install -g @angular/cli
```

## 🏃‍♂️ Ejecutar el Proyecto

```bash
# Servidor de desarrollo
ng serve

# El proyecto estará disponible en http://localhost:4200
```

## 🔧 Construcción

```bash
# Build para producción
ng build

# Los archivos se generarán en dist/
```

## 👥 Sistema de Roles

### Usuario Público
- Acceso a página principal
- Puede reportar incidentes de forma anónima
- Ver estado de zonas
- Acceso a soporte

### Usuario Registrado
- Dashboard personal con estadísticas
- Reportes con mayor credibilidad
- Historial de actividad
- Notificaciones personalizadas

### Administrador
- **Selector de Roles**: Puede elegir entre acceso de usuario o admin
- Panel completo de administración
- Gestión de alertas y reportes
- Control de zonas universitarias
- Herramientas administrativas avanzadas

## 🔐 Credenciales de Testing

- **Admin con selector de roles**: `admin` / `admin123`
- **Usuario normal**: Cualquier otra combinación

## 📱 Funcionalidades Principales

### Sistema de Reportes
- Modal interactivo para reportar incidentes
- Selector de tipo de incidente (robo, sospechoso, agresión, etc.)
- Selector de zona universitaria
- Campo de descripción detallada
- Subida opcional de fotografías
- Opción de reporte anónimo

### Monitoreo de Zonas
- 12 zonas universitarias monitoreadas 24/7
- Estados en tiempo real (Seguro, Alerta, Peligro)
- Vista detallada de cada zona
- Historial de incidentes por zona

### Navegación Inteligente
- Navegación diferente según rol de usuario
- Breadcrumbs y contexto visual
- Responsive design para móviles

### Sistema de Alertas
- Notificaciones en tiempo real
- Estados diferenciados por color
- Sistema limpio con mensajes informativos

## 🛠️ Tecnologías Utilizadas

- **Angular 18**: Framework principal
- **TypeScript**: Lenguaje de programación
- **Tailwind CSS v4**: Estilos y diseño
- **Angular Signals**: Gestión de estado reactiva
- **Standalone Components**: Arquitectura moderna de Angular
- **Forms Reactive**: Manejo de formularios

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── components/
│   │   ├── navigation/          # Navegación principal
│   │   ├── home-page/           # Página principal
│   │   ├── user-dashboard/      # Dashboard de usuario
│   │   ├── admin-dashboard/     # Dashboard de administrador
│   │   ├── report-modal/        # Modal de reportes
│   │   ├── sos-button/          # Botón de emergencia
│   │   ├── pages/
│   │   │   ├── login-page/      # Página de login con selector de roles
│   │   │   ├── zonas-page/      # Monitoreo de zonas
│   │   │   └── soporte-page/    # Centro de soporte
│   │   └── ui/                  # Componentes UI reutilizables
│   │       ├── button/
│   │       ├── card/
│   │       ├── input/
│   │       ├── badge/
│   │       └── alert/
│   ├── types/                   # Tipos de TypeScript
│   ├── app.component.ts         # Componente principal
│   └── app.routes.ts            # Configuración de rutas
├── styles/
│   └── globals.css              # Estilos globales de Tailwind
└── index.html                   # HTML principal
```

## 🎯 Características Específicas de la Migración

### Conversiones Realizadas
- **React Hooks → Angular Signals**: `useState` → `signal()`
- **Props → Input/Output**: Props de React → `@Input()` y `@Output()`
- **JSX → Angular Templates**: Sintaxis JSX → Templates Angular
- **Event Handlers**: `onClick` → `(click)`
- **Conditional Rendering**: `{condition && <Component>}` → `*ngIf="condition"`
- **Lists**: `map()` → `*ngFor`

### Mantenimiento de Funcionalidad
- ✅ Sistema de roles idéntico
- ✅ Selector de roles para admin
- ✅ Modal de reportes completo
- ✅ Navegación responsive
- ✅ Botón SOS con animaciones
- ✅ Estados del sistema (datos en 0)
- ✅ Mensajes informativos
- ✅ Botones beta para cambio rápido de roles

## 🔄 Estados del Sistema

El sistema está configurado con todos los datos en 0 (modo limpio):
- 0 reportes activos
- 0 alertas
- 0 zonas en peligro
- Estados "Sin reportes" en todas las zonas
- Mensajes informativos para sistema nuevo/en prueba

## 📞 Soporte

- **Email**: soporte@alertaantirrobo.edu
- **Teléfono**: +1 (800) 123-4567
- **Chat**: Disponible 24/7
- **Emergencias**: Policía 123, Universidad 911

## 📋 Notas Importantes

1. **Selector de Roles**: Solo aparece para credenciales de admin (`admin`/`admin123`)
2. **Botones Beta**: Disponibles en esquina inferior izquierda para pruebas rápidas
3. **Responsive**: Optimizado para desktop y móvil
4. **Accesibilidad**: Implementa principios de accesibilidad web
5. **Sistema Limpio**: Todos los contadores en 0, listo para producción

## 🚀 Despliegue

```bash
# Build de producción
ng build --configuration production

# Los archivos optimizados estarán en dist/alerta-antirrobo/
```

---

**Desarrollado con Angular 18 + Tailwind CSS v4**
*Sistema de Alertas Antirrobo Universitario - Protegiendo la comunidad las 24 horas*