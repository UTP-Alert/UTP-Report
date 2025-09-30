import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { SOSButton } from '../SOSButton';
import { 
  Clock, 
  AlertTriangle, 
  MapPin, 
  Eye, 
  Filter,
  Search,
  Calendar,
  Users,
  TrendingUp,
  BarChart3
} from 'lucide-react';

interface ReportesPageProps {
  onOpenReport: () => void;
}

export function ReportesPage({ onOpenReport }: ReportesPageProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedFilter, setSelectedFilter] = React.useState('todos');

  const recentReports = [
    {
      id: 1,
      tipo: 'ROBO',
      titulo: 'Robo de bicicleta en estacionamiento',
      zona: 'Estacionamiento Este',
      fecha: '2024-03-15',
      hora: '14:30',
      descripcion: 'Bicicleta marca Trek color azul fue sustraída del estacionamiento este durante clases.',
      status: 'activo',
      confirmaciones: 8,
      categoria: 'robo'
    },
    {
      id: 2,
      tipo: 'SOSPECHOSO',
      titulo: 'Persona merodeando biblioteca',
      zona: 'Biblioteca Central',
      fecha: '2024-03-15',
      hora: '13:45',
      descripcion: 'Individuo sin identificación estudiantil observando estudiantes en área de estudio.',
      status: 'investigando',
      confirmaciones: 3,
      categoria: 'sospechoso'
    },
    {
      id: 3,
      tipo: 'ROBO',
      titulo: 'Intento de robo de celular',
      zona: 'Zona Deportiva',
      fecha: '2024-03-15',
      hora: '12:15',
      descripcion: 'Estudiante reporta intento de robo de dispositivo móvil en vestidores.',
      status: 'resuelto',
      confirmaciones: 12,
      categoria: 'robo'
    },
    {
      id: 4,
      tipo: 'VANDALISMO',
      titulo: 'Grafiti en paredes del campus',
      zona: 'Campus Principal',
      fecha: '2024-03-15',
      hora: '08:20',
      descripcion: 'Daños a la propiedad universitaria con pintura en aerosol.',
      status: 'activo',
      confirmaciones: 5,
      categoria: 'vandalismo'
    },
    {
      id: 5,
      tipo: 'ACOSO',
      titulo: 'Comportamiento inapropiado',
      zona: 'Cafetería Norte',
      fecha: '2024-03-14',
      hora: '19:30',
      descripcion: 'Reporte de conducta inapropiada hacia estudiantes en área de cafetería.',
      status: 'investigando',
      confirmaciones: 7,
      categoria: 'acoso'
    },
    {
      id: 6,
      tipo: 'ROBO',
      titulo: 'Sustracción de laptop',
      zona: 'Biblioteca Central',
      fecha: '2024-03-14',
      hora: '16:45',
      descripcion: 'Laptop dejada sin supervisión fue sustraída de mesa de estudio.',
      status: 'resuelto',
      confirmaciones: 15,
      categoria: 'robo'
    },
    {
      id: 7,
      tipo: 'SOSPECHOSO',
      titulo: 'Vehículo sospechoso',
      zona: 'Estacionamiento Oeste',
      fecha: '2024-03-14',
      hora: '21:00',
      descripcion: 'Vehículo sin placas universitarias permanece en estacionamiento fuera de horario.',
      status: 'activo',
      confirmaciones: 4,
      categoria: 'sospechoso'
    },
    {
      id: 8,
      tipo: 'EMERGENCIA',
      titulo: 'Estudiante requiere asistencia médica',
      zona: 'Zona Deportiva',
      fecha: '2024-03-14',
      hora: '15:20',
      descripcion: 'Estudiante se desmayó durante actividad deportiva, requiere atención.',
      status: 'resuelto',
      confirmaciones: 20,
      categoria: 'emergencia'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activo': return 'bg-red-500 hover:bg-red-600';
      case 'investigando': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'resuelto': return 'bg-green-500 hover:bg-green-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'activo': return 'ACTIVO';
      case 'investigando': return 'INVESTIGANDO';
      case 'resuelto': return 'RESUELTO';
      default: return 'DESCONOCIDO';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'ROBO': return AlertTriangle;
      case 'SOSPECHOSO': return Eye;
      case 'VANDALISMO': return AlertTriangle;
      case 'ACOSO': return Users;
      case 'EMERGENCIA': return AlertTriangle;
      default: return AlertTriangle;
    }
  };

  const filteredReports = recentReports.filter(report => {
    const matchesSearch = report.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.zona.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'todos' || report.categoria === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Clock className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-3xl">REPORTES RECIENTES</h1>
              <p className="text-lg text-gray-600">
                Historial completo de incidentes reportados por la comunidad
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl">{recentReports.length}</p>
                    <p className="text-sm text-gray-600">Total Reportes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                  <div>
                    <p className="text-2xl">{recentReports.filter(r => r.status === 'activo').length}</p>
                    <p className="text-sm text-gray-600">Casos Activos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Eye className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="text-2xl">{recentReports.filter(r => r.status === 'investigando').length}</p>
                    <p className="text-sm text-gray-600">En Investigación</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl">{recentReports.filter(r => r.status === 'resuelto').length}</p>
                    <p className="text-sm text-gray-600">Resueltos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar reportes por título, descripción o zona..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-lg"
                aria-label="Buscar reportes"
              />
            </div>
            
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-full md:w-48 h-12" aria-label="Filtrar por categoría">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los reportes</SelectItem>
                <SelectItem value="robo">Robos</SelectItem>
                <SelectItem value="sospechoso">Actividad Sospechosa</SelectItem>
                <SelectItem value="vandalismo">Vandalismo</SelectItem>
                <SelectItem value="acoso">Acoso</SelectItem>
                <SelectItem value="emergencia">Emergencias</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              className="flex items-center gap-2 h-12"
              aria-label="Exportar reportes filtrados"
            >
              <Calendar className="h-4 w-4" />
              Exportar
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Mostrando {filteredReports.length} de {recentReports.length} reportes
            </p>
            <Badge variant="outline" className="text-base px-3 py-1">
              📊 Datos actualizados en tiempo real
            </Badge>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.map((report) => {
            const TipoIcon = getTipoIcon(report.tipo);
            return (
              <Card 
                key={report.id} 
                className="border-l-4 border-l-primary hover:shadow-lg transition-all cursor-pointer focus:ring-4 focus:ring-primary/50"
                tabIndex={0}
                role="button"
                aria-label={`Reporte de ${report.tipo} - ${report.titulo} - Estado: ${report.status} - ${report.confirmaciones} confirmaciones`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <TipoIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl flex items-center gap-3 mb-2">
                          {report.titulo}
                          <Badge 
                            className={`${getStatusColor(report.status)} text-white px-3 py-1 text-sm`}
                          >
                            {getStatusText(report.status)}
                          </Badge>
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-4 text-gray-600">
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-sm">{report.tipo}</Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{report.zona}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{report.fecha} - {report.hora}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{report.confirmaciones} confirmaciones</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <CardDescription className="text-base mb-4">
                    {report.descripcion}
                  </CardDescription>
                  
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      size="sm" 
                      variant="outline"
                      aria-label="Ver detalles completos del reporte"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Detalles
                    </Button>
                    
                    {report.status === 'activo' && (
                      <Button 
                        size="sm" 
                        className="bg-primary hover:bg-primary/90"
                        aria-label="Confirmar información de este reporte"
                      >
                        Confirmar Info
                      </Button>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      aria-label="Agregar información adicional"
                    >
                      Agregar Info
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      aria-label="Compartir este reporte"
                    >
                      Compartir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* No Results */}
        {filteredReports.length === 0 && (
          <Card className="mt-8">
            <CardContent className="p-12 text-center">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl mb-2">No se encontraron reportes</h3>
              <p className="text-gray-600 mb-6">
                Intenta ajustar los filtros de búsqueda o explora todas las categorías.
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedFilter('todos');
                }}
                aria-label="Limpiar filtros de búsqueda"
              >
                Limpiar Filtros
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="mt-8 bg-gray-100">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl mb-4">¿Tienes información sobre algún reporte?</h3>
            <p className="text-lg text-gray-600 mb-6">
              Tu colaboración es fundamental para mantener segura nuestra comunidad universitaria.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                onClick={onOpenReport}
                size="lg" 
                className="bg-primary hover:bg-primary/90"
                aria-label="Crear nuevo reporte de incidente"
              >
                <AlertTriangle className="h-5 w-5 mr-2" />
                Crear Nuevo Reporte
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                aria-label="Contactar con seguridad universitaria"
              >
                <Users className="h-5 w-5 mr-2" />
                Contactar Seguridad
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Botón SOS */}
      <SOSButton />
    </div>
  );
}