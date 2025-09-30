import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { SOSButton } from '../SOSButton';
import { useUserService } from '../services/UserService';
import { 
  LogIn, 
  Shield, 
  Eye, 
  EyeOff, 
  Lock,
  User,
  AlertTriangle,
  CheckCircle,
  UserCircle,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import loginImage from 'figma:asset/af128b453656c9e7e557f17a3d5f04408bc56e1c.png';

type UserRole = 'public' | 'user' | 'admin' | 'security' | 'superuser';

interface LoginPageProps {
  currentUserRole?: UserRole;
  onRoleSelect?: (role: UserRole) => void;
}

export function LoginPage({ currentUserRole, onRoleSelect }: LoginPageProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showRoleSelector, setShowRoleSelector] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<UserRole | null>(null);
  const [loginForm, setLoginForm] = React.useState({
    username: '',
    password: '',
    rememberMe: false
  });
  
  // Hook para acceder al servicio de usuarios
  const { users, getUserByEmail } = useUserService();

  const handleLoginChange = (field: string, value: string | boolean) => {
    setLoginForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para validar formato de código estudiantil
  const validateStudentCode = (code: string): boolean => {
    // Formato: U seguido de 7 dígitos (ej: U1234567)
    const studentCodeRegex = /^[Uu]\d{7}$/;
    return studentCodeRegex.test(code);
  };

  // Función para validar formato de código de docente
  const validateTeacherCode = (code: string): boolean => {
    // Formato: C seguido de 5 dígitos (ej: C54321)
    const teacherCodeRegex = /^[Cc]\d{5}$/;
    return teacherCodeRegex.test(code);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar credenciales de superusuario
    if (loginForm.username === 'admin.sistema' && loginForm.password === 'UTP2024*') {
      if (onRoleSelect) {
        onRoleSelect('superuser');
      }
      return;
    }
    
    // 1. BUSCAR POR EMAIL COMPLETO (formato @utp.edu.pe)
    let foundUser = getUserByEmail(loginForm.username);
    
    // 2. BUSCAR POR CÓDIGO SIN DOMINIO (formato U1234567, C54321, D1234567, S001)
    if (!foundUser && !loginForm.username.includes('@')) {
      const emailWithDomain = `${loginForm.username}@utp.edu.pe`;
      foundUser = getUserByEmail(emailWithDomain);
    }
    
    // 3. VERIFICAR CREDENCIALES
    if (foundUser && foundUser.isActive) {
      // Verificar contraseña
      if (foundUser.password === loginForm.password) {
        // Verificar si es administrador con múltiples roles
        if (foundUser.role === 'admin') {
          setShowRoleSelector(true);
          return;
        }
        
        // Login exitoso - dirigir al dashboard correspondiente
        if (onRoleSelect) {
          onRoleSelect(foundUser.role as UserRole);
        }
        return;
      } else {
        alert('Contraseña incorrecta. Intenta nuevamente.');
        return;
      }
    }
    
    // 4. CREDENCIALES LEGACY DE SUPERUSUARIO (mantener compatibilidad)
    if ((loginForm.username === 'superuser' && loginForm.password === 'super2024') ||
        (loginForm.username === 'admin.sistema' && loginForm.password === 'UTP2024*')) {
      if (onRoleSelect) {
        onRoleSelect('superuser');
      }
      return;
    }
    
    // 5. ERRORES ESPECÍFICOS
    if (validateStudentCode(loginForm.username)) {
      alert('Código de estudiante válido, pero no encontrado en el sistema o contraseña incorrecta.');
      return;
    }

    if (validateTeacherCode(loginForm.username)) {
      alert('Código de docente válido, pero no encontrado en el sistema o contraseña incorrecta.');
      return;
    }
    
    // Error general
    if (loginForm.username && loginForm.password) {
      alert('Usuario no encontrado o credenciales incorrectas. Verifica tu código UTP y contraseña.');
    } else {
      alert('Por favor ingresa tu código y contraseña.');
    }
  };

  const handleRoleSelection = (role: UserRole) => {
    setSelectedRole(role);
    if (onRoleSelect) {
      onRoleSelect(role);
    }
    setShowRoleSelector(false);
    // Reset form after successful role selection
    setLoginForm({ username: '', password: '', rememberMe: false });
    
    // Show confirmation message
    const roleText = 
      role === 'admin' ? 'Administrador' : 
      role === 'security' ? 'Personal de Seguridad' : 
      'Usuario';
    setTimeout(() => {
      alert(`¡Acceso exitoso como ${roleText}!`);
    }, 100);
  };

  return (
    <>
      {/* Role Selector Full Screen */}
      {showRoleSelector && (
        <div className="fixed inset-0 bg-gray-50 z-50 flex items-center justify-center p-4">
          <div className="max-w-3xl w-full">
            <Card className="border-2 border-primary bg-white shadow-2xl">
              <CardHeader className="text-center pb-8">
                <div className="flex items-center justify-center gap-6 mb-8">
                  <Shield className="h-20 w-20 text-primary" />
                  <div>
                    <CardTitle className="text-5xl mb-4">
                      Seleccionar Rol de Acceso
                    </CardTitle>
                    <CardDescription className="text-2xl">
                      Como administrador, elige el tipo de acceso que deseas utilizar
                    </CardDescription>
                  </div>
                </div>
                
                <Alert className="border-blue-200 bg-blue-50">
                  <ShieldCheck className="h-6 w-6 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-xl">
                    <strong>¡Credenciales de administrador verificadas!</strong> Selecciona el tipo de acceso que necesitas.
                  </AlertDescription>
                </Alert>
              </CardHeader>
              
              <CardContent className="pb-8">
                <div className="space-y-8">
                  <Button
                    onClick={() => handleRoleSelection('user')}
                    className="w-full h-24 flex items-center justify-start gap-8 bg-blue-500 hover:bg-blue-600 text-white transition-all hover:scale-105 text-xl"
                    size="lg"
                  >
                    <UserCircle className="h-16 w-16" />
                    <div className="text-left">
                      <div className="text-3xl font-medium mb-2">👤 Acceso como Usuario</div>
                      <div className="text-lg opacity-90">Dashboard personal con estadísticas y reportes</div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => handleRoleSelection('admin')}
                    className="w-full h-24 flex items-center justify-start gap-8 bg-primary hover:bg-primary/90 text-white transition-all hover:scale-105 text-xl"
                    size="lg"
                  >
                    <Shield className="h-16 w-16" />
                    <div className="text-left">
                      <div className="text-3xl font-medium mb-2">🛡️ Acceso como Administrador</div>
                      <div className="text-lg opacity-90">Panel completo con gestión de alertas y sistema</div>
                    </div>
                  </Button>
                  
                  <Button
                    onClick={() => setShowRoleSelector(false)}
                    variant="outline"
                    className="w-full mt-8 h-16 text-xl"
                  >
                    ← Volver al Login
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Main Login Page */}
      <div className="min-h-screen bg-gray-50">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
          {/* Left side - Welcome Section with Image */}
          <div className="bg-primary flex items-center justify-center p-8 lg:p-12">
            <div className="max-w-md text-center text-white">
              {/* Security System Illustration */}
              <div className="mb-8">
                <img 
                  src={loginImage}
                  alt="Sistema de reportes UTP - Ilustración de estudiante usando el sistema de reportes con notificaciones, personal de seguridad y seguimiento de incidentes"
                  className="w-full h-72 object-contain rounded-2xl bg-white p-4 shadow-2xl"
                />
              </div>

              {/* Brand Logo */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <Shield className="h-16 w-16 text-white" />
                <div>
                  <h1 className="text-4xl font-bold">UTP+Report</h1>
                  <p className="text-lg text-white/90">
                    Sistema de Reportes de Seguridad
                  </p>
                </div>
              </div>

              {/* Welcome Message */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">¡Bienvenido!</h2>
                <p className="text-lg text-white/90 leading-relaxed">
                  Reporta incidencias, recibe alertas y sigue el estado de tus reportes 
                  de forma rápida y sencilla.
                </p>
                
                {/* Features */}
                <div className="grid grid-cols-1 gap-3 mt-8">
                  <div className="flex items-center gap-3 text-left">
                    <CheckCircle className="h-6 w-6 text-white/90 flex-shrink-0" />
                    <span className="text-white/90">Reportes anónimos y seguros</span>
                  </div>
                  <div className="flex items-center gap-3 text-left">
                    <CheckCircle className="h-6 w-6 text-white/90 flex-shrink-0" />
                    <span className="text-white/90">Notificaciones en tiempo real</span>
                  </div>
                  <div className="flex items-center gap-3 text-left">
                    <CheckCircle className="h-6 w-6 text-white/90 flex-shrink-0" />
                    <span className="text-white/90">Seguimiento de casos</span>
                  </div>
                  <div className="flex items-center gap-3 text-left">
                    <CheckCircle className="h-6 w-6 text-white/90 flex-shrink-0" />
                    <span className="text-white/90">Campus más seguro</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="flex items-center justify-center p-8 lg:p-12">
            <div className="max-w-md w-full space-y-8">
              {/* Login Form */}
              <Card className="border-2 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl text-center flex items-center justify-center gap-3">
                    <User className="h-8 w-8 text-primary" />
                    ¡Hola!
                  </CardTitle>
                  <CardDescription className="text-center text-base">
                    Ingresa tus datos para iniciar sesión.
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {/* Credentials hint */}
                  <Alert className="mb-4 border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800 text-sm">
                      <strong>Credenciales de prueba:</strong><br/>
                      • Superadmin: <span className="font-mono">admin.sistema</span> / <span className="font-mono">UTP2024*</span><br/>
                      • Administrador: <span className="font-mono">D1234567</span> / <span className="font-mono">admin123</span><br/>
                      • Seguridad: <span className="font-mono">S001</span> / <span className="font-mono">seguridad123</span><br/>
                      • Estudiante: <span className="font-mono">U1234567</span> / <span className="font-mono">estudiante123</span>
                    </AlertDescription>
                  </Alert>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label htmlFor="username" className="block text-sm mb-2">
                        Usuario: código UTP (estudiante/docente/personal)
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="username"
                          type="text"
                          value={loginForm.username}
                          onChange={(e) => handleLoginChange('username', e.target.value)}
                          placeholder="Ingresa tu código UTP"
                          className="pl-10 h-12"
                          required
                          aria-label="Ingresa tu código UTP"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Estudiantes: U1234567 | Admins: D1234567 | Seguridad: S001
                      </p>
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm mb-2">
                        Contraseña
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={loginForm.password}
                          onChange={(e) => handleLoginChange('password', e.target.value)}
                          placeholder="Ingresa tu contraseña"
                          className="pl-10 pr-10 h-12"
                          required
                          aria-label="Ingresa tu contraseña"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 p-2"
                          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={loginForm.rememberMe}
                          onChange={(e) => handleLoginChange('rememberMe', e.target.checked)}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                          aria-label="Recordar mi sesión"
                        />
                        <span className="text-sm">Recordarme</span>
                      </label>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.open('https://contrasena.utp.edu.pe/Recuperacion/OlvideMiClave.aspx', '_blank');
                        }}
                        className="text-primary text-sm hover:underline bg-transparent border-none cursor-pointer p-1"
                        aria-label="Recuperar contraseña olvidada"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-primary hover:bg-primary/90"
                      aria-label="Iniciar sesión en el sistema"
                    >
                      <LogIn className="h-5 w-5 mr-2" />
                      Iniciar Sesión
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Footer */}
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  © 2024 UTP+Report - Sistema de Seguridad Universitaria
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Botón SOS */}
        <SOSButton />
      </div>
    </>
  );
}