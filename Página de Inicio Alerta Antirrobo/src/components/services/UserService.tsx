import React from 'react';

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: 'admin' | 'security' | 'user' | 'superuser';
  userType?: 'estudiante' | 'docente';
  campus: string;
  assignedZones?: string[]; // Para personal de seguridad
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  permissions?: string[];
}

interface UserServiceContext {
  users: SystemUser[];
  addUser: (userData: Omit<SystemUser, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<SystemUser>) => void;
  deleteUser: (id: string) => boolean;
  toggleUserStatus: (id: string) => boolean;
  getUserByEmail: (email: string) => SystemUser | undefined;
  getUsersByRole: (role: SystemUser['role']) => SystemUser[];
  getSecurityPersonnel: () => SystemUser[]; // Función específica para obtener personal de seguridad activo
  getTotalUsers: () => number;
  getActiveUsers: () => number;
}

const UserServiceContext = React.createContext<UserServiceContext | undefined>(undefined);

export function UserServiceProvider({ children }: { children: React.ReactNode }) {
  // Usuarios demo para demostración del sistema - Una credencial por rol
  const [users, setUsers] = React.useState<SystemUser[]>([
    {
      id: 'superuser',
      name: 'Carlos Administrador del Sistema',
      email: 'admin.sistema@utp.edu.pe',
      phone: '+51 999-888-777',
      password: 'UTP2024*',
      role: 'superuser',
      campus: 'UTP Campus Principal',
      isActive: true,
      createdAt: '2024-01-01',
      lastLogin: '2024-12-17 12:00',
      permissions: ['system_control', 'manage_all', 'sensitive_access']
    },
    {
      id: 'admin_demo',
      name: 'Admin García',
      email: 'D1234567@utp.edu.pe',
      phone: '+51 987-123-456',
      password: 'admin123',
      role: 'admin',
      campus: 'UTP Campus Principal',
      isActive: true,
      createdAt: '2024-01-10',
      lastLogin: '2024-12-17 10:15',
      permissions: ['manage_reports', 'assign_security', 'view_analytics']
    },
    {
      id: 'security_demo',
      name: 'Oficial Seguridad',
      email: 'S001@utp.edu.pe',
      phone: '+51 987-654-321',
      password: 'seguridad123',
      role: 'security',
      campus: 'UTP Campus Principal',
      assignedZones: ['Biblioteca Central', 'Cafetería Norte', 'Estacionamiento Este'],
      isActive: true,
      createdAt: '2024-01-15',
      lastLogin: '2024-12-17 08:30',
      permissions: ['receive_assignments', 'update_status']
    },
    {
      id: 'user_demo',
      name: 'Juan Pérez',
      email: 'U1234567@utp.edu.pe',
      phone: '+51 987-456-789',
      password: 'estudiante123',
      role: 'user',
      userType: 'estudiante',
      campus: 'UTP Campus Principal',
      isActive: true,
      createdAt: '2024-01-20',
      lastLogin: '2024-12-17 14:20',
      permissions: ['create_reports', 'view_own_reports']
    }
  ]);

  const addUser = React.useCallback((userData: Omit<SystemUser, 'id' | 'createdAt'>) => {
    const newUser: SystemUser = {
      ...userData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setUsers(prev => [...prev, newUser]);
  }, []);

  const updateUser = React.useCallback((id: string, updates: Partial<SystemUser>) => {
    setUsers(prev => 
      prev.map(user => 
        user.id === id 
          ? { ...user, ...updates }
          : user
      )
    );
  }, []);

  const deleteUser = React.useCallback((id: string) => {
    // No permitir eliminar el superusuario
    if (id === 'superuser') {
      return false;
    }
    
    setUsers(prev => prev.filter(user => user.id !== id));
    return true;
  }, []);

  const toggleUserStatus = React.useCallback((id: string) => {
    // No permitir desactivar el superusuario
    if (id === 'superuser') {
      return false;
    }
    
    setUsers(prev => 
      prev.map(user => 
        user.id === id 
          ? { ...user, isActive: !user.isActive }
          : user
      )
    );
    return true;
  }, []);

  const getUserByEmail = React.useCallback((email: string) => {
    return users.find(user => user.email === email);
  }, [users]);

  const getUsersByRole = React.useCallback((role: SystemUser['role']) => {
    return users.filter(user => user.role === role);
  }, [users]);

  // Función específica para obtener personal de seguridad ACTIVO con zonas asignadas
  const getSecurityPersonnel = React.useCallback(() => {
    return users.filter(user => 
      user.role === 'security' && 
      user.isActive && 
      user.assignedZones && 
      user.assignedZones.length > 0
    );
  }, [users]);

  const getTotalUsers = React.useCallback(() => {
    return users.length;
  }, [users]);

  const getActiveUsers = React.useCallback(() => {
    return users.filter(user => user.isActive).length;
  }, [users]);

  const value = {
    users,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    getUserByEmail,
    getUsersByRole,
    getSecurityPersonnel,
    getTotalUsers,
    getActiveUsers
  };

  return (
    <UserServiceContext.Provider value={value}>
      {children}
    </UserServiceContext.Provider>
  );
}

export function useUserService() {
  const context = React.useContext(UserServiceContext);
  if (context === undefined) {
    throw new Error('useUserService must be used within a UserServiceProvider');
  }
  return context;
}