import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useNotificationService } from './services/NotificationService';
import { useReportService } from './services/ReportService';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Shield, 
  Zap,
  Play,
  User,
  UserCheck,
  Crown
} from 'lucide-react';

interface NotificationDemoProps {
  currentRole?: string;
}

export function NotificationDemo({ currentRole = 'user' }: NotificationDemoProps) {
  const { triggerNotification, notifyReportProgress, checkDangerousZones } = useNotificationService();
  const { reports } = useReportService();

  const getRoleSpecificDemos = () => {
    switch (currentRole) {
      case 'admin':
        return [
          {
            title: '📢 Nuevo Reporte Recibido',
            description: 'Simular cuando un usuario crea un nuevo reporte (Solo Admin)',
            action: () => notifyReportProgress('demo-admin-1', 'created', 'admin'),
            icon: Bell,
            color: 'bg-blue-500',
            role: 'admin'
          }
        ];
      
      case 'security':
        return [
          {
            title: '📋 Nuevo Caso Asignado',
            description: 'Simular cuando se te asigna un nuevo caso (Solo Seguridad)',
            action: () => notifyReportProgress('demo-security-1', 'assigned', 'security'),
            icon: Shield,
            color: 'bg-purple-500',
            role: 'security'
          }
        ];
      
      case 'user':
      default:
        return [
          {
            title: '⚠️ Zona Peligrosa Detectada',
            description: 'Simular detección de zona peligrosa (Solo Usuario)',
            action: () => triggerNotification('danger_zone', 
              '⚠️ ZONA PELIGROSA DETECTADA',
              'La zona "Estacionamiento Este" ha tenido 3+ reportes en 24h. Se recomienda precaución.',
              undefined,
              'user'
            ),
            icon: Zap,
            color: 'bg-orange-500',
            role: 'user'
          },
          {
            title: '🔄 Reporte en Proceso',
            description: 'Simular cuando tu reporte es asignado a seguridad (Solo Usuario)',
            action: () => notifyReportProgress('demo-user-1', 'assigned', 'user'),
            icon: CheckCircle,
            color: 'bg-blue-500',
            role: 'user'
          },
          {
            title: '✅ Reporte Resuelto',
            description: 'Simular cuando tu reporte se resuelve exitosamente (Solo Usuario)',
            action: () => notifyReportProgress('demo-user-2', 'resolved', 'user'),
            icon: CheckCircle,
            color: 'bg-green-500',
            role: 'user'
          }
        ];
    }
  };

  const demoNotifications = getRoleSpecificDemos();

  const simulateMultipleReports = () => {
    // Solo disponible para usuarios ya que solo ellos reciben alertas de zona peligrosa
    if (currentRole !== 'user') {
      return;
    }

    // Crear reportes simulados para una zona
    const simulatedReports = [
      {
        id: 'sim-1',
        zone: 'Estacionamiento Este',
        timestamp: new Date(Date.now() - 60000).toISOString(),
        incidentType: 'robo'
      },
      {
        id: 'sim-2', 
        zone: 'Estacionamiento Este',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        incidentType: 'sospechoso'
      },
      {
        id: 'sim-3',
        zone: 'Estacionamiento Este', 
        timestamp: new Date(Date.now() - 180000).toISOString(),
        incidentType: 'intento_robo'
      }
    ];

    // Combinar con reportes existentes y verificar
    const allReports = [...reports, ...simulatedReports];
    checkDangerousZones(allReports);
  };

  const getRoleIcon = () => {
    switch (currentRole) {
      case 'admin':
        return <UserCheck className="h-5 w-5" />;
      case 'security':
        return <Shield className="h-5 w-5" />;
      case 'superuser':
        return <Crown className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getRoleColor = () => {
    switch (currentRole) {
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'security':
        return 'bg-purple-100 text-purple-800';
      case 'superuser':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  // Si es superusuario, no mostrar el demo ya que no tiene campanita
  if (currentRole === 'superuser') {
    return (
      <Card className="border-2 border-dashed border-gray-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-500">
            <Crown className="h-5 w-5" />
            Demo de Notificaciones - No Disponible
          </CardTitle>
          <CardDescription>
            El SuperAdmin no recibe notificaciones en la campanita. Las notificaciones están disponibles solo para Admin, Usuario y Seguridad.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-dashed border-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Bell className="h-5 w-5" />
          Demo de Notificaciones 
          <Badge variant="outline" className={getRoleColor()}>
            {getRoleIcon()}
            <span className="ml-1 capitalize">{currentRole}</span>
          </Badge>
        </CardTitle>
        <CardDescription>
          Prueba las notificaciones específicas para tu rol. Solo verás las notificaciones relevantes para <strong>{currentRole}</strong>. 
          Estas aparecerán en la campanita de arriba y como toasts con sonidos y vibraciones.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {demoNotifications.map((demo, index) => {
            const Icon = demo.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 text-left justify-start hover:bg-gray-50 w-full"
                onClick={demo.action}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className={`p-2 rounded-lg ${demo.color} bg-opacity-10`}>
                    <Icon className="h-4 w-4" style={{ color: demo.color.replace('bg-', '').replace('-500', '') }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{demo.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{demo.description}</p>
                  </div>
                  <Play className="h-4 w-4 text-gray-400" />
                </div>
              </Button>
            );
          })}
        </div>

        {/* Botón de zona peligrosa solo para usuarios */}
        {currentRole === 'user' && (
          <div className="mt-4 pt-4 border-t">
            <Button
              onClick={simulateMultipleReports}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              <Zap className="h-4 w-4 mr-2" />
              Simular 3+ Reportes en Zona (Activar Alerta Peligrosa)
            </Button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Solo los usuarios reciben alertas de zonas peligrosas
            </p>
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-sm text-blue-900 mb-2">Flujo de Notificaciones:</h4>
          <div className="text-xs text-blue-700 space-y-1">
            {currentRole === 'user' && (
              <>
                <div>• Zona peligrosa: Cuando 3+ reportes en una zona</div>
                <div>• Proceso: Cuando tu reporte es asignado</div>
                <div>• Resuelto: Cuando tu reporte se cierra</div>
              </>
            )}
            {currentRole === 'admin' && (
              <div>• Nuevo reporte: Cuando un usuario crea un reporte</div>
            )}
            {currentRole === 'security' && (
              <div>• Caso asignado: Cuando se te asigna un nuevo caso</div>
            )}
          </div>
        </div>

        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            💡 Verifica que las notificaciones incluyan sonido, vibración y aparezcan en la campanita
          </p>
        </div>
      </CardContent>
    </Card>
  );
}