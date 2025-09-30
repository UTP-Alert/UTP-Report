import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { useWorkflowService } from './services/WorkflowService';
import { useNotificationService } from './services/NotificationService';
import { useReportService } from './services/ReportService';
import { 
  UserCheck, 
  Shield, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Play,
  Pause,
  SkipForward
} from 'lucide-react';

export function AdminWorkflowDemo() {
  const [currentReportId, setCurrentReportId] = React.useState<string | null>(null);
  const [workflowStep, setWorkflowStep] = React.useState(0);
  const [isProcessing, setIsProcessing] = React.useState(false);
  
  const { 
    processAdminReview, 
    assignToSecurity, 
    updateSecurityProgress, 
    completeWorkflow 
  } = useWorkflowService();
  
  const { triggerNotification } = useNotificationService();
  const { reports } = useReportService();

  // Obtener reportes nuevos pendientes de revisión
  const pendingReports = reports.filter(report => report.status === 'nuevo');

  const processReport = async (reportId: string, isHighPriority: boolean) => {
    setIsProcessing(true);
    setCurrentReportId(reportId);
    setWorkflowStep(1);

    // Notificación inicial al admin
    triggerNotification(
      'normal',
      '📋 Iniciando proceso administrativo',
      `Procesando reporte #${reportId.slice(-6)} - Prioridad: ${isHighPriority ? 'ALTA' : 'NORMAL'}`,
      reportId,
      'admin'
    );

    // Paso 1: Admin revisa y clasifica
    processAdminReview(reportId, isHighPriority);
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Paso 2: Asignar a seguridad
    setWorkflowStep(2);
    assignToSecurity(reportId, 'Oficial Carlos Mendoza');
    
    // Notificación sobre asignación
    triggerNotification(
      'assignment',
      '👮 Personal asignado exitosamente',
      'El Oficial Carlos Mendoza ha sido notificado y está en camino',
      reportId,
      'admin'
    );
    
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // Paso 3: Seguridad trabaja
    setWorkflowStep(3);
    updateSecurityProgress(
      reportId, 
      'Patrullaje completado. Zona asegurada. Se implementaron medidas preventivas adicionales.'
    );
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Paso 4: Completar caso
    setWorkflowStep(4);
    completeWorkflow(
      reportId, 
      'Caso resuelto exitosamente. Se reforzó la seguridad en la zona y se implementaron medidas preventivas.'
    );
    
    // Notificación final de resolución
    triggerNotification(
      'report_resolved',
      '✅ Caso cerrado exitosamente',
      `Reporte #${reportId.slice(-6)} ha sido completamente resuelto. ${isHighPriority ? 'El usuario recibió notificación con vibración y sonido.' : 'El usuario fue notificado del resultado.'}`,
      reportId,
      'admin'
    );
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    setWorkflowStep(0);
    setCurrentReportId(null);
  };

  const adminActions = [
    {
      step: 1,
      title: "Revisar y Clasificar",
      description: "Admin evalúa la prioridad del reporte",
      icon: UserCheck
    },
    {
      step: 2,
      title: "Asignar a Seguridad",
      description: "Se notifica al personal de seguridad",
      icon: Shield
    },
    {
      step: 3,
      title: "Seguridad Investiga",
      description: "Personal realiza el trabajo de campo",
      icon: Clock
    },
    {
      step: 4,
      title: "Resolver Caso",
      description: "Admin confirma la resolución",
      icon: CheckCircle
    }
  ];

  return (
    <div className="space-y-6">
      {/* Panel de Control Admin */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <UserCheck className="h-6 w-6 text-primary" />
            Panel de Control - Administrador
          </CardTitle>
          <CardDescription>
            Procesa reportes y gestiona el flujo de trabajo completo
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Estado del workflow */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {adminActions.map((action) => {
              const Icon = action.icon;
              const isActive = workflowStep === action.step;
              const isCompleted = workflowStep > action.step;
              
              return (
                <div
                  key={action.step}
                  className={`p-4 rounded-lg border-2 text-center ${
                    isActive 
                      ? 'border-primary bg-primary/10' 
                      : isCompleted 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-center mb-2">
                    <div className={`p-2 rounded-full ${
                      isActive 
                        ? 'bg-primary text-white' 
                        : isCompleted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-100'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                  <h4 className="font-medium text-sm mb-1">{action.title}</h4>
                  <p className="text-xs text-gray-600">{action.description}</p>
                </div>
              );
            })}
          </div>

          {/* Información del proceso actual */}
          {isProcessing && currentReportId && (
            <Alert className="border-primary bg-blue-50 mb-4">
              <Play className="h-4 w-4" />
              <AlertDescription>
                <strong>Procesando reporte #{currentReportId.slice(-6)}</strong>
                <br />
                El sistema está ejecutando automáticamente todo el flujo de trabajo...
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Reportes Pendientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            Reportes Pendientes de Revisión
          </CardTitle>
          <CardDescription>
            {pendingReports.length} reportes esperando clasificación de prioridad
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {pendingReports.length > 0 ? (
            <div className="space-y-4">
              {pendingReports.slice(0, 3).map((report) => (
                <div key={report.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{report.type}</h4>
                      <p className="text-sm text-gray-600">{report.zone}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(report.timestamp).toLocaleString('es-ES')}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-blue-600">
                      {report.status}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                    {report.description}
                  </p>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => processReport(report.id, true)}
                      disabled={isProcessing}
                      className="bg-red-500 hover:bg-red-600 text-white"
                      size="sm"
                    >
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Alta Prioridad
                    </Button>
                    
                    <Button
                      onClick={() => processReport(report.id, false)}
                      disabled={isProcessing}
                      variant="outline"
                      size="sm"
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Prioridad Normal
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No hay reportes pendientes
              </h3>
              <p className="text-gray-500">
                Todos los reportes han sido procesados
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acciones Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => {
                triggerNotification(
                  'normal',
                  '📊 Reporte de Estado',
                  'Resumen diario: 5 reportes procesados, 2 casos resueltos',
                  undefined,
                  'admin'
                );
              }}
              variant="outline"
              className="h-16"
            >
              <UserCheck className="h-5 w-5 mr-2" />
              Generar Reporte
            </Button>
            
            <Button
              onClick={() => {
                triggerNotification(
                  'assignment',
                  '👮 Notificar Seguridad',
                  'Reunión de briefing programada para las 3:00 PM',
                  undefined,
                  'security'
                );
              }}
              variant="outline"
              className="h-16"
            >
              <Shield className="h-5 w-5 mr-2" />
              Notificar Seguridad
            </Button>
            
            <Button
              onClick={() => {
                triggerNotification(
                  'status_update',
                  '📢 Alerta General',
                  'Se recomienda precaución en la zona de estacionamiento este',
                  undefined,
                  'user'
                );
              }}
              variant="outline"
              className="h-16"
            >
              <AlertTriangle className="h-5 w-5 mr-2" />
              Alerta General
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}