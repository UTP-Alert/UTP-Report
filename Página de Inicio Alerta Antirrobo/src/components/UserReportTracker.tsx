import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { useReportService } from './services/ReportService';
import { useNotificationService } from './services/NotificationService';
import { useUserService } from './services/UserService';
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  User, 
  MapPin, 
  Calendar,
  Eye,
  X
} from 'lucide-react';

export function UserReportTracker() {
  const { reports, cancelReport, sessionId } = useReportService();
  const { triggerNotification } = useNotificationService();
  const { getUserByEmail } = useUserService();

  // Obtener datos del usuario logueado actual
  const loggedUser = getUserByEmail('U1234567@utp.edu.pe');
  const currentUserId = loggedUser?.id || 'user_demo';
  const currentUserName = loggedUser?.name || 'Juan Pérez';
  
  // Filtrar reportes del usuario actual usando el sessionId (anónimos y no anónimos)
  const userReports = Array.isArray(reports) ? reports.filter(report => 
    report?.sessionId === sessionId
  ).slice(0, 10) : []; // Hasta 10 reportes del usuario

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'nuevo':
        return {
          label: 'Nuevo',
          color: 'bg-blue-500',
          icon: Clock,
          description: 'Reporte recibido, en espera de revisión'
        };
      case 'investigando':
        return {
          label: 'Investigando',
          color: 'bg-yellow-500',
          icon: AlertTriangle,
          description: 'Siendo revisado por administración'
        };
      case 'assigned_to_security':
        return {
          label: 'Asignado a Seguridad',
          color: 'bg-purple-500',
          icon: AlertTriangle,
          description: 'Asignado al personal de seguridad'
        };
      case 'in_progress':
        return {
          label: 'En Proceso',
          color: 'bg-orange-500',
          icon: AlertTriangle,
          description: 'Siendo atendido por seguridad'
        };
      case 'pending_approval':
        return {
          label: 'Pendiente de Aprobación',
          color: 'bg-indigo-500',
          icon: Clock,
          description: 'Esperando aprobación final del administrador'
        };
      case 'resuelto':
        return {
          label: 'Resuelto',
          color: 'bg-green-500',
          icon: CheckCircle,
          description: 'Caso resuelto exitosamente'
        };
      case 'cerrado':
        return {
          label: 'Cerrado',
          color: 'bg-gray-500',
          icon: CheckCircle,
          description: 'Caso cerrado'
        };
      case 'cancelado':
        return {
          label: 'Cancelado',
          color: 'bg-red-500',
          icon: X,
          description: 'Reporte cancelado por el usuario'
        };
      default:
        return {
          label: 'Pendiente',
          color: 'bg-gray-500',
          icon: Clock,
          description: 'Estado desconocido'
        };
    }
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'nuevo': return 20;
      case 'investigando': return 40;
      case 'assigned_to_security': return 60;
      case 'in_progress': return 80;
      case 'pending_approval': return 90;
      case 'resuelto': return 100;
      case 'cerrado': return 100;
      case 'cancelado': return 0;
      default: return 0;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const simulateStatusUpdate = (reportId: string) => {
    triggerNotification({
      id: `status_update_${reportId}`,
      type: 'status_update',
      priority: 'media',
      message: '🔄 Estado Actualizado',
      description: 'Tu reporte ha sido actualizado. El personal de seguridad está trabajando en tu caso.',
      timestamp: new Date().toISOString(),
      isRead: false,
      targetRole: 'user'
    });
  };

  const handleCancelReport = (reportId: string) => {
    if (window.confirm('¿Estás seguro que deseas cancelar este reporte? Esta acción no se puede deshacer.')) {
      cancelReport(reportId, 'user');
      triggerNotification({
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
  };

  // Function to check if a report can be cancelled by the user
  const canCancelReport = (report: any) => {
    const cancelableStatuses = ['nuevo', 'investigando', 'assigned_to_security', 'in_progress'];
    return cancelableStatuses.includes(report?.status);
  };

  if (userReports.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-gray-100 p-4 rounded-full">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">No tienes reportes</h3>
              <p className="text-sm text-gray-600 mt-1">
                Cuando hagas un reporte, podrás ver su progreso aquí.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Mis Reportes</h3>
        <Badge variant="outline" className="text-xs">
          {userReports.length} reportes
        </Badge>
      </div>

      <div className="space-y-3">
        {userReports.map((report, index) => {
          const statusInfo = getStatusInfo(report.status || 'pending');
          const StatusIcon = statusInfo.icon;
          const progress = getProgressPercentage(report.status || 'pending');

          return (
            <Card key={report.id || index} className="transition-all hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${statusInfo.color} bg-opacity-10`}>
                      <StatusIcon className={`h-4 w-4 text-current`} style={{ color: statusInfo.color.replace('bg-', '').replace('-500', '') }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">
                          {report.incidentType?.replace('_', ' ').toUpperCase() || 'Incidente'}
                        </h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${statusInfo.color} text-white border-transparent`}
                          style={{ backgroundColor: statusInfo.color.replace('bg-', '').replace('-500', '') }}
                        >
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{report.zone || 'Zona no especificada'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(report.timestamp)}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {statusInfo.description}
                      </p>
                      
                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Progreso</span>
                          <span className="text-xs text-gray-500">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => simulateStatusUpdate(report.id || index.toString())}
                      className="text-gray-400 hover:text-gray-600"
                      aria-label="Ver detalles del reporte"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {canCancelReport(report) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelReport(report.id)}
                        className="text-red-400 hover:text-red-600"
                        aria-label="Cancelar reporte"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center pt-2">
        <p className="text-xs text-gray-500">
          Recibirás notificaciones cuando el estado de tus reportes cambie
        </p>
      </div>
    </div>
  );
}