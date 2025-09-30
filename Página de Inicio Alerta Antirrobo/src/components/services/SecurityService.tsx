import React from 'react';
import { useUserService, SystemUser } from './UserService';

export interface SecurityOfficer {
  id: string;
  name: string;
  badge: string;
  status: 'available' | 'busy' | 'offline';
  currentZone: string | null;
  assignedZones: string[];
  activeReports: string[];
  lastUpdate: string;
  contactInfo: string;
  experience: string;
  userId?: string; // Referencia al usuario del sistema
}

interface SecurityServiceContext {
  officers: SecurityOfficer[];
  getAvailableOfficers: () => SecurityOfficer[];
  getOfficersByZone: (zone: string) => SecurityOfficer[];
  updateOfficerStatus: (id: string, status: SecurityOfficer['status'], currentZone?: string) => void;
  assignReportToOfficer: (officerId: string, reportId: string) => void;
  completeReportForOfficer: (officerId: string, reportId: string) => void;
  getNearestOfficer: (zone: string) => SecurityOfficer | null;
  syncWithUserService: () => void; // Función para sincronizar con el UserService
}

const SecurityServiceContext = React.createContext<SecurityServiceContext | undefined>(undefined);

export function SecurityServiceProvider({ children }: { children: React.ReactNode }) {
  const { users, getSecurityPersonnel } = useUserService();
  const [officers, setOfficers] = React.useState<SecurityOfficer[]>([]);

  // Función para sincronizar automáticamente con el UserService
  const syncWithUserService = React.useCallback(() => {
    const securityUsers = getSecurityPersonnel();
    
    setOfficers(prevOfficers => {
      const newOfficers: SecurityOfficer[] = [];
      
      securityUsers.forEach((user: SystemUser, index: number) => {
        // Buscar si ya existe este oficial
        const existingOfficer = prevOfficers.find(officer => officer.userId === user.id);
        
        if (existingOfficer) {
          // Actualizar información del oficial existente
          newOfficers.push({
            ...existingOfficer,
            name: user.name,
            assignedZones: user.assignedZones || [],
            contactInfo: user.email
          });
        } else {
          // Crear nuevo oficial basado en el usuario de seguridad
          newOfficers.push({
            id: `sec_${user.id}`,
            userId: user.id,
            name: user.name,
            badge: `SEC-${String(index + 1).padStart(3, '0')}`,
            status: user.isActive ? 'available' : 'offline',
            currentZone: null,
            assignedZones: user.assignedZones || [],
            activeReports: [],
            lastUpdate: new Date().toISOString(),
            contactInfo: user.email,
            experience: 'Nuevo'
          });
        }
      });
      
      return newOfficers;
    });
  }, [getSecurityPersonnel]);

  // Sincronizar automáticamente cuando cambian los usuarios
  React.useEffect(() => {
    syncWithUserService();
  }, [users, syncWithUserService]);

  const getAvailableOfficers = React.useCallback(() => {
    return officers.filter(officer => officer.status === 'available');
  }, [officers]);

  const getOfficersByZone = React.useCallback((zone: string) => {
    return officers.filter(officer => 
      officer.assignedZones.includes(zone) && officer.status !== 'offline'
    );
  }, [officers]);

  const updateOfficerStatus = React.useCallback((
    id: string, 
    status: SecurityOfficer['status'], 
    currentZone?: string
  ) => {
    setOfficers(prev => 
      prev.map(officer => 
        officer.id === id 
          ? { 
              ...officer, 
              status, 
              currentZone: status === 'busy' ? currentZone || officer.currentZone : null,
              lastUpdate: new Date().toISOString()
            }
          : officer
      )
    );
  }, []);

  const assignReportToOfficer = React.useCallback((officerId: string, reportId: string) => {
    setOfficers(prev => 
      prev.map(officer => 
        officer.id === officerId 
          ? { 
              ...officer, 
              activeReports: [...officer.activeReports, reportId],
              status: 'busy' as const,
              lastUpdate: new Date().toISOString()
            }
          : officer
      )
    );
  }, []);

  const completeReportForOfficer = React.useCallback((officerId: string, reportId: string) => {
    setOfficers(prev => 
      prev.map(officer => 
        officer.id === officerId 
          ? { 
              ...officer, 
              activeReports: officer.activeReports.filter(id => id !== reportId),
              status: officer.activeReports.length <= 1 ? 'available' as const : 'busy' as const,
              currentZone: officer.activeReports.length <= 1 ? null : officer.currentZone,
              lastUpdate: new Date().toISOString()
            }
          : officer
      )
    );
  }, []);

  const getNearestOfficer = React.useCallback((zone: string): SecurityOfficer | null => {
    // First try to find an available officer assigned to this zone
    const zoneOfficers = getOfficersByZone(zone).filter(o => o.status === 'available');
    if (zoneOfficers.length > 0) {
      return zoneOfficers[0];
    }

    // If no zone-specific officer is available, return any available officer
    const availableOfficers = getAvailableOfficers();
    if (availableOfficers.length > 0) {
      return availableOfficers[0];
    }

    return null;
  }, [getOfficersByZone, getAvailableOfficers]);

  const value = {
    officers,
    getAvailableOfficers,
    getOfficersByZone,
    updateOfficerStatus,
    assignReportToOfficer,
    completeReportForOfficer,
    getNearestOfficer,
    syncWithUserService
  };

  return (
    <SecurityServiceContext.Provider value={value}>
      {children}
    </SecurityServiceContext.Provider>
  );
}

export function useSecurityService() {
  const context = React.useContext(SecurityServiceContext);
  if (context === undefined) {
    throw new Error('useSecurityService must be used within a SecurityServiceProvider');
  }
  return context;
}

// Helper function to get status color
export function getStatusColor(status: SecurityOfficer['status']): string {
  switch (status) {
    case 'available': return 'bg-green-500 hover:bg-green-600';
    case 'busy': return 'bg-yellow-500 hover:bg-yellow-600';
    case 'offline': return 'bg-red-500 hover:bg-red-600';
    default: return 'bg-gray-500 hover:bg-gray-600';
  }
}

// Helper function to get status text
export function getStatusText(status: SecurityOfficer['status']): string {
  switch (status) {
    case 'available': return 'DISPONIBLE';
    case 'busy': return 'OCUPADO';
    case 'offline': return 'FUERA DE SERVICIO';
    default: return 'DESCONOCIDO';
  }
}