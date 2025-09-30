import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { SOSButton } from './SOSButton';
import { NotificationDemo } from './NotificationDemo';
import { 
  Shield, 
  Phone, 
  MapPin, 
  AlertTriangle, 
  Users, 
  Clock,
  Eye,
  MessageCircle,
  Navigation
} from 'lucide-react';

interface HomePageProps {
  onOpenReport: () => void;
  onPageChange?: (page: string) => void;
}

export function HomePage({ onOpenReport, onPageChange }: HomePageProps) {
  const universityZones = [
    { id: 1, name: 'Campus Principal', status: 'seguro', incidents: 0 },
    { id: 2, name: 'Biblioteca Central', status: 'seguro', incidents: 0 },
    { id: 3, name: 'Cafetería Norte', status: 'seguro', incidents: 0 },
    { id: 4, name: 'Estacionamiento Este', status: 'seguro', incidents: 0 },
    { id: 5, name: 'Laboratorios', status: 'seguro', incidents: 0 },
    { id: 6, name: 'Zona Deportiva', status: 'seguro', incidents: 0 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'seguro': return 'bg-green-500 hover:bg-green-600';
      case 'alerta': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'peligro': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'seguro': return 'ZONA SEGURA';
      case 'alerta': return 'PRECAUCIÓN';
      case 'peligro': return 'ZONA PELIGROSA';
      default: return 'SIN DATOS';
    }
  };

  return (
    <div className="min-h-screen bg-white">

      <main className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Emergency Alert */}
        <Alert className="mb-4 sm:mb-8 border-primary bg-red-50">
          <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />
          <AlertDescription className="text-base sm:text-lg">
            En caso de emergencia inmediata, llama al 911 o usa el botón SOS flotante.
          </AlertDescription>
        </Alert>

        {/* Main Action Button - Solo Reportar Robo */}
        <div className="flex justify-center mb-6 sm:mb-12">
          <Card className="border-2 hover:shadow-lg transition-shadow max-w-md w-full">
            <CardHeader className="text-center pb-3 sm:pb-4">
              <CardTitle className="flex items-center justify-center gap-2 sm:gap-3 text-xl sm:text-2xl">
                <AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                REPORTAR ROBO
              </CardTitle>
              <CardDescription className="text-base sm:text-lg">
                ¿Has sido víctima de un robo? Reporta el incidente de forma inmediata
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={onOpenReport}
                className="w-full h-12 sm:h-16 text-lg sm:text-xl bg-primary hover:bg-primary/90"
                aria-label="Botón para reportar un robo - Presiona para abrir formulario de reporte"
              >
                <Eye className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3" />
                REPORTAR AHORA
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* University Zones Status */}
        <section className="mb-6 sm:mb-12">
          <h2 className="text-xl sm:text-2xl mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            Estado de Zonas Universitarias
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {universityZones.map((zone) => (
              <Card 
                key={zone.id} 
                className="border-2 hover:shadow-md transition-all cursor-pointer focus:ring-4 focus:ring-primary/50"
                tabIndex={0}
                role="button"
                aria-label={`Zona ${zone.name} - ${getStatusText(zone.status)} - ${zone.incidents} incidentes reportados`}
              >
                <CardHeader className="pb-2 sm:pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg">{zone.name}</CardTitle>
                    <Badge 
                      className={`${getStatusColor(zone.status)} text-white px-2 sm:px-3 py-1 text-xs sm:text-sm`}
                    >
                      {getStatusText(zone.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                      <span className="text-base sm:text-lg">{zone.incidents} incidentes</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 text-gray-600">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-sm sm:text-base">Hoy</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-6 sm:mb-12">
          <h2 className="text-xl sm:text-2xl mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
            <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            Acciones Rápidas
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Button 
              variant="outline" 
              className="h-16 sm:h-20 text-base sm:text-lg border-2 border-gray-300 hover:border-primary hover:bg-primary/5"
              aria-label="Ver reportes recientes de la comunidad estudiantil"
            >
              <Eye className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
              <span className="hidden sm:inline">Ver Reportes Recientes</span>
              <span className="sm:hidden">Reportes</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-16 sm:h-20 text-base sm:text-lg border-2 border-gray-300 hover:border-primary hover:bg-primary/5"
              aria-label="Consejos de seguridad para estudiantes"
            >
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
              <span className="hidden sm:inline">Consejos de Seguridad</span>
              <span className="sm:hidden">Consejos</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-16 sm:h-20 text-base sm:text-lg border-2 border-gray-300 hover:border-primary hover:bg-primary/5 sm:col-span-2 lg:col-span-1"
              aria-label="Contactar con seguridad universitaria"
            >
              <Phone className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
              <span className="hidden sm:inline">Contactar Seguridad</span>
              <span className="sm:hidden">Contactar</span>
            </Button>
          </div>
        </section>

        {/* Notification Demo - Only for testing */}
        <section className="mb-6 sm:mb-12">
          <NotificationDemo />
        </section>

        {/* Information Section */}
        <section className="mb-6 sm:mb-12">
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-4 sm:p-8 text-center">
              <h3 className="text-xl sm:text-2xl mb-3 sm:mb-4">Sistema de Reportes UTP</h3>
              <p className="text-base sm:text-lg text-gray-700 mb-4 sm:mb-6">
                Plataforma diseñada para mantener segura a nuestra comunidad estudiantil. 
                Reporta incidentes de forma anónima y contribuye a un campus más seguro.
              </p>
              <div className="grid grid-cols-2 lg:flex lg:flex-wrap justify-center gap-2 sm:gap-4">
                <Badge variant="outline" className="text-sm sm:text-base px-2 sm:px-4 py-1 sm:py-2">
                  🔒 Reportes Anónimos
                </Badge>
                <Badge variant="outline" className="text-sm sm:text-base px-2 sm:px-4 py-1 sm:py-2">
                  ⚡ Respuesta Inmediata
                </Badge>
                <Badge variant="outline" className="text-sm sm:text-base px-2 sm:px-4 py-1 sm:py-2">
                  🛡️ Seguridad Garantizada
                </Badge>
                <Badge variant="outline" className="text-sm sm:text-base px-2 sm:px-4 py-1 sm:py-2">
                  📱 Acceso 24/7
                </Badge>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer Info */}
        <footer className="bg-gray-50 rounded-lg p-4 sm:p-6 mt-6 sm:mt-12">
          <div className="text-center">
            <h3 className="text-lg sm:text-xl mb-2 sm:mb-3">¿Necesitas Ayuda?</h3>
            <p className="text-base sm:text-lg mb-3 sm:mb-4">
              Todos los reportes son anónimos y contribuyen a mejorar la seguridad de nuestra comunidad estudiantil.
            </p>
            <div className="grid grid-cols-1 sm:flex sm:flex-wrap justify-center gap-2 sm:gap-4">
              <Badge variant="outline" className="text-sm sm:text-base px-3 sm:px-4 py-1 sm:py-2">
                🔒 100% Anónimo
              </Badge>
              <Badge variant="outline" className="text-sm sm:text-base px-3 sm:px-4 py-1 sm:py-2">
                ⚡ Respuesta Rápida
              </Badge>
              <Badge variant="outline" className="text-sm sm:text-base px-3 sm:px-4 py-1 sm:py-2">
                🛡️ Seguro y Confiable
              </Badge>
            </div>
          </div>
        </footer>
      </main>
      
      {/* Botón SOS */}
      <SOSButton />
    </div>
  );
}