import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  FileDown,
  Download,
  Filter,
  Calendar,
  MapPin,
  Clock,
  User,
  AlertTriangle,
  Eye,
  Search,
  FileText,
  FileSpreadsheet,
  File
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Report {
  id: string;
  type: 'robo' | 'acoso' | 'vandalismo' | 'emergencia';
  location: string;
  description: string;
  reporter: string;
  status: 'pendiente' | 'en_proceso' | 'resuelto';
  priority: 'baja' | 'media' | 'alta' | 'critica';
  date: string;
  time: string;
  assignedTo?: string;
}

interface ReportsViewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReportsViewModal({ isOpen, onClose }: ReportsViewModalProps) {
  const [reports] = React.useState<Report[]>([
    {
      id: '1',
      type: 'robo',
      location: 'Biblioteca Central',
      description: 'Robo de laptop en la mesa de estudios del segundo piso',
      reporter: 'Juan Pérez',
      status: 'en_proceso',
      priority: 'alta',
      date: '2024-12-17',
      time: '14:30',
      assignedTo: 'Carlos Mendoza'
    },
    {
      id: '2',
      type: 'acoso',
      location: 'Cafetería Norte',
      description: 'Acoso verbal por parte de un estudiante desconocido',
      reporter: 'Ana García',
      status: 'pendiente',
      priority: 'media',
      date: '2024-12-17',
      time: '12:15'
    },
    {
      id: '3',
      type: 'vandalismo',
      location: 'Estacionamiento Este',
      description: 'Rayones en vehículo, posible vandalismo intencional',
      reporter: 'Miguel Torres',
      status: 'resuelto',
      priority: 'baja',
      date: '2024-12-16',
      time: '18:45',
      assignedTo: 'Ana Rodríguez'
    },
    {
      id: '4',
      type: 'emergencia',
      location: 'Laboratorios',
      description: 'Emergencia médica en el laboratorio de química',
      reporter: 'Prof. Sandra López',
      status: 'resuelto',
      priority: 'critica',
      date: '2024-12-16',
      time: '09:20',
      assignedTo: 'Carlos Mendoza'
    },
    {
      id: '5',
      type: 'robo',
      location: 'Campus Principal',
      description: 'Sustracción de celular en las afueras del campus',
      reporter: 'Luis Herrera',
      status: 'pendiente',
      priority: 'alta',
      date: '2024-12-15',
      time: '16:30'
    }
  ]);

  const [filteredReports, setFilteredReports] = React.useState(reports);
  const [filters, setFilters] = React.useState({
    type: '',
    status: '',
    priority: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  const typeConfig = {
    robo: { label: 'Robo', color: 'bg-red-500', icon: '🚨' },
    acoso: { label: 'Acoso', color: 'bg-orange-500', icon: '⚠️' },
    vandalismo: { label: 'Vandalismo', color: 'bg-yellow-500', icon: '🔨' },
    emergencia: { label: 'Emergencia', color: 'bg-purple-500', icon: '🚑' }
  };

  const statusConfig = {
    pendiente: { label: 'Pendiente', color: 'bg-gray-500' },
    en_proceso: { label: 'En Proceso', color: 'bg-blue-500' },
    resuelto: { label: 'Resuelto', color: 'bg-green-500' }
  };

  const priorityConfig = {
    baja: { label: 'Baja', color: 'bg-gray-400' },
    media: { label: 'Media', color: 'bg-yellow-500' },
    alta: { label: 'Alta', color: 'bg-orange-500' },
    critica: { label: 'Crítica', color: 'bg-red-600' }
  };

  React.useEffect(() => {
    let filtered = reports;

    if (filters.type) {
      filtered = filtered.filter(r => r.type === filters.type);
    }
    if (filters.status) {
      filtered = filtered.filter(r => r.status === filters.status);
    }
    if (filters.priority) {
      filtered = filtered.filter(r => r.priority === filters.priority);
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(r => r.date >= filters.dateFrom);
    }
    if (filters.dateTo) {
      filtered = filtered.filter(r => r.date <= filters.dateTo);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(r => 
        r.description.toLowerCase().includes(searchLower) ||
        r.location.toLowerCase().includes(searchLower) ||
        r.reporter.toLowerCase().includes(searchLower)
      );
    }

    setFilteredReports(filtered);
  }, [filters, reports]);

  const clearFilters = () => {
    setFilters({
      type: '',
      status: '',
      priority: '',
      dateFrom: '',
      dateTo: '',
      search: ''
    });
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Tipo', 'Ubicación', 'Descripción', 'Reportado por', 'Estado', 'Prioridad', 'Fecha', 'Hora', 'Asignado a'];
    const csvData = [
      headers.join(','),
      ...filteredReports.map(report => [
        report.id,
        typeConfig[report.type].label,
        `"${report.location}"`,
        `"${report.description}"`,
        `"${report.reporter}"`,
        statusConfig[report.status].label,
        priorityConfig[report.priority].label,
        report.date,
        report.time,
        report.assignedTo || 'Sin asignar'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reportes_utp_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Archivo CSV exportado exitosamente');
  };

  const exportToExcel = () => {
    // Simulación de exportación a Excel
    const data = filteredReports.map(report => ({
      ID: report.id,
      Tipo: typeConfig[report.type].label,
      Ubicación: report.location,
      Descripción: report.description,
      'Reportado por': report.reporter,
      Estado: statusConfig[report.status].label,
      Prioridad: priorityConfig[report.priority].label,
      Fecha: report.date,
      Hora: report.time,
      'Asignado a': report.assignedTo || 'Sin asignar'
    }));

    // En un entorno real, usarías una librería como xlsx
    console.log('Exportando a Excel:', data);
    toast.success('Archivo Excel exportado exitosamente');
  };

  const exportToPDF = () => {
    // Simulación de exportación a PDF
    const reportData = {
      title: 'Reporte de Incidentes UTP+Report',
      date: new Date().toLocaleDateString(),
      reports: filteredReports,
      summary: {
        total: filteredReports.length,
        pendientes: filteredReports.filter(r => r.status === 'pendiente').length,
        enProceso: filteredReports.filter(r => r.status === 'en_proceso').length,
        resueltos: filteredReports.filter(r => r.status === 'resuelto').length
      }
    };

    console.log('Exportando a PDF:', reportData);
    toast.success('Archivo PDF exportado exitosamente');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            Visualización y Exportación de Reportes
          </DialogTitle>
          <DialogDescription>
            Visualiza todos los reportes del sistema y exporta la información en diferentes formatos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-xl">{filteredReports.length}</p>
                    <p className="text-xs text-gray-600">Total Reportes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                  <div>
                    <p className="text-xl">{filteredReports.filter(r => r.status === 'pendiente').length}</p>
                    <p className="text-xs text-gray-600">Pendientes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-6 w-6 text-yellow-600" />
                  <div>
                    <p className="text-xl">{filteredReports.filter(r => r.status === 'en_proceso').length}</p>
                    <p className="text-xs text-gray-600">En Proceso</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Eye className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-xl">{filteredReports.filter(r => r.status === 'resuelto').length}</p>
                    <p className="text-xs text-gray-600">Resueltos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Export */}
          <Card className="border-primary bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-primary" />
                Filtros y Exportación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar reportes..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tipo</label>
                  <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      {Object.entries(typeConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.icon} {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Estado</label>
                  <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Prioridad</label>
                  <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas</SelectItem>
                      {Object.entries(priorityConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Desde</label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Hasta</label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <Button variant="outline" onClick={clearFilters}>
                  Limpiar Filtros
                </Button>

                <div className="flex items-center gap-2">
                  <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Exportar CSV
                  </Button>
                  <Button onClick={exportToExcel} variant="outline" className="flex items-center gap-2">
                    <File className="h-4 w-4" />
                    Exportar Excel
                  </Button>
                  <Button onClick={exportToPDF} className="bg-primary hover:bg-primary/90 flex items-center gap-2">
                    <FileDown className="h-4 w-4" />
                    Exportar PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Reportes ({filteredReports.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredReports.map((report) => {
                  const typeInfo = typeConfig[report.type];
                  const statusInfo = statusConfig[report.status];
                  const priorityInfo = priorityConfig[report.priority];

                  return (
                    <div key={report.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className={`${typeInfo.color} text-white`}>
                              {typeInfo.icon} {typeInfo.label}
                            </Badge>
                            <Badge className={statusInfo.color}>
                              {statusInfo.label}
                            </Badge>
                            <Badge className={priorityInfo.color}>
                              {priorityInfo.label}
                            </Badge>
                          </div>

                          <h4 className="font-medium mb-1">{report.description}</h4>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {report.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {report.reporter}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {report.date}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {report.time}
                            </div>
                            {report.assignedTo && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                Asignado: {report.assignedTo}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-sm text-gray-500">
                          ID: {report.id}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredReports.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No se encontraron reportes con los filtros aplicados</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}