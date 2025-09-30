import React from 'react';
import { Button } from './ui/button';
import { NotificationBell } from './NotificationBell';
import { useSystemConfig } from './services/SystemConfigService';
import { 
  Shield, 
  Phone, 
  Home,
  AlertTriangle,
  MapPin,
  Clock,
  HelpCircle,
  User,
  Users,
  Menu,
  X,
  LogOut,
  Crown,
  FileText,
  BarChart3,
  UserCog,
  Monitor
} from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onOpenReport: () => void;
  userRole: 'public' | 'user' | 'admin' | 'security' | 'superuser';
  onLogout?: () => void;
}

export function Navigation({ currentPage, onPageChange, onOpenReport, userRole, onLogout }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { isPageEnabled } = useSystemConfig();

  // Get user name based on role
  const getUserName = () => {
    if (userRole === 'superuser') {
      return 'Super Admin';
    } else if (userRole === 'admin') {
      return 'Admin García';
    } else if (userRole === 'user') {
      return 'Juan Pérez';
    } else if (userRole === 'security') {
      return 'Carlos Mendoza';
    }
    return null;
  };

  // Different navigation items based on user role and system configuration
  const getNavItems = () => {
    let baseItems = [];

    if (userRole === 'superuser') {
      baseItems = [
        { id: 'inicio', label: 'INICIO', icon: Crown, ariaLabel: 'Ir al panel de control del sistema' },
        { id: 'usuarios', label: 'GESTIÓN DE USUARIOS', icon: Users, ariaLabel: 'Gestionar usuarios del sistema' },
        { id: 'reportes-sensibles', label: 'REPORTES SENSIBLES', icon: Shield, ariaLabel: 'Ver reportes con información sensible' },
        { id: 'zonas', label: 'ESTADO DE ZONAS', icon: MapPin, ariaLabel: 'Ver estado de zonas universitarias' }
      ];
    } else if (userRole === 'admin') {
      baseItems = [
        { id: 'inicio', label: 'INICIO', icon: Monitor, ariaLabel: 'Ir al dashboard de administración' },
        { id: 'zonas', label: 'ESTADO DE ZONAS', icon: MapPin, ariaLabel: 'Ver estado de zonas universitarias' },
        { id: 'reportes', label: 'REPORTES', icon: FileText, ariaLabel: 'Ver y gestionar reportes' },
        { id: 'analytics', label: 'ANALYTICS', icon: BarChart3, ariaLabel: 'Ver estadísticas del sistema' }
      ];
    } else if (userRole === 'user') {
      baseItems = [
        { id: 'inicio', label: 'INICIO', icon: Home, ariaLabel: 'Ir a mi dashboard de usuario' },
        { id: 'zonas', label: 'ESTADO DE ZONAS', icon: MapPin, ariaLabel: 'Ver estado de zonas universitarias' },
        { id: 'guia', label: 'GUÍA', icon: HelpCircle, ariaLabel: 'Ver guía y tutorial del sistema' }
      ];
    } else if (userRole === 'security') {
      baseItems = [
        { id: 'inicio', label: 'INICIO', icon: Shield, ariaLabel: 'Ir al panel de seguridad' },
        { id: 'zonas', label: 'ESTADO DE ZONAS', icon: MapPin, ariaLabel: 'Ver estado de zonas universitarias' }
      ];
    } else {
      // Public navigation (simplified)
      baseItems = [
        { id: 'inicio', label: 'INICIO', icon: Home, ariaLabel: 'Ir a página de inicio' },
        { id: 'zonas', label: 'ESTADO DE ZONAS', icon: MapPin, ariaLabel: 'Ver estado de zonas universitarias' },
        { id: 'login', label: 'INICIAR SESIÓN', icon: User, ariaLabel: 'Iniciar sesión en el sistema' }
      ];
    }

    // Filter items based on system configuration (except for superuser who can see all)
    if (userRole !== 'superuser') {
      return baseItems.filter(item => isPageEnabled(item.id) || item.id === 'login');
    }

    return baseItems;
  };

  const navItems = getNavItems();
  const userName = getUserName();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-secondary text-secondary-foreground sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" aria-label="Logo UTP Report" />
            <h1 className="text-lg sm:text-xl lg:text-2xl">
              UTP+Report
            </h1>
          </div>

          {/* Navegación Desktop */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onPageChange(item.id)}
                  className={`flex items-center gap-1 xl:gap-2 px-2 xl:px-4 py-2 transition-all ${
                    isActive 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                      : 'text-secondary-foreground hover:bg-white/10 hover:text-white'
                  }`}
                  aria-label={item.ariaLabel}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs xl:text-sm">{item.label}</span>
                </Button>
              );
            })}
            
            {/* Notification Bell and User Info when logged in */}
            {userName && (
              <div className="flex items-center gap-1 xl:gap-2">
                {/* Notification Bell - Only for admin, user, and security roles */}
                {(userRole === 'admin' || userRole === 'user' || userRole === 'security') && (
                  <div className="notification-bell">
                    <NotificationBell userRole={userRole} />
                  </div>
                )}
                
                <div className={`flex items-center gap-1 xl:gap-2 px-2 xl:px-4 py-2 rounded-md ${
                  userRole === 'superuser' ? 'bg-primary/20 border border-primary/30' : 'bg-white/10'
                }`}>
                  {userRole === 'superuser' ? (
                    <Crown className="h-4 w-4 text-primary" />
                  ) : (
                    <User className="h-4 w-4 text-white" />
                  )}
                  <span className={`text-xs xl:text-sm ${userRole === 'superuser' ? 'text-primary font-medium' : 'text-white'} hidden sm:inline`}>
                    {userName}
                  </span>
                </div>
                {onLogout && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLogout}
                    className="text-secondary-foreground hover:bg-white/10 hover:text-white"
                    aria-label="Cerrar sesión"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </nav>

          {/* Botón de reporte y menú móvil */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Botón REPORTAR AHORA solo para usuarios */}
            {userRole === 'user' && (
              <Button 
                onClick={onOpenReport}
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 hidden lg:flex xl:flex"
                aria-label="Reportar nuevo incidente"
              >
                <AlertTriangle className="h-4 w-4 xl:h-5 xl:w-5 mr-1 xl:mr-2" />
                <span className="hidden xl:inline">REPORTAR AHORA</span>
                <span className="xl:hidden">REPORTAR</span>
              </Button>
            )}

            {/* Botón menú móvil */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="lg:hidden text-secondary-foreground hover:bg-white/10"
              aria-label={isMobileMenuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </Button>
          </div>
        </div>

        {/* Navegación Móvil */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden mt-2 sm:mt-4 border-t border-white/20 pt-2 sm:pt-4">
            <div className="grid grid-cols-1 gap-1 sm:gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    size="lg"
                    onClick={() => {
                      onPageChange(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-start gap-2 sm:gap-3 w-full h-12 sm:h-14 px-3 sm:px-4 transition-all ${
                      isActive 
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                        : 'text-secondary-foreground hover:bg-white/10 hover:text-white'
                    }`}
                    aria-label={item.ariaLabel}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-base sm:text-lg">{item.label}</span>
                  </Button>
                );
              })}
              
              {/* Show user name when logged in (mobile) */}
              {userName && (
                <div className="mt-2 space-y-1 sm:space-y-2">
                  <div className="flex items-center justify-start gap-2 sm:gap-3 w-full h-12 sm:h-14 px-3 sm:px-4 bg-white/10 rounded-md">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    <span className="text-base sm:text-lg text-white">{userName}</span>
                  </div>
                  {onLogout && (
                    <Button
                      variant="ghost"
                      size="lg"
                      onClick={() => {
                        onLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-start gap-2 sm:gap-3 w-full h-12 sm:h-14 px-3 sm:px-4 text-secondary-foreground hover:bg-white/10 hover:text-white"
                      aria-label="Cerrar sesión"
                    >
                      <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-base sm:text-lg">CERRAR SESIÓN</span>
                    </Button>
                  )}
                </div>
              )}
              
              {/* Botón de reporte en móvil - solo para usuarios */}
              {userRole === 'user' && (
                <div className="mt-3 sm:mt-4">
                  <Button 
                    onClick={() => {
                      onOpenReport();
                      setIsMobileMenuOpen(false);
                    }}
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 w-full h-12 sm:h-14"
                    aria-label="Reportar nuevo incidente"
                  >
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                    REPORTAR AHORA
                  </Button>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}