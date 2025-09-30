import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { SOSButton } from './SOSButton';
import { UserReportTracker } from './UserReportTracker';
import { NotificationDemo } from './NotificationDemo';
import { ReportWorkflowDemo } from './ReportWorkflowDemo';
import { LiveWorkflowTracker } from './LiveWorkflowTracker';
import { FirstReportTutorial } from './FirstReportTutorial';
import { ReportFeedbackModal } from './ReportFeedbackModal';
import { UserOnboardingTour } from './UserOnboardingTour';
import { useReportService } from './services/ReportService';
import { useWorkflowService } from './services/WorkflowService';
import { useNotificationService } from './services/NotificationService';
import { useUserService } from './services/UserService';
import { 
  Shield, 
  Phone, 
  MapPin, 
  AlertTriangle, 
  Users, 
  Clock,
  Eye,
  MessageCircle,
  Navigation,
  UserCheck,
  Bell,
  FileText,
  User,
  UserX,
  X
} from 'lucide-react';

interface UserDashboardProps {
  onOpenReport: () => void;
  onPageChange?: (page: string) => void;
}

export function UserDashboard({ onOpenReport, onPageChange }: UserDashboardProps) {
  // Service hooks with error handling
  const reportService = useReportService();
  const workflowService = useWorkflowService();
  const notificationService = useNotificationService();
  const userService = useUserService();
  
  // Safe destructuring with fallbacks
  const { reports = [], addReport = () => {}, cancelReport = () => {} } = reportService || {};
  const { initiateReportWorkflow = () => {} } = workflowService || {};
  const { triggerNotification = () => {} } = notificationService || {};
  const { getUserByEmail } = userService || {};
  const universityZones = [
    { id: 1, name: 'Campus Principal', status: 'seguro', incidents: 0 },
    { id: 2, name: 'Biblioteca Central', status: 'seguro', incidents: 0 },
    { id: 3, name: 'Cafetería Norte', status: 'seguro', incidents: 0 },
    { id: 4, name: 'Estacionamiento Este', status: 'seguro', incidents: 0 },
    { id: 5, name: 'Laboratorios', status: 'seguro', incidents: 0 },
    { id: 6, name: 'Zona Deportiva', status: 'seguro', incidents: 0 }
  ];

  const getZoneStatusColor = (status: string) => {
    switch (status) {
      case 'seguro': return 'bg-green-500 hover:bg-green-600';
      case 'alerta': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'peligro': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'seguro': return 'ZONA SEGURA';
      case 'alerta': return 'PRECAUCIÓN';
      case 'peligro': return 'ZONA PELIGROSA';
      default: return 'SIN DATOS';
    }
  };

  // Helper functions for report display
  const getReporterName = (report: any) => {
    if (report.isAnonymous) {
      return 'Anónimo';
    }
    
    if (report.contactInfo.includes('@')) {
      // Extract name from email
      const emailName = report.contactInfo.split('@')[0];
      return emailName.split('.').map((part: string) => 
        part.charAt(0).toUpperCase() + part.slice(1)
      ).join(' ');
    }
    
    return report.contactInfo || 'Usuario';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-500 text-white';
      case 'media': return 'bg-yellow-500 text-white';
      case 'baja': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'nuevo': return 'bg-blue-500 text-white';
      case 'investigando': return 'bg-yellow-600 text-white';
      case 'assigned_to_security': return 'bg-purple-500 text-white';
      case 'in_progress': return 'bg-orange-500 text-white';
      case 'pending_approval': return 'bg-indigo-500 text-white';
      case 'resuelto': return 'bg-green-600 text-white';
      case 'cerrado': return 'bg-gray-600 text-white';
      case 'cancelado': return 'bg-red-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'nuevo': return 'Nuevo';
      case 'investigando': return 'Investigando';
      case 'assigned_to_security': return 'Asignado a Seguridad';
      case 'in_progress': return 'En Progreso';
      case 'pending_approval': return 'Pendiente de Aprobación';
      case 'resuelto': return 'Resuelto';
      case 'cerrado': return 'Cerrado';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  // Get recent reports (last 5 reports) filtered by allowed statuses for users
  // Estados permitidos para usuarios: todos los estados relevantes del progreso
  const allowedStatuses = ['nuevo', 'investigando', 'assigned_to_security', 'in_progress', 'pending_approval', 'resuelto', 'cerrado', 'cancelado'];
  const filteredReports = Array.isArray(reports) ? reports.filter(report => 
    report && allowedStatuses.includes(report.status)
  ) : [];
  const recentReports = filteredReports.slice(0, 5);

  // Obtener datos del usuario logueado actual
  const loggedUser = getUserByEmail ? getUserByEmail('U1234567@utp.edu.pe') : null;
  const currentUserId = loggedUser?.email?.split('@')[0] || 'U1234567';
  const currentUserName = loggedUser?.name || 'Juan Pérez';
  
  // Get user's own reports for cancel functionality
  const userReports = Array.isArray(reports) ? reports.filter(report => 
    report?.reportedBy?.userName === currentUserName || 
    report?.reportedBy?.userId === currentUserId ||
    report?.reportedBy?.userEmail === loggedUser?.email ||
    (!report?.isAnonymous && report?.contactInfo?.includes(currentUserId.toLowerCase()))
  ) : [];

  // User statistics - calculated after userReports is defined
  const userStats = {
    reportesCreados: userReports.length,
    alertasConfirmadas: userReports.filter(r => r.status === 'resuelto').length,
    nivelConfianza: userReports.length >= 5 ? 'Experimentado' : userReports.length >= 2 ? 'Activo' : 'Nuevo'
  };

  // Estado para tracking del reporte actual
  const [currentReportId, setCurrentReportId] = React.useState<string | null>(null);
  const [reportStatus, setReportStatus] = React.useState<string>('');
  
  // Estados para tutorial y encuesta de satisfacción
  const [showTutorial, setShowTutorial] = React.useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = React.useState(false);
  const [feedbackReportData, setFeedbackReportData] = React.useState<{id: string, type: string, resolutionTime: string} | null>(null);
  
  // Estado para el tour de bienvenida interactivo con selecciones
  const [showOnboardingTour, setShowOnboardingTour] = React.useState(false);

  // Mostrar tour interactivo OBLIGATORIAMENTE la primera vez que entra al dashboard
  React.useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('userOnboardingCompleted');
    if (!hasSeenOnboarding) {
      // Pequeño delay para que cargue el dashboard primero
      setTimeout(() => {
        setShowOnboardingTour(true);
      }, 1000);
    }
  }, []);

  // Detectar cuando un reporte del usuario ha sido resuelto para mostrar encuesta de satisfacción
  // SOLO SE MUESTRA SI EL USUARIO YA HA COMPLETADO EL TOUR Y HA HECHO AL MENOS UN REPORTE
  React.useEffect(() => {
    try {
      const hasSeenOnboarding = localStorage.getItem('userOnboardingCompleted');
      const hasCreatedReport = localStorage.getItem('userHasCreatedFirstReport');
      
      // Solo mostrar encuesta si ya completó el tour y ha creado al menos un reporte
      if (!hasSeenOnboarding || !hasCreatedReport) {
        return;
      }

      const userReports = Array.isArray(reports) ? reports.filter(report => 
        report?.reportedBy?.userName === currentUserName || 
        report?.reportedBy?.userId === currentUserId ||
        report?.reportedBy?.userEmail === loggedUser?.email ||
        (!report?.isAnonymous && report?.contactInfo?.includes(currentUserId.toLowerCase()))
      ) : [];
      
      const recentlyResolvedReport = userReports.find(report => 
        report?.status === 'resuelto' && 
        !localStorage.getItem(`feedback_completed_${report.id}`)
      );
      
      if (recentlyResolvedReport) {
        // Calcular tiempo de resolución
        const createdTime = new Date(recentlyResolvedReport.timestamp);
        const resolvedTime = new Date(recentlyResolvedReport.resolvedAt || new Date());
        const diffHours = Math.abs(resolvedTime.getTime() - createdTime.getTime()) / (1000 * 60 * 60);
        const resolutionTime = diffHours < 1 ? 
          `${Math.round(diffHours * 60)} minutos` : 
          `${Math.round(diffHours)} horas`;
        
        setFeedbackReportData({
          id: recentlyResolvedReport.id,
          type: recentlyResolvedReport.type,
          resolutionTime
        });
        setShowFeedbackModal(true);
      }
    } catch (error) {
      console.error('Error checking resolved reports:', error);
    }
  }, [reports]);

  const handleFeedbackComplete = () => {
    if (feedbackReportData) {
      localStorage.setItem(`feedback_completed_${feedbackReportData.id}`, 'true');
      setFeedbackReportData(null);
    }
    setShowFeedbackModal(false);
  };

  // Función para crear reporte real - directo sin tutorial automático
  const handleQuickReport = () => {
    // Marcar que el usuario ha creado su primer reporte (para permitir encuestas futuras)
    localStorage.setItem('userHasCreatedFirstReport', 'true');
    // Abrir directamente el modal de reporte
    onOpenReport();
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    // Ya no abrimos automáticamente el modal de reporte - el usuario debe hacerlo manualmente
  };

  const handleOnboardingComplete = () => {
    setShowOnboardingTour(false);
  };

  const handleRestartTour = () => {
    localStorage.removeItem('userOnboardingCompleted');
    setShowOnboardingTour(true);
  };

  const handleCancelReport = (reportId: string) => {
    if (window.confirm('¿Estás seguro que deseas cancelar este reporte? Esta acción no se puede deshacer.')) {
      cancelReport(reportId, 'user');
      if (notificationService?.triggerNotification) {
        notificationService.triggerNotification({
          id: `cancel_${reportId}`,
          type: 'system',
          priority: 'baja',
          message: 'Reporte cancelado exitosamente',
          description: `Tu reporte #${reportId.slice(-6)} ha sido cancelado.`,
          timestamp: new Date().toISOString(),
          isRead: false,
          targetRole: 'user'
        });
      }
    }
  };

  // Function to check if a report can be cancelled by the user
  const canCancelReport = (report: any) => {
    const isUserReport = report?.reportedBy?.userName === currentUserName || 
                        report?.reportedBy?.userId === currentUserId ||
                        report?.reportedBy?.userEmail === loggedUser?.email ||
                        (!report?.isAnonymous && report?.contactInfo?.includes(currentUserId.toLowerCase()));
    const cancelableStatuses = ['nuevo', 'investigando', 'assigned_to_security', 'in_progress'];
    return isUserReport && cancelableStatuses.includes(report?.status);
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Welcome Header */}
        <div className="mb-4 sm:mb-8 user-dashboard-welcome">
          <Alert className="border-primary bg-blue-50">
            <UserCheck className="h-5 w-5 sm:h-6 sm:w-6" />
            <AlertDescription className="text-base sm:text-lg">
              Bienvenido a tu Dashboard de Usuario - Aquí puedes reportar incidentes y consultar el estado de seguridad del campus.
            </AlertDescription>
          </Alert>
        </div>

        {/* User Stats */}
        <section className="mb-4 sm:mb-8">
          <h2 className="text-xl sm:text-2xl mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
            <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            Mi Actividad
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                  <div>
                    <p className="text-xl sm:text-2xl">{userStats.reportesCreados}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Reportes Creados</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                  <div>
                    <p className="text-xl sm:text-2xl">{userStats.alertasConfirmadas}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Alertas Confirmadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200 sm:col-span-2 lg:col-span-1">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                  <div>
                    <p className="text-lg sm:text-xl">{userStats.nivelConfianza}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Nivel de Confianza</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Main Action Button */}
        <div className="flex justify-center mb-6 sm:mb-12 report-main-button">
          <Card className="border-2 hover:shadow-lg transition-shadow max-w-md w-full">
            <CardHeader className="text-center pb-3 sm:pb-4">
              <CardTitle className="flex items-center justify-center gap-2 sm:gap-3 text-xl sm:text-2xl">
                <AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                REPORTAR INCIDENTE
              </CardTitle>
              <CardDescription className="text-base sm:text-lg">
                ¿Has sido víctima de un incidente? Reporta de forma inmediata y anónima
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <Button 
                onClick={handleQuickReport}
                className="w-full h-12 sm:h-16 text-lg sm:text-xl bg-primary hover:bg-primary/90"
                aria-label="Botón para reportar un incidente"
              >
                <Eye className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3" />
                REPORTAR AHORA
              </Button>
              
              <Button 
                onClick={() => {
                  // Marcar que el usuario ha creado su primer reporte
                  localStorage.setItem('userHasCreatedFirstReport', 'true');
                  onOpenReport();
                }}
                variant="outline"
                className="w-full h-10 sm:h-12 text-base sm:text-lg border-2 border-primary text-primary hover:bg-primary/5"
                aria-label="Botón para abrir formulario detallado de reporte"
              >
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 mr-1 sm:mr-2" />
                Reporte Detallado
              </Button>


            </CardContent>
          </Card>
        </div>

        {/* University Zones Status */}
        <section className="mb-6 sm:mb-12 zones-status-section">
          <h2 className="text-xl sm:text-2xl mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
            <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            Estado de Zonas Universitarias
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {universityZones.map((zone) => (
              <Card 
                key={zone.id} 
                className="border-2 hover:shadow-md transition-all cursor-pointer focus:ring-4 focus:ring-primary/50"
                tabIndex={0}
                role="button"
                aria-label={`Zona ${zone.name} - ${getStatusText(zone.status)} - ${zone.incidents} incidentes reportados`}
              >
                <CardHeader className="pb-2 sm:pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg">{zone.name}</CardTitle>
                    <Badge 
                      className={`${getZoneStatusColor(zone.status)} text-white px-2 sm:px-3 py-1 text-xs sm:text-sm`}
                    >
                      {getStatusText(zone.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                      <span className="text-base sm:text-lg">{zone.incidents} incidentes</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 text-gray-600">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-sm sm:text-base">Hoy</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-6 sm:mb-12 quick-actions-section">
          <h2 className="text-xl sm:text-2xl mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
            <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            Acciones Rápidas
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Button 
              variant="outline" 
              className="h-16 sm:h-20 text-base sm:text-lg border-2 border-gray-300 hover:border-primary hover:bg-primary/5"
              aria-label="Ver mis reportes anteriores"
            >
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
              Mis Reportes
            </Button>
            
            <Button 
              variant="outline" 
              className="h-16 sm:h-20 text-base sm:text-lg border-2 border-gray-300 hover:border-primary hover:bg-primary/5"
              onClick={handleRestartTour}
              aria-label="Ver tour interactivo nuevamente"
            >
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
              <span className="hidden sm:inline">Tour Interactivo</span>
              <span className="sm:hidden">Tour</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-16 sm:h-20 text-base sm:text-lg border-2 border-gray-300 hover:border-primary hover:bg-primary/5 sm:col-span-2 lg:col-span-1"
              aria-label="Contactar con seguridad universitaria"
            >
              <Phone className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
              <span className="hidden sm:inline">Contactar Seguridad</span>
              <span className="sm:hidden">Contactar</span>
            </Button>
          </div>
        </section>

        {/* User Report Tracker */}
        <section className="mb-6 sm:mb-12 user-report-tracker">
          <h2 className="text-xl sm:text-2xl mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            Seguimiento de Mis Reportes
          </h2>
          <UserReportTracker />
        </section>

        {/* Explicación del Flujo con Notificaciones */}
        <section className="mb-6 sm:mb-12">
          <h2 className="text-xl sm:text-2xl mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
            <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            Cómo Funciona el Sistema de Notificaciones
          </h2>
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4 text-blue-800">
                    🚨 Reportes de Alta Prioridad
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      <span><strong>Vibración intensa</strong> + sonido de alerta</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      <span>Notificación visual destacada</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      <span>Seguimiento en tiempo real</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      <span>Resolución prioritaria</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4 text-blue-800">
                    📋 Reportes Normales  
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>Vibración suave informativa</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>Notificación estándar</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>Actualización en dashboard</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>Proceso de resolución normal</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">
                  🔄 Flujo del Proceso
                </h4>
                <div className="flex flex-wrap items-center gap-2 text-sm text-blue-700">
                  <span className="px-2 py-1 bg-blue-100 rounded">Usuario Reporta</span>
                  <span>→</span>
                  <span className="px-2 py-1 bg-yellow-100 rounded">Admin Revisa</span>
                  <span>→</span>
                  <span className="px-2 py-1 bg-red-100 rounded">¿Es Alta Prioridad?</span>
                  <span>→</span>
                  <span className="px-2 py-1 bg-purple-100 rounded">Asigna a Seguridad</span>
                  <span>→</span>
                  <span className="px-2 py-1 bg-green-100 rounded">Caso Resuelto</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>



        {/* Recent Reports from Colleagues */}
        <section className="mb-12">
          <h2 className="text-2xl mb-6 flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            Reportes Recientes de Compañeros
          </h2>
          
          {recentReports.length > 0 ? (
            <div className="space-y-4">
              {recentReports.map((report) => (
                <Card key={report.id} className="border-2 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {report.isAnonymous ? (
                          <UserX className="h-6 w-6 text-gray-500" />
                        ) : (
                          <User className="h-6 w-6 text-blue-600" />
                        )}
                        <div>
                          <CardTitle className="text-lg">{getReporterName(report)}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <MapPin className="h-4 w-4" />
                            {report.zone}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <Badge className={getPriorityColor(report.priority)}>
                          {report.priority.charAt(0).toUpperCase() + report.priority.slice(1)}
                        </Badge>
                        <Badge className={getStatusColor(report.status)}>
                          {getStatusLabel(report.status)}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Tipo de Incidente Grande y Destacado */}
                    <div className="bg-primary/10 rounded-lg p-4 border-l-4 border-primary">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-8 w-8 text-primary" />
                        <div>
                          <p className="text-sm text-primary/70 uppercase tracking-wide">Tipo de Incidente</p>
                          <h3 className="text-2xl font-bold text-primary">{report.type}</h3>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3 line-clamp-2">
                      {report.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {new Date(report.timestamp).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* View All Reports Button */}
              <Card className="border-2 border-dashed border-primary">
                <CardContent className="p-6 text-center">
                  <Button 
                    variant="outline" 
                    className="text-primary border-primary hover:bg-primary/5"
                    aria-label="Ver todos los reportes de la comunidad"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Ver Todos los Reportes
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border-2 border-dashed border-gray-300">
              <CardContent className="p-8 text-center">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl mb-2 text-gray-600">No hay reportes recientes</h3>
                <p className="text-gray-500 mb-6">
                  Aún no hay reportes de otros compañeros. ¡Sé el primero en contribuir a la seguridad del campus!
                </p>
                <Button 
                  onClick={() => {
                    // Marcar que el usuario ha creado su primer reporte
                    localStorage.setItem('userHasCreatedFirstReport', 'true');
                    onOpenReport();
                  }}
                  className="bg-primary hover:bg-primary/90"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Crear Mi Primer Reporte
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Footer Info */}
        <footer className="bg-gray-50 rounded-lg p-6 mt-12">
          <div className="text-center">
            <h3 className="text-xl mb-3">Tu Contribución Hace la Diferencia</h3>
            <p className="text-lg mb-4">
              Gracias por ser parte activa de la comunidad de seguridad universitaria. 
              Cada reporte contribuye a mantener nuestro campus más seguro.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <Badge variant="outline" className="text-base px-4 py-2">
                🔒 100% Anónimo
              </Badge>
              <Badge variant="outline" className="text-base px-4 py-2">
                ⚡ Respuesta Rápida
              </Badge>
              <Badge variant="outline" className="text-base px-4 py-2">
                🛡️ Seguro y Confiable
              </Badge>
            </div>
          </div>
        </footer>
      </main>
      
      {/* Botón SOS */}
      <SOSButton />

      {/* Tutorial paso a paso básico (opcional) */}
      <FirstReportTutorial
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onComplete={handleTutorialComplete}
      />

      {/* Modal de encuesta de satisfacción */}
      {feedbackReportData && (
        <ReportFeedbackModal
          isOpen={showFeedbackModal}
          onClose={handleFeedbackComplete}
          reportId={feedbackReportData.id}
          reportType={feedbackReportData.type}
          resolutionTime={feedbackReportData.resolutionTime}
        />
      )}

      {/* Tour interactivo de bienvenida para nuevos usuarios */}
      <UserOnboardingTour
        isOpen={showOnboardingTour}
        onClose={() => setShowOnboardingTour(false)}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}