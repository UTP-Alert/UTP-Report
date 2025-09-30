import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { SOSButton } from '../SOSButton';
import { useSystemConfig } from '../services/SystemConfigService';
import { toast } from 'sonner@2.0.3';
import { 
  MapPin, 
  AlertTriangle, 
  Clock, 
  Users, 
  Shield, 
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Navigation,
  Camera,
  ImageIcon,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Building
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface ZonasPageProps {
  onOpenReport: () => void;
  userRole?: 'public' | 'user' | 'admin' | 'security' | 'superuser';
}

export function ZonasPage({ onOpenReport, userRole = 'public' }: ZonasPageProps) {
  const { systemConfig, updateZone, addZone, deleteZone, saveChanges } = useSystemConfig();
  const [selectedZone, setSelectedZone] = React.useState<string | null>(null);
  const [editingZone, setEditingZone] = React.useState<string | null>(null);
  const [isCreatingZone, setIsCreatingZone] = React.useState(false);
  const [selectedSede, setSelectedSede] = React.useState(
    systemConfig?.sedes?.find(s => s.isActive)?.id || ''
  );
  
  const [zoneFormData, setZoneFormData] = React.useState({
    name: '',
    description: '',
    imageUrl: '',
    isActive: true
  });

  // Obtener la sede seleccionada
  const currentSede = systemConfig?.sedes?.find(sede => sede.id === selectedSede);
  const availableSedes = systemConfig?.sedes?.filter(sede => sede.isActive) || [];

  // Control de permisos
  const canEdit = userRole === 'admin' || userRole === 'superuser';
  const canDelete = userRole === 'superuser';

  // URLs de ejemplo para imágenes - NUEVA FUNCIONALIDAD PARA SUPERUSUARIOS
  const exampleImages = [
    {
      url: 'https://images.unsplash.com/photo-1680226425348-cedaf70ec06d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzJTIwYnVpbGRpbmd8ZW58MXx8fHwxNzU4MzMyMzMxfDA&ixlib=rb-4.1.0&q=80&w=1080',
      label: '🏫 Edificio universitario general'
    },
    {
      url: 'https://images.unsplash.com/photo-1562529163-2cded489cc9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwbGlicmFyeSUyMGludGVyaW9yfGVufDF8fHx8MTc1ODI3MjgyNHww&ixlib=rb-4.1.0&q=80&w=1080',
      label: '📚 Biblioteca/Sala de estudio'
    },
    {
      url: 'https://images.unsplash.com/photo-1744168222850-85b5e5e9aa24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FmZXRlcmlhJTIwZGluaW5nJTIwaGFsbHxlbnwxfHx8fDE3NTgzOTY3MzZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      label: '🍽️ Cafetería/Comedor'
    }
  ];

  // Funciones auxiliares
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'subiendo': return TrendingUp;
      case 'bajando': return TrendingDown;
      case 'estable': return Minus;
      default: return Minus;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'subiendo': return 'text-red-500';
      case 'bajando': return 'text-green-500';
      case 'estable': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  // Generar datos dinámicos de zonas basados en el SystemConfig
  const generateZoneData = (zone: any) => ({
    ...zone,
    status: Math.random() > 0.7 ? 'alerta' : Math.random() > 0.4 ? 'seguro' : 'peligro',
    incidents: Math.floor(Math.random() * 6),
    studentsActive: Math.floor(Math.random() * 300) + 50,
    trend: Math.random() > 0.5 ? 'estable' : Math.random() > 0.5 ? 'subiendo' : 'bajando',
    lastUpdate: `Hace ${Math.floor(Math.random() * 20) + 1} min`,
    securityLevel: Math.floor(Math.random() * 40) + 60,
    location: `${currentSede?.name || 'Sede'} - ${zone.name}`
  });

  const universityZones = currentSede?.zones?.filter(zone => zone.isActive).map(generateZoneData) || [];

  // Funciones de manejo de zonas
  const handleEditZone = (zoneId: string) => {
    if (!canEdit) {
      toast.error('No tienes permisos para editar zonas');
      return;
    }
    
    const zone = currentSede?.zones?.find(z => z.id === zoneId);
    if (zone) {
      setEditingZone(zoneId);
      setZoneFormData({
        name: zone.name,
        description: zone.description || '',
        imageUrl: zone.imageUrl || '',
        isActive: zone.isActive
      });
    }
  };

  const handleSaveZone = () => {
    if (!canEdit) {
      toast.error('No tienes permisos para editar zonas');
      return;
    }
    
    if (!editingZone || !selectedSede || !zoneFormData.name.trim()) {
      toast.error('Datos incompletos para guardar la zona');
      return;
    }

    updateZone(selectedSede, editingZone, zoneFormData);
    saveChanges();
    setEditingZone(null);
    setZoneFormData({ name: '', description: '', imageUrl: '', isActive: true });
    toast.success('Zona actualizada exitosamente');
  };

  const handleCreateZone = () => {
    if (!canEdit) {
      toast.error('No tienes permisos para crear zonas');
      return;
    }
    
    if (!selectedSede || !zoneFormData.name.trim()) {
      toast.error('Datos incompletos para crear la zona');
      return;
    }

    addZone(selectedSede, zoneFormData);
    saveChanges();
    setIsCreatingZone(false);
    setZoneFormData({ name: '', description: '', imageUrl: '', isActive: true });
    toast.success('Zona creada exitosamente');
  };

  const handleDeleteZone = (zoneId: string) => {
    if (!canDelete) {
      toast.error('No tienes permisos para eliminar zonas');
      return;
    }
    
    if (!selectedSede) return;
    
    const zone = currentSede?.zones?.find(z => z.id === zoneId);
    if (zone && confirm(`¿Estás seguro de eliminar la zona "${zone.name}"?`)) {
      deleteZone(selectedSede, zoneId);
      saveChanges();
      toast.success('Zona eliminada exitosamente');
    }
  };

  const cancelEdit = () => {
    setEditingZone(null);
    setIsCreatingZone(false);
    setZoneFormData({ name: '', description: '', imageUrl: '', isActive: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <MapPin className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-3xl">GESTIÓN DE ZONAS UNIVERSITARIAS</h1>
              <p className="text-lg text-gray-600">
                Monitoreo y administración de zonas de la sede
              </p>
            </div>
          </div>

          {/* Role-based Info Alert */}
          {canEdit ? (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Sistema de Edición Activo:</strong> Los cambios que realices en las zonas (descripciones, imágenes) se reflejarán automáticamente para todos los usuarios del sistema. Usa el botón "Editar" para modificar cualquier zona existente.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="mb-6 border-blue-200 bg-blue-50">
              <Eye className="h-4 w-4" />
              <AlertDescription>
                <strong>Modo Solo Lectura:</strong> Estás viendo las zonas en modo de consulta. Solo los administradores pueden editar la información de las zonas.
              </AlertDescription>
            </Alert>
          )}

          {/* Sede Selector */}
          <Card className="mb-6 border-primary bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Building className="h-6 w-6 text-primary" />
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Seleccionar Sede:</label>
                  <Select value={selectedSede} onValueChange={setSelectedSede}>
                    <SelectTrigger className="w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSedes.map((sede) => (
                        <SelectItem key={sede.id} value={sede.id}>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            {sede.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {canEdit && (
                  <Button 
                    onClick={() => setIsCreatingZone(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Zona
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl">{universityZones.filter(z => z.status === 'seguro').length}</p>
                    <p className="text-sm text-gray-600">Zonas Seguras</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="text-2xl">{universityZones.filter(z => z.status === 'alerta').length}</p>
                    <p className="text-sm text-gray-600">En Precaución</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                  <div>
                    <p className="text-2xl">{universityZones.filter(z => z.status === 'peligro').length}</p>
                    <p className="text-sm text-gray-600">Zonas Peligrosas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl">{universityZones.reduce((sum, z) => sum + z.studentsActive, 0)}</p>
                    <p className="text-sm text-gray-600">Estudiantes Activos</p>
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
              aria-label="Ver mapa interactivo de las zonas"
            >
              <Navigation className="h-4 w-4" />
              Ver Mapa Interactivo
            </Button>
            <Button 
              variant="outline"
              aria-label="Exportar reporte de seguridad"
            >
              Exportar Reporte
            </Button>
            <Badge variant="outline" className="text-base px-3 py-1">
              🔄 Actualizado cada 2 minutos
            </Badge>
          </div>
        </div>

        {/* Create Zone Form */}
        {isCreatingZone && canEdit && (
          <Card className="border-primary bg-green-50 mb-6 shadow-lg">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Crear Nueva Zona Completa
                {userRole === 'superuser' && <Badge variant="outline" className="ml-2">SUPERUSUARIO</Badge>}
              </CardTitle>
              <CardDescription>
                Complete TODOS los campos para crear una zona completa con imagen y descripción detallada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              
              {/* Vista previa en tiempo real */}
              {(zoneFormData.name || zoneFormData.description || zoneFormData.imageUrl) && (
                <div className="bg-white p-4 rounded-lg border-2 border-dashed border-primary/30">
                  <h4 className="text-sm font-medium text-primary mb-3 flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Vista Previa de la Zona
                  </h4>
                  <div className="space-y-3">
                    {zoneFormData.name && (
                      <p><strong>Nombre:</strong> {zoneFormData.name}</p>
                    )}
                    {zoneFormData.description && (
                      <p><strong>Descripción:</strong> {zoneFormData.description}</p>
                    )}
                    {zoneFormData.imageUrl && (
                      <div>
                        <p><strong>Imagen:</strong></p>
                        <div className="w-32 h-20 rounded border overflow-hidden bg-gray-100 mt-1">
                          <ImageWithFallback
                            src={zoneFormData.imageUrl}
                            alt="Vista previa"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Nombre de la Zona *
                  </label>
                  <Input
                    placeholder="Ej: Biblioteca Principal, Cafetería Norte..."
                    value={zoneFormData.name}
                    onChange={(e) => setZoneFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={zoneFormData.name ? "border-green-300 bg-green-50" : ""}
                  />
                  <p className="text-xs text-gray-600">Nombre identificativo de la zona</p>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    URL de Imagen
                  </label>
                  <Input
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={zoneFormData.imageUrl}
                    onChange={(e) => setZoneFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    className={zoneFormData.imageUrl ? "border-green-300 bg-green-50" : ""}
                  />
                  
                  {/* Ejemplos de imágenes rápidas */}
                  <div className="bg-blue-50 p-3 rounded border">
                    <p className="text-xs font-medium text-blue-800 mb-2">🖼️ Ejemplos de imágenes (haga clic para usar):</p>
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      {exampleImages.map((img, index) => (
                        <button 
                          key={index}
                          type="button"
                          onClick={() => setZoneFormData(prev => ({ ...prev, imageUrl: img.url }))}
                          className="text-left text-blue-700 hover:text-blue-900 hover:underline p-1 rounded hover:bg-blue-100"
                        >
                          {img.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">Imagen representativa de la zona</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Descripción de Seguridad
                </label>
                <Textarea
                  placeholder="Describe las características de seguridad de esta zona: iluminación, vigilancia, cámaras, accesos, horarios, etc."
                  value={zoneFormData.description}
                  onChange={(e) => setZoneFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className={zoneFormData.description ? "border-green-300 bg-green-50" : ""}
                />
                <p className="text-xs text-gray-600">Información de seguridad que verán los usuarios</p>
              </div>
              
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  onClick={handleCreateZone} 
                  className="bg-primary hover:bg-primary/90 flex-1"
                  disabled={!zoneFormData.name.trim()}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Crear Zona Completa
                </Button>
                <Button onClick={cancelEdit} variant="outline" className="px-6">
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Zones Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {universityZones.map((zone) => {
            const TrendIcon = getTrendIcon(zone.trend);
            const isSelected = selectedZone === zone.id;
            const isEditing = editingZone === zone.id;
            
            return (
              <Card 
                key={zone.id} 
                className={`border-2 hover:shadow-lg transition-all cursor-pointer focus:ring-4 focus:ring-primary/50 ${
                  isSelected ? 'ring-4 ring-primary/50 border-primary' : ''
                }`}
                tabIndex={0}
                role="button"
                onClick={() => setSelectedZone(isSelected ? null : zone.id)}
                aria-label={`Zona ${zone.name} - ${getStatusText(zone.status)} - ${zone.incidents} incidentes - ${zone.studentsActive} estudiantes activos`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-3 mb-2">
                        {isEditing ? (
                          <Input
                            value={zoneFormData.name}
                            onChange={(e) => setZoneFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="text-xl font-semibold"
                          />
                        ) : (
                          zone.name
                        )}
                        <Badge 
                          className={`${getStatusColor(zone.status)} text-white px-3 py-1`}
                        >
                          {getStatusText(zone.status)}
                        </Badge>
                      </CardTitle>
                      <div className="flex items-center gap-4 text-gray-600">
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          <span>{zone.incidents} incidentes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{zone.studentsActive} estudiantes</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center gap-1 ${getTrendColor(zone.trend)}`}>
                        <TrendIcon className="h-4 w-4" />
                        <span className="text-sm capitalize">{zone.trend}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{zone.lastUpdate}</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Security Level */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Nivel de Seguridad</span>
                      <span className="text-sm">{zone.securityLevel}%</span>
                    </div>
                    <Progress 
                      value={zone.securityLevel} 
                      className="h-2"
                      aria-label={`Nivel de seguridad ${zone.securityLevel}%`}
                    />
                  </div>

                  {/* Zone Image */}
                  <div className="mb-4">
                    {isEditing ? (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium flex items-center gap-2">
                          <ImageIcon className="h-4 w-4" />
                          URL de Imagen
                        </label>
                        <Input
                          placeholder="https://ejemplo.com/imagen.jpg"
                          value={zoneFormData.imageUrl}
                          onChange={(e) => setZoneFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                          className={zoneFormData.imageUrl ? "border-green-300" : ""}
                        />
                        
                        {/* Ejemplos de imágenes para edición también */}
                        <div className="bg-blue-50 p-2 rounded text-xs">
                          <p className="font-medium text-blue-800 mb-1">Ejemplos:</p>
                          {exampleImages.map((img, index) => (
                            <button 
                              key={index}
                              type="button"
                              onClick={() => setZoneFormData(prev => ({ ...prev, imageUrl: img.url }))}
                              className="block text-blue-700 hover:underline mb-1"
                            >
                              {img.label}
                            </button>
                          ))}
                        </div>

                        {zoneFormData.imageUrl && (
                          <div className="w-32 h-20 rounded border overflow-hidden bg-gray-100 mt-2">
                            <ImageWithFallback
                              src={zoneFormData.imageUrl}
                              alt="Vista previa"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative h-32 w-full rounded-lg overflow-hidden bg-gray-100">
                        <ImageWithFallback
                          src={zone.imageUrl || ''}
                          alt={`Vista de ${zone.name}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-2 left-3 text-white text-sm">
                          <p className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {zone.location}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Zone Description */}
                  <div className="mb-4">
                    {isEditing ? (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Descripción de Seguridad
                        </label>
                        <Textarea
                          placeholder="Describe las características de seguridad..."
                          value={zoneFormData.description}
                          onChange={(e) => setZoneFormData(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                          className={zoneFormData.description ? "border-green-300" : ""}
                        />
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Información de Seguridad:
                        </p>
                        <p className="text-sm bg-gray-50 p-3 rounded border">
                          {zone.description || 'Sin información de seguridad disponible.'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Zone Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenReport();
                      }}
                      className="bg-primary hover:bg-primary/90 flex-1"
                    >
                      📢 Reportar Incidente
                    </Button>

                    {/* Edit/Save/Cancel buttons for admins */}
                    {canEdit && !isEditing && (
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditZone(zone.id);
                        }}
                        className="text-blue-600"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}

                    {isEditing && (
                      <>
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveZone();
                          }}
                          className="text-green-600"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelEdit();
                          }}
                          className="text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}

                    {canDelete && !isEditing && (
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteZone(zone.id);
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty state */}
        {universityZones.length === 0 && (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="p-12 text-center">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">
                No hay zonas disponibles
              </h3>
              <p className="text-gray-500 mb-6">
                No se encontraron zonas para la sede seleccionada.
              </p>
              {canEdit && (
                <Button
                  onClick={() => setIsCreatingZone(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Zona
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* SOS Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <SOSButton />
        </div>
      </div>
    </div>
  );
}