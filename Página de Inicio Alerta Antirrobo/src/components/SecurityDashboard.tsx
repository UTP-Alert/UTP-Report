import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { useReportService } from './services/ReportService';
import { useSecurityService, getStatusColor, getStatusText } from './services/SecurityService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { 
  Shield, 
  MapPin, 
  Clock, 
  User, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  CheckSquare,
  Navigation,
  Camera,
  ArrowRight,
  MapPinCheck
} from 'lucide-react';

interface SecurityDashboardProps {
  onOpenReport: () => void;
}

export function SecurityDashboard({ onOpenReport }: SecurityDashboardProps) {
  const { reports, updateReportStatus, submitSecurityDescription } = useReportService();
  const { officers, updateOfficerStatus, completeReportForOfficer } = useSecurityService();
  
  // For demo purposes, assume we're the first security officer
  const currentOfficer = officers.length > 0 ? officers[0] : null;
  const [selectedZone, setSelectedZone] = React.useState<string>('');
  const [isCompletionModalOpen, setIsCompletionModalOpen] = React.useState(false);
  const [selectedReportId, setSelectedReportId] = React.useState<string>('');
  const [reportDescription, setReportDescription] = React.useState('');
  const [isGoingToZoneModalOpen, setIsGoingToZoneModalOpen] = React.useState(false);

  // Filtrar reportes asignados a seguridad
  const assignedReports = reports.filter(report => 
    (report.status === 'assigned_to_security' || 
     report.status === 'going_to_zone' ||
     report.status === 'in_progress' ||
     report.status === 'investigating' ||
     report.status === 'pending_approval') &&
    report.assignedTo === 'security' && // Solo reportes asignados a seguridad
    report.securityActions?.assignedOfficer // Solo reportes con oficial asignado
  );

  const completedReports = reports.filter(report => 
    report.status === 'resolved' && report.assignedTo === 'security'
  );

  const handleGoToZone = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report && currentOfficer) {
      updateReportStatus(reportId, 'going_to_zone');
      updateOfficerStatus(currentOfficer.id, 'busy', report.zone);
      setSelectedReportId(reportId);
      setIsGoingToZoneModalOpen(true);
      toast.success(`Dirigiéndose a ${report.zone}. Estado actualizado a ocupado.`);
    }
  };

  const handleArriveAtZone = () => {
    if (selectedReportId && currentOfficer) {
      updateReportStatus(selectedReportId, 'investigating');
      toast.success('Ha llegado a la zona. Puede comenzar la investigación.');
      setIsGoingToZoneModalOpen(false);
      setSelectedReportId('');
    }
  };

  const handleStartInvestigation = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report && currentOfficer) {
      updateReportStatus(reportId, 'investigating');
      toast.info('Investigación iniciada.');
    }
  };

  const handleOpenCompletionModal = (reportId: string) => {
    setSelectedReportId(reportId);
    setIsCompletionModalOpen(true);
    setReportDescription('');
  };

  const handleCompleteReport = () => {
    if (!reportDescription.trim()) {
      toast.error('Por favor ingrese la descripción del parte policial.');
      return;
    }

    if (!currentOfficer) {
      toast.error('No se puede completar el reporte sin un oficial asignado.');
      return;
    }

    // Enviar descripción de seguridad para aprobación del administrador
    submitSecurityDescription(selectedReportId, reportDescription);
    completeReportForOfficer(currentOfficer.id, selectedReportId);
    
    // Guardar la descripción del parte para logs
    const selectedReport = reports.find(r => r.id === selectedReportId);
    if (selectedReport) {
      const reportCompletion = {
        reportId: selectedReportId,
        officerId: currentOfficer.id,
        officerName: currentOfficer.name,
        completionDescription: reportDescription,
        completedAt: new Date().toISOString(),
        originalReport: selectedReport
      };
      
      console.log('Parte policial enviado para aprobación:', reportCompletion);
    }
    
    toast.success('Parte policial enviado al administrador para aprobación.');
    setIsCompletionModalOpen(false);
    setReportDescription('');
    setSelectedReportId('');
  };

  const handleReportProgress = (reportId: string) => {
    updateReportStatus(reportId, 'in_progress');
    toast.info('Reporte marcado como en progreso.');
  };

  const handleStatusChange = (newStatus: 'available' | 'busy' | 'offline') => {
    if (!currentOfficer) {
      toast.error('No se puede cambiar el estado sin un oficial asignado.');
      return;
    }
    updateOfficerStatus(currentOfficer.id, newStatus, selectedZone || undefined);
    toast.success(`Estado actualizado a ${getStatusText(newStatus).toLowerCase()}`);
  };

  const zones = [
    'Estacionamiento Este',
    'Biblioteca Central', 
    'Cafetería Norte',
    'Zona Deportiva',
    'Edificio de Administración',
    'Aulas Norte',
    'Residencias Estudiantiles',
    'Jardines Campus',
    'Entrada Principal',
    'Laboratorios',
    'Auditorio Principal',
    'Cafetería Sur'
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta':
        return 'bg-red-500';
      case 'media':
        return 'bg-yellow-500';
      case 'baja':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getReportStatusColor = (status: string) => {
    switch (status) {
      case 'assigned_to_security':
        return 'bg-blue-500';
      case 'going_to_zone':
        return 'bg-amber-500';
      case 'investigating':
        return 'bg-orange-500';
      case 'in_progress':
        return 'bg-purple-500';
      case 'resolved':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getReportStatusText = (status: string) => {
    switch (status) {
      case 'assigned_to_security':
        return 'Asignado';
      case 'going_to_zone':
        return 'En Camino';
      case 'investigating':
        return 'Investigando';
      case 'in_progress':
        return 'En Progreso';
      case 'resolved':
        return 'Resuelto';
      default:
        return status;
    }
  };

  // Show loading or no officer state if needed
  if (!currentOfficer) {
    return (
      <div className="size-full bg-gray-50 p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <Shield className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">No hay oficiales de seguridad disponibles</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4">Contacte con el administrador para asignar personal de seguridad.</p>
          <Button onClick={onOpenReport} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Reportar Incidente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="size-full bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl text-gray-900">Panel de Seguridad</h1>
              <p className="text-sm sm:text-base text-gray-600">Oficial {currentOfficer.name} - {currentOfficer.badge}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <Badge className={`${getStatusColor(currentOfficer.status)} text-center w-full sm:w-auto`}>
              {getStatusText(currentOfficer.status)}
            </Badge>
            <Button 
              onClick={onOpenReport}
              className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              <span className="sm:inline">Reportar Incidente</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center p-4 sm:p-6">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-blue-100">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm text-gray-600">Reportes Pendientes</p>
                <p className="text-lg sm:text-xl text-gray-900">{assignedReports.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-4 sm:p-6">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-orange-100">
                <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm text-gray-600">Investigando</p>
                <p className="text-lg sm:text-xl text-gray-900">
                  {assignedReports.filter(r => r.status === 'investigating').length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-4 sm:p-6">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm text-gray-600">Completados Hoy</p>
                <p className="text-lg sm:text-xl text-gray-900">{completedReports.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-4 sm:p-6">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm text-gray-600">Alta Prioridad</p>
                <p className="text-lg sm:text-xl text-gray-900">
                  {assignedReports.filter(r => r.priority === 'alta').length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Control Panel */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
              Control de Estado de Servicio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">Estado Actual</label>
                <Select
                  value={currentOfficer.status}
                  onValueChange={(value: 'available' | 'busy' | 'offline') => handleStatusChange(value)}
                >
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">✅ Disponible</SelectItem>
                    <SelectItem value="busy">🟡 Ocupado</SelectItem>
                    <SelectItem value="offline">🔴 Fuera de Servicio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">Zona Actual</label>
                <Select
                  value={selectedZone}
                  onValueChange={setSelectedZone}
                  disabled={currentOfficer.status === 'available'}
                >
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue placeholder={currentOfficer.currentZone || "Seleccionar zona"} />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((zone) => (
                      <SelectItem key={zone} value={zone} className="text-xs sm:text-sm">{zone}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-2 lg:col-span-1">
                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">Reportes Activos</label>
                <div className="p-3 bg-white rounded border text-center">
                  <span className="text-lg sm:text-xl font-semibold text-primary">{currentOfficer.activeReports.length}</span>
                  <p className="text-xs text-gray-600">casos asignados</p>
                </div>
              </div>
            </div>
            
            {currentOfficer.currentZone && (
              <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                <p className="text-xs sm:text-sm text-yellow-800">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                  Actualmente en patrullaje: <strong>{currentOfficer.currentZone}</strong>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reportes Asignados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Reportes Asignados a Seguridad
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignedReports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                <Shield className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4" />
                <h3 className="text-base sm:text-lg text-gray-900 mb-2">No hay reportes asignados</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Cuando el administrador asigne reportes aparecerán aquí.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignedReports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Badge 
                            variant="secondary"
                            className={`${getPriorityColor(report.priority)} text-white text-xs`}
                          >
                            Prioridad {report.priority}
                          </Badge>
                          <Badge 
                            variant="outline"
                            className={`${getReportStatusColor(report.status)} text-white border-none text-xs`}
                          >
                            {getReportStatusText(report.status)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            ID: {report.id.slice(0, 8)}
                          </span>
                        </div>
                        
                        <h3 className="text-base sm:text-lg text-gray-900 mb-2">{report.type}</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-3">
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">{report.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">{new Date(report.timestamp).toLocaleString()}</span>
                          </div>
                          {!report.isAnonymous && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                              <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span className="truncate">{report.contactInfo}</span>
                            </div>
                          )}
                          {report.photo && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                              <Camera className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span>Evidencia fotográfica adjunta</span>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-xs sm:text-sm text-gray-700 mb-4 line-clamp-3">{report.description}</p>
                        
                        <div className="flex flex-col sm:flex-row gap-2">
                          {report.status === 'assigned_to_security' && (
                            <Button
                              size="sm"
                              onClick={() => handleGoToZone(report.id)}
                              className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto"
                            >
                              <Navigation className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                              Ir a la Zona
                            </Button>
                          )}
                          
                          {report.status === 'going_to_zone' && (
                            <div className="flex flex-col sm:flex-row gap-2 w-full">
                              <Button
                                size="sm"
                                onClick={handleArriveAtZone}
                                className="bg-blue-600 hover:bg-blue-700 flex-1"
                              >
                                <MapPinCheck className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                He Llegado a la Zona
                              </Button>
                            </div>
                          )}
                          
                          {(report.status === 'investigating' || report.status === 'in_progress') && (
                            <div className="flex flex-col sm:flex-row gap-2 w-full">
                              {report.status === 'investigating' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReportProgress(report.id)}
                                  className="flex-1"
                                >
                                  <Eye className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                  Marcar en Progreso
                                </Button>
                              )}
                              <Button
                                size="sm"
                                onClick={() => handleOpenCompletionModal(report.id)}
                                className="bg-green-600 hover:bg-green-700 flex-1"
                              >
                                <CheckSquare className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                Completar Reporte
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reportes Completados */}
        {completedReports.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                Reportes Completados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {completedReports.slice(0, 3).map((report) => (
                  <div key={report.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-green-50 rounded-lg gap-2">
                    <div className="flex-1">
                      <p className="text-sm sm:text-base text-gray-900">{report.type} - {report.location}</p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Completado: {new Date(report.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 text-xs self-start sm:self-center">
                      Resuelto
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modal para Ir a Zona */}
        <Dialog open={isGoingToZoneModalOpen} onOpenChange={setIsGoingToZoneModalOpen}>
          <DialogContent className="sm:max-w-[500px] mx-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Navigation className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                Dirigiéndose a la Zona
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center">
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-orange-100 mx-auto mb-4">
                  <ArrowRight className="h-8 w-8 sm:h-10 sm:w-10 text-orange-600 animate-pulse" />
                </div>
                <h3 className="text-base sm:text-lg text-gray-900 mb-2">En camino a la zona del incidente</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Su estado ha sido actualizado a "Ocupado". Presione "He llegado" cuando esté en la ubicación del reporte.
                </p>
                {selectedReportId && (() => {
                  const report = reports.find(r => r.id === selectedReportId);
                  return report ? (
                    <div className="bg-orange-50 p-3 rounded-lg text-left">
                      <p className="text-sm"><strong>Destino:</strong> {report.location}</p>
                      <p className="text-sm"><strong>Zona:</strong> {report.zone}</p>
                      <p className="text-sm"><strong>Tipo:</strong> {report.type}</p>
                    </div>
                  ) : null;
                })()}
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsGoingToZoneModalOpen(false)}
                className="w-full sm:w-auto"
              >
                Cerrar
              </Button>
              <Button 
                onClick={handleArriveAtZone}
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
              >
                <MapPinCheck className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                He Llegado a la Zona
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal para Completar Reporte */}
        <Dialog open={isCompletionModalOpen} onOpenChange={setIsCompletionModalOpen}>
          <DialogContent className="sm:max-w-[600px] mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                <CheckSquare className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                Completar Reporte - Parte Policial
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-4">
                  <strong>Oficial:</strong> {currentOfficer.name} ({currentOfficer.badge})
                </p>
                {selectedReportId && (
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    {(() => {
                      const report = reports.find(r => r.id === selectedReportId);
                      return report ? (
                        <div className="space-y-1">
                          <p className="text-xs sm:text-sm"><strong>Reporte:</strong> {report.type}</p>
                          <p className="text-xs sm:text-sm"><strong>Ubicación:</strong> {report.location}</p>
                          <p className="text-xs sm:text-sm"><strong>Descripción:</strong> {report.description}</p>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Descripción del Parte Policial *
                </label>
                <Textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Describa detalladamente cómo se resolvió el incidente, las acciones tomadas, las personas involucradas y cualquier observación relevante..."
                  className="min-h-[100px] sm:min-h-[120px] text-xs sm:text-sm"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Esta descripción formará parte del parte oficial del incidente.
                </p>
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsCompletionModalOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCompleteReport}
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                disabled={!reportDescription.trim()}
              >
                <CheckSquare className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Completar y Registrar Parte
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}