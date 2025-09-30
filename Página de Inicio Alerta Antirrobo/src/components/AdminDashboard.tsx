import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { SOSButton } from './SOSButton';
import { SecurityAssignmentModal } from './SecurityAssignmentModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { useReportService, getIncidentTypeLabel, getIncidentTypeIcon } from './services/ReportService';
import { useNotificationService } from './services/NotificationService';
import { AdminWorkflowDemo } from './AdminWorkflowDemo';
import { toast } from 'sonner@2.0.3';
import { 
  Shield, 
  BarChart3,
  AlertTriangle, 
  Users, 
  Clock,
  Eye,
  Bell,
  FileText,
  TrendingUp,
  MapPin,
  Filter,
  Calendar,
  Search,
  Camera,
  CheckCircle,
  AlertCircle,
  Info,
  Settings,
  X,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface AdminDashboardProps {
  onOpenReport: () => void;
}

export function AdminDashboard({ onOpenReport }: AdminDashboardProps) {
  const { 
    reports, 
    getReportsByStatus, 
    getTotalReports, 
    getReportsByPriority,
    updateReportStatus,
    updateReportPriority,
    assignReportToSecurity,
    cancelReport,
    approveResolution
  } = useReportService();
  
  const { notifyReportProgress, checkDangerousZones } = useNotificationService();

  // Security assignment modal state
  const [isSecurityModalOpen, setIsSecurityModalOpen] = React.useState(false);
  const [selectedReport, setSelectedReport] = React.useState<any>(null);
  
  // Approval modal state
  const [isApprovalModalOpen, setIsApprovalModalOpen] = React.useState(false);
  const [selectedReportForApproval, setSelectedReportForApproval] = React.useState<any>(null);
  const [approvalComments, setApprovalComments] = React.useState('');

  // Report details modal state
  const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);
  const [selectedReportForDetails, setSelectedReportForDetails] = React.useState<any>(null);

  // Data for recent reports (new reports)
  const recentReports = reports.filter(report => 
    report.status === 'nuevo'
  ).sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Data for reports in process
  const inProcessReports = reports.filter(report => {
    // Solo incluir reportes que están verdaderamente "en proceso" pero no en pending_approval
    const isInProcess = ['in_progress'].includes(report.status);
    const isLegacyInProcess = ['assigned_to_security', 'investigando'].includes(report.status);
    
    // Los reportes legacy pueden estar en proceso si aún no han sido asignados apropiadamente
    return isInProcess || isLegacyInProcess;
  }).sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  // Data for reports pending approval
  const pendingApprovalReports = reports.filter(report => 
    report.status === 'pending_approval'
  ).sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  // Data for resolved reports
  const resolvedReports = reports.filter(report => 
    ['resuelto', 'cerrado'].includes(report.status)
  ).sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  // Data for cancelled reports
  const cancelledReports = reports.filter(report => 
    report.status === 'cancelado'
  ).sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  // Statistics
  const totalReports = getTotalReports();
  const criticalAlerts = getReportsByPriority('alta').filter(r => !['resuelto', 'cerrado', 'cancelado'].includes(r.status)).length;
  const investigating = reports.filter(r => ['in_progress', 'assigned_to_security', 'investigando'].includes(r.status)).length;
  const resolved = getReportsByStatus('resuelto').length;

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return 'bg-red-500 hover:bg-red-600';
      case 'media': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'baja': return 'bg-blue-500 hover:bg-blue-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'nuevo': return 'bg-blue-500 hover:bg-blue-600';
      case 'in_progress': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'pending_approval': return 'bg-purple-500 hover:bg-purple-600';
      case 'resuelto': return 'bg-green-500 hover:bg-green-600';
      case 'cancelado': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'nuevo': return 'NUEVO';
      case 'in_progress': return 'EN PROCESO';
      case 'pending_approval': return 'PEND. APROBACIÓN';
      case 'resuelto': return 'RESUELTO';
      case 'cancelado': return 'CANCELADO';
      // Estados legacy para compatibilidad
      case 'investigando': return 'EN PROCESO';
      case 'assigned_to_security': return 'EN PROCESO';
      case 'cerrado': return 'RESUELTO';
      default: return 'DESCONOCIDO';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return `Hace ${minutes} min`;
    } else if (hours < 24) {
      return `Hace ${hours}h`;
    } else {
      return `Hace ${days}d`;
    }
  };

  const handleStatusChange = (reportId: string, newStatus: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    // Si el nuevo estado es cancelado, usar la función de cancelar
    if (newStatus === 'cancelado') {
      handleCancelReport(reportId);
      return;
    }

    // Validaciones del workflow estricto
    if (newStatus === 'in_progress') {
      // Si viene de "nuevo", debe abrirse el modal de asignación automáticamente
      if (report.status === 'nuevo') {
        // Cambiar el estado primero y luego abrir modal de asignación
        updateReportStatus(reportId, 'in_progress');
        
        // Notificar que pasó a proceso
        notifyReportProgress(reportId, 'in_process', 'user');
        
        toast.success('Reporte movido a En Proceso', {
          description: `Reporte #${reportId.slice(-6)} ahora requiere asignación de personal de seguridad.`
        });
        
        // Abrir modal de asignación automáticamente después de actualizar el estado
        // Usar el reporte actualizado directamente
        const updatedReport = { ...report, status: 'in_progress' as const, updatedAt: new Date().toISOString() };
        setSelectedReport(updatedReport);
        setIsSecurityModalOpen(true);
        
        return;
      } else {
        // Para otros estados, debe estar asignado a seguridad
        if (!report.assignedTo || report.assignedTo !== 'security') {
          toast.error('Error: Asignación requerida', {
            description: 'Debe asignar el reporte a un oficial de seguridad antes de cambiar a "En Proceso"'
          });
          return;
        }
        if (!report.securityActions?.assignedOfficer) {
          toast.error('Error: Oficial no asignado', {
            description: 'Debe asignar un oficial específico antes de cambiar a "En Proceso"'
          });
          return;
        }
      }
    }

    if (newStatus === 'pending_approval') {
      // Solo el personal de seguridad puede mover a pending_approval
      toast.error('Error: Transición no permitida', {
        description: 'Solo el personal de seguridad puede marcar un reporte como pendiente de aprobación'
      });
      return;
    }

    if (newStatus === 'resuelto') {
      // Solo se puede resolver desde pending_approval y solo por admin
      if (report.status !== 'pending_approval') {
        toast.error('Error: Workflow incorrecto', {
          description: 'Solo se pueden resolver reportes que estén en "Pendiente de Aprobación"'
        });
        return;
      }
    }
    
    updateReportStatus(reportId, newStatus as any);
    
    // Notificar según el nuevo estado
    if (newStatus === 'assigned_to_security' || newStatus === 'in_progress') {
      notifyReportProgress(reportId, 'assigned', 'security');
      notifyReportProgress(reportId, 'assigned', 'user');
    } else if (newStatus === 'resuelto') {
      notifyReportProgress(reportId, 'resolved', 'user');
    }
    
    // Verificar zonas peligrosas después de cualquier cambio
    checkDangerousZones(reports);
    
    toast.success(`Estado actualizado a ${getStatusText(newStatus).toLowerCase()}`, {
      description: `Reporte #${reportId.slice(-6)} ha sido actualizado exitosamente.`
    });
  };

  const handlePriorityChange = (reportId: string, newPriority: string) => {
    updateReportPriority(reportId, newPriority as any);
    toast.success(`Prioridad actualizada a ${newPriority}`, {
      description: `Reporte #${reportId.slice(-6)} ahora tiene prioridad ${newPriority}.`
    });
  };

  const handleAssignToSecurity = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      setSelectedReport(report);
      setIsSecurityModalOpen(true);
    }
  };

  const handleCancelReport = (reportId: string) => {
    if (window.confirm('¿Estás seguro que deseas cancelar este reporte? Esta acción no se puede deshacer.')) {
      cancelReport(reportId, 'admin');
      toast.success('Reporte cancelado exitosamente', {
        description: `Reporte #${reportId.slice(-6)} ha sido cancelado.`
      });
    }
  };

  // Function to check if a report can be cancelled
  const canCancelReport = (report: any) => {
    const cancelableStatuses = ['nuevo', 'in_progress', 'assigned_to_security', 'investigando'];
    return cancelableStatuses.includes(report?.status);
  };

  // Function to handle report approval
  const handleApproveReport = (reportId: string, approved: boolean, comments?: string) => {
    approveResolution(reportId, approved, comments);
    
    if (approved) {
      notifyReportProgress(reportId, 'resolved', 'user');
      toast.success('Reporte aprobado y marcado como resuelto', {
        description: `Reporte #${reportId.slice(-6)} ha sido aprobado exitosamente.`
      });
    } else {
      toast.success('Reporte devuelto a seguridad para correcciones', {
        description: `Reporte #${reportId.slice(-6)} ha sido devuelto para revisión.`
      });
    }
  };

  const handleOpenApprovalModal = (report: any) => {
    setSelectedReportForApproval(report);
    setApprovalComments('');
    setIsApprovalModalOpen(true);
  };

  const handleApprovalDecision = (approved: boolean) => {
    if (selectedReportForApproval) {
      handleApproveReport(selectedReportForApproval.id, approved, approvalComments);
      setIsApprovalModalOpen(false);
      setSelectedReportForApproval(null);
      setApprovalComments('');
    }
  };

  const handleOpenDetailsModal = (report: any) => {
    setSelectedReportForDetails(report);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedReportForDetails(null);
  };

  // Function to definitively close a report
  const handleCloseReportDefinitively = (reportId: string) => {
    if (window.confirm('¿Estás seguro que deseas cerrar definitivamente este reporte? Esta acción no se puede deshacer.')) {
      updateReportStatus(reportId, 'cerrado');
      toast.success('Reporte cerrado definitivamente', {
        description: `Reporte #${reportId.slice(-6)} ha sido cerrado permanentemente.`
      });
    }
  };

  // Function to get available status options based on current status and conditions
  const getAvailableStatusOptions = (report: any) => {
    const currentStatus = report.status;
    const isAssigned = report.assignedTo && report.securityActions?.assignedOfficer;

    switch (currentStatus) {
      case 'nuevo':
        return [
          { value: 'nuevo', label: 'Nuevo' },
          { value: 'in_progress', label: 'Pasar a En Proceso (Asignar)' },
          { value: 'cancelado', label: 'Cancelado' }
        ];
      
      case 'in_progress':
        if (!isAssigned) {
          return [
            { value: 'in_progress', label: 'En Proceso' },
            { value: 'nuevo', label: 'Volver a Nuevo' },
            { value: 'cancelado', label: 'Cancelado' }
          ];
        } else {
          return [
            { value: 'in_progress', label: 'En Proceso' },
            { value: 'cancelado', label: 'Cancelado' }
          ];
        }
      
      case 'assigned_to_security':
      case 'investigando':
        // Estados legacy que ahora pasan directamente a pending_approval
        return [
          { value: 'pending_approval', label: 'Pend. Aprobación' },
          { value: 'cancelado', label: 'Cancelado' }
        ];
      
      case 'pending_approval':
        return [
          { value: 'pending_approval', label: 'Pend. Aprobación' },
          { value: 'resuelto', label: 'Aprobar y Resolver' },
          { value: 'in_progress', label: 'Devolver a En Proceso' }
        ];
      
      case 'resuelto':
        return [
          { value: 'resuelto', label: 'Resuelto' }
        ];
      
      default:
        return [
          { value: 'nuevo', label: 'Nuevo' },
          { value: 'in_progress', label: 'En Proceso' },
          { value: 'pending_approval', label: 'Pend. Aprobación' },
          { value: 'resuelto', label: 'Resuelto' },
          { value: 'cancelado', label: 'Cancelado' }
        ];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Admin Header */}
        <div className="mb-6 sm:mb-8">
          <Alert className="border-primary bg-blue-50">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
            <AlertDescription className="text-sm sm:text-base lg:text-lg">
              Panel de Administración - Gestiona alertas, reportes y supervisa la seguridad del campus en tiempo real.
            </AlertDescription>
          </Alert>
        </div>

        {/* Dashboard Stats */}
        <section className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
            <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-primary" />
            Dashboard de Administración
          </h1>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-red-500 p-1.5 sm:p-2 rounded-lg">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-lg sm:text-xl lg:text-2xl">{criticalAlerts}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Alertas Críticas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-yellow-500 p-1.5 sm:p-2 rounded-lg">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-lg sm:text-xl lg:text-2xl">{inProcessReports.length}</p>
                    <p className="text-xs sm:text-sm text-gray-600">En Proceso</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-purple-500 p-1.5 sm:p-2 rounded-lg">
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-lg sm:text-xl lg:text-2xl">{pendingApprovalReports.length}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Pend. Aprobación</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-blue-500 p-1.5 sm:p-2 rounded-lg">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-lg sm:text-xl lg:text-2xl">{totalReports}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Total Reportes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-green-500 p-1.5 sm:p-2 rounded-lg">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-lg sm:text-xl lg:text-2xl">{resolved}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Casos Resueltos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Main Content Tabs */}
        <Tabs defaultValue="recientes" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-4 sm:mb-6 h-auto">
            <TabsTrigger value="recientes" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Reportes</span> Recientes
            </TabsTrigger>
            <TabsTrigger value="proceso" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">En</span> Proceso
            </TabsTrigger>
            <TabsTrigger value="aprobacion" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3 col-span-2 sm:col-span-1">
              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden lg:inline">Pend.</span> Aprobación ({pendingApprovalReports.length})
            </TabsTrigger>
            <TabsTrigger value="resueltos" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3">
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              Resueltos
            </TabsTrigger>
            <TabsTrigger value="cancelados" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3">
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
              Cancelados
            </TabsTrigger>
          </TabsList>

          {/* Reportes Recientes Tab */}
          <TabsContent value="recientes">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-lg sm:text-xl lg:text-2xl flex items-center gap-2 sm:gap-3">
                  <FileText className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-primary" />
                  Reportes Recientes ({recentReports.length})
                </h2>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar
                  </Button>
                  <Button variant="outline" size="sm">
                    Actualizar
                  </Button>
                  <Badge variant="outline" className="px-3 py-1">
                    🆕 NUEVOS
                  </Badge>
                </div>
              </div>

              {recentReports.length === 0 ? (
                <Card className="border-2 border-dashed border-gray-300">
                  <CardContent className="p-12 text-center">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl mb-2 text-gray-600">No hay reportes nuevos</h3>
                    <p className="text-gray-500 mb-6">
                      Excelente! No hay reportes nuevos pendientes de revisión en este momento.
                    </p>
                    <Badge variant="outline" className="px-4 py-2">
                      ✅ Estado: Todo al día
                    </Badge>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {recentReports.map((report) => (
                    <Card 
                      key={report.id} 
                      className={`border-l-4 hover:shadow-lg transition-all ${
                        report.priority === 'alta' ? 'border-l-red-500 bg-red-50' : 
                        report.priority === 'media' ? 'border-l-yellow-500 bg-yellow-50' : 
                        'border-l-blue-500 bg-blue-50'
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">
                              {getIncidentTypeIcon(report.incidentType)}
                            </div>
                            <div>
                              <h4 className="text-lg">{getIncidentTypeLabel(report.incidentType)}</h4>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span>{report.zone}</span>
                                <span>•</span>
                                <span>{formatTimestamp(report.timestamp)}</span>
                                <span>•</span>
                                <span>ID: #{report.id.slice(-6)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getPriorityColor(report.priority)}>
                              {report.priority.toUpperCase()}
                            </Badge>
                            <Badge className="bg-blue-500 hover:bg-blue-600">
                              NUEVO
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-4">
                          {report.description}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-gray-50 p-4 rounded-lg">
                          <div>
                            <label className="text-sm text-gray-600">Prioridad</label>
                            <select 
                              value={report.priority}
                              onChange={(e) => handlePriorityChange(report.id, e.target.value)}
                              className="w-full mt-1 p-2 border rounded text-sm"
                            >
                              <option value="baja">Baja</option>
                              <option value="media">Media</option>
                              <option value="alta">Alta</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-sm text-gray-600">Estado</label>
                            <select 
                              value={report.status}
                              onChange={(e) => handleStatusChange(report.id, e.target.value)}
                              className="w-full mt-1 p-2 border rounded text-sm"
                            >
                              {getAvailableStatusOptions(report).map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-sm text-gray-600">Recibido</label>
                            <p className="mt-1 p-2 text-sm text-gray-700">
                              {formatTimestamp(report.timestamp)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {report.hasPhoto && (
                              <div className="flex items-center gap-1">
                                <Camera className="h-4 w-4" />
                                <span>Evidencia: {report.photoName}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Shield className="h-4 w-4" />
                              <span>{report.isAnonymous ? 'Reporte Anónimo' : 'Con contacto'}</span>
                            </div>
                            {!report.isAnonymous && report.contactInfo && (
                              <div className="flex items-center gap-1">
                                <Info className="h-4 w-4" />
                                <span>Contacto disponible</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            {canCancelReport(report) && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleCancelReport(report.id)}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Cancelar
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Reportes en Proceso Tab */}
          <TabsContent value="proceso">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl flex items-center gap-3">
                  <Clock className="h-8 w-8 text-primary" />
                  Reportes en Proceso ({inProcessReports.length})
                </h2>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar
                  </Button>
                  <Button variant="outline" size="sm">
                    Actualizar Estado
                  </Button>
                  <Badge variant="outline" className="px-3 py-1">
                    🔄 EN PROGRESO
                  </Badge>
                </div>
              </div>

              {inProcessReports.length === 0 ? (
                <Card className="border-2 border-dashed border-gray-300">
                  <CardContent className="p-12 text-center">
                    <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl mb-2 text-gray-600">No hay reportes en proceso</h3>
                    <p className="text-gray-500 mb-6">
                      No hay reportes siendo procesados actualmente por el equipo de seguridad.
                    </p>
                    <Badge variant="outline" className="px-4 py-2">
                      ⏸️ Estado: Sin casos activos
                    </Badge>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {inProcessReports.map((report) => (
                    <Card 
                      key={report.id} 
                      className="border-l-4 border-l-orange-500 bg-orange-50 hover:shadow-lg transition-all"
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">
                              {getIncidentTypeIcon(report.incidentType)}
                            </div>
                            <div>
                              <h4 className="text-lg">{getIncidentTypeLabel(report.incidentType)}</h4>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span>{report.zone}</span>
                                <span>•</span>
                                <span>Iniciado: {formatTimestamp(report.timestamp)}</span>
                                <span>•</span>
                                <span>ID: #{report.id.slice(-6)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getPriorityColor(report.priority)}>
                              {report.priority.toUpperCase()}
                            </Badge>
                            <Badge 
                              className={
                                report.status === 'investigando' ? 'bg-yellow-500 hover:bg-yellow-600' :
                                report.status === 'assigned_to_security' ? 'bg-purple-500 hover:bg-purple-600' :
                                'bg-orange-500 hover:bg-orange-600'
                              }
                            >
                              {getStatusText(report.status)}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-4">
                          {report.description}
                        </p>

                        {/* Progress Tracking */}
                        <div className="bg-white p-4 rounded-lg border mb-4">
                          <h5 className="font-medium mb-3 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Estado del Proceso
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="text-sm text-gray-600">Asignado a</label>
                              <p className="text-sm font-medium">
                                {report.securityActions?.assignedOfficer ? 
                                  `${report.securityActions.assignedOfficer}` : 
                                  'Sin asignar'
                                }
                              </p>
                              {!report.securityActions?.assignedOfficer && (
                                <span className="text-xs text-red-600">⚠️ Requiere asignación</span>
                              )}
                            </div>
                            <div>
                              <label className="text-sm text-gray-600">Tiempo en proceso</label>
                              <p className="text-sm font-medium">
                                {formatTimestamp(report.updatedAt)}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm text-gray-600">Última actualización</label>
                              <p className="text-sm font-medium">
                                {formatTimestamp(report.updatedAt)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Admin Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-gray-50 p-4 rounded-lg">
                          <div>
                            <label className="text-sm text-gray-600">Cambiar Prioridad</label>
                            <select 
                              value={report.priority}
                              onChange={(e) => handlePriorityChange(report.id, e.target.value)}
                              className="w-full mt-1 p-2 border rounded text-sm"
                            >
                              <option value="baja">Baja</option>
                              <option value="media">Media</option>
                              <option value="alta">Alta</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-sm text-gray-600">Cambiar Estado</label>
                            <select 
                              value={report.status}
                              onChange={(e) => handleStatusChange(report.id, e.target.value)}
                              className="w-full mt-1 p-2 border rounded text-sm"
                            >
                              {getAvailableStatusOptions(report).map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {report.hasPhoto && (
                              <div className="flex items-center gap-1">
                                <Camera className="h-4 w-4" />
                                <span>Evidencia disponible</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Shield className="h-4 w-4" />
                              <span>{report.isAnonymous ? 'Reporte Anónimo' : 'Con contacto'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>En progreso activo</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            {/* Mostrar botón de asignar solo si no está asignado */}
                            {(!report.assignedTo || !report.securityActions?.assignedOfficer) && (
                              <Button 
                                size="sm" 
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => handleAssignToSecurity(report.id)}
                              >
                                <Shield className="h-4 w-4 mr-1" />
                                Asignar a Seguridad
                              </Button>
                            )}
                            {/* Botón de contactar solo si ya está asignado */}
                            {report.assignedTo && report.securityActions?.assignedOfficer && (
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Bell className="h-4 w-4 mr-1" />
                                Contactar Seguridad
                              </Button>
                            )}
                            {canCancelReport(report) && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleCancelReport(report.id)}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Cancelar
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Reportes Pendientes de Aprobación Tab */}
          <TabsContent value="aprobacion">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl flex items-center gap-3">
                  <AlertCircle className="h-8 w-8 text-purple-600" />
                  Reportes Pendientes de Aprobación ({pendingApprovalReports.length})
                </h2>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar
                  </Button>
                  <Button variant="outline" size="sm">
                    Actualizar
                  </Button>
                  <Badge variant="outline" className="px-3 py-1 bg-purple-100 text-purple-800">
                    🔍 REQUIERE APROBACIÓN
                  </Badge>
                </div>
              </div>

              {pendingApprovalReports.length === 0 ? (
                <Card className="border-2 border-dashed border-gray-300">
                  <CardContent className="p-12 text-center">
                    <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl mb-2 text-gray-600">No hay reportes pendientes de aprobación</h3>
                    <p className="text-gray-500 mb-6">
                      Excelente! No hay reportes de seguridad esperando tu aprobación en este momento.
                    </p>
                    <Badge variant="outline" className="px-4 py-2">
                      ✅ Estado: Todo al día
                    </Badge>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pendingApprovalReports.map((report) => (
                    <Card 
                      key={report.id} 
                      className="border-l-4 border-l-purple-500 bg-purple-50 hover:shadow-lg transition-all"
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">
                              {getIncidentTypeIcon(report.incidentType)}
                            </div>
                            <div>
                              <h4 className="text-lg">{getIncidentTypeLabel(report.incidentType)}</h4>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span>{report.zone}</span>
                                <span>•</span>
                                <span>Completado: {formatTimestamp(report.updatedAt)}</span>
                                <span>•</span>
                                <span>ID: #{report.id.slice(-6)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getPriorityColor(report.priority)}>
                              {report.priority.toUpperCase()}
                            </Badge>
                            <Badge className="bg-purple-500 hover:bg-purple-600">
                              PENDIENTE APROBACIÓN
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-4">
                          <strong>Reporte Original:</strong> {report.description}
                        </p>

                        {/* Descripción de Seguridad */}
                        {report.securityActions?.securityDescription && (
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                            <h5 className="font-medium mb-2 flex items-center gap-2 text-blue-800">
                              <Shield className="h-4 w-4" />
                              Parte de Seguridad - Descripción de Resolución
                            </h5>
                            <p className="text-blue-700 bg-white p-3 rounded border">
                              {report.securityActions.securityDescription}
                            </p>
                            {report.securityActions.endTime && (
                              <p className="text-sm text-blue-600 mt-2">
                                <strong>Completado:</strong> {new Date(report.securityActions.endTime).toLocaleString()}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Officer Information */}
                        {report.securityActions?.assignedOfficer && (
                          <div className="bg-gray-50 p-3 rounded-lg mb-4">
                            <p className="text-sm">
                              <strong>Oficial Asignado:</strong> {report.securityActions.assignedOfficer}
                            </p>
                          </div>
                        )}

                        {/* Evidence Information */}
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                          {report.hasPhoto && (
                            <div className="flex items-center gap-1">
                              <Camera className="h-4 w-4" />
                              <span>Evidencia: {report.photoName}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Shield className="h-4 w-4" />
                            <span>{report.isAnonymous ? 'Reporte Anónimo' : 'Con contacto'}</span>
                          </div>
                          {!report.isAnonymous && report.contactInfo && (
                            <div className="flex items-center gap-1">
                              <Info className="h-4 w-4" />
                              <span>Contacto disponible</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-3">
                          <Button 
                            onClick={() => handleOpenApprovalModal(report)}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Revisar y Decidir
                          </Button>
                          <Button 
                            onClick={() => handleApproveReport(report.id, true)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            Aprobar Inmediatamente
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => handleApproveReport(report.id, false, 'Requiere más información')}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <ThumbsDown className="h-4 w-4 mr-2" />
                            Rechazar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Reportes Resueltos Tab */}
          <TabsContent value="resueltos">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  Reportes Resueltos ({resolvedReports.length})
                </h2>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar
                  </Button>
                  <Button variant="outline" size="sm">
                    Exportar
                  </Button>
                  <Badge variant="outline" className="px-3 py-1 bg-green-100 text-green-800">
                    ✅ RESUELTOS
                  </Badge>
                </div>
              </div>

              {resolvedReports.length === 0 ? (
                <Card className="border-2 border-dashed border-gray-300">
                  <CardContent className="p-12 text-center">
                    <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl mb-2 text-gray-600">No hay reportes resueltos</h3>
                    <p className="text-gray-500 mb-6">
                      Los reportes resueltos aparecerán aquí una vez que se completen las investigaciones.
                    </p>
                    <Badge variant="outline" className="px-4 py-2">
                      📋 Estado: Esperando resoluciones
                    </Badge>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {resolvedReports.map((report) => (
                    <Card 
                      key={report.id} 
                      className="border-l-4 border-l-green-500 bg-green-50 hover:shadow-lg transition-all"
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">
                              {getIncidentTypeIcon(report.incidentType)}
                            </div>
                            <div>
                              <h4 className="text-lg">{getIncidentTypeLabel(report.incidentType)}</h4>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span>{report.zone}</span>
                                <span>•</span>
                                <span>Resuelto: {formatTimestamp(report.updatedAt)}</span>
                                <span>•</span>
                                <span>ID: #{report.id.slice(-6)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge className="bg-gray-400 hover:bg-gray-500">
                              {report.priority.toUpperCase()}
                            </Badge>
                            <Badge className="bg-green-500 hover:bg-green-600">
                              RESUELTO
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-4">
                          {report.description}
                        </p>

                        {/* Resolution Details */}
                        {report.securityActions?.resolutionDetails && (
                          <div className="bg-green-100 p-4 rounded-lg border border-green-200 mb-4">
                            <h5 className="font-medium mb-2 flex items-center gap-2 text-green-800">
                              <CheckCircle className="h-4 w-4" />
                              Detalles de la Resolución
                            </h5>
                            <p className="text-green-700">
                              {report.securityActions.resolutionDetails}
                            </p>
                          </div>
                        )}

                        {/* Actions Taken */}
                        {report.securityActions?.actionsTaken && (
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                            <h5 className="font-medium mb-2 flex items-center gap-2 text-blue-800">
                              <Shield className="h-4 w-4" />
                              Acciones Realizadas
                            </h5>
                            <p className="text-blue-700">
                              {report.securityActions.actionsTaken}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {report.hasPhoto && (
                              <div className="flex items-center gap-1">
                                <Camera className="h-4 w-4" />
                                <span>Evidencia: {report.photoName}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Shield className="h-4 w-4" />
                              <span>{report.isAnonymous ? 'Reporte Anónimo' : 'Con contacto'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              <span>Caso cerrado exitosamente</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleOpenDetailsModal(report)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver Detalle
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleCloseReportDefinitively(report.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Cerrar Definitivamente
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Reportes Cancelados Tab */}
          <TabsContent value="cancelados">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl flex items-center gap-3">
                  <X className="h-8 w-8 text-red-600" />
                  Reportes Cancelados ({cancelledReports.length})
                </h2>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar
                  </Button>
                  <Button variant="outline" size="sm">
                    Exportar
                  </Button>
                  <Badge variant="outline" className="px-3 py-1">
                    ❌ CANCELADOS
                  </Badge>
                </div>
              </div>

              {cancelledReports.length === 0 ? (
                <Card className="border-2 border-dashed border-gray-300">
                  <CardContent className="p-12 text-center">
                    <X className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl mb-2 text-gray-600">No hay reportes cancelados</h3>
                    <p className="text-gray-500 mb-6">
                      No se han cancelado reportes recientemente.
                    </p>
                    <Badge variant="outline" className="px-4 py-2">
                      ℹ️ Estado: Sin cancelaciones
                    </Badge>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {cancelledReports.map((report) => (
                    <Card 
                      key={report.id} 
                      className="border-l-4 border-l-red-500 bg-red-50 hover:shadow-lg transition-all opacity-75"
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl opacity-50">
                              {getIncidentTypeIcon(report.incidentType)}
                            </div>
                            <div>
                              <h4 className="text-lg text-gray-600">{getIncidentTypeLabel(report.incidentType)}</h4>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span>{report.zone}</span>
                                <span>•</span>
                                <span>Cancelado: {formatTimestamp(report.updatedAt)}</span>
                                <span>•</span>
                                <span>ID: #{report.id.slice(-6)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge className="bg-gray-400 hover:bg-gray-500">
                              {report.priority.toUpperCase()}
                            </Badge>
                            <Badge className="bg-red-500 hover:bg-red-600">
                              CANCELADO
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-4 line-through">
                          {report.description}
                        </p>
                        
                        <div className="bg-gray-100 p-4 rounded-lg border mb-4">
                          <h5 className="font-medium mb-3 flex items-center gap-2 text-gray-600">
                            <X className="h-4 w-4" />
                            Información de Cancelación
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="text-sm text-gray-600">Fecha de cancelación</label>
                              <p className="text-sm font-medium">
                                {formatTimestamp(report.updatedAt)}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm text-gray-600">Reporte original</label>
                              <p className="text-sm font-medium">
                                {formatTimestamp(report.timestamp)}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm text-gray-600">Estado anterior</label>
                              <p className="text-sm font-medium">
                                En proceso
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {report.hasPhoto && (
                              <div className="flex items-center gap-1">
                                <Camera className="h-4 w-4" />
                                <span className="line-through">Evidencia: {report.photoName}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Shield className="h-4 w-4" />
                              <span>{report.isAnonymous ? 'Reporte Anónimo' : 'Con contacto'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <X className="h-4 w-4" />
                              <span>Cancelado por administrador</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" disabled>
                              <Eye className="h-4 w-4 mr-1" />
                              Ver Archivado
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal de Aprobación */}
        <Dialog open={isApprovalModalOpen} onOpenChange={setIsApprovalModalOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-purple-600" />
                Revisar Resolución del Reporte
              </DialogTitle>
            </DialogHeader>
            
            {selectedReportForApproval && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Información del Reporte</h3>
                  <p><strong>Tipo:</strong> {getIncidentTypeLabel(selectedReportForApproval.incidentType)}</p>
                  <p><strong>Ubicación:</strong> {selectedReportForApproval.zone}</p>
                  <p><strong>Descripción Original:</strong> {selectedReportForApproval.description}</p>
                  <p><strong>ID:</strong> #{selectedReportForApproval.id.slice(-6)}</p>
                </div>

                {selectedReportForApproval.securityActions?.securityDescription && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-medium mb-2 text-blue-800">Parte de Seguridad</h3>
                    <div className="bg-white p-3 rounded border">
                      <p className="text-blue-700">{selectedReportForApproval.securityActions.securityDescription}</p>
                    </div>
                    {selectedReportForApproval.securityActions.assignedOfficer && (
                      <p className="text-sm text-blue-600 mt-2">
                        <strong>Oficial:</strong> {selectedReportForApproval.securityActions.assignedOfficer}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comentarios de Aprobación (Opcional)
                  </label>
                  <Textarea
                    value={approvalComments}
                    onChange={(e) => setApprovalComments(e.target.value)}
                    placeholder="Agregue comentarios adicionales sobre la resolución del caso..."
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsApprovalModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleApprovalDecision(false)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <ThumbsDown className="h-4 w-4 mr-2" />
                Rechazar y Devolver
              </Button>
              <Button 
                onClick={() => handleApprovalDecision(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                Aprobar y Marcar como Resuelto
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Detalles Completos */}
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Detalles Completos del Reporte
              </DialogTitle>
            </DialogHeader>
            
            {selectedReportForDetails && (
              <div className="space-y-6">
                {/* Información Básica */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Información del Reporte
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">ID del Reporte</label>
                      <p className="font-medium">#{selectedReportForDetails.id.slice(-6)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Tipo de Incidente</label>
                      <p className="font-medium">{getIncidentTypeLabel(selectedReportForDetails.incidentType)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Ubicación</label>
                      <p className="font-medium">{selectedReportForDetails.zone}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Prioridad</label>
                      <Badge className={getPriorityColor(selectedReportForDetails.priority)}>
                        {selectedReportForDetails.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Fecha y Hora de Reporte</label>
                      <p className="font-medium">{new Date(selectedReportForDetails.timestamp).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Estado Actual</label>
                      <Badge className={getStatusColor(selectedReportForDetails.status)}>
                        {getStatusText(selectedReportForDetails.status)}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Tipo de Reporte</label>
                      <p className="font-medium">{selectedReportForDetails.isAnonymous ? 'Anónimo' : 'Con Contacto'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Evidencia Fotográfica</label>
                      <p className="font-medium">
                        {selectedReportForDetails.hasPhoto ? 
                          `Sí - ${selectedReportForDetails.photoName}` : 
                          'No incluida'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Descripción Original */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-medium mb-2 text-blue-800">Descripción Original</h3>
                  <p className="text-blue-700">{selectedReportForDetails.description}</p>
                </div>

                {/* Información de Contacto (si no es anónimo) */}
                {!selectedReportForDetails.isAnonymous && selectedReportForDetails.contactInfo && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-medium mb-2 text-green-800">Información de Contacto</h3>
                    <p className="text-green-700">Contacto disponible (protegido por privacidad)</p>
                  </div>
                )}

                {/* Información de Seguridad Asignada */}
                {selectedReportForDetails.securityActions?.assignedOfficer && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h3 className="font-medium mb-3 text-purple-800 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Asignación de Seguridad
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-purple-600">Oficial Asignado</label>
                        <p className="font-medium text-purple-700">{selectedReportForDetails.securityActions.assignedOfficer}</p>
                      </div>
                      <div>
                        <label className="text-sm text-purple-600">Fecha de Asignación</label>
                        <p className="font-medium text-purple-700">
                          {selectedReportForDetails.securityActions.assignedAt ? 
                            new Date(selectedReportForDetails.securityActions.assignedAt).toLocaleString() : 
                            'No disponible'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Acciones Realizadas por Seguridad */}
                {selectedReportForDetails.securityActions?.actionsTaken && (
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h3 className="font-medium mb-2 text-orange-800 flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Acciones Realizadas
                    </h3>
                    <p className="text-orange-700">{selectedReportForDetails.securityActions.actionsTaken}</p>
                  </div>
                )}

                {/* Parte de Seguridad */}
                {selectedReportForDetails.securityActions?.securityDescription && (
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <h3 className="font-medium mb-2 text-indigo-800 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Parte de Seguridad
                    </h3>
                    <p className="text-indigo-700">{selectedReportForDetails.securityActions.securityDescription}</p>
                  </div>
                )}

                {/* Detalles de Resolución */}
                {selectedReportForDetails.securityActions?.resolutionDetails && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-medium mb-2 text-green-800 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Detalles de la Resolución
                    </h3>
                    <p className="text-green-700">{selectedReportForDetails.securityActions.resolutionDetails}</p>
                  </div>
                )}

                {/* Timeline de Estados */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Timeline del Reporte
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">
                        <strong>Creado:</strong> {new Date(selectedReportForDetails.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {selectedReportForDetails.updatedAt && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">
                          <strong>Última Actualización:</strong> {new Date(selectedReportForDetails.updatedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">
                        <strong>Estado Actual:</strong> {getStatusText(selectedReportForDetails.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button onClick={handleCloseDetailsModal}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Security Assignment Modal */}
        <SecurityAssignmentModal
          isOpen={isSecurityModalOpen}
          onClose={() => setIsSecurityModalOpen(false)}
          report={selectedReport}
          onAssign={() => {
            setIsSecurityModalOpen(false);
            setSelectedReport(null);
          }}
        />
      </main>
    </div>
  );
}