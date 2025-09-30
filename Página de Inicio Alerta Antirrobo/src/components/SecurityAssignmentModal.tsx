import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { useSecurityService, getStatusColor, getStatusText, type SecurityOfficer } from './services/SecurityService';
import { useReportService, type Report } from './services/ReportService';
import { toast } from 'sonner@2.0.3';
import { 
  Shield, 
  MapPin, 
  Clock, 
  User, 
  Radio, 
  CheckCircle,
  AlertTriangle,
  Star,
  Navigation
} from 'lucide-react';

interface SecurityAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: Report | null;
}

export function SecurityAssignmentModal({ isOpen, onClose, report }: SecurityAssignmentModalProps) {
  const { officers, assignReportToOfficer, getNearestOfficer } = useSecurityService();
  const { assignReportToSecurity } = useReportService();

  if (!report) return null;

  const availableOfficers = officers.filter(officer => officer.status === 'available');
  const nearestOfficer = getNearestOfficer(report.zone);
  const zoneOfficers = officers.filter(officer => 
    officer.assignedZones.includes(report.zone)
  );

  const handleAssignOfficer = (officer: SecurityOfficer) => {
    // Update both services
    assignReportToOfficer(officer.id, report.id);
    assignReportToSecurity(report.id, officer.id, officer.name);
    
    toast.success('Reporte asignado y en proceso', {
      description: `${officer.name} (${officer.badge}) está trabajando en el caso y enviará su reporte para aprobación`,
    });
    
    onClose();
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 60) {
      return `Hace ${minutes} min`;
    } else {
      const hours = Math.floor(diff / 3600000);
      return `Hace ${hours}h`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            Asignar Personal de Seguridad
          </DialogTitle>
          <DialogDescription>
            Selecciona el oficial de seguridad para atender el reporte en {report.zone}
          </DialogDescription>
        </DialogHeader>

        {/* Report Summary */}
        <Card className="mb-6 border-l-4 border-l-red-500 bg-red-50">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-lg mb-2">{report.type}</h4>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{report.zone}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatTimestamp(report.timestamp)}</span>
                  </div>
                </div>
                <p className="text-gray-700 text-sm">{report.description}</p>
              </div>
              <Badge className="bg-red-500 hover:bg-red-600">
                PRIORIDAD {report.priority.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Nearest Officer Recommendation */}
        {nearestOfficer && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <Navigation className="h-4 w-4" />
            <AlertDescription>
              <strong>Recomendación:</strong> {nearestOfficer.name} ({nearestOfficer.badge}) es el oficial más cercano a esta zona.
            </AlertDescription>
          </Alert>
        )}

        {/* Available Officers */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Disponible ({availableOfficers.length})
          </h3>

          {availableOfficers.length === 0 ? (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No hay personal de seguridad disponible en este momento. Todos los oficiales están ocupados.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableOfficers.map((officer) => (
                <Card key={officer.id} className={`hover:shadow-lg transition-all ${
                  officer.id === nearestOfficer?.id ? 'ring-2 ring-green-500 bg-green-50' : ''
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {officer.name}
                          {officer.id === nearestOfficer?.id && (
                            <Star className="h-4 w-4 text-green-600 fill-current" />
                          )}
                        </CardTitle>
                        <p className="text-sm text-gray-600">{officer.badge}</p>
                      </div>
                      <Badge className={getStatusColor(officer.status)}>
                        {getStatusText(officer.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="text-sm">
                        <p className="text-gray-600 mb-1">Zonas asignadas:</p>
                        <div className="flex flex-wrap gap-1">
                          {officer.assignedZones.map((zone) => (
                            <Badge
                              key={zone}
                              variant="outline"
                              className={zone === report.zone ? 'bg-blue-100 border-blue-300' : ''}
                            >
                              {zone}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Experiencia:</p>
                          <p className="font-medium">{officer.experience}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Última actualización:</p>
                          <p className="font-medium">{formatTimestamp(officer.lastUpdate)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Radio className="h-4 w-4" />
                        <span>{officer.contactInfo}</span>
                      </div>

                      <Button
                        onClick={() => handleAssignOfficer(officer)}
                        className="w-full bg-primary hover:bg-primary/90"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Asignar a {officer.name}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* All Officers Status */}
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Estado de Todo el Personal
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {officers.map((officer) => (
              <Card key={officer.id} className="text-center">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">{officer.name}</h4>
                    <Badge className={getStatusColor(officer.status)}>
                      {getStatusText(officer.status)}
                    </Badge>
                    {officer.currentZone && (
                      <p className="text-xs text-gray-600">En: {officer.currentZone}</p>
                    )}
                    {officer.activeReports.length > 0 && (
                      <p className="text-xs text-gray-600">
                        {officer.activeReports.length} reporte(s) activo(s)
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}