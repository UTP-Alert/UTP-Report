import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useWorkflowService } from './services/WorkflowService';
import { useNotificationService } from './services/NotificationService';
import { 
  User, 
  UserCheck, 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Bell,
  Volume2,
  Smartphone
} from 'lucide-react';

interface LiveWorkflowTrackerProps {
  reportId: string | null;
  onClose: () => void;
}

export function LiveWorkflowTracker({ reportId, onClose }: LiveWorkflowTrackerProps) {
  const { getWorkflowByReportId } = useWorkflowService();
  const { triggerNotification, triggerVibration, playNotificationSound } = useNotificationService();
  
  if (!reportId) return null;
  
  const workflowSteps = getWorkflowByReportId(reportId);
  const latestStep = workflowSteps[workflowSteps.length - 1];
  
  const steps = [
    {
      key: 'reported',
      title: 'Reporte Creado',
      description: 'Tu reporte ha sido enviado',
      icon: User,
      color: 'bg-blue-500'
    },
    {
      key: 'admin_review',
      title: 'Revisión Administrativa',
      description: 'Admin está revisando el caso',
      icon: UserCheck,
      color: 'bg-yellow-500'
    },
    {
      key: 'priority_assigned',
      title: 'Prioridad Asignada',
      description: 'Se determinó la prioridad',
      icon: AlertTriangle,
      color: 'bg-red-500'
    },
    {
      key: 'security_notified',
      title: 'Seguridad Notificada',
      description: 'Personal asignado al caso',
      icon: Shield,
      color: 'bg-purple-500'
    },
    {
      key: 'security_working',
      title: 'Seguridad Trabajando',
      description: 'Investigación en progreso',
      icon: Clock,
      color: 'bg-orange-500'
    },
    {
      key: 'pending_approval',
      title: 'Esperando Aprobación',
      description: 'Revisión administrativa final',
      icon: AlertTriangle,
      color: 'bg-yellow-600'
    },
    {
      key: 'admin_approval',
      title: 'Aprobación Administrativa',
      description: 'Admin revisando resolución',
      icon: UserCheck,
      color: 'bg-blue-600'
    },
    {
      key: 'completed',
      title: 'Caso Completado',
      description: 'Resolución exitosa',
      icon: CheckCircle,
      color: 'bg-green-500'
    }
  ];

  const getCurrentStepIndex = () => {
    if (!latestStep) return -1;
    return steps.findIndex(step => step.key === latestStep.step);
  };

  const currentStepIndex = getCurrentStepIndex();
  const isHighPriority = workflowSteps.some(step => 
    step.step === 'priority_assigned' && step.details?.includes('ALTA PRIORIDAD')
  );

  // Función para demostrar notificación
  const demoNotification = (type: 'normal' | 'high_priority') => {
    if (type === 'high_priority') {
      triggerVibration([400, 200, 400, 200, 400]);
      playNotificationSound('alert');
      triggerNotification(
        'high_priority',
        '🚨 NOTIFICACIÓN DE ALTA PRIORIDAD',
        'Tu reporte está siendo procesado con máxima urgencia. Personal de seguridad asignado.',
        reportId,
        'user'
      );
    } else {
      triggerVibration([150]);
      playNotificationSound('info');
      triggerNotification(
        'status_update',
        '📲 Actualización de estado',
        'Tu reporte ha sido actualizado. Revisa el progreso en tu dashboard.',
        reportId,
        'user'
      );
    }
  };

  return (
    <Card className="mt-6 border-2 border-primary bg-gradient-to-r from-blue-50 to-purple-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-primary" />
            Seguimiento en Vivo - Reporte #{reportId.slice(-6)}
          </CardTitle>
          <div className="flex gap-2">
            {isHighPriority && (
              <Badge className="bg-red-500 text-white animate-pulse">
                🚨 ALTA PRIORIDAD
              </Badge>
            )}
            <Button onClick={onClose} variant="outline" size="sm">
              Cerrar
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Progress Steps */}
        <div className="space-y-4 mb-6">
          {steps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isActive = index === currentStepIndex;
            const Icon = step.icon;
            
            return (
              <div
                key={step.key}
                className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-primary/10 border-2 border-primary' 
                    : isCompleted 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  isActive 
                    ? 'bg-primary text-white animate-pulse' 
                    : isCompleted 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                
                <div className="flex-1">
                  <h4 className={`font-medium ${
                    isActive ? 'text-primary' : isCompleted ? 'text-green-800' : 'text-gray-600'
                  }`}>
                    {step.title}
                  </h4>
                  <p className="text-sm text-gray-600">{step.description}</p>
                  
                  {/* Mostrar detalles específicos del paso */}
                  {isCompleted && workflowSteps.find(ws => ws.step === step.key) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {workflowSteps.find(ws => ws.step === step.key)?.details}
                    </p>
                  )}
                </div>
                
                {isActive && (
                  <div className="flex items-center gap-1 text-xs text-primary">
                    <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
                    EN PROCESO
                  </div>
                )}
                
                {isCompleted && !isActive && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
            );
          })}
        </div>

        {/* Notification Demo Buttons */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Demostrar Notificaciones
          </h4>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => demoNotification('high_priority')}
              className="bg-red-500 hover:bg-red-600 text-white"
              size="sm"
            >
              <Volume2 className="h-4 w-4 mr-1" />
              Alerta Alta (Vibración + Sonido)
            </Button>
            
            <Button
              onClick={() => demoNotification('normal')}
              variant="outline"
              size="sm"
            >
              <Bell className="h-4 w-4 mr-1" />
              Notificación Normal
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            * Las notificaciones de alta prioridad incluyen vibración intensa y sonido de alerta
          </p>
        </div>

        {/* Timeline */}
        {workflowSteps.length > 0 && (
          <div className="mt-6 bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium mb-3">Historial del Caso</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {workflowSteps.map((step, index) => (
                <div key={step.id} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium">{step.action}</p>
                    <p className="text-gray-600">{step.details}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(step.timestamp).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}