import React from 'react';

interface SystemConfig {
  enabledPages: string[];
  sedes: Sede[];
  userRoles: UserRole[];
  incidentTypes: IncidentType[];
  siteName: string;
  primaryColor: string;
  secondaryColor: string;
}

interface Sede {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
  zones: Zone[];
}

interface Zone {
  id: string;
  name: string;
  isActive: boolean;
  description?: string;
  imageUrl?: string;
}

interface UserRole {
  id: string;
  name: string;
  permissions: string[];
  isActive: boolean;
}

interface IncidentType {
  id: string;
  name: string;
  description: string;
  icon: string;
  isEnabled: boolean;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface SystemConfigContextType {
  systemConfig: SystemConfig;
  updateSystemConfig: (updates: Partial<SystemConfig>) => void;
  isPageEnabled: (pageId: string) => boolean;
  getEnabledPages: () => string[];
  saveChanges: () => void;
  hasUnsavedChanges: boolean;
  addSede: (sede: Omit<Sede, 'id'>) => void;
  updateSede: (sedeId: string, updates: Partial<Sede>) => void;
  deleteSede: (sedeId: string) => void;
  addZone: (sedeId: string, zone: Omit<Zone, 'id'>) => void;
  updateZone: (sedeId: string, zoneId: string, updates: Partial<Zone>) => void;
  deleteZone: (sedeId: string, zoneId: string) => void;
  addIncidentType: (incidentType: Omit<IncidentType, 'id'>) => void;
  updateIncidentType: (incidentTypeId: string, updates: Partial<IncidentType>) => void;
  deleteIncidentType: (incidentTypeId: string) => void;
  getEnabledIncidentTypes: () => IncidentType[];
}

const SystemConfigContext = React.createContext<SystemConfigContextType | undefined>(undefined);

// Configuración inicial del sistema
const initialSystemConfig: SystemConfig = {
  siteName: 'UTP+Report',
  primaryColor: '#FF395C',
  secondaryColor: '#000000',
  enabledPages: ['inicio', 'zonas', 'guia', 'reportes'],
  sedes: [
    {
      id: 'utp-main',
      name: 'UTP Campus Principal',
      address: 'Vía Tocumen, Panamá',
      isActive: true,
      zones: [
        { 
          id: 'campus-principal', 
          name: 'Campus Principal', 
          isActive: true,
          description: 'Zona central del campus con alta vigilancia y buena iluminación.',
          imageUrl: 'https://images.unsplash.com/photo-1672912995257-0c8255289523?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzJTIwYWVyaWFsJTIwdmlld3xlbnwxfHx8fDE3NTgxMjc4NTN8MA&ixlib=rb-4.1.0&q=80&w=1080'
        },
        { 
          id: 'biblioteca', 
          name: 'Biblioteca Central', 
          isActive: true,
          description: 'Biblioteca principal del campus con múltiples salas de estudio.',
          imageUrl: 'https://images.unsplash.com/photo-1562529163-2cded489cc9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwbGlicmFyeSUyMGludGVyaW9yfGVufDF8fHx8MTc1ODE0NDA0Mnww&ixlib=rb-4.1.0&q=80&w=1080'
        },
        { 
          id: 'cafeteria', 
          name: 'Cafetería Norte', 
          isActive: true,
          description: 'Área bien transitada con personal de seguridad presente.',
          imageUrl: 'https://images.unsplash.com/photo-1744168222850-85b5e5e9aa24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FmZXRlcmlhJTIwZGluaW5nfGVufDF8fHx8MTc1ODE4MDIwMnww&ixlib=rb-4.1.0&q=80&w=1080'
        },
        { 
          id: 'estacionamiento', 
          name: 'Estacionamiento Este', 
          isActive: true,
          description: 'Estacionamiento principal del campus con cámaras de seguridad.',
          imageUrl: 'https://images.unsplash.com/photo-1719466162744-eb03048346e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwcGFya2luZyUyMGxvdHxlbnwxfHx8fDE3NTgyMzc4NzF8MA&ixlib=rb-4.1.0&q=80&w=1080'
        },
        { 
          id: 'laboratorios', 
          name: 'Laboratorios', 
          isActive: true,
          description: 'Acceso controlado con tarjetas estudiantiles.',
          imageUrl: 'https://images.unsplash.com/photo-1562411403-f583472c8e87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwbGFib3JhdG9yeSUyMHNjaWVuY2V8ZW58MXx8fHwxNzU4MTg1MDYzfDA&ixlib=rb-4.1.0&q=80&w=1080'
        },
        { 
          id: 'deportiva', 
          name: 'Zona Deportiva', 
          isActive: true,
          description: 'Complejo deportivo con vestidores y canchas.',
          imageUrl: 'https://images.unsplash.com/photo-1754878206374-f78eac63ff29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwc3BvcnRzJTIwZmFjaWxpdGllc3xlbnwxfHx8fDE3NTgyMTQ2MjN8MA&ixlib=rb-4.1.0&q=80&w=1080'
        }
      ]
    }
  ],
  userRoles: [
    { id: 'user', name: 'Usuario/Alumno', permissions: ['view_reports', 'create_reports'], isActive: true },
    { id: 'admin', name: 'Administrador', permissions: ['manage_reports', 'assign_security', 'view_analytics'], isActive: true },
    { id: 'security', name: 'Seguridad', permissions: ['receive_assignments', 'update_status'], isActive: true },
    { id: 'superuser', name: 'Superusuario', permissions: ['system_control', 'manage_all'], isActive: true }
  ],
  incidentTypes: [
    { 
      id: 'robo', 
      name: 'Robo', 
      description: 'Sustracción de pertenencias con o sin violencia',
      icon: '🔴', 
      isEnabled: true, 
      category: 'delito', 
      priority: 'critical' 
    },
    { 
      id: 'intento_robo', 
      name: 'Intento de Robo', 
      description: 'Intento de sustracción que no se completó',
      icon: '🟠', 
      isEnabled: true, 
      category: 'delito', 
      priority: 'high' 
    },
    { 
      id: 'sospechoso', 
      name: 'Actividad Sospechosa', 
      description: 'Comportamiento inusual o sospechoso de personas',
      icon: '🟡', 
      isEnabled: true, 
      category: 'seguridad', 
      priority: 'medium' 
    },
    { 
      id: 'acoso', 
      name: 'Acoso o Intimidación', 
      description: 'Comportamiento de acoso hacia estudiantes',
      icon: '🔴', 
      isEnabled: true, 
      category: 'delito', 
      priority: 'critical' 
    },
    { 
      id: 'vandalismo', 
      name: 'Vandalismo', 
      description: 'Daño a propiedad universitaria o personal',
      icon: '🟠', 
      isEnabled: true, 
      category: 'daños', 
      priority: 'medium' 
    },
    { 
      id: 'emergencia', 
      name: 'Emergencia Médica', 
      description: 'Situación médica que requiere atención inmediata',
      icon: '🔴', 
      isEnabled: true, 
      category: 'emergencia', 
      priority: 'critical' 
    },
    { 
      id: 'otro', 
      name: 'Otro Incidente', 
      description: 'Incidente no clasificado en otras categorías',
      icon: '🔵', 
      isEnabled: true, 
      category: 'general', 
      priority: 'low' 
    }
  ]
};

export function SystemConfigServiceProvider({ children }: { children: React.ReactNode }) {
  const [systemConfig, setSystemConfig] = React.useState<SystemConfig>(() => {
    // Intentar cargar configuración guardada
    try {
      const saved = localStorage.getItem('utp-system-config');
      return saved ? JSON.parse(saved) : initialSystemConfig;
    } catch {
      return initialSystemConfig;
    }
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  const updateSystemConfig = React.useCallback((updates: Partial<SystemConfig>) => {
    setSystemConfig(prev => {
      const newConfig = { ...prev, ...updates };
      return newConfig;
    });
    setHasUnsavedChanges(true);
  }, []);

  const saveChanges = React.useCallback(() => {
    try {
      localStorage.setItem('utp-system-config', JSON.stringify(systemConfig));
      setHasUnsavedChanges(false);
      console.log('Sistema guardado:', systemConfig);
    } catch (error) {
      console.error('Error al guardar configuración:', error);
    }
  }, [systemConfig]);

  const isPageEnabled = React.useCallback((pageId: string) => {
    return systemConfig.enabledPages.includes(pageId);
  }, [systemConfig.enabledPages]);

  const getEnabledPages = React.useCallback(() => {
    return systemConfig.enabledPages;
  }, [systemConfig.enabledPages]);

  const addSede = React.useCallback((sede: Omit<Sede, 'id'>) => {
    const newSede: Sede = {
      ...sede,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };
    setSystemConfig(prev => ({
      ...prev,
      sedes: [...prev.sedes, newSede]
    }));
    setHasUnsavedChanges(true);
  }, []);

  const updateSede = React.useCallback((sedeId: string, updates: Partial<Sede>) => {
    setSystemConfig(prev => ({
      ...prev,
      sedes: prev.sedes.map(sede =>
        sede.id === sedeId ? { ...sede, ...updates } : sede
      )
    }));
    setHasUnsavedChanges(true);
  }, []);

  const deleteSede = React.useCallback((sedeId: string) => {
    setSystemConfig(prev => ({
      ...prev,
      sedes: prev.sedes.filter(sede => sede.id !== sedeId)
    }));
    setHasUnsavedChanges(true);
  }, []);

  const addZone = React.useCallback((sedeId: string, zone: Omit<Zone, 'id'>) => {
    const newZone: Zone = {
      ...zone,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };
    setSystemConfig(prev => ({
      ...prev,
      sedes: prev.sedes.map(sede =>
        sede.id === sedeId
          ? { ...sede, zones: [...sede.zones, newZone] }
          : sede
      )
    }));
    setHasUnsavedChanges(true);
  }, []);

  const updateZone = React.useCallback((sedeId: string, zoneId: string, updates: Partial<Zone>) => {
    setSystemConfig(prev => ({
      ...prev,
      sedes: prev.sedes.map(sede =>
        sede.id === sedeId
          ? {
              ...sede,
              zones: sede.zones.map(zone =>
                zone.id === zoneId ? { ...zone, ...updates } : zone
              )
            }
          : sede
      )
    }));
    setHasUnsavedChanges(true);
  }, []);

  const deleteZone = React.useCallback((sedeId: string, zoneId: string) => {
    setSystemConfig(prev => ({
      ...prev,
      sedes: prev.sedes.map(sede =>
        sede.id === sedeId
          ? {
              ...sede,
              zones: sede.zones.filter(zone => zone.id !== zoneId)
            }
          : sede
      )
    }));
    setHasUnsavedChanges(true);
  }, []);

  const addIncidentType = React.useCallback((incidentType: Omit<IncidentType, 'id'>) => {
    const newIncidentType: IncidentType = {
      ...incidentType,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };
    setSystemConfig(prev => ({
      ...prev,
      incidentTypes: [...prev.incidentTypes, newIncidentType]
    }));
    setHasUnsavedChanges(true);
  }, []);

  const updateIncidentType = React.useCallback((incidentTypeId: string, updates: Partial<IncidentType>) => {
    setSystemConfig(prev => ({
      ...prev,
      incidentTypes: prev.incidentTypes.map(incidentType =>
        incidentType.id === incidentTypeId ? { ...incidentType, ...updates } : incidentType
      )
    }));
    setHasUnsavedChanges(true);
  }, []);

  const deleteIncidentType = React.useCallback((incidentTypeId: string) => {
    setSystemConfig(prev => ({
      ...prev,
      incidentTypes: prev.incidentTypes.filter(incidentType => incidentType.id !== incidentTypeId)
    }));
    setHasUnsavedChanges(true);
  }, []);

  const getEnabledIncidentTypes = React.useCallback(() => {
    return systemConfig.incidentTypes.filter(incidentType => incidentType.isEnabled);
  }, [systemConfig.incidentTypes]);

  return (
    <SystemConfigContext.Provider value={{
      systemConfig,
      updateSystemConfig,
      isPageEnabled,
      getEnabledPages,
      saveChanges,
      hasUnsavedChanges,
      addSede,
      updateSede,
      deleteSede,
      addZone,
      updateZone,
      deleteZone,
      addIncidentType,
      updateIncidentType,
      deleteIncidentType,
      getEnabledIncidentTypes
    }}>
      {children}
    </SystemConfigContext.Provider>
  );
}

export function useSystemConfig() {
  const context = React.useContext(SystemConfigContext);
  if (!context) {
    throw new Error('useSystemConfig must be used within a SystemConfigServiceProvider');
  }
  return context;
}