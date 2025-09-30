import React from 'react';
import { useNotificationService } from './NotificationService';
import { useReportService } from './ReportService';

interface WorkflowStep {
  id: string;
  reportId: string;
  step: 'reported' | 'admin_review' | 'priority_assigned' | 'in_progress' | 'security_notified' | 'security_working' | 'pending_approval' | 'admin_approval' | 'completed';
  timestamp: string;
  userId: string;
  userRole: 'user' | 'admin' | 'security';
  action: string;
  details?: string;
}

interface WorkflowContextType {
  workflowSteps: WorkflowStep[];
  initiateReportWorkflow: (reportId: string, priority: string) => void;
  processAdminReview: (reportId: string, isHighPriority: boolean) => void;
  assignToSecurity: (reportId: string, securityId: string) => void;
  updateSecurityProgress: (reportId: string, details: string) => void;
  submitForApproval: (reportId: string, securityDescription: string) => void;
  processAdminApproval: (reportId: string, approved: boolean, comments?: string) => void;
  completeWorkflow: (reportId: string, resolution: string) => void;
  getWorkflowByReportId: (reportId: string) => WorkflowStep[];
}

const WorkflowContext = React.createContext<WorkflowContextType | undefined>(undefined);

export function WorkflowServiceProvider({ children }: { children: React.ReactNode }) {
  const [workflowSteps, setWorkflowSteps] = React.useState<WorkflowStep[]>([]);
  const { triggerNotification, notifyApprovalNeeded, notifyApprovalComplete, notifyFeedbackRequest } = useNotificationService();
  const { updateReportStatus, updateReportPriority, assignReportToSecurity, submitSecurityDescription, approveResolution } = useReportService();

  // Paso 1: Usuario inicia reporte
  const initiateReportWorkflow = (reportId: string, priority: string) => {
    const step: WorkflowStep = {
      id: Date.now().toString(),
      reportId,
      step: 'reported',
      timestamp: new Date().toISOString(),
      userId: 'user-juan',
      userRole: 'user',
      action: 'Reporte creado',
      details: `Prioridad inicial: ${priority}`
    };

    setWorkflowSteps(prev => [...prev, step]);

    // Notificar al usuario que el reporte fue enviado
    triggerNotification('normal', 'Reporte enviado exitosamente', 'Tu reporte ha sido recibido y será revisado por el administrador', reportId, 'user');

    // Simular notificación al administrador después de 2 segundos
    setTimeout(() => {
      triggerNotification('normal', '📢 Nuevo reporte recibido', `Reporte #${reportId.slice(-6)} requiere revisión inmediata`, reportId, 'admin');
    }, 2000);
  };

  // Paso 2: Administrador revisa y asigna prioridad
  const processAdminReview = (reportId: string, isHighPriority: boolean) => {
    const reviewStep: WorkflowStep = {
      id: Date.now().toString(),
      reportId,
      step: 'admin_review',
      timestamp: new Date().toISOString(),
      userId: 'admin-garcia',
      userRole: 'admin',
      action: 'Reporte revisado por administrador',
      details: `Clasificado como: ${isHighPriority ? 'ALTA PRIORIDAD' : 'PRIORIDAD NORMAL'}`
    };

    const priorityStep: WorkflowStep = {
      id: (Date.now() + 1).toString(),
      reportId,
      step: 'priority_assigned',
      timestamp: new Date().toISOString(),
      userId: 'admin-garcia',
      userRole: 'admin',
      action: 'Prioridad asignada',
      details: `Estado cambiado a: En Proceso`
    };

    setWorkflowSteps(prev => [...prev, reviewStep, priorityStep]);

    // Actualizar el reporte
    const newPriority = isHighPriority ? 'alta' : 'media';
    updateReportPriority(reportId, newPriority);
    updateReportStatus(reportId, 'investigando');

    // Notificar al usuario según la prioridad
    setTimeout(() => {
      if (isHighPriority) {
        triggerNotification(
          'high_priority',
          '🚨 ALERTA DE ALTA PRIORIDAD',
          'Tu reporte ha sido clasificado como alta prioridad y está siendo procesado inmediatamente. Personal de seguridad será asignado de forma inmediata.',
          reportId,
          'user'
        );
      } else {
        triggerNotification(
          'status_update',
          'Reporte en proceso',
          'Tu reporte está siendo revisado y procesado por nuestro equipo',
          reportId,
          'user'
        );
      }
    }, 1500);
  };

  // Paso 3: Asignar a seguridad
  const assignToSecurity = (reportId: string, securityId: string) => {
    const assignmentStep: WorkflowStep = {
      id: Date.now().toString(),
      reportId,
      step: 'security_notified',
      timestamp: new Date().toISOString(),
      userId: 'admin-garcia',
      userRole: 'admin',
      action: 'Asignado al personal de seguridad',
      details: `Asignado a: ${securityId}`
    };

    setWorkflowSteps(prev => [...prev, assignmentStep]);

    // Actualizar el reporte
    assignReportToSecurity(reportId, securityId);

    // Notificar a seguridad
    triggerNotification(
      'assignment',
      '📋 Nueva asignación de seguridad',
      `Se te ha asignado el reporte #${reportId.slice(-6)} para investigación`,
      reportId,
      'security'
    );

    // Notificar al usuario
    setTimeout(() => {
      triggerNotification(
        'status_update',
        '🔄 Personal de seguridad asignado',
        'Un oficial de seguridad ha sido asignado para atender tu reporte',
        reportId,
        'user'
      );
    }, 2000);
  };

  // Paso 4: Seguridad trabaja en el caso
  const updateSecurityProgress = (reportId: string, details: string) => {
    const progressStep: WorkflowStep = {
      id: Date.now().toString(),
      reportId,
      step: 'security_working',
      timestamp: new Date().toISOString(),
      userId: 'security-carlos',
      userRole: 'security',
      action: 'Personal de seguridad reporta progreso',
      details
    };

    setWorkflowSteps(prev => [...prev, progressStep]);

    updateReportStatus(reportId, 'in_progress');

    // Notificar al administrador
    triggerNotification(
      'normal',
      '📊 Actualización de seguridad',
      `Reporte #${reportId.slice(-6)}: ${details}`,
      reportId,
      'admin'
    );

    // Notificar al usuario
    setTimeout(() => {
      triggerNotification(
        'status_update',
        '🔍 Progreso en tu reporte',
        'El personal de seguridad está trabajando activamente en tu caso',
        reportId,
        'user'
      );
    }, 1500);
  };

  // Paso 5: Personal de seguridad envía descripción para aprobación
  const submitForApproval = (reportId: string, securityDescription: string) => {
    const approvalStep: WorkflowStep = {
      id: Date.now().toString(),
      reportId,
      step: 'pending_approval',
      timestamp: new Date().toISOString(),
      userId: 'security-carlos',
      userRole: 'security',
      action: 'Enviado para aprobación administrativa',
      details: `Descripción: ${securityDescription}`
    };

    setWorkflowSteps(prev => [...prev, approvalStep]);
    submitSecurityDescription(reportId, securityDescription);

    // Notificar al administrador que necesita aprobar
    notifyApprovalNeeded(reportId, securityDescription);

    // Notificar al usuario que el caso está en revisión final
    setTimeout(() => {
      triggerNotification(
        'status_update',
        '🔍 Revisión Final en Proceso',
        'Tu reporte está en la fase final de revisión administrativa antes de ser marcado como resuelto.',
        reportId,
        'user'
      );
    }, 1000);
  };

  // Paso 6: Administrador aprueba o rechaza la resolución
  const processAdminApproval = (reportId: string, approved: boolean, comments?: string) => {
    const approvalStep: WorkflowStep = {
      id: Date.now().toString(),
      reportId,
      step: 'admin_approval',
      timestamp: new Date().toISOString(),
      userId: 'admin-garcia',
      userRole: 'admin',
      action: approved ? 'Resolución aprobada' : 'Resolución rechazada',
      details: comments || (approved ? 'Aprobado para resolución final' : 'Requiere trabajo adicional')
    };

    setWorkflowSteps(prev => [...prev, approvalStep]);
    approveResolution(reportId, approved, comments);

    // Notificar al personal de seguridad
    notifyApprovalComplete(reportId, approved);

    if (approved) {
      // Si se aprueba, marcar como completado y solicitar feedback
      const completionStep: WorkflowStep = {
        id: (Date.now() + 1).toString(),
        reportId,
        step: 'completed',
        timestamp: new Date().toISOString(),
        userId: 'admin-garcia',
        userRole: 'admin',
        action: 'Caso completado exitosamente',
        details: 'Resolución aprobada y caso cerrado'
      };

      setWorkflowSteps(prev => [...prev, completionStep]);

      // Notificar al usuario que el caso está resuelto
      const workflow = getWorkflowByReportId(reportId);
      const isHighPriority = workflow.some(step => 
        step.details?.includes('ALTA PRIORIDAD')
      );

      setTimeout(() => {
        if (isHighPriority) {
          triggerNotification(
            'report_resolved',
            '🎉 CASO DE ALTA PRIORIDAD RESUELTO',
            'Tu reporte ha sido completamente resuelto tras revisión administrativa.',
            reportId,
            'user'
          );
        } else {
          triggerNotification(
            'report_resolved',
            '✅ Caso Resuelto Exitosamente',
            'Tu reporte ha sido resuelto y aprobado por administración.',
            reportId,
            'user'
          );
        }

        // Solicitar feedback después de un breve delay
        setTimeout(() => {
          // Aquí deberíamos obtener el tipo de reporte y tiempo de resolución real
          const reportType = 'Incidente de Seguridad'; // Placeholder
          const resolutionTime = '2 horas'; // Placeholder 
          notifyFeedbackRequest(reportId, reportType, resolutionTime);
        }, 3000);
      }, 1000);
    }
  };

  // Paso 7: Completar workflow (función legacy mantenida para compatibilidad)
  const completeWorkflow = (reportId: string, resolution: string) => {
    const completionStep: WorkflowStep = {
      id: Date.now().toString(),
      reportId,
      step: 'completed',
      timestamp: new Date().toISOString(),
      userId: 'admin-garcia',
      userRole: 'admin',
      action: 'Caso completado (método directo)',
      details: resolution
    };

    setWorkflowSteps(prev => [...prev, completionStep]);
    updateReportStatus(reportId, 'resuelto');

    // Obtener la prioridad del reporte para la notificación final
    const workflow = getWorkflowByReportId(reportId);
    const isHighPriority = workflow.some(step => 
      step.details?.includes('ALTA PRIORIDAD')
    );

    // Notificación final al usuario
    setTimeout(() => {
      if (isHighPriority) {
        triggerNotification(
          'report_resolved',
          '✅ CASO DE ALTA PRIORIDAD RESUELTO',
          `Tu reporte ha sido completamente resuelto. Resolución: ${resolution}`,
          reportId,
          'user'
        );
      } else {
        triggerNotification(
          'report_resolved',
          '✅ Caso resuelto',
          `Tu reporte ha sido resuelto exitosamente. Resolución: ${resolution}`,
          reportId,
          'user'
        );
      }
    }, 1000);
  };

  const getWorkflowByReportId = (reportId: string) => {
    return workflowSteps.filter(step => step.reportId === reportId);
  };

  return (
    <WorkflowContext.Provider value={{
      workflowSteps,
      initiateReportWorkflow,
      processAdminReview,
      assignToSecurity,
      updateSecurityProgress,
      submitForApproval,
      processAdminApproval,
      completeWorkflow,
      getWorkflowByReportId
    }}>
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflowService() {
  const context = React.useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflowService must be used within a WorkflowServiceProvider');
  }
  return context;
}