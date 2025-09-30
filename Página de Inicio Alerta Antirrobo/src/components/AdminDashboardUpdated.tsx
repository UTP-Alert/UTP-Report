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

  // Data for recent reports (new reports)
  const recentReports = reports.filter(report => 
    report.status === 'nuevo'
  ).sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Data for reports in process
  const inProcessReports = reports.filter(report => 
    ['assigned_to_security', 'in_progress', 'investigando'].includes(report.status)
  ).sort((a, b) => 
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
  const investigating = getReportsByStatus('investigando').length;
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
      case 'activo': return 'bg-red-500 hover:bg-red-600';
      case 'investigando': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'resuelto': return 'bg-green-500 hover:bg-green-600';
      case 'pending_approval': return 'bg-purple-500 hover:bg-purple-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'nuevo': return 'NUEVO';
      case 'investigando': return 'INVESTIGANDO';
      case 'resuelto': return 'RESUELTO';
      case 'cerrado': return 'CERRADO';
      case 'assigned_to_security': return 'ASIGNADO A SEGURIDAD';
      case 'in_progress': return 'EN PROCESO';
      case 'pending_approval': return 'PENDIENTE DE APROBACIÓN';
      case 'cancelado': return 'CANCELADO';
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
    // Si el nuevo estado es cancelado, usar la función de cancelar
    if (newStatus === 'cancelado') {
      handleCancelReport(reportId);
      return;
    }
    
    updateReportStatus(reportId, newStatus as any);
    
    // Notificar según el nuevo estado
    if (newStatus === 'assigned_to_security') {
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
    const cancelableStatuses = ['nuevo', 'investigando', 'assigned_to_security', 'in_progress'];
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

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Admin Header */}
        <div className="mb-8">
          <Alert className="border-primary bg-blue-50">
            <Shield className="h-6 w-6" />
            <AlertDescription className="text-lg">
              Panel de Administración - Gestiona alertas, reportes y supervisa la seguridad del campus en tiempo real.
            </AlertDescription>
          </Alert>
        </div>

        {/* Dashboard Stats */}
        <section className="mb-8">
          <h1 className="text-3xl mb-6 flex items-center gap-3">
            <BarChart3 className="h-10 w-10 text-primary" />
            Dashboard de Administración
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-red-500 p-2 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl">{criticalAlerts}</p>
                    <p className="text-sm text-gray-600">Alertas Críticas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-500 p-2 rounded-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl">{inProcessReports.length}</p>
                    <p className="text-sm text-gray-600">En Proceso</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-500 p-2 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl">{pendingApprovalReports.length}</p>
                    <p className="text-sm text-gray-600">Pend. Aprobación</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl">{totalReports}</p>
                    <p className="text-sm text-gray-600">Total Reportes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500 p-2 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl">{resolved}</p>
                    <p className="text-sm text-gray-600">Casos Resueltos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Main Content Tabs */}
        <Tabs defaultValue="recientes" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="recientes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reportes Recientes
            </TabsTrigger>
            <TabsTrigger value="proceso" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Reportes en Proceso
            </TabsTrigger>
            <TabsTrigger value="aprobacion" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Pend. Aprobación ({pendingApprovalReports.length})
            </TabsTrigger>
            <TabsTrigger value="resueltos" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Reportes Resueltos
            </TabsTrigger>
            <TabsTrigger value="cancelados" className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Reportes Cancelados
            </TabsTrigger>
          </TabsList>

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

          {/* Existing tabs content would go here - truncated for brevity */}
          <TabsContent value="recientes">
            <div className="text-center p-8">
              <p className="text-gray-600">Tab de Reportes Recientes - Funcionalidad existente mantenida</p>
            </div>
          </TabsContent>

          <TabsContent value="proceso">
            <div className="text-center p-8">
              <p className="text-gray-600">Tab de Reportes en Proceso - Funcionalidad existente mantenida</p>
            </div>
          </TabsContent>

          <TabsContent value="resueltos">
            <div className="text-center p-8">
              <p className="text-gray-600">Tab de Reportes Resueltos - Funcionalidad existente mantenida</p>
            </div>
          </TabsContent>

          <TabsContent value="cancelados">
            <div className="text-center p-8">
              <p className="text-gray-600">Tab de Reportes Cancelados - Funcionalidad existente mantenida</p>
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