import React from 'react';
import { toast } from 'sonner@2.0.3';

interface Notification {
  id: string;
  type: 'high_priority' | 'normal' | 'status_update' | 'assignment' | 'danger_zone' | 'report_resolved' | 'approval_needed' | 'approved' | 'feedback_request';
  title: string;
  description?: string;
  timestamp: Date;
  read: boolean;
  userId?: string;
  reportId?: string;
  targetRole?: string;
  priority?: 'high' | 'medium' | 'low';
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  triggerNotification: (type: 'high_priority' | 'normal' | 'status_update' | 'assignment' | 'danger_zone' | 'report_resolved' | 'approval_needed' | 'approved' | 'feedback_request', message: string, description?: string, reportId?: string, targetRole?: string, priority?: 'high' | 'medium' | 'low') => void;
  playNotificationSound: (type: 'alert' | 'success' | 'info' | 'vibration_simulation') => void;
  triggerVibration: (pattern?: number[], forceSound?: boolean) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  checkDangerousZones: (reports: any[]) => void;
  notifyReportProgress: (reportId: string, status: string, userRole: string) => void;
  notifyApprovalNeeded: (reportId: string, securityDescription: string) => void;
  notifyApprovalComplete: (reportId: string, approved: boolean) => void;
  notifyFeedbackRequest: (reportId: string, reportType: string, resolutionTime: string) => void;
  notifySecurityAssignment: (reportId: string, incidentType: string, location: string, priority: string) => void;
  notifyUserReportUpdate: (reportId: string, oldStatus: string, newStatus: string) => void;
  notifyAdminAction: (reportId: string, action: string, targetRole: string) => void;
  setCurrentUserRole: (role: string) => void;
}

const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined);

export function NotificationServiceProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [reportCounts, setReportCounts] = React.useState<{[zone: string]: number}>({});
  const [currentUserRole, setCurrentUserRole] = React.useState<string>('');
  // Función para reproducir sonidos MÁS FUERTES y distintivos
  const playNotificationSound = (type: 'alert' | 'success' | 'info' | 'vibration_simulation') => {
    try {
      // Add timeout to prevent hanging
      const audioTimeout = setTimeout(() => {
        console.warn('Audio operation timed out');
      }, 5000);

      // Crear contexto de audio
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const playTone = (frequency: number, duration: number, delay: number = 0, volume: number = 0.3) => {
        const timeoutId = setTimeout(() => {
          try {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = 'square'; // Cambio a square para sonido más fuerte
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
            
            // Clean up timeout
            clearTimeout(audioTimeout);
          } catch (error) {
            console.warn('Error playing tone:', error);
            clearTimeout(audioTimeout);
          }
        }, delay);

        // Clear timeout if delay is too long
        if (delay > 10000) {
          clearTimeout(timeoutId);
          clearTimeout(audioTimeout);
        }
      };

      switch (type) {
        case 'alert':
          // Sonido de alerta MÁS FUERTE (tono alto repetitivo y potente)
          playTone(1000, 0.4, 0, 0.6);    // Tono fuerte inicial
          playTone(1200, 0.4, 300, 0.6);  // Tono más agudo
          playTone(1000, 0.4, 600, 0.6);  // Repetición
          playTone(1200, 0.4, 900, 0.6);  // Final fuerte
          break;
        case 'success':
          // Sonido de éxito (tono ascendente MÁS CLARO)
          playTone(523, 0.25, 0, 0.4);   // Do
          playTone(659, 0.25, 200, 0.4); // Mi
          playTone(784, 0.35, 400, 0.5); // Sol - más fuerte al final
          break;
        case 'info':
          // Sonido informativo (tono más claro)
          playTone(523, 0.3, 0, 0.3);    // Do
          playTone(659, 0.3, 250, 0.3);  // Mi
          break;
        case 'vibration_simulation':
          // Sonido que simula vibración FUERTE - para dispositivos sin vibración
          playTone(80, 0.15, 0, 0.8);    // Frecuencia muy baja, volumen alto
          playTone(80, 0.15, 200, 0.8);  
          playTone(80, 0.15, 400, 0.8);  
          playTone(80, 0.15, 600, 0.8);  
          playTone(80, 0.15, 800, 0.8);  
          break;
      }
    } catch (error) {
      console.log('Audio no disponible:', error);
    }
  };

  // Función para activar vibración O simular con sonido fuerte
  const triggerVibration = (pattern: number[] = [200], forceSound: boolean = false) => {
    if ('vibrate' in navigator && !forceSound) {
      // Activar vibración real
      navigator.vibrate(pattern);
    } else {
      // Simular vibración con sonido fuerte si no hay vibración disponible
      console.log('Vibración no disponible - simulando con sonido');
      playNotificationSound('vibration_simulation');
      
      // Si el patrón es largo, repetir el sonido
      if (pattern.length > 3) {
        setTimeout(() => {
          playNotificationSound('vibration_simulation');
        }, 1000);
      }
    }
  };

  // Función para agregar notificación al estado
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>, targetRole?: string) => {
    // Solo agregar notificaciones para el rol actual o para 'all'
    if (targetRole && targetRole !== 'all' && targetRole !== currentUserRole) {
      return;
    }
    
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
      targetRole
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Mantener solo las últimas 50
  };

  // Función para detectar zonas peligrosas
  const checkDangerousZones = (reports: any[]) => {
    const zoneCounts: {[zone: string]: number} = {};
    
    // Contar reportes por zona en las últimas 24 horas
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    reports.forEach(report => {
      if (new Date(report.timestamp) > oneDayAgo && report.zone) {
        zoneCounts[report.zone] = (zoneCounts[report.zone] || 0) + 1;
      }
    });

    // Verificar si hay zonas con 3 o más reportes - Solo notificar a usuarios
    Object.entries(zoneCounts).forEach(([zone, count]) => {
      if (count >= 3 && reportCounts[zone] !== count) {
        triggerNotification('danger_zone', 
          `⚠️ ZONA PELIGROSA DETECTADA`,
          `La zona "${zone}" ha tenido ${count} reportes en las últimas 24 horas. Se recomienda precaución.`,
          undefined,
          'user' // Solo los usuarios reciben alertas de zonas peligrosas
        );
      }
    });

    setReportCounts(zoneCounts);
  };

  // Función para notificar progreso de reportes con notificaciones específicas por rol
  const notifyReportProgress = (reportId: string, status: string, targetUserRole: string) => {
    const reportShortId = reportId.slice(-6);
    
    switch (status) {
      case 'created':
        // Notificaciones diferenciadas para administradores
        if (targetUserRole === 'admin') {
          triggerNotification('normal',
            '🆕 Nuevo Reporte Recibido',
            `Reporte #${reportShortId} requiere revisión inmediata y asignación de prioridad. Evalúa el tipo de incidente para determinar el nivel de urgencia.`,
            reportId,
            'admin',
            'high'
          );
        }
        // Notificación para superusuarios
        if (targetUserRole === 'superuser') {
          triggerNotification('normal',
            '📊 Reporte Registrado en el Sistema',
            `Nuevo reporte #${reportShortId} agregado al sistema para supervisión general. Monitoreo activo iniciado.`,
            reportId,
            'superuser',
            'medium'
          );
        }
        // Confirmación inmediata para usuarios
        if (targetUserRole === 'user') {
          triggerNotification('status_update',
            '✅ ¡Reporte Enviado Exitosamente!',
            `Tu reporte #${reportShortId} ha sido recibido y está siendo procesado. Te mantendremos informado de cada paso.`,
            reportId,
            'user',
            'high'
          );
        }
        break;
        
      case 'assigned':
        // Notificación urgente para personal de seguridad
        if (targetUserRole === 'security') {
          triggerNotification('assignment',
            '🚨 NUEVA ASIGNACIÓN URGENTE',
            `Reporte #${reportShortId} te ha sido asignado para supervisión inmediata. Revisa ubicación, detalles del incidente y procede al área indicada.`,
            reportId,
            'security',
            'high'
          );
        }
        // Notificación de progreso para usuarios
        if (targetUserRole === 'user') {
          triggerNotification('status_update',
            '👮‍♂️ Personal de Seguridad Asignado',
            `¡Buenas noticias! Un oficial especializado ha sido asignado a tu reporte #${reportShortId} y se dirige al lugar del incidente.`,
            reportId,
            'user',
            'high'
          );
        }
        // Confirmación de asignación para administradores
        if (targetUserRole === 'admin') {
          triggerNotification('normal',
            '✅ Asignación Ejecutada Exitosamente',
            `Reporte #${reportShortId} ha sido asignado al personal de seguridad. El oficial ha sido notificado y está en ruta.`,
            reportId,
            'admin',
            'medium'
          );
        }
        break;
        
      case 'in_progress':
        // Notificación de progreso activo para usuarios
        if (targetUserRole === 'user') {
          triggerNotification('status_update',
            '🔍 Investigación Activa en Terreno',
            `Nuestro oficial de seguridad está actualmente en el lugar del incidente trabajando en tu reporte #${reportShortId}. Investigación en progreso.`,
            reportId,
            'user',
            'high'
          );
        }
        // Actualización de estado para administradores
        if (targetUserRole === 'admin') {
          triggerNotification('normal',
            '📋 Oficial Reporta Progreso en Campo',
            `El personal de seguridad confirma trabajo activo en caso #${reportShortId}. Investigación en desarrollo.`,
            reportId,
            'admin',
            'medium'
          );
        }
        // Confirmación para seguridad
        if (targetUserRole === 'security') {
          triggerNotification('normal',
            '✅ Estado Actualizado: En Progreso',
            `Tu reporte de progreso del caso #${reportShortId} ha sido registrado en el sistema. Continúa con la investigación.`,
            reportId,
            'security',
            'low'
          );
        }
        break;
        
      case 'resolved':
        // Notificación de resolución exitosa para usuarios (activará encuesta)
        if (targetUserRole === 'user') {
          triggerNotification('report_resolved',
            '🎉 ¡Tu Reporte Ha Sido Resuelto!',
            `¡Excelente noticia! Tu reporte #${reportShortId} ha sido completamente resuelto por nuestro equipo de seguridad. Gracias por contribuir a la seguridad del campus.`,
            reportId,
            'user',
            'high'
          );
          // Trigger encuesta de satisfacción después de un momento
          setTimeout(() => {
            notifyFeedbackRequest(reportId, 'Incidente de Seguridad', 'Menos de 1 día');
          }, 3000);
        }
        // Confirmación de cierre para administradores
        if (targetUserRole === 'admin') {
          triggerNotification('normal',
            '✅ Caso Oficialmente Cerrado',
            `Reporte #${reportShortId} ha sido marcado como resuelto tras revisión y aprobación administrativa. Caso cerrado exitosamente.`,
            reportId,
            'admin',
            'medium'
          );
        }
        // Reconocimiento para personal de seguridad
        if (targetUserRole === 'security') {
          triggerNotification('approved',
            '🏆 Trabajo Aprobado - Caso Resuelto',
            `¡Excelente trabajo! Tu resolución del reporte #${reportShortId} ha sido aprobada por administración. Caso oficialmente cerrado.`,
            reportId,
            'security',
            'high'
          );
        }
        break;
    }
  };

  // Nueva función para notificaciones de aprobación
  const notifyApprovalNeeded = (reportId: string, securityDescription: string) => {
    const reportShortId = reportId.slice(-6);
    triggerNotification('approval_needed',
      '⚠️ Aprobación Requerida',
      `El reporte #${reportShortId} necesita tu aprobación para ser marcado como resuelto. Descripción: ${securityDescription.slice(0, 100)}...`,
      reportId,
      'admin',
      'high'
    );
  };

  // Nueva función para notificar aprobación completada
  const notifyApprovalComplete = (reportId: string, approved: boolean) => {
    const reportShortId = reportId.slice(-6);
    if (approved) {
      triggerNotification('approved',
        '✅ Resolución Aprobada',
        `La resolución del reporte #${reportShortId} ha sido aprobada y el caso se marca como resuelto.`,
        reportId,
        'security',
        'medium'
      );
    } else {
      triggerNotification('normal',
        '🔄 Resolución Rechazada',
        `La resolución del reporte #${reportShortId} requiere trabajo adicional. Revisa los comentarios del administrador.`,
        reportId,
        'security',
        'high'
      );
    }
  };

  // Nueva función para solicitar feedback
  const notifyFeedbackRequest = (reportId: string, reportType: string, resolutionTime: string) => {
    const reportShortId = reportId.slice(-6);
    triggerNotification('feedback_request',
      '📝 ¡Ayúdanos a Mejorar! - Encuesta de Satisfacción',
      `Tu reporte #${reportShortId} (${reportType}) ha sido resuelto exitosamente. Tu opinión es muy importante para nosotros.`,
      reportId,
      'user',
      'medium'
    );
  };

  // Nueva función para notificar asignaciones específicas a seguridad
  const notifySecurityAssignment = (reportId: string, incidentType: string, location: string, priority: string) => {
    const reportShortId = reportId.slice(-6);
    const priorityEmoji = priority === 'alta' ? '🚨' : priority === 'media' ? '⚠️' : '📋';
    
    triggerNotification('assignment',
      `${priorityEmoji} ASIGNACIÓN DE CAMPO - PRIORIDAD ${priority.toUpperCase()}`,
      `Nuevo caso #${reportShortId}: ${incidentType} en ${location}. Procede al área indicada para supervisión inmediata.`,
      reportId,
      'security',
      'high'
    );
  };

  // Nueva función para notificar cambios de estado a usuarios
  const notifyUserReportUpdate = (reportId: string, oldStatus: string, newStatus: string) => {
    const reportShortId = reportId.slice(-6);
    const statusMessages = {
      'investigando': '🔍 Tu reporte está siendo investigado por nuestro equipo.',
      'assigned_to_security': '👮‍♂️ Personal de seguridad ha sido asignado a tu caso.',
      'in_progress': '⚡ Nuestro oficial está trabajando activamente en tu reporte.',
      'pending_approval': '📋 El oficial ha completado el trabajo y está siendo revisado.',
      'resolved': '🎉 ¡Tu reporte ha sido resuelto exitosamente!'
    };

    const message = statusMessages[newStatus as keyof typeof statusMessages] || `Estado actualizado: ${newStatus}`;
    
    triggerNotification('status_update',
      `📱 Actualización de tu Reporte #${reportShortId}`,
      message,
      reportId,
      'user',
      newStatus === 'resolved' ? 'high' : 'medium'
    );
  };

  // Nueva función para notificar acciones administrativas
  const notifyAdminAction = (reportId: string, action: string, targetRole: string) => {
    const reportShortId = reportId.slice(-6);
    
    const actionMessages = {
      'assigned_to_security': {
        title: '✅ Reporte Asignado Exitosamente',
        description: `Reporte #${reportShortId} ha sido asignado al personal de seguridad. El oficial ha sido notificado.`
      },
      'priority_changed': {
        title: '🔄 Prioridad del Reporte Actualizada',
        description: `La prioridad del reporte #${reportShortId} ha sido modificada según evaluación administrativa.`
      },
      'approved': {
        title: '✅ Resolución Aprobada',
        description: `Has aprobado la resolución del reporte #${reportShortId}. El caso ha sido cerrado exitosamente.`
      },
      'rejected': {
        title: '🔄 Resolución Rechazada',
        description: `Has solicitado trabajo adicional en el reporte #${reportShortId}. El personal de seguridad ha sido notificado.`
      }
    };

    const actionData = actionMessages[action as keyof typeof actionMessages];
    if (actionData) {
      triggerNotification('normal',
        actionData.title,
        actionData.description,
        reportId,
        targetRole,
        'medium'
      );
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => notif.id === notificationId ? { ...notif, read: true } : notif)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Función principal para activar notificaciones
  const triggerNotification = (
    type: 'high_priority' | 'normal' | 'status_update' | 'assignment' | 'danger_zone' | 'report_resolved' | 'approval_needed' | 'approved' | 'feedback_request',
    message: string,
    description?: string,
    reportId?: string,
    targetRole?: string,
    priority?: 'high' | 'medium' | 'low'
  ) => {
    // Agregar a la lista de notificaciones
    addNotification({
      type,
      title: message,
      description,
      reportId,
      userId: targetRole,
      priority
    }, targetRole);
    switch (type) {
      case 'high_priority':
        // Alerta alta: vibración intensa + sonido de alerta + notificación visual
        // Solo activar vibración y sonido para usuarios en alertas de alta prioridad
        if (currentUserRole === 'user') {
          // Patrón de vibración más dramático para alertas críticas
          triggerVibration([500, 200, 500, 200, 500, 200, 500]);
          playNotificationSound('alert');
          
          // Segundo round de vibración después de un breve delay
          setTimeout(() => {
            triggerVibration([300, 100, 300]);
          }, 2000);
          
          // Tercer sonido de alerta después de otro delay
          setTimeout(() => {
            playNotificationSound('alert');
          }, 4000);
        }
        toast.error(message, {
          description,
          duration: 12000, // Duración más larga para alertas críticas
          className: 'border-l-4 border-l-red-500 bg-red-50 shadow-xl animate-pulse',
          style: {
            borderLeft: '4px solid #ef4444',
            backgroundColor: '#fef2f2',
            boxShadow: '0 10px 25px rgba(239, 68, 68, 0.4)',
            border: '2px solid #ef4444'
          }
        });
        break;
        
      case 'danger_zone':
        // Zona peligrosa: vibración intensa + sonido de alerta + notificación visual llamativa
        triggerVibration([400, 200, 400, 200, 400]);
        playNotificationSound('alert');
        toast.error(message, {
          description,
          duration: 10000,
          className: 'border-l-4 border-l-orange-500 bg-orange-50 animate-pulse',
          style: {
            borderLeft: '4px solid #f97316',
            backgroundColor: '#fff7ed'
          }
        });
        break;
        
      case 'normal':
        // Reporte normal: solo actualización visual
        toast.info(message, {
          description,
          duration: 5000,
          className: 'border-l-4 border-l-blue-500 bg-blue-50'
        });
        break;
        
      case 'status_update':
        // Actualización de estado: vibración suave + sonido info MÁS FUERTE
        // Para usuarios: sonido más prominente cuando se actualiza SU reporte
        if (currentUserRole === 'user') {
          triggerVibration([200, 100, 200], true); // Forzar sonido de vibración simulada
          playNotificationSound('info');
          // Segundo sonido para enfatizar la actualización
          setTimeout(() => {
            playNotificationSound('success');
          }, 500);
        } else {
          triggerVibration([150]);
          playNotificationSound('info');
        }
        toast.success(message, {
          description,
          duration: 6000, // Duración más larga para actualizaciones importantes
          className: 'border-l-4 border-l-green-500 bg-green-50 shadow-lg',
          style: {
            borderLeft: '4px solid #10b981',
            backgroundColor: '#f0fdf4',
            boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)'
          }
        });
        break;
        
      case 'assignment':
        // Asignación a seguridad: sonido de éxito + vibración
        triggerVibration([200, 50, 200]);
        playNotificationSound('success');
        toast.success(message, {
          description,
          duration: 6000,
          className: 'border-l-4 border-l-purple-500 bg-purple-50'
        });
        break;

      case 'report_resolved':
        // Reporte resuelto: vibración suave + sonido de éxito
        // Solo para usuarios cuando su reporte se resuelve
        if (currentUserRole === 'user') {
          // Determinar si el reporte fue de alta prioridad basado en el descripción
          const isHighPriorityResolution = description?.includes('ALTA PRIORIDAD') || message.includes('ALTA PRIORIDAD');
          
          if (isHighPriorityResolution) {
            // Para resoluciones de alta prioridad: vibración y sonido más intensos
            triggerVibration([200, 100, 200, 100, 200]);
            playNotificationSound('success');
            // Segundo sonido de confirmación
            setTimeout(() => {
              playNotificationSound('success');
            }, 1000);
          } else {
            // Para resoluciones normales: vibración suave
            triggerVibration([150, 100, 150]);
            playNotificationSound('success');
          }
        }
        toast.success(message, {
          description,
          duration: 8000,
          className: 'border-l-4 border-l-green-500 bg-green-50 shadow-lg',
          style: {
            borderLeft: '4px solid #10b981',
            backgroundColor: '#f0fdf4',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)'
          }
        });
        break;

      case 'approval_needed':
        // Notificación de aprobación requerida para administradores
        if (currentUserRole === 'admin') {
          triggerVibration([300, 150, 300]);
          playNotificationSound('alert');
        }
        toast.warning(message, {
          description,
          duration: 10000,
          className: 'border-l-4 border-l-orange-500 bg-orange-50',
          style: {
            borderLeft: '4px solid #f97316',
            backgroundColor: '#fff7ed'
          }
        });
        break;

      case 'approved':
        // Notificación de aprobación completada
        triggerVibration([200, 100, 200]);
        playNotificationSound('success');
        toast.success(message, {
          description,
          duration: 6000,
          className: 'border-l-4 border-l-blue-500 bg-blue-50'
        });
        break;

      case 'feedback_request':
        // Solicitud de feedback para usuarios
        if (currentUserRole === 'user') {
          triggerVibration([150]);
          playNotificationSound('info');
        }
        toast.info(message, {
          description,
          duration: 10000,
          className: 'border-l-4 border-l-purple-500 bg-purple-50',
          style: {
            borderLeft: '4px solid #8b5cf6',
            backgroundColor: '#faf5ff'
          }
        });
        break;
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      triggerNotification,
      playNotificationSound,
      triggerVibration,
      markAsRead,
      markAllAsRead,
      clearNotifications,
      checkDangerousZones,
      notifyReportProgress,
      notifyApprovalNeeded,
      notifyApprovalComplete,
      notifyFeedbackRequest,
      notifySecurityAssignment,
      notifyUserReportUpdate,
      notifyAdminAction,
      setCurrentUserRole
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationService() {
  const context = React.useContext(NotificationContext);
  if (!context) {
    console.warn('useNotificationService must be used within a NotificationServiceProvider');
    // Return a safe fallback instead of throwing
    return {
      notifications: [],
      unreadCount: 0,
      triggerNotification: () => {},
      playNotificationSound: (type: 'alert' | 'success' | 'info' | 'vibration_simulation') => {},
      triggerVibration: (pattern?: number[], forceSound?: boolean) => {},
      markAsRead: () => {},
      markAllAsRead: () => {},
      clearNotifications: () => {},
      checkDangerousZones: () => {},
      notifyReportProgress: () => {},
      notifyApprovalNeeded: () => {},
      notifyApprovalComplete: () => {},
      notifyFeedbackRequest: () => {},
      notifySecurityAssignment: () => {},
      notifyUserReportUpdate: () => {},
      notifyAdminAction: () => {},
      setCurrentUserRole: () => {}
    };
  }
  return context;
}