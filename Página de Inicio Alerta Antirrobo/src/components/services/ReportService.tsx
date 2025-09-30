import React from 'react';
import { useNotificationService } from './NotificationService';

export interface Report {
  id: string;
  incidentType: string;
  zone: string;
  description: string;
  isAnonymous: boolean;
  contactInfo: string;
  timestamp: string;
  hasPhoto: boolean;
  photoName: string | null;
  status: 'nuevo' | 'investigando' | 'resuelto' | 'cerrado' | 'assigned_to_security' | 'in_progress' | 'pending_approval' | 'cancelado';
  priority: 'alta' | 'media' | 'baja';
  assignedTo?: string;
  updatedAt: string;
  resolvedAt?: string; // Fecha y hora cuando el reporte fue marcado como resuelto
  type: string;
  location: string;
  photo?: string;
  sessionId: string; // Identificador único de la sesión para contar límites diarios
  // Información adicional para reportes sensibles - solo visible por SuperAdmin
  reportedBy?: {
    userId: string;
    userName: string;
    userEmail: string;
    userRole: string;
  };
  // Información del seguimiento de seguridad
  securityActions?: {
    assignedOfficer?: string;
    startTime?: string;
    endTime?: string;
    actionsTaken?: string;
    evidence?: string[];
    finalReport?: string;
    resolutionDetails?: string;
    securityDescription?: string; // Descripción enviada por seguridad para aprobación
    adminApprovalComments?: string; // Comentarios del administrador
    approvedBy?: string;
    approvalTimestamp?: string;
  };
}

interface ReportServiceContext {
  reports: Report[];
  sessionId: string;
  addReport: (reportData: Omit<Report, 'id' | 'status' | 'priority' | 'updatedAt' | 'sessionId'>) => void;
  updateReportStatus: (id: string, status: Report['status']) => void;
  updateReportPriority: (id: string, priority: Report['priority']) => void;
  assignReportToSecurity: (id: string) => void;
  cancelReport: (id: string, userRole: string) => void;
  submitSecurityDescription: (id: string, description: string) => void;
  approveResolution: (id: string, approved: boolean, comments?: string) => void;
  getReportsByStatus: (status: Report['status']) => Report[];
  getTotalReports: () => number;
  getReportsByPriority: (priority: Report['priority']) => Report[];
  canCreateReport: (userId: string) => boolean;
  getUserTodayReportsCount: (userId: string) => number;
  isUserFirstReport: (userId: string) => boolean;
  getUserReportsCount: (userId: string) => number;
}

const ReportServiceContext = React.createContext<ReportServiceContext | undefined>(undefined);

export function ReportServiceProvider({ children }: { children: React.ReactNode }) {
  // Hook para notificaciones
  const notificationService = useNotificationService();
  
  const [reports, setReports] = React.useState<Report[]>(() => {
    // Reportes de muestra para demostrar el flujo
    const sampleReports: Report[] = [
      {
        id: 'demo_report_1',
        incidentType: 'robo',
        zone: 'Biblioteca Central',
        description: 'Robo de laptop en el segundo piso de la biblioteca',
        isAnonymous: false,
        contactInfo: 'U1234567@utp.edu.pe',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
        hasPhoto: true,
        photoName: 'evidencia_robo.jpg',
        status: 'investigating',
        priority: 'alta',
        assignedTo: 'security',
        updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min atrás
        type: 'Robo',
        location: 'Biblioteca Central',
        sessionId: 'demo_session_user',
        reportedBy: {
          userId: 'U1234567',
          userName: 'Juan Pérez',
          userEmail: 'U1234567@utp.edu.pe',
          userRole: 'user'
        },
        securityActions: {
          assignedOfficer: 'Carlos López',
          assignedOfficerId: 'sec_1',
          startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          status: 'working'
        }
      },
      {
        id: 'demo_report_2',
        incidentType: 'sospechoso',
        zone: 'Estacionamiento Este',
        description: 'Persona merodeando en el estacionamiento de estudiantes',
        isAnonymous: true,
        contactInfo: 'anonymous',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hora atrás
        hasPhoto: false,
        photoName: null,
        status: 'nuevo',
        priority: 'media',
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        type: 'Actividad Sospechosa',
        location: 'Estacionamiento Este',
        sessionId: 'demo_session_anonymous'
      },
      {
        id: 'demo_report_3',
        incidentType: 'vandalismo',
        zone: 'Cafetería Norte',
        description: 'Grafitis en las paredes del baño de la cafetería',
        isAnonymous: false,
        contactInfo: 'U9876543@utp.edu.pe',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 horas atrás
        hasPhoto: true,
        photoName: 'vandalismo_cafeteria.jpg',
        status: 'pending_approval',
        priority: 'baja',
        assignedTo: 'security',
        updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 min atrás
        type: 'Vandalismo',
        location: 'Cafetería Norte',
        sessionId: 'demo_session_other',
        reportedBy: {
          userId: 'U9876543',
          userName: 'María García',
          userEmail: 'U9876543@utp.edu.pe',
          userRole: 'user'
        },
        securityActions: {
          assignedOfficer: 'Ana Rodríguez',
          assignedOfficerId: 'sec_2',
          startTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          securityDescription: 'Revisé la zona y confirmé el vandalismo. Tomé fotos de evidencia y contacté al personal de limpieza para la reparación. Se recomienda instalar cámaras en esa área.',
          status: 'completed'
        }
      },
      {
        id: 'demo_report_4',
        incidentType: 'sospechoso',
        zone: 'Zona Deportiva',
        description: 'Persona desconocida merodeando cerca de los vestuarios después del horario',
        isAnonymous: false,
        contactInfo: 'U5555555@utp.edu.pe',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutos atrás
        hasPhoto: false,
        photoName: null,
        status: 'assigned_to_security',
        priority: 'media',
        assignedTo: 'security',
        updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        type: 'Actividad Sospechosa',
        location: 'Zona Deportiva',
        sessionId: 'demo_session_student',
        reportedBy: {
          userId: 'U5555555',
          userName: 'Pedro Sánchez',
          userEmail: 'U5555555@utp.edu.pe',
          userRole: 'user'
        },
        securityActions: {
          assignedOfficer: 'Carlos López',
          assignedOfficerId: 'sec_1',
          startTime: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
          status: 'assigned'
        }
      }
    ];
    return sampleReports;
  });
  
  // Generar un sessionId único para esta sesión de usuario (usar demo_session_user para mostrar reportes de muestra a Juan Pérez)
  const sessionId = React.useMemo(() => {
    return 'demo_session_user'; // Fijo para demo para que Juan Pérez vea el reporte de muestra
  }, []);

  // Función para verificar límite diario de reportes (anónimos y no anónimos)
  const canCreateReport = React.useCallback((userId: string) => {
    const today = new Date().toDateString();
    const userReportsToday = reports.filter(report => {
      const reportDate = new Date(report.timestamp).toDateString();
      return reportDate === today && report.sessionId === sessionId;
    });
    return userReportsToday.length < 3;
  }, [reports, sessionId]);

  // Función para obtener reportes del día del usuario (anónimos y no anónimos)
  const getUserTodayReportsCount = React.useCallback((userId: string) => {
    const today = new Date().toDateString();
    const userReportsToday = reports.filter(report => {
      const reportDate = new Date(report.timestamp).toDateString();
      return reportDate === today && report.sessionId === sessionId;
    });
    return userReportsToday.length;
  }, [reports, sessionId]);

  const addReport = React.useCallback((reportData: Omit<Report, 'id' | 'status' | 'priority' | 'updatedAt' | 'sessionId'>) => {
    // Verificar límite diario para todos los reportes (anónimos y no anónimos)
    if (!canCreateReport('session_user')) {
      throw new Error('DAILY_LIMIT_EXCEEDED');
    }

    const newReport: Report = {
      ...reportData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      status: 'nuevo',
      priority: determinePriority(reportData.incidentType),
      updatedAt: new Date().toISOString(),
      type: getIncidentTypeLabel(reportData.incidentType),
      location: reportData.zone,
      sessionId: sessionId,
      // Usar directamente el reportedBy que viene del modal
      reportedBy: reportData.reportedBy
    };
    
    setReports(prev => [newReport, ...prev]);
    
    // Notificar a usuarios, administradores y superusuarios sobre el nuevo reporte
    if (notificationService) {
      notificationService.notifyReportProgress(newReport.id, 'created', 'user');
      notificationService.notifyReportProgress(newReport.id, 'created', 'admin');
      notificationService.notifyReportProgress(newReport.id, 'created', 'superuser');
    }
  }, [notificationService, canCreateReport]);

  const updateReportStatus = React.useCallback((id: string, status: Report['status']) => {
    const report = reports.find(r => r.id === id);
    const oldStatus = report?.status;
    
    setReports(prev => 
      prev.map(report => 
        report.id === id 
          ? { 
              ...report, 
              status, 
              resolvedAt: status === 'resuelto' ? new Date().toISOString() : report.resolvedAt,
              updatedAt: new Date().toISOString() 
            }
          : report
      )
    );
    
    // Notificar al usuario sobre el cambio de estado
    if (notificationService && oldStatus !== status) {
      notificationService.notifyUserReportUpdate(id, oldStatus || '', status);
    }
  }, [reports, notificationService]);

  const updateReportPriority = React.useCallback((id: string, priority: Report['priority']) => {
    setReports(prev => 
      prev.map(report => 
        report.id === id 
          ? { ...report, priority, updatedAt: new Date().toISOString() }
          : report
      )
    );
  }, []);

  const assignReportToSecurity = React.useCallback((id: string, officerId?: string, officerName?: string) => {
    const report = reports.find(r => r.id === id);
    
    setReports(prev => 
      prev.map(report => 
        report.id === id 
          ? { 
              ...report, 
              status: 'in_progress' as const, // Mantener en "in_progress" cuando se asigna a seguridad
              assignedTo: 'security',
              securityActions: {
                ...report.securityActions,
                assignedOfficer: officerName || officerId || 'Oficial de Seguridad',
                assignedOfficerId: officerId,
                startTime: new Date().toISOString(),
                status: 'working'
              },
              updatedAt: new Date().toISOString() 
            }
          : report
      )
    );
    
    // Notificar a todos los roles sobre la asignación
    if (notificationService && report) {
      notificationService.notifySecurityAssignment(id, report.type, report.zone, report.priority);
      notificationService.notifyReportProgress(id, 'assigned', 'user');
      notificationService.notifyReportProgress(id, 'assigned', 'security');
      notificationService.notifyAdminAction(id, 'assigned_to_security', 'admin');
    }
  }, [reports, notificationService]);

  const getReportsByStatus = React.useCallback((status: Report['status']) => {
    return reports.filter(report => report.status === status);
  }, [reports]);

  const getTotalReports = React.useCallback(() => {
    return reports.length;
  }, [reports]);

  const getReportsByPriority = React.useCallback((priority: Report['priority']) => {
    return reports.filter(report => report.priority === priority);
  }, [reports]);

  const cancelReport = React.useCallback((id: string, userRole: string) => {
    setReports(prev => 
      prev.map(report => {
        if (report.id === id) {
          // Solo permitir cancelar si el reporte está en ciertos estados
          const cancelableStatuses = ['nuevo', 'investigando', 'assigned_to_security', 'in_progress'];
          if (cancelableStatuses.includes(report.status)) {
            // Verificar permisos: usuarios solo pueden cancelar sus propios reportes
            if (userRole === 'user') {
              // Verificar que el reporte pertenece a la sesión actual
              const canCancel = report.sessionId === sessionId;
              if (!canCancel) {
                return report; // No cancelar si no es el propietario
              }
            }
            // Admin y superuser pueden cancelar cualquier reporte
            return { 
              ...report, 
              status: 'cancelado' as const, 
              updatedAt: new Date().toISOString() 
            };
          }
        }
        return report;
      })
    );
  }, [sessionId]);

  // Nueva función para que seguridad envíe descripción para aprobación
  const submitSecurityDescription = React.useCallback((id: string, description: string) => {
    setReports(prev => 
      prev.map(report => 
        report.id === id 
          ? { 
              ...report, 
              status: 'pending_approval' as const,
              securityActions: {
                ...report.securityActions,
                securityDescription: description,
                endTime: new Date().toISOString()
              },
              updatedAt: new Date().toISOString() 
            }
          : report
      )
    );
    
    // Notificar al administrador que necesita aprobar
    if (notificationService) {
      notificationService.notifyApprovalNeeded(id, description);
    }
  }, [notificationService]);

  // Nueva función para que el administrador apruebe o rechace la resolución
  const approveResolution = React.useCallback((id: string, approved: boolean, comments?: string) => {
    setReports(prev => 
      prev.map(report => 
        report.id === id 
          ? { 
              ...report, 
              status: approved ? 'resuelto' as const : 'in_progress' as const,
              resolvedAt: approved ? new Date().toISOString() : report.resolvedAt,
              securityActions: {
                ...report.securityActions,
                adminApprovalComments: comments,
                approvedBy: 'Admin García',
                approvalTimestamp: new Date().toISOString()
              },
              updatedAt: new Date().toISOString() 
            }
          : report
      )
    );
    
    // Notificar según la decisión del administrador
    if (notificationService) {
      if (approved) {
        // Notificar resolución exitosa a todos los roles
        notificationService.notifyReportProgress(id, 'resolved', 'user');
        notificationService.notifyReportProgress(id, 'resolved', 'admin');
        notificationService.notifyReportProgress(id, 'resolved', 'security');
        notificationService.notifyApprovalComplete(id, true);
      } else {
        // Notificar que se necesita más trabajo
        notificationService.notifyApprovalComplete(id, false);
        notificationService.notifyAdminAction(id, 'rejected', 'security');
      }
    }
  }, [notificationService]);

  // Function to check if this is user's first report
  const isUserFirstReport = React.useCallback((userId: string) => {
    const userReports = reports.filter(report => 
      report.userId === userId && report.userId !== 'anonymous'
    );
    return userReports.length === 0;
  }, [reports]);

  // Function to get total user reports count
  const getUserReportsCount = React.useCallback((userId: string) => {
    return reports.filter(report => 
      report.userId === userId && report.userId !== 'anonymous'
    ).length;
  }, [reports]);

  const value = {
    reports,
    sessionId,
    addReport,
    updateReportStatus,
    updateReportPriority,
    assignReportToSecurity,
    cancelReport,
    submitSecurityDescription,
    approveResolution,
    getReportsByStatus,
    getTotalReports,
    getReportsByPriority,
    canCreateReport,
    getUserTodayReportsCount,
    isUserFirstReport,
    getUserReportsCount
  };

  return (
    <ReportServiceContext.Provider value={value}>
      {children}
    </ReportServiceContext.Provider>
  );
}

export function useReportService() {
  const context = React.useContext(ReportServiceContext);
  if (context === undefined) {
    throw new Error('useReportService must be used within a ReportServiceProvider');
  }
  return context;
}

// Helper function to determine priority based on incident type
function determinePriority(incidentType: string): Report['priority'] {
  switch (incidentType) {
    case 'robo':
    case 'emergencia':
    case 'acoso':
      return 'alta';
    case 'intento_robo':
    case 'sospechoso':
    case 'vandalismo':
      return 'media';
    case 'otro':
      return 'baja';
    default:
      return 'media';
  }
}

// Helper function to get incident type label
export function getIncidentTypeLabel(type: string): string {
  const types: Record<string, string> = {
    'robo': 'Robo',
    'intento_robo': 'Intento de Robo',
    'sospechoso': 'Actividad Sospechosa',
    'acoso': 'Acoso o Intimidación',
    'vandalismo': 'Vandalismo',
    'emergencia': 'Emergencia Médica',
    'otro': 'Otro Incidente'
  };
  return types[type] || type;
}

// Helper function to get incident type icon
export function getIncidentTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    'robo': '🔴',
    'intento_robo': '🟠',
    'sospechoso': '🟡',
    'acoso': '🔴',
    'vandalismo': '🟠',
    'emergencia': '🔴',
    'otro': '🔵'
  };
  return icons[type] || '🔵';
}