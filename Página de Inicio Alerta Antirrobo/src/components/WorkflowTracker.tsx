import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Shield, 
  UserCheck,
  ArrowRight,
  Eye,
  Activity
} from 'lucide-react';
import { useWorkflowService } from './services/WorkflowService';
import { useReportService } from './services/ReportService';

interface WorkflowTrackerProps {
  reportId: string;
  className?: string;
}

export function WorkflowTracker({ reportId, className = '' }: WorkflowTrackerProps) {
  const { getWorkflowByReportId } = useWorkflowService();
  const { reports } = useReportService();
  
  const workflow = getWorkflowByReportId(reportId);
  const report = reports.find(r => r.id === reportId);
  
  if (!report || workflow.length === 0) {
    return null;
  }

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'reported':
        return <User className="h-4 w-4" />;
      case 'admin_review':
      case 'priority_assigned':
        return <Shield className="h-4 w-4" />;
      case 'security_notified':
      case 'security_working':
        return <UserCheck className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStepColor = (step: string, isCompleted: boolean) => {
    if (isCompleted) {
      switch (step) {
        case 'reported':
          return 'bg-blue-500 text-white';
        case 'admin_review':
        case 'priority_assigned':
          return 'bg-red-500 text-white';
        case 'security_notified':
        case 'security_working':
          return 'bg-green-500 text-white';
        case 'completed':
          return 'bg-purple-500 text-white';
        default:
          return 'bg-gray-500 text-white';
      }
    }
    return 'bg-gray-200 text-gray-600';
  };

  const getStepLabel = (step: string) => {
    switch (step) {
      case 'reported':
        return 'Reporte Creado';
      case 'admin_review':
        return 'Revisión Admin';
      case 'priority_assigned':
        return 'Prioridad Asignada';
      case 'security_notified':
        return 'Seguridad Notificada';
      case 'security_working':
        return 'En Investigación';
      case 'completed':
        return 'Completado';
      default:
        return 'Proceso';
    }
  };

  const calculateProgress = () => {
    const totalSteps = 6; // reported, admin_review, priority_assigned, security_notified, security_working, completed
    const completedSteps = workflow.length;
    return Math.min((completedSteps / totalSteps) * 100, 100);
  };

  const getProgressColor = () => {
    const progress = calculateProgress();
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getLastUpdate = () => {
    if (workflow.length === 0) return null;
    const lastStep = workflow[workflow.length - 1];
    const timeDiff = Date.now() - new Date(lastStep.timestamp).getTime();
    const minutes = Math.floor(timeDiff / 60000);
    const hours = Math.floor(timeDiff / 3600000);
    
    let timeAgo = '';
    if (hours > 0) {
      timeAgo = `hace ${hours}h ${minutes % 60}min`;
    } else {
      timeAgo = `hace ${minutes} min`;
    }
    
    return {
      action: lastStep.action,
      timeAgo,
      details: lastStep.details
    };
  };

  const lastUpdate = getLastUpdate();
  const progress = calculateProgress();
  const isHighPriority = workflow.some(step => step.details?.includes('ALTA PRIORIDAD'));

  return (
    <Card className={`${className} ${isHighPriority ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-primary" />
            Seguimiento del Reporte #{reportId.slice(-6)}
          </CardTitle>
          {isHighPriority && (
            <Badge className="bg-red-500 hover:bg-red-600 animate-pulse">
              🚨 ALTA PRIORIDAD
            </Badge>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progreso del caso</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${getProgressColor()}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Timeline */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Historial de Acciones:</h4>
          <div className="space-y-2">
            {workflow.map((step, index) => (
              <div key={step.id} className="flex items-start gap-3">
                <div className={`p-1.5 rounded-full ${getStepColor(step.step, true)}`}>
                  {getStepIcon(step.step)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{getStepLabel(step.step)}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(step.timestamp).toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{step.action}</p>
                  {step.details && (
                    <p className="text-xs text-gray-500 mt-1 italic">{step.details}</p>
                  )}
                </div>
                {index < workflow.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-gray-400 mt-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Last Update */}
        {lastUpdate && (
          <div className="border-t pt-3">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Última actualización:</span>
              <span className="text-gray-600">{lastUpdate.timeAgo}</span>
            </div>
            <p className="text-sm text-gray-700 mt-1">{lastUpdate.action}</p>
            {lastUpdate.details && (
              <p className="text-xs text-gray-500 mt-1">{lastUpdate.details}</p>
            )}
          </div>
        )}

        {/* Status Badge */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Estado: {report.status === 'nuevo' ? 'Nuevo' :
                      report.status === 'investigando' ? 'Investigando' :
                      report.status === 'in_progress' ? 'En Proceso' :
                      report.status === 'assigned_to_security' ? 'Asignado a Seguridad' :
                      report.status === 'resuelto' ? 'Resuelto' : 'Desconocido'}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Prioridad: {report.priority.toUpperCase()}
            </Badge>
          </div>
          
          {progress < 100 && (
            <Button variant="outline" size="sm" className="text-xs">
              <Eye className="h-3 w-3 mr-1" />
              Ver Detalles
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}