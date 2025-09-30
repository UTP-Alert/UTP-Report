import React from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Lightbulb, 
  Play, 
  X, 
  CheckCircle,
  ArrowRight,
  User,
  Shield
} from 'lucide-react';

interface WelcomeNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
  userName?: string;
}

export function WelcomeNotification({ 
  isOpen, 
  onClose, 
  onStartTour, 
  userName = "Juan Pérez" 
}: WelcomeNotificationProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="max-w-md w-full mx-4 border-2 border-primary shadow-2xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="text-primary border-primary">
              <Shield className="h-3 w-3 mr-1" />
              Nuevo Usuario
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="mb-4">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">
              ¡Bienvenido a UTP+Report, {userName}! 👋
            </CardTitle>
          </div>
          
          <CardDescription className="text-base leading-relaxed">
            Tu sistema de seguridad universitaria está listo. Te guiaremos paso a paso 
            para que conozcas todas las herramientas disponibles.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Características destacadas */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Lo que puedes hacer:
            </h4>
            <ul className="space-y-1 text-sm text-blue-700">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Reportar incidentes de forma anónima</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Monitorear zonas en tiempo real</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Seguir el progreso de tus reportes</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Recibir notificaciones importantes</span>
              </li>
            </ul>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={onStartTour}
              className="w-full bg-primary hover:bg-primary/90 h-12"
            >
              <Play className="h-4 w-4 mr-2" />
              Comenzar Tour Guiado (2 min)
            </Button>
            
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Explorar por mi cuenta
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Nota informativa */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Puedes volver a ver este tutorial desde la página de Guía en cualquier momento
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}