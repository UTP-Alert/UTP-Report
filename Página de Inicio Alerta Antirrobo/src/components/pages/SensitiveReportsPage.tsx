import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { 
  Shield,
  ShieldCheck,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
  Lock,
  Unlock,
  Crown,
  Search,
  Filter,
  Download,
  UserCheck,
  Clock,
  FileText
} from 'lucide-react';
import { useReportService, Report } from '../services/ReportService';
import { toast } from 'sonner@2.0.3';

interface SensitiveReportsPageProps {
  userRole: string;
}

export function SensitiveReportsPage({ userRole }: SensitiveReportsPageProps) {
  const { reports } = useReportService();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [showAuthDialog, setShowAuthDialog] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [priorityFilter, setPriorityFilter] = React.useState('all');
  const [anonymousFilter, setAnonymousFilter] = React.useState('all');
  const [selectedReport, setSelectedReport] = React.useState<Report | null>(null);

  // Contraseña especial para acceder a reportes sensibles
  const SENSITIVE_ACCESS_PASSWORD = 'SuperAdmin2025!';

  const handleAuthentication = () => {
    if (password === SENSITIVE_ACCESS_PASSWORD) {
      setIsAuthenticated(true);
      setShowAuthDialog(false);
      toast.success('Acceso autorizado a reportes sensibles');
    } else {
      toast.error('Contraseña incorrecta. Acceso denegado.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowAuthDialog(true);
    setPassword('');
    setSelectedReport(null);
    toast.info('Sesión de reportes sensibles cerrada');
  };

  // Verificar que solo el superuser pueda acceder
  if (userRole !== 'superuser') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-medium mb-2">Acceso Denegado</h2>
            <p className="text-gray-600">Solo el SuperAdmin tiene acceso a esta sección.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filtrar reportes según criterios
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (report.reportedBy?.userName.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (report.reportedBy?.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || report.priority === priorityFilter;
    const matchesAnonymous = anonymousFilter === 'all' || 
                            (anonymousFilter === 'anonymous' && report.isAnonymous) ||
                            (anonymousFilter === 'identified' && !report.isAnonymous);
    
    return matchesSearch && matchesStatus && matchesPriority && matchesAnonymous;
  });

  const exportSensitiveData = () => {
    const sensitiveData = filteredReports.map(report => ({
      id: report.id,
      tipo: report.type,
      zona: report.zone,
      descripcion: report.description,
      esAnonimo: report.isAnonymous ? 'Sí' : 'No',
      reportadoPor: report.reportedBy?.userName || 'Desconocido',
      email: report.reportedBy?.userEmail || 'N/A',
      rol: report.reportedBy?.userRole || 'N/A',
      fecha: new Date(report.timestamp).toLocaleString('es-PA'),
      estado: report.status,
      prioridad: report.priority
    }));

    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,Tipo,Zona,Descripción,Es Anónimo,Reportado Por,Email,Rol,Fecha,Estado,Prioridad\n" +
      sensitiveData.map(row => 
        Object.values(row).map(val => `"${val}"`).join(',')
      ).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reportes_sensibles_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Datos sensibles exportados exitosamente');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-500';
      case 'media': return 'bg-yellow-500';
      case 'baja': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'nuevo': return 'bg-blue-500';
      case 'investigating': return 'bg-orange-500';
      case 'assigned_to_security': return 'bg-purple-500';
      case 'in_progress': return 'bg-indigo-500';
      case 'resuelto': return 'bg-green-500';
      case 'cerrado': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  // Dialog de autenticación
  if (showAuthDialog && !isAuthenticated) {
    return (
      <Dialog open={showAuthDialog} onOpenChange={(open) => {
        if (!open) {
          // Si el usuario cierra el dialog, redirigir de vuelta
          window.history.back();
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Crown className="h-6 w-6 text-primary" />
              Acceso a Reportes Sensibles
            </DialogTitle>
            <DialogDescription>
              Esta sección contiene información confidencial de todos los reportes, incluyendo la identidad real de reportes anónimos. 
              Se requiere autenticación adicional.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert className="border-primary bg-red-50">
              <Lock className="h-4 w-4" />
              <AlertDescription>
                Solo el SuperAdmin puede acceder a esta información sensible.
              </AlertDescription>
            </Alert>
            
            <div>
              <label className="block text-sm font-medium mb-2">Contraseña de Acceso Sensible</label>
              <Input
                type="password"
                placeholder="Ingrese la contraseña especial"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAuthentication()}
              />
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={handleAuthentication}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                <Unlock className="h-4 w-4 mr-2" />
                Autenticar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAuthDialog(false);
                  window.history.back();
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header con logout */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <Alert className="border-primary bg-red-50 flex-1 mr-4">
              <Crown className="h-6 w-6 text-primary" />
              <AlertDescription className="text-lg">
                <strong>Reportes Sensibles</strong> - Acceso a información confidencial y identidad real de todos los reportes.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="border-red-500 text-red-600 hover:bg-red-50"
            >
              <Lock className="h-4 w-4 mr-2" />
              Cerrar Sesión Sensible
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <section className="mb-8">
          <h1 className="text-3xl mb-6 flex items-center gap-3">
            <ShieldCheck className="h-10 w-10 text-primary" />
            Panel de Reportes Sensibles
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-2xl">{reports.length}</p>
                    <p className="text-sm text-gray-600">Total Reportes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Eye className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-2xl">{reports.filter(r => !r.isAnonymous).length}</p>
                    <p className="text-sm text-gray-600">Identificados</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <EyeOff className="h-6 w-6 text-yellow-600" />
                  <div>
                    <p className="text-2xl">{reports.filter(r => r.isAnonymous).length}</p>
                    <p className="text-sm text-gray-600">Anónimos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                  <div>
                    <p className="text-2xl">{reports.filter(r => r.priority === 'alta').length}</p>
                    <p className="text-sm text-gray-600">Alta Prioridad</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <UserCheck className="h-6 w-6 text-purple-600" />
                  <div>
                    <p className="text-2xl">{new Set(reports.map(r => r.reportedBy?.userId).filter(Boolean)).size}</p>
                    <p className="text-sm text-gray-600">Usuarios Únicos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium mb-2">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Usuario, email, descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Estado</label>
                <select
                  className="w-full h-10 px-3 border border-gray-300 rounded-md"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Todos</option>
                  <option value="nuevo">Nuevo</option>
                  <option value="investigating">Investigando</option>
                  <option value="assigned_to_security">Asignado</option>
                  <option value="in_progress">En Progreso</option>
                  <option value="resuelto">Resuelto</option>
                  <option value="cerrado">Cerrado</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Prioridad</label>
                <select
                  className="w-full h-10 px-3 border border-gray-300 rounded-md"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="all">Todas</option>
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Tipo</label>
                <select
                  className="w-full h-10 px-3 border border-gray-300 rounded-md"
                  value={anonymousFilter}
                  onChange={(e) => setAnonymousFilter(e.target.value)}
                >
                  <option value="all">Todos</option>
                  <option value="identified">Identificados</option>
                  <option value="anonymous">Anónimos</option>
                </select>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                  setAnonymousFilter('all');
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
              
              <Button 
                onClick={exportSensitiveData}
                className="bg-primary hover:bg-primary/90"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de reportes */}
        <Card>
          <CardHeader>
            <CardTitle>Reportes Sensibles ({filteredReports.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <div key={report.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={getPriorityColor(report.priority)}>
                          {report.priority.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(report.status)} variant="outline">
                          {report.status}
                        </Badge>
                        <Badge variant={report.isAnonymous ? "destructive" : "default"}>
                          {report.isAnonymous ? 'ANÓNIMO' : 'IDENTIFICADO'}
                        </Badge>
                        <span className="text-sm text-gray-500">{report.type}</span>
                      </div>
                      
                      <h3 className="font-medium mb-2">{report.zone}</h3>
                      <p className="text-gray-700 mb-3 line-clamp-2">{report.description}</p>
                      
                      {/* Información sensible del usuario */}
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                        <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Información Confidencial del Reporter
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-red-600" />
                            <span className="text-red-700">
                              {report.reportedBy?.userName || 'Usuario Desconocido'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-red-600" />
                            <span className="text-red-700">
                              {report.reportedBy?.userEmail || 'Email no disponible'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-3 w-3 text-red-600" />
                            <span className="text-red-700">
                              Rol: {report.reportedBy?.userRole || 'No especificado'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {report.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(report.timestamp).toLocaleString('es-PA')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Actualizado: {new Date(report.updatedAt).toLocaleString('es-PA')}
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedReport(report)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalle
                    </Button>
                  </div>
                </div>
              ))}

              {filteredReports.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No se encontraron reportes con los filtros aplicados</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Modal de detalle de reporte */}
        {selectedReport && (
          <Dialog open={!!selectedReport} onOpenChange={(open) => {
            if (!open) {
              setSelectedReport(null);
            }
          }}>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-primary" />
                  Detalle Completo del Reporte #{selectedReport.id}
                </DialogTitle>
                <DialogDescription>
                  Información completa y confidencial del reporte seleccionado, incluyendo datos del usuario que lo reportó.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Badge className={getPriorityColor(selectedReport.priority)}>
                    {selectedReport.priority.toUpperCase()}
                  </Badge>
                  <Badge className={getStatusColor(selectedReport.status)}>
                    {selectedReport.status}
                  </Badge>
                  <Badge variant={selectedReport.isAnonymous ? "destructive" : "default"}>
                    {selectedReport.isAnonymous ? 'ANÓNIMO' : 'IDENTIFICADO'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tipo de Incidente</label>
                    <p>{selectedReport.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Zona</label>
                    <p>{selectedReport.zone}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Descripción</label>
                  <p className="mt-1">{selectedReport.description}</p>
                </div>
                
                {/* Información sensible completa */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-3 flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    Información Confidencial Completa
                  </h4>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-red-700">Usuario</label>
                        <p className="text-red-800">{selectedReport.reportedBy?.userName || 'Desconocido'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-red-700">Email</label>
                        <p className="text-red-800">{selectedReport.reportedBy?.userEmail || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-red-700">Rol en el Sistema</label>
                        <p className="text-red-800">{selectedReport.reportedBy?.userRole || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-red-700">ID de Usuario</label>
                        <p className="text-red-800">{selectedReport.reportedBy?.userId || 'N/A'}</p>
                      </div>
                    </div>
                    {selectedReport.contactInfo && (
                      <div>
                        <label className="text-sm font-medium text-red-700">Información de Contacto Proporcionada</label>
                        <p className="text-red-800">{selectedReport.contactInfo}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium text-gray-600">Fecha de Reporte</label>
                    <p>{new Date(selectedReport.timestamp).toLocaleString('es-PA')}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600">Última Actualización</label>
                    <p>{new Date(selectedReport.updatedAt).toLocaleString('es-PA')}</p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
}