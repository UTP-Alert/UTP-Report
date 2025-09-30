import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { 
  User,
  Mail,
  Phone,
  Building,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  Users,
  UserCheck,
  MapPin,
  X,
  GraduationCap,
  BookOpen,
  Lock,
  Key
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string; // Agregar campo de contraseña
  role: 'admin' | 'security' | 'user';
  userType?: 'estudiante' | 'docente'; // Para distinguir entre estudiantes y docentes
  campus: string;
  assignedZones?: string[]; // Para personal de seguridad
  isActive: boolean;
  createdAt: string;
}

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const zonesByCampus = {
  'UTP Campus Principal': [
    'Biblioteca Central',
    'Cafetería Norte',
    'Cafetería Sur',
    'Estacionamiento Este',
    'Estacionamiento Oeste',
    'Estacionamiento Norte',
    'Laboratorios de Ingeniería',
    'Laboratorios de Informática',
    'Zona Deportiva',
    'Residencias Estudiantiles',
    'Auditorio Principal',
    'Edificio de Administración',
    'Centro de Estudiantes',
    'Paradas de Autobús',
    'Áreas Verdes',
    'Entrada Principal',
    'Edificio de Aulas'
  ],
  'UTP Sede Azuero': [
    'Biblioteca Azuero',
    'Cafetería Central Azuero',
    'Estacionamiento Principal Azuero',
    'Laboratorios Azuero',
    'Aulas Azuero',
    'Administración Azuero',
    'Entrada Azuero',
    'Área Recreativa Azuero'
  ],
  'UTP Sede Chiriquí': [
    'Biblioteca Chiriquí',
    'Cafetería Chiriquí',
    'Estacionamiento Chiriquí',
    'Laboratorios Chiriquí',
    'Aulas Chiriquí',
    'Administración Chiriquí',
    'Entrada Chiriquí',
    'Zona Verde Chiriquí'
  ]
};

export function UserManagementModal({ isOpen, onClose }: UserManagementModalProps) {
  const [users, setUsers] = React.useState<User[]>([
    {
      id: '1',
      name: 'Admin García',
      email: 'D2265445@utp.edu.pe',
      phone: '+507 6123-4567',
      password: 'admin123',
      role: 'admin',
      campus: 'UTP Campus Principal',
      isActive: true,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Juan Pérez',
      email: 'U2245645@utp.edu.pe',
      phone: '+507 6234-5678',
      password: 'juan123',
      role: 'user',
      userType: 'estudiante',
      campus: 'UTP Campus Principal',
      isActive: true,
      createdAt: '2024-02-01'
    },
    {
      id: '3',
      name: 'Carlos Mendoza',
      email: 'S001@utp.edu.pe',
      phone: '+507 6345-6789',
      password: 'security123',
      role: 'security',
      campus: 'UTP Campus Principal',
      assignedZones: ['Estacionamiento Este', 'Biblioteca Central', 'Laboratorios de Ingeniería'],
      isActive: true,
      createdAt: '2024-01-20'
    },
    {
      id: '4',
      name: 'Ana Rodríguez',
      email: 'S002@utp.edu.pe',
      phone: '+507 6456-7890',
      password: 'ana456',
      role: 'security',
      campus: 'UTP Campus Principal',
      assignedZones: ['Cafetería Norte', 'Zona Deportiva', 'Residencias Estudiantiles'],
      isActive: true,
      createdAt: '2024-01-25'
    },
    {
      id: '5',
      name: 'María García',
      email: 'U1533148@utp.edu.pe',
      phone: '+507 6567-8901',
      password: 'maria456',
      role: 'user',
      userType: 'estudiante',
      campus: 'UTP Campus Principal',
      isActive: true,
      createdAt: '2024-02-05'
    },
    {
      id: '6',
      name: 'Carlos Mendoza (Estudiante)',
      email: 'U3456789@utp.edu.pe',
      phone: '+507 6678-9012',
      password: 'carlos789',
      role: 'user',
      userType: 'estudiante',
      campus: 'UTP Campus Principal',
      isActive: true,
      createdAt: '2024-02-10'
    },
    {
      id: '7',
      name: 'Ana López',
      email: 'U4567890@utp.edu.pe',
      phone: '+507 6789-0123',
      password: 'ana321',
      role: 'user',
      userType: 'estudiante',
      campus: 'UTP Campus Principal',
      isActive: true,
      createdAt: '2024-02-15'
    },
    {
      id: '8',
      name: 'Dr. Luis Martínez',
      email: 'C54321@utp.edu.pe',
      phone: '+507 6890-1234',
      password: 'prof123',
      role: 'user',
      userType: 'docente',
      campus: 'UTP Campus Principal',
      isActive: true,
      createdAt: '2024-02-20'
    },
    {
      id: '9',
      name: 'Dra. Carmen López',
      email: 'C12345@utp.edu.pe',
      phone: '+507 6901-2345',
      password: 'doc456',
      role: 'user',
      userType: 'docente',
      campus: 'UTP Campus Principal',
      isActive: true,
      createdAt: '2024-02-25'
    },
    {
      id: '10',
      name: 'Ing. Roberto Silva',
      email: 'C98765@utp.edu.pe',
      phone: '+507 6012-3456',
      password: 'teach789',
      role: 'user',
      userType: 'docente',
      campus: 'UTP Sede Azuero',
      isActive: true,
      createdAt: '2024-03-01'
    }
  ]);

  const [isCreating, setIsCreating] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user' as 'admin' | 'security' | 'user',
    userType: 'estudiante' as 'estudiante' | 'docente',
    campus: 'UTP Campus Principal',
    assignedZones: [] as string[]
  });

  const availableZones = zonesByCampus[formData.campus as keyof typeof zonesByCampus] || [];

  const roleConfig = {
    admin: { 
      label: 'Administrador', 
      icon: Shield, 
      color: 'bg-red-500',
      description: 'Gestión completa del sistema'
    },
    security: { 
      label: 'Seguridad', 
      icon: UserCheck, 
      color: 'bg-green-500',
      description: 'Personal de seguridad'
    },
    user: { 
      label: 'Usuario', 
      icon: User, 
      color: 'bg-blue-500',
      description: 'Estudiante o docente'
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'user',
      userType: 'estudiante',
      campus: 'UTP Campus Principal',
      assignedZones: []
    });
    setIsCreating(false);
    setEditingUser(null);
  };

  // Resetear zonas asignadas cuando cambia el campus (para que las zonas sean del campus correcto)
  React.useEffect(() => {
    if (formData.role === 'security') {
      const currentCampusZones = zonesByCampus[formData.campus as keyof typeof zonesByCampus] || [];
      const validZones = formData.assignedZones.filter(zone => currentCampusZones.includes(zone));
      if (validZones.length !== formData.assignedZones.length) {
        setFormData(prev => ({ ...prev, assignedZones: validZones }));
      }
    }
  }, [formData.campus, formData.role]);

  const handleCreateUser = () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Nombre, email y contraseña son requeridos');
      return;
    }

    // Validar formato de email según el rol y tipo de usuario
    if (formData.role === 'user') {
      if (formData.userType === 'estudiante') {
        const studentEmailRegex = /^U\d{7}@utp\.edu\.pe$/;
        if (!studentEmailRegex.test(formData.email)) {
          toast.error('Para estudiantes, el email debe tener el formato: U1234567@utp.edu.pe');
          return;
        }
      } else if (formData.userType === 'docente') {
        const teacherEmailRegex = /^C\d{5}@utp\.edu\.pe$/;
        if (!teacherEmailRegex.test(formData.email)) {
          toast.error('Para docentes, el email debe tener el formato: C54321@utp.edu.pe');
          return;
        }
      }
    } else if (formData.role === 'admin') {
      const adminEmailRegex = /^D\d{7}@utp\.edu\.pe$/;
      if (!adminEmailRegex.test(formData.email)) {
        toast.error('Para administradores, el email debe tener el formato: D1234567@utp.edu.pe');
        return;
      }
    } else if (formData.role === 'security') {
      const securityEmailRegex = /^S\d{3}@utp\.edu\.pe$/;
      if (!securityEmailRegex.test(formData.email)) {
        toast.error('Para seguridad, el email debe tener el formato: S001@utp.edu.pe');
        return;
      }
    }

    // Validar que personal de seguridad tenga al menos una zona asignada
    if (formData.role === 'security' && formData.assignedZones.length === 0) {
      toast.error('El personal de seguridad debe tener al menos una zona asignada');
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      ...formData,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUsers(prev => [...prev, newUser]);
    resetForm();
    toast.success(`Usuario ${newUser.name} creado exitosamente`);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: user.password || '',
      role: user.role,
      userType: user.userType || 'estudiante',
      campus: user.campus,
      assignedZones: user.assignedZones || []
    });
  };

  const handleAddZone = (zone: string) => {
    if (!formData.assignedZones.includes(zone)) {
      setFormData(prev => ({
        ...prev,
        assignedZones: [...prev.assignedZones, zone]
      }));
    }
  };

  const handleRemoveZone = (zone: string) => {
    setFormData(prev => ({
      ...prev,
      assignedZones: prev.assignedZones.filter(z => z !== zone)
    }));
  };

  const handleUpdateUser = () => {
    if (!editingUser || !formData.name || !formData.email) {
      toast.error('Datos incompletos');
      return;
    }

    // Validar formato de email según el rol y tipo de usuario
    if (formData.role === 'user') {
      if (formData.userType === 'estudiante') {
        const studentEmailRegex = /^U\d{7}@utp\.edu\.pe$/;
        if (!studentEmailRegex.test(formData.email)) {
          toast.error('Para estudiantes, el email debe tener el formato: U1234567@utp.edu.pe');
          return;
        }
      } else if (formData.userType === 'docente') {
        const teacherEmailRegex = /^C\d{5}@utp\.edu\.pe$/;
        if (!teacherEmailRegex.test(formData.email)) {
          toast.error('Para docentes, el email debe tener el formato: C54321@utp.edu.pe');
          return;
        }
      }
    } else if (formData.role === 'admin') {
      const adminEmailRegex = /^D\d{7}@utp\.edu\.pe$/;
      if (!adminEmailRegex.test(formData.email)) {
        toast.error('Para administradores, el email debe tener el formato: D1234567@utp.edu.pe');
        return;
      }
    } else if (formData.role === 'security') {
      const securityEmailRegex = /^S\d{3}@utp\.edu\.pe$/;
      if (!securityEmailRegex.test(formData.email)) {
        toast.error('Para seguridad, el email debe tener el formato: S001@utp.edu.pe');
        return;
      }
    }

    // Validar que personal de seguridad tenga al menos una zona asignada
    if (formData.role === 'security' && formData.assignedZones.length === 0) {
      toast.error('El personal de seguridad debe tener al menos una zona asignada');
      return;
    }

    setUsers(prev => prev.map(user => 
      user.id === editingUser.id 
        ? { ...user, ...formData }
        : user
    ));
    resetForm();
    toast.success(`Usuario ${formData.name} actualizado exitosamente`);
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast.success(`Usuario ${user.name} eliminado`);
    }
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, isActive: !user.isActive }
        : user
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            Gestión de Usuarios del Sistema
          </DialogTitle>
          <DialogDescription>
            Crear, editar y gestionar usuarios con diferentes roles en el sistema UTP+Report
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-xl">{users.filter(u => u.role === 'user' && u.userType === 'estudiante').length}</p>
                    <p className="text-xs text-gray-600">Estudiantes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                  <div>
                    <p className="text-xl">{users.filter(u => u.role === 'user' && u.userType === 'docente').length}</p>
                    <p className="text-xs text-gray-600">Docentes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-red-600" />
                  <div>
                    <p className="text-xl">{users.filter(u => u.role === 'admin').length}</p>
                    <p className="text-xs text-gray-600">Administradores</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <UserCheck className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-xl">{users.filter(u => u.role === 'security').length}</p>
                    <p className="text-xs text-gray-600">Personal Seguridad</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-gray-600" />
                  <div>
                    <p className="text-xl">{users.filter(u => u.isActive).length}</p>
                    <p className="text-xs text-gray-600">Usuarios Activos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Create/Edit Form */}
          <Card className="border-primary bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">
                  {editingUser ? 'Editar Usuario' : isCreating ? 'Crear Nuevo Usuario' : 'Gestión de Usuarios'}
                </h3>
                {!isCreating && !editingUser && (
                  <Button
                    onClick={() => setIsCreating(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Crear Usuario
                  </Button>
                )}
              </div>

              {(isCreating || editingUser) && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre Completo</label>
                    <Input
                      placeholder="Ej: Juan Pérez"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                      type="email"
                      placeholder={
                        formData.role === 'user' ? (
                          formData.userType === 'estudiante' ? 'U1234567@utp.edu.pe' : 'C54321@utp.edu.pe'
                        ) : 
                        formData.role === 'admin' ? 'D1234567@utp.edu.pe' :
                        formData.role === 'security' ? 'S001@utp.edu.pe' : 
                        'usuario@utp.edu.pe'
                      }
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                    {formData.role === 'user' && formData.userType === 'estudiante' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Para estudiantes: usar código UTP (Ej: U1234567@utp.edu.pe)
                      </p>
                    )}
                    {formData.role === 'user' && formData.userType === 'docente' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Para docentes: usar código UTP (Ej: C54321@utp.edu.pe)
                      </p>
                    )}
                    {formData.role === 'admin' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Para administradores: usar código personal (Ej: D1234567@utp.edu.pe)
                      </p>
                    )}
                    {formData.role === 'security' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Para seguridad: usar código de empleado (Ej: S001@utp.edu.pe)
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Contraseña</label>
                    <Input
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {editingUser ? 'Dejar en blanco para mantener contraseña actual' : 'Contraseña para acceder al sistema'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Teléfono</label>
                    <Input
                      placeholder="+507 6000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Rol</label>
                    <Select value={formData.role} onValueChange={(value) => {
                      setFormData(prev => ({ 
                        ...prev, 
                        role: value as any,
                        assignedZones: value !== 'security' ? [] : prev.assignedZones
                      }));
                    }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(roleConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <config.icon className="h-4 w-4" />
                              {config.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Tipo de Usuario - Solo para rol User */}
                  {formData.role === 'user' && (
                    <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg">
                      <label className="block text-sm font-medium mb-2 text-blue-800 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        👥 Tipo de Usuario (OBLIGATORIO)
                      </label>
                      <Select value={formData.userType} onValueChange={(value) => setFormData(prev => ({ ...prev, userType: value as 'estudiante' | 'docente' }))}>
                        <SelectTrigger className="border-blue-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="estudiante">
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-blue-600" />
                              <span>👨‍🎓 Estudiante</span>
                              <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-700">U1234567</Badge>
                            </div>
                          </SelectItem>
                          <SelectItem value="docente">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-purple-600" />
                              <span>👨‍🏫 Docente</span>
                              <Badge variant="outline" className="ml-2 bg-purple-100 text-purple-700">C54321</Badge>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-blue-600 mt-2">
                        ℹ️ Selecciona si es estudiante o docente para determinar el formato del código UTP
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1">Campus</label>
                    <Select value={formData.campus} onValueChange={(value) => setFormData(prev => ({ ...prev, campus: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTP Campus Principal">UTP Campus Principal</SelectItem>
                        <SelectItem value="UTP Sede Azuero">UTP Sede Azuero</SelectItem>
                        <SelectItem value="UTP Sede Chiriquí">UTP Sede Chiriquí</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Zonas Asignadas - Solo para rol Security */}
                  {formData.role === 'security' && (
                    <div className="md:col-span-3 border-t-2 border-primary pt-6 mt-4 bg-green-50 p-4 rounded-lg">
                      <label className="block text-lg font-medium mb-4 flex items-center gap-2 text-green-800">
                        <MapPin className="h-5 w-5 text-green-600" />
                        🗺️ Zonas Designadas para Patrullaje (OBLIGATORIO)
                      </label>
                      
                      <div className="space-y-3">
                        {/* Alerta cuando no hay zonas asignadas */}
                        {formData.assignedZones.length === 0 && (
                          <div className="bg-red-50 border-2 border-red-200 p-4 rounded-lg">
                            <div className="flex items-center gap-2 text-red-800 mb-2">
                              <MapPin className="h-5 w-5" />
                              <span className="font-medium">🚨 SIN ZONAS ASIGNADAS</span>
                            </div>
                            <p className="text-sm text-red-700">
                              Debes asignar al menos una zona antes de poder crear este usuario de seguridad.
                            </p>
                          </div>
                        )}
                        
                        {/* Zonas actualmente asignadas */}
                        {formData.assignedZones.length > 0 && (
                          <div className="bg-green-50 border-2 border-green-200 p-3 rounded-lg">
                            <p className="text-sm font-medium text-green-800 mb-2 flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              ✅ Zonas asignadas ({formData.assignedZones.length}):
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {formData.assignedZones.map((zone) => (
                                <Badge key={zone} variant="outline" className="pr-1 bg-white border-green-300">
                                  {zone}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveZone(zone)}
                                    className="ml-2 h-4 w-4 p-0 hover:bg-red-100"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Selector para agregar zonas */}
                        <div>
                          <p className="text-sm font-medium text-green-800 mb-2 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Agregar zona del campus:
                          </p>
                          <Select onValueChange={handleAddZone}>
                            <SelectTrigger className={`border-2 ${formData.assignedZones.length === 0 ? 'border-red-300 bg-red-50' : 'border-green-300'}`}>
                              <SelectValue placeholder={formData.assignedZones.length === 0 ? "🚨 SELECCIONAR ZONA OBLIGATORIA" : "Seleccionar zona adicional"} />
                            </SelectTrigger>
                            <SelectContent>
                              {availableZones
                                .filter(zone => !formData.assignedZones.includes(zone))
                                .map((zone) => (
                                  <SelectItem key={zone} value={zone}>
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4" />
                                      {zone}
                                    </div>
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <strong>⚠️ IMPORTANTE:</strong> Las zonas asignadas determinan en qué áreas del campus 
                            este oficial de seguridad puede patrullar y recibir asignaciones de reportes. 
                            <strong>Se requiere al menos una zona para crear un usuario de seguridad.</strong>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="md:col-span-2 lg:col-span-3 flex items-center gap-2 pt-4">
                    <Button
                      onClick={editingUser ? handleUpdateUser : handleCreateUser}
                      className="bg-primary hover:bg-primary/90 flex-1"
                      disabled={formData.role === 'security' && formData.assignedZones.length === 0}
                    >
                      <Key className="h-4 w-4 mr-2" />
                      {editingUser ? 'Actualizar Usuario' : 'Crear Usuario'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={resetForm}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Users List */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Lista de Usuarios ({users.length})</h3>
              <div className="space-y-3">
                {users.map((user) => {
                  const roleInfo = roleConfig[user.role];
                  const RoleIcon = roleInfo.icon;
                  
                  return (
                    <div key={user.id} className={`p-4 border rounded-lg ${user.isActive ? 'border-gray-200' : 'border-gray-300 bg-gray-50'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full ${roleInfo.color} flex items-center justify-center`}>
                            <RoleIcon className="h-5 w-5 text-white" />
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-3">
                              <h4 className="font-medium">{user.name}</h4>
                              <Badge className={user.isActive ? 'bg-green-500' : 'bg-gray-500'}>
                                {user.isActive ? 'Activo' : 'Inactivo'}
                              </Badge>
                              <Badge variant="outline">{roleInfo.label}</Badge>
                              {/* Badge para tipo de usuario (estudiante/docente) */}
                              {user.role === 'user' && user.userType && (
                                <Badge 
                                  variant="outline" 
                                  className={user.userType === 'estudiante' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}
                                >
                                  {user.userType === 'estudiante' ? (
                                    <><GraduationCap className="h-3 w-3 mr-1" /> Estudiante</>
                                  ) : (
                                    <><BookOpen className="h-3 w-3 mr-1" /> Docente</>
                                  )}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </div>
                              {user.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {user.phone}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                {user.campus}
                              </div>
                              {user.password && (
                                <div className="flex items-center gap-1">
                                  <Lock className="h-3 w-3" />
                                  Contraseña configurada
                                </div>
                              )}
                            </div>
                            
                            {/* Mostrar zonas asignadas para personal de seguridad */}
                            {user.role === 'security' && user.assignedZones && (
                              <div className="mt-2">
                                {user.assignedZones.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    <span className="text-xs text-green-700 font-medium">Zonas:</span>
                                    {user.assignedZones.map((zone) => (
                                      <Badge key={zone} variant="secondary" className="text-xs bg-green-100 text-green-800">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        {zone}
                                      </Badge>
                                    ))}
                                  </div>
                                ) : (
                                  <Badge variant="destructive" className="text-xs">
                                    🚨 Sin zonas asignadas
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleUserStatus(user.id)}
                            className={user.isActive ? 'text-orange-600' : 'text-green-600'}
                          >
                            {user.isActive ? 'Desactivar' : 'Activar'}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}