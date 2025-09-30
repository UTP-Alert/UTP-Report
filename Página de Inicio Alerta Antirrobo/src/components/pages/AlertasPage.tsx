import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { SOSButton } from '../SOSButton';
import { 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Users,
  Bell,
  Eye,
  Filter
} from 'lucide-react';

interface AlertasPageProps {
  onOpenReport: () => void;
}

export function AlertasPage({ onOpenReport }: AlertasPageProps) {
  const activeAlerts = [
    {
      id: 1,
      tipo: 'ROBO',
      zona: 'Estacionamiento Este',
      descripcion: 'Reporte de robo de bicicleta en la zona de estacionamiento este',
      tiempo: 'Hace 15 minutos',
      prioridad: 'alta',
      confirmaciones: 8
    },
    {
      id: 2,
      tipo: 'SOSPECHOSO',
      zona: 'Biblioteca Central',
      descripcion: 'Persona sospechosa merodeando en los alrededores de la biblioteca',
      tiempo: 'Hace 32 minutos',
      prioridad: 'media',
      confirmaciones: 3
    },
    {
      id: 3,
      tipo: 'ROBO',
      zona: 'Zona Deportiva',
      descripcion: 'Intento de robo de celular reportado en los vestidores',
      tiempo: 'Hace 1 hora',
      prioridad: 'alta',
      confirmaciones: 12
    },
    {
      id: 4,
      tipo: 'VANDALISMO',
      zona: 'Campus Principal',
      descripcion: 'Daños reportados en instalaciones del campus principal',
      tiempo: 'Hace 2 horas',
      prioridad: 'baja',
      confirmaciones: 5
    },
    {
      id: 5,
      tipo: 'ACOSO',
      zona: 'Cafetería Norte',
      descripcion: 'Reporte de comportamiento inapropiado en área de cafetería',
      tiempo: 'Hace 3 horas',
      prioridad: 'alta',
      confirmaciones: 7
    }
  ];

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return 'bg-red-500 hover:bg-red-600';
      case 'media': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'baja': return 'bg-blue-500 hover:bg-blue-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getPriorityText = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return 'PRIORIDAD ALTA';
      case 'media': return 'PRIORIDAD MEDIA';
      case 'baja': return 'PRIORIDAD BAJA';
      default: return 'SIN PRIORIDAD';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'ROBO': return AlertTriangle;
      case 'SOSPECHOSO': return Eye;
      case 'VANDALISMO': return AlertTriangle;
      case 'ACOSO': return Users;
      default: return AlertTriangle;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Bell className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-3xl">ALERTAS ACTIVAS</h1>
              <p className="text-lg text-gray-600">
                Reportes en tiempo real de la comunidad estudiantil
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-red-500 p-2 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl">3</p>
                    <p className="text-sm text-gray-600">Alta Prioridad</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-500 p-2 rounded-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl">1</p>
                    <p className="text-sm text-gray-600">Media Prioridad</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl">1</p>
                    <p className="text-sm text-gray-600">Baja Prioridad</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500 p-2 rounded-lg">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl">35</p>
                    <p className="text-sm text-gray-600">Confirmaciones</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 items-center">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              aria-label="Filtrar alertas por categoría"
            >
              <Filter className="h-4 w-4" />
              Filtrar Alertas
            </Button>
            <Button 
              variant="outline"
              aria-label="Actualizar lista de alertas"
            >
              Actualizar
            </Button>
            <Badge variant="outline" className="text-base px-3 py-1">
              🔴 EN VIVO - Actualizando cada 30 segundos
            </Badge>
          </div>
        </div>

        {/* Emergency Alert */}
        <Alert className="mb-8 border-primary bg-red-50">
          <AlertTriangle className="h-6 w-6" />
          <AlertDescription className="text-lg">
            Si presencias una emergencia en curso, llama inmediatamente al 911 antes de reportar aquí.
          </AlertDescription>
        </Alert>

        {/* Active Alerts */}
        <div className="space-y-4">
          {activeAlerts.map((alert) => {
            const TipoIcon = getTipoIcon(alert.tipo);
            return (
              <Card 
                key={alert.id} 
                className="border-l-4 border-l-primary hover:shadow-lg transition-all cursor-pointer focus:ring-4 focus:ring-primary/50"
                tabIndex={0}
                role="button"
                aria-label={`Alerta de ${alert.tipo} en ${alert.zona} - ${alert.prioridad} prioridad - ${alert.confirmaciones} confirmaciones`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <TipoIcon className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl flex items-center gap-3">
                          {alert.tipo}
                          <Badge 
                            className={`${getPriorityColor(alert.prioridad)} text-white px-3 py-1`}
                          >
                            {getPriorityText(alert.prioridad)}
                          </Badge>
                        </CardTitle>
                        <div className="flex items-center gap-4 mt-2 text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span className="text-lg">{alert.zona}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{alert.tiempo}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-base px-3 py-2">
                      {alert.confirmaciones} confirmaciones
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-lg mb-4">
                    {alert.descripcion}
                  </CardDescription>
                  <div className="flex gap-3">
                    <Button 
                      size="sm" 
                      className="bg-primary hover:bg-primary/90"
                      aria-label="Confirmar que has visto esta alerta"
                    >
                      Confirmar Alerta
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      aria-label="Ver más detalles de esta alerta"
                    >
                      Ver Detalles
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      aria-label="Reportar información adicional sobre esta alerta"
                    >
                      Agregar Info
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="mt-12 text-center">
          <Card className="bg-gray-100 border-gray-200">
            <CardContent className="p-8">
              <h3 className="text-xl mb-4">¿Tienes información sobre alguna alerta?</h3>
              <p className="text-lg text-gray-600 mb-6">
                Tu aporte puede ayudar a mantener segura a toda la comunidad universitaria.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  onClick={onOpenReport}
                  size="lg" 
                  className="bg-primary hover:bg-primary/90"
                  aria-label="Reportar nueva alerta o incidente"
                >
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Reportar Nuevo Incidente
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  aria-label="Contactar con el equipo de seguridad"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Contactar Seguridad
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Botón SOS */}
      <SOSButton />
    </div>
  );
}