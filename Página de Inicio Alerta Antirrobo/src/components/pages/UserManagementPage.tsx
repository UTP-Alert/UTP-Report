import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Users,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  UserCheck,
  User,
  Mail,
  Phone,
  Building,
  Crown,
  Search,
  Filter,
  Eye,
  EyeOff,
  MapPin,
  X,
  GraduationCap,
  BookOpen,
  Lock,
  Key
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useUserService, SystemUser } from '../services/UserService';
import { useSystemConfig } from '../services/SystemConfigService';

interface UserWithPassword extends SystemUser {
  password?: string;
  userType?: 'estudiante' | 'docente';
  assignedZones?: string[];
}

export function UserManagementPage() {
  const { 
    users, 
    addUser, 
    updateUser, 
    deleteUser, 
    toggleUserStatus, 
    getUsersByRole, 
    getTotalUsers, 
    getActiveUsers 
  } = useUserService();
  
  const { systemConfig } = useSystemConfig();

  // Obtener sedes y zonas del SystemConfig
  const availableSedes = systemConfig?.sedes?.filter(sede => sede.isActive) || [];
  const zonesBySede = availableSedes.reduce((acc, sede) => {
    acc[sede.name] = sede.zones.filter(zone => zone.isActive).map(zone => zone.name);
    return acc;
  }, {} as Record<string, string[]>);

  // Filter out superuser from the regular user management view
  const regularUsers = users?.filter(user => user.role !== 'superuser') || [];
  
  const [isCreating, setIsCreating] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<UserWithPassword | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');
  
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user' as 'admin' | 'security' | 'user',
    userType: 'estudiante' as 'estudiante' | 'docente',
    campus: availableSedes.length > 0 ? availableSedes[0].name : '',
    assignedZones: [] as string[]
  });

  const availableZones = zonesBySede[formData.campus as keyof typeof zonesBySede] || [];

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

  // Filter users based on search and filters
  const filteredUsers = regularUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = !statusFilter || statusFilter === 'all' || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'user',
      userType: 'estudiante',
      campus: availableSedes.length > 0 ? availableSedes[0].name : '',
      assignedZones: []
    });
    setIsCreating(false);
    setEditingUser(null);
  };

  // Resetear zonas asignadas cuando cambia el campus
  React.useEffect(() => {
    if (formData.role === 'security') {
      const currentSedeZones = zonesBySede[formData.campus as keyof typeof zonesBySede] || [];
      const validZones = formData.assignedZones.filter(zone => currentSedeZones.includes(zone));
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

    // Determinar permisos basados en el rol
    const getPermissionsByRole = (role: string) => {
      switch (role) {
        case 'admin':
          return ['manage_reports', 'assign_security', 'view_analytics'];
        case 'security':
          return ['receive_assignments', 'update_status'];
        case 'user':
          return ['view_reports', 'create_reports'];
        default:
          return ['view_reports'];
      }
    };

    addUser({
      ...formData,
      isActive: true,
      permissions: getPermissionsByRole(formData.role)
    });
    resetForm();
    toast.success(`Usuario ${formData.name} creado exitosamente`);
  };

  const handleEditUser = (user: SystemUser) => {
    const userWithPassword = user as UserWithPassword;
    setEditingUser(userWithPassword);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: userWithPassword.password || '',
      role: user.role as 'admin' | 'security' | 'user',
      userType: userWithPassword.userType || 'estudiante',
      campus: user.campus,
      assignedZones: userWithPassword.assignedZones || []
    });
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

    updateUser(editingUser.id, formData);
    resetForm();
    toast.success(`Usuario ${formData.name} actualizado exitosamente`);
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user && deleteUser(userId)) {
      toast.success(`Usuario ${user.name} eliminado`);
    } else {
      toast.error('No se pudo eliminar el usuario');
    }
  };

  const handleToggleUserStatus = (userId: string) => {
    if (toggleUserStatus(userId)) {
      const user = users.find(u => u.id === userId);
      toast.success(`Usuario ${user?.name} ${user?.isActive ? 'desactivado' : 'activado'}`);
    } else {
      toast.error('No se pudo cambiar el estado del usuario');
    }
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

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Alert className="border-primary bg-red-50">
            <Crown className="h-6 w-6 text-primary" />
            <AlertDescription className="text-lg">
              <strong>Gestión de Usuarios</strong> - Panel exclusivo del SuperAdmin para administrar todos los usuarios del sistema UTP+Report.
            </AlertDescription>
          </Alert>
        </div>

        {/* Stats Overview */}
        <section className="mb-8">
          <h1 className="text-3xl mb-6 flex items-center gap-3">
            <Users className="h-10 w-10 text-primary" />
            Gestión de Usuarios del Sistema
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-2xl">{users?.filter(u => u.role === 'user' && (u as any).userType === 'estudiante').length || 0}</p>
                    <p className="text-sm text-gray-600">Estudiantes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                  <div>
                    <p className="text-2xl">{users?.filter(u => u.role === 'user' && (u as any).userType === 'docente').length || 0}</p>
                    <p className="text-sm text-gray-600">Docentes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-red-600" />
                  <div>
                    <p className="text-2xl">{getUsersByRole('admin').length}</p>
                    <p className="text-sm text-gray-600">Administradores</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <UserCheck className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-2xl">{getUsersByRole('security').length}</p>
                    <p className="text-sm text-gray-600">Personal Seguridad</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-gray-600" />
                  <div>
                    <p className="text-2xl">{getActiveUsers()}</p>
                    <p className="text-sm text-gray-600">Usuarios Activos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-4 items-center flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar usuarios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los roles</SelectItem>
                    <SelectItem value="admin">Administradores</SelectItem>
                    <SelectItem value="security">Seguridad</SelectItem>
                    <SelectItem value="user">Usuarios</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="active">Activos</SelectItem>
                    <SelectItem value="inactive">Inactivos</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={clearFilters}>
                  Limpiar Filtros
                </Button>
              </div>

              <Button 
                onClick={() => setIsCreating(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Crear Usuario
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Create/Edit Form */}
        {(isCreating || editingUser) && (
          <Card className="border-primary bg-red-50 mb-6">
            <CardHeader>
              <CardTitle>
                {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    placeholder="+51 999-000-000"
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
                  <label className="block text-sm font-medium mb-1">Sede</label>
                  <Select value={formData.campus} onValueChange={(value) => setFormData(prev => ({ ...prev, campus: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSedes.length > 0 ? (
                        availableSedes.map((sede) => (
                          <SelectItem key={sede.id} value={sede.name}>
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              {sede.name}
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          No hay sedes disponibles
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Zonas Asignadas - Solo para rol Security */}
              {formData.role === 'security' && (
                <div className="border-t-2 border-primary pt-6 mt-4 bg-green-50 p-4 rounded-lg">
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
                        Agregar zona de la sede:
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
                                  <MapPin className="h-4 w-4 text-green-600" />
                                  {zone}
                                </div>
                              </SelectItem>
                            ))}
                          {availableZones.filter(zone => !formData.assignedZones.includes(zone)).length === 0 && (
                            <SelectItem value="" disabled>
                              Todas las zonas ya están asignadas
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button 
                  onClick={editingUser ? handleUpdateUser : handleCreateUser}
                  className="bg-primary hover:bg-primary/90"
                >
                  {editingUser ? 'Actualizar Usuario' : 'Crear Usuario'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              Lista de Usuarios ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user) => {
                const RoleIcon = roleConfig[user.role as keyof typeof roleConfig]?.icon || User;
                return (
                  <Card key={user.id} className={`border-2 ${user.isActive ? 'border-green-200' : 'border-gray-200'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${roleConfig[user.role as keyof typeof roleConfig]?.color || 'bg-gray-500'}`}>
                            <RoleIcon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium text-lg">{user.name}</h3>
                            <p className="text-gray-600">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary">
                                {roleConfig[user.role as keyof typeof roleConfig]?.label || user.role}
                              </Badge>
                              <Badge className={user.isActive ? 'bg-green-500' : 'bg-gray-500'}>
                                {user.isActive ? 'Activo' : 'Inactivo'}
                              </Badge>
                              {user.campus && (
                                <Badge variant="outline">
                                  <Building className="h-3 w-3 mr-1" />
                                  {user.campus}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleUserStatus(user.id)}
                            className={user.isActive ? "text-orange-600" : "text-green-600"}
                          >
                            {user.isActive ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                            {user.isActive ? 'Desactivar' : 'Activar'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No se encontraron usuarios con los filtros aplicados</p>
                  <Button variant="outline" onClick={clearFilters} className="mt-4">
                    Limpiar Filtros
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}