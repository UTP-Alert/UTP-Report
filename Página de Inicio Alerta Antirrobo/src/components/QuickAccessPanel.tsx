import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Crown,
  Shield,
  User,
  UserCheck,
  Eye,
  EyeOff,
  Settings
} from 'lucide-react';

type UserRole = 'public' | 'user' | 'admin' | 'security' | 'superuser';

interface QuickAccessPanelProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isLoggedIn: boolean;
  currentPage: string;
}

export function QuickAccessPanel({ currentRole, onRoleChange, isLoggedIn, currentPage }: QuickAccessPanelProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  // Mostrar solo si está logueado O está en la página de login
  if (!isLoggedIn && currentPage !== 'login') {
    return null;
  }

  const roles = [
    {
      id: 'superuser' as UserRole,
      name: 'Superadmin',
      icon: Crown,
      color: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      textColor: 'text-yellow-600',
      credentials: 'admin.sistema / UTP2024*'
    },
    {
      id: 'admin' as UserRole,
      name: 'Administrador',
      icon: Shield,
      color: 'bg-gradient-to-r from-red-500 to-red-600',
      textColor: 'text-red-600',
      credentials: 'D1234567 / admin123'
    },
    {
      id: 'user' as UserRole,
      name: 'Estudiante',
      icon: User,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
      credentials: 'U1234567 / estudiante123'
    },
    {
      id: 'security' as UserRole,
      name: 'Seguridad',
      icon: UserCheck,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      textColor: 'text-green-600',
      credentials: 'S001 / seguridad123'
    }
  ];

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          className="bg-primary hover:bg-primary/90 shadow-lg"
          size="sm"
        >
          <Settings className="h-4 w-4 mr-2" />
          Beta Panel
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <Card className="border-2 border-primary bg-white shadow-2xl">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Header del panel */}
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-gray-900">🧪 Panel Beta</p>
                <p className="text-xs text-gray-500">
                  {!isLoggedIn ? 'Login rápido' : 'Cambio rápido de roles'}
                </p>
              </div>
            </div>

            {/* Separador */}
            <div className="h-8 w-px bg-gray-300"></div>

            {/* Botones de roles */}
            <div className="flex items-center gap-2">
              {roles.map((role) => {
                const Icon = role.icon;
                const isActive = currentRole === role.id;
                
                return (
                  <div key={role.id} className="relative">
                    <Button
                      onClick={() => onRoleChange(role.id)}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      className={`flex items-center gap-2 transition-all hover:scale-105 ${
                        isActive 
                          ? `${role.color} text-white border-none shadow-md` 
                          : `border-2 hover:border-current ${role.textColor} hover:bg-gray-50`
                      }`}
                      title={`${!isLoggedIn ? 'Login como' : 'Cambiar a'} ${role.name}\nCredenciales: ${role.credentials}`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-xs font-medium">
                        {role.name}
                      </span>
                    </Button>
                    
                    {/* Indicador activo */}
                    {isActive && (
                      <div className="absolute -top-1 -right-1">
                        <div className="h-3 w-3 bg-white border-2 border-current rounded-full animate-pulse" 
                             style={{ borderColor: role.color.includes('yellow') ? '#eab308' : '#ffffff' }}>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Botón ocultar */}
            <div className="h-8 w-px bg-gray-300"></div>
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-600"
              title="Ocultar panel beta"
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Info del rol actual */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {!isLoggedIn ? 'Sin loguear' : `Rol Actual: ${roles.find(r => r.id === currentRole)?.name}`}
                </Badge>
              </div>
              <p className="text-xs text-gray-500">
                💡 Hover para ver credenciales
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}