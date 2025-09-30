import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { useWorkflowService } from './services/WorkflowService';
import { useNotificationService } from './services/NotificationService';
import { useReportService } from './services/ReportService';
import { 
  Play, 
  User, 
  UserCheck, 
  Shield, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Volume2,
  Smartphone,
  Bell
} from 'lucide-react';

export function ReportWorkflowDemo() {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isRunning, setIsRunning] = React.useState(false);
  const [demoReportId, setDemoReportId] = React.useState<string | null>(null);
  
  const { 
    initiateReportWorkflow, 
    processAdminReview, 
    assignToSecurity, 
    updateSecurityProgress, 
    completeWorkflow 
  } = useWorkflowService();
  
  const { triggerNotification } = useNotificationService();
  const { addReport } = useReportService();

  const steps = [
    {
      id: 0,
      title: "1. Usuario crea reporte",
      description: "Juan Pérez reporta un incidente",
      icon: User,
      action: () => {
        const reportId = Date.now().toString();
        setDemoReportId(reportId);
        
        // Crear reporte en el sistema
        addReport({
          incidentType: 'robo',
          zone: 'Estacionamiento Este',
          description: 'DEMO: Se reportó el robo de una laptop que estaba en el auto. Ventana rota.',
          isAnonymous: false,
          contactInfo: 'juan.perez@est.utp.ac.pa',
          timestamp: new Date().toISOString(),
          hasPhoto: true,
          photoName: 'evidencia_demo.jpg',
          type: 'Robo',
          location: 'Estacionamiento Este',
          photo: 'evidencia_demo.jpg',
          reportedBy: {
            userId: '2',
            userName: 'Juan Pérez',
            userEmail: 'juan.perez@est.utp.ac.pa',
            userRole: 'user'
          }
        });

        // Iniciar workflow
        initiateReportWorkflow(reportId, 'alta');
        
        triggerNotification(
          'normal',
          '📢 DEMO: Reporte creado',
          'Usuario Juan Pérez ha enviado un nuevo reporte'
        );
      }
    },
    {
      id: 1,
      title: "2. Admin revisa y clasifica",
      description: "Admin García evalúa la prioridad",
      icon: UserCheck,
      action: () => {
        if (!demoReportId) return;
        
        // Simular decisión del admin: 70% probabilidad de alta prioridad
        const isHighPriority = Math.random() > 0.3;
        
        processAdminReview(demoReportId, isHighPriority);
        
        triggerNotification(
          'status_update',
          `📋 DEMO: Reporte ${isHighPriority ? 'ALTA PRIORIDAD' : 'PRIORIDAD NORMAL'}`,
          `Admin García clasificó el reporte como ${isHighPriority ? 'alta prioridad - requiere atención inmediata' : 'prioridad normal'}`
        );
      }
    },
    {
      id: 2,
      title: "3. Asignación a seguridad",
      description: "Se asigna al personal de seguridad",
      icon: Shield,
      action: () => {
        if (!demoReportId) return;
        
        assignToSecurity(demoReportId, 'Oficial Carlos Mendoza');
        
        triggerNotification(
          'assignment',
          '👮 DEMO: Asignado a seguridad',
          'Oficial Carlos Mendoza recibe la asignación del caso'
        );
      }
    },
    {
      id: 3,
      title: "4. Seguridad trabaja",
      description: "Personal de seguridad investiga",
      icon: Clock,
      action: () => {
        if (!demoReportId) return;
        
        updateSecurityProgress(
          demoReportId, 
          'Investigación en curso. Se revisaron las cámaras de seguridad y se identificó al sospechoso.'
        );
        
        triggerNotification(
          'status_update',
          '🔍 DEMO: Investigación en progreso',
          'Seguridad reporta avances en la investigación'
        );
      }
    },
    {
      id: 4,
      title: "5. Caso resuelto",
      description: "Admin confirma resolución",
      icon: CheckCircle,
      action: () => {
        if (!demoReportId) return;
        
        completeWorkflow(
          demoReportId, 
          'Caso resuelto: Sospechoso identificado y entregado a autoridades. Laptop recuperada.'
        );
        
        triggerNotification(
          'report_resolved',
          '✅ DEMO: Caso completado',
          'El caso ha sido resuelto exitosamente'
        );
      }
    }
  ];

  const runFullDemo = async () => {
    setIsRunning(true);
    setCurrentStep(0);
    
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, 2000));
      steps[i].action();
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    setIsRunning(false);
    setCurrentStep(0);
  };

  const runStep = (stepIndex: number) => {
    if (stepIndex < currentStep) return; // No permitir retroceder
    
    setCurrentStep(stepIndex);
    steps[stepIndex].action();
    
    if (stepIndex < steps.length - 1) {
      setCurrentStep(stepIndex + 1);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          <Play className="h-8 w-8 text-primary" />
          Demostración del Flujo de Reportes
        </CardTitle>
        <CardDescription className="text-lg">
          Simula el flujo completo desde el reporte hasta la resolución con notificaciones reales
        </CardDescription>
        
        <Alert className="border-primary bg-blue-50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-primary" />
              <span className="font-medium">Sonido</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <span className="font-medium">Vibración</span>
            </div>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <span className="font-medium">Notificaciones</span>
            </div>
          </div>
          <AlertDescription className="mt-2">
            La demostración incluye efectos de sonido, vibración y notificaciones para reportes de alta prioridad
          </AlertDescription>
        </Alert>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Controles de demostración */}
        <div className="flex gap-4 justify-center">
          <Button 
            onClick={runFullDemo}
            disabled={isRunning}
            className="bg-primary hover:bg-primary/90"
            size="lg"
          >
            <Play className="h-5 w-5 mr-2" />
            {isRunning ? 'Ejecutando Demo...' : 'Ejecutar Demostración Completa'}
          </Button>
        </div>

        {/* Pasos del workflow */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === index;
            const isCompleted = currentStep > index;
            const isAvailable = index <= currentStep && !isRunning;
            
            return (
              <Card 
                key={step.id}
                className={`cursor-pointer transition-all border-2 ${
                  isActive 
                    ? 'border-primary bg-primary/5 shadow-lg' 
                    : isCompleted 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                } ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => isAvailable && runStep(index)}
              >
                <CardContent className="p-4 text-center">
                  <div className="flex justify-center mb-3">
                    <div className={`p-3 rounded-full ${
                      isActive 
                        ? 'bg-primary text-white' 
                        : isCompleted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                    </div>
                  </div>
                  
                  <h3 className={`font-medium mb-2 ${
                    isActive ? 'text-primary' : isCompleted ? 'text-green-700' : 'text-gray-700'
                  }`}>
                    {step.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600">
                    {step.description}
                  </p>
                  
                  {isActive && (
                    <Badge className="mt-2 bg-primary text-white">
                      Activo
                    </Badge>
                  )}
                  
                  {isCompleted && (
                    <Badge className="mt-2 bg-green-500 text-white">
                      Completado
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Información adicional */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Características del Sistema
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Notificaciones por Rol:</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• <strong>Usuario:</strong> Alertas de zonas peligrosas, progreso de reportes</li>
                <li>• <strong>Admin:</strong> Nuevos reportes, confirmaciones</li>
                <li>• <strong>Seguridad:</strong> Asignaciones de casos</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Efectos para Alta Prioridad:</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• <strong>Vibración:</strong> Patrón intenso [300ms, 100ms, 300ms]</li>
                <li>• <strong>Sonido:</strong> Tonos de alerta repetitivos</li>
                <li>• <strong>Visual:</strong> Notificaciones destacadas</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}