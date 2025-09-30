import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { UserManagementPage } from './pages/UserManagementPage';
import { SensitiveReportsPage } from './pages/SensitiveReportsPage';
import { useSystemConfig } from './services/SystemConfigService';
import { useFeedbackService } from './services/FeedbackService';
import { toast } from 'sonner@2.0.3';
import { 
  Crown,
  Settings,
  Users,
  Shield,
  Plus,
  Edit,
  Save,
  Building,
  MapPin,
  Monitor,
  Eye,
  EyeOff,
  Server,
  BarChart3,
  UserCog,
  Layout,
  FileText,
  MessageCircle,
  Star,
  ThumbsUp,
  Calendar,
  User,
  Trash2,
  UserPlus,
  X
} from 'lucide-react';

interface SuperuserDashboardProps {
  onOpenReport: () => void;
}

interface SystemConfig {
  siteName: string;
  primaryColor: string;
  secondaryColor: string;
  enabledPages: string[];
  sedes: Sede[];
  userRoles: UserRole[];
  incidentTypes: IncidentType[];
}

interface Sede {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
  zones: Zone[];
}

interface Zone {
  id: string;
  name: string;
  isActive: boolean;
}

interface UserRole {
  id: string;
  name: string;
  permissions: string[];
  isActive: boolean;
}

interface IncidentType {
  id: string;
  name: string;
  description: string;
  icon: string;
  isEnabled: boolean;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// Feedback Management Component
function FeedbackManagementTab() {
  const { getAllFeedbacks } = useFeedbackService();
  const feedbacks = getAllFeedbacks();
  
  const averageRating = feedbacks.length > 0 
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : '0.0';

  const ratingDistribution = feedbacks.reduce((acc, feedback) => {
    acc[feedback.rating] = (acc[feedback.rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header y estadísticas */}
      <div>
        <h2 className="text-2xl mb-4 flex items-center gap-3">
          <MessageCircle className="h-8 w-8 text-primary" />
          Feedback del Sistema
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl">{feedbacks.length}</p>
                  <p className="text-sm text-gray-600">Total Comentarios</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Star className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-2xl">{averageRating}</p>
                  <p className="text-sm text-gray-600">Promedio</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <ThumbsUp className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl">{ratingDistribution[5] || 0}</p>
                  <p className="text-sm text-gray-600">5 Estrellas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <User className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl">{new Set(feedbacks.map(f => f.userId)).size}</p>
                  <p className="text-sm text-gray-600">Usuarios Únicos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lista de feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Comentarios de Usuarios
          </CardTitle>
          <CardDescription>
            Feedback recibido de usuarios después de su primer reporte
          </CardDescription>
        </CardHeader>
        <CardContent>
          {feedbacks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay comentarios de feedback aún</p>
              <p className="text-sm">Los comentarios aparecerán aquí cuando los usuarios completen su primer reporte</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((feedback) => (
                <div key={feedback.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{feedback.username}</p>
                        <p className="text-sm text-gray-500">{feedback.userEmail}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        {renderStars(feedback.rating)}
                        <span className={`ml-2 font-medium ${getRatingColor(feedback.rating)}`}>
                          {feedback.rating}/5
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {formatDate(feedback.timestamp)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-700">{feedback.comment}</p>
                  </div>
                  
                  {feedback.isFirstReport && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        Primer Reporte
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function SuperuserDashboard({ onOpenReport }: SuperuserDashboardProps) {
  const { systemConfig, updateSystemConfig, saveChanges, hasUnsavedChanges, addIncidentType, updateIncidentType, deleteIncidentType } = useSystemConfig();
  
  const [newSede, setNewSede] = React.useState({ name: '', address: '' });
  const [newZone, setNewZone] = React.useState('');
  const [selectedSede, setSelectedSede] = React.useState<string>('');
  const [newIncidentType, setNewIncidentType] = React.useState({ 
    name: '', 
    description: '', 
    icon: '🔵', 
    category: 'general',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical'
  });
  const [editingSede, setEditingSede] = React.useState<string | null>(null);
  const [editSedeData, setEditSedeData] = React.useState({ name: '', address: '' });
  const [editingIncidentType, setEditingIncidentType] = React.useState<string | null>(null);
  const [editIncidentTypeData, setEditIncidentTypeData] = React.useState({
    name: '',
    description: '',
    icon: '🔵',
    category: 'general',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical'
  });
  
  const availablePages = [
    { id: 'inicio', name: 'Inicio', icon: Monitor },
    { id: 'zonas', name: 'Zonas', icon: MapPin },
    { id: 'reportes', name: 'Reportes', icon: FileText },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'usuarios', name: 'Usuarios', icon: UserCog }
  ];

  const togglePage = (pageId: string) => {
    const enabledPages = systemConfig.enabledPages.includes(pageId)
      ? systemConfig.enabledPages.filter(p => p !== pageId)
      : [...systemConfig.enabledPages, pageId];
    updateSystemConfig({ enabledPages });
    
    const isNowEnabled = !systemConfig.enabledPages.includes(pageId);
    toast.success(
      `Página "${pageId}" ${isNowEnabled ? 'activada' : 'desactivada'}`,
      {
        description: `La página ${isNowEnabled ? 'ahora está disponible' : 'se ha ocultado'} para todos los usuarios del sistema.`
      }
    );
  };

  const addSede = () => {
    if (newSede.name && newSede.address) {
      const sede = {
        id: Date.now().toString(),
        name: newSede.name,
        address: newSede.address,
        isActive: true,
        zones: []
      };
      updateSystemConfig({ 
        sedes: [...systemConfig.sedes, sede] 
      });
      setNewSede({ name: '', address: '' });
      toast.success('Sede agregada exitosamente');
    }
  };

  const deleteSede = (sedeId: string) => {
    updateSystemConfig({
      sedes: systemConfig.sedes.filter(sede => sede.id !== sedeId)
    });
    toast.success('Sede eliminada exitosamente');
  };

  const startEditingSede = (sede: Sede) => {
    setEditingSede(sede.id);
    setEditSedeData({ name: sede.name, address: sede.address });
  };

  const saveSedeChanges = () => {
    if (editingIncidentType && editSedeData.name.trim() && editSedeData.address.trim()) {
      const updatedSedes = systemConfig.sedes.map(sede =>
        sede.id === editingSede ? { ...sede, name: editSedeData.name, address: editSedeData.address } : sede
      );
      updateSystemConfig({ sedes: updatedSedes });
      setEditingSede(null);
      setEditSedeData({ name: '', address: '' });
      toast.success('Sede actualizada exitosamente');
    }
  };

  const cancelEditingSede = () => {
    setEditingSede(null);
    setEditSedeData({ name: '', address: '' });
  };

  const addZone = () => {
    if (newZone && selectedSede) {
      const updatedSedes = systemConfig.sedes.map(sede => {
        if (sede.id === selectedSede) {
          return {
            ...sede,
            zones: [...sede.zones, {
              id: Date.now().toString(),
              name: newZone,
              isActive: true
            }]
          };
        }
        return sede;
      });
      updateSystemConfig({ sedes: updatedSedes });
      setNewZone('');
      toast.success('Zona agregada exitosamente');
    }
  };

  const deleteZone = (sedeId: string, zoneId: string) => {
    const updatedSedes = systemConfig.sedes.map(sede => {
      if (sede.id === sedeId) {
        return {
          ...sede,
          zones: sede.zones.filter(zone => zone.id !== zoneId)
        };
      }
      return sede;
    });
    updateSystemConfig({ sedes: updatedSedes });
    toast.success('Zona eliminada exitosamente');
  };

  const toggleIncidentType = (incidentTypeId: string) => {
    const incidentType = systemConfig.incidentTypes.find(type => type.id === incidentTypeId);
    if (incidentType) {
      updateIncidentType(incidentTypeId, { isEnabled: !incidentType.isEnabled });
      toast.success(
        `Tipo de incidente "${incidentType.name}" ${!incidentType.isEnabled ? 'activado' : 'desactivado'}`
      );
    }
  };

  const removeIncidentType = (incidentTypeId: string) => {
    const incidentType = systemConfig.incidentTypes.find(type => type.id === incidentTypeId);
    if (incidentType) {
      deleteIncidentType(incidentTypeId);
      toast.success(`Tipo de incidente "${incidentType.name}" eliminado`);
    }
  };

  const startEditingIncidentType = (incidentType: IncidentType) => {
    setEditingIncidentType(incidentType.id);
    setEditIncidentTypeData({
      name: incidentType.name,
      description: incidentType.description,
      icon: incidentType.icon,
      category: incidentType.category,
      priority: incidentType.priority
    });
  };

  const cancelEditingIncidentType = () => {
    setEditingIncidentType(null);
    setEditIncidentTypeData({
      name: '',
      description: '',
      icon: '🔵',
      category: 'general',
      priority: 'medium' as 'low' | 'medium' | 'high' | 'critical'
    });
  };

  const addNewIncidentType = () => {
    if (newIncidentType.name && newIncidentType.description) {
      addIncidentType({
        name: newIncidentType.name,
        description: newIncidentType.description,
        icon: newIncidentType.icon,
        category: newIncidentType.category,
        priority: newIncidentType.priority,
        isEnabled: true
      });
      setNewIncidentType({ 
        name: '', 
        description: '', 
        icon: '🔵', 
        category: 'general',
        priority: 'medium' as 'low' | 'medium' | 'high' | 'critical'
      });
      toast.success('Tipo de Incidente agregado exitosamente');
    }
  };

  const updateIncidentTypeData = () => {
    if (editIncidentTypeData.name.trim() && editIncidentTypeData.description.trim() && editingIncidentType) {
      updateIncidentType(editingIncidentType, {
        name: editIncidentTypeData.name,
        description: editIncidentTypeData.description,
        icon: editIncidentTypeData.icon,
        category: editIncidentTypeData.category,
        priority: editIncidentTypeData.priority
      });
      setEditingIncidentType(null);
      setEditIncidentTypeData({
        name: '',
        description: '',
        icon: '🔵',
        category: 'general',
        priority: 'medium' as 'low' | 'medium' | 'high' | 'critical'
      });
      toast.success('Tipo de Incidente actualizado exitosamente');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl mb-2 flex items-center gap-4">
                <Crown className="h-10 w-10 text-yellow-500" />
                Panel de Superusuario
              </h1>
              <p className="text-gray-600">Control total del sistema de seguridad universitaria</p>
            </div>
            
            {/* Save Button */}
            {hasUnsavedChanges && (
              <Button 
                onClick={saveChanges}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </Button>
            )}
          </div>
        </div>

        {/* System Overview */}
        <section className="mb-8">
          <h2 className="text-2xl mb-4 flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            Resumen del Sistema
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Building className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl">{systemConfig.sedes.length}</p>
                    <p className="text-sm text-gray-600">Sedes Activas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Monitor className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl">{systemConfig.enabledPages.length}</p>
                    <p className="text-sm text-gray-600">Páginas Activas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl">{systemConfig.incidentTypes.filter(type => type.isEnabled).length}</p>
                    <p className="text-sm text-gray-600">Tipos de Incidentes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Server className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-2xl">Activo</p>
                    <p className="text-sm text-gray-600">Estado del Sistema</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Configuration Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Gestión de Usuarios
            </TabsTrigger>
            <TabsTrigger value="sensitive" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Reportes Sensibles
            </TabsTrigger>
            <TabsTrigger value="pages" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              Páginas
            </TabsTrigger>
            <TabsTrigger value="sedes" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Sedes
            </TabsTrigger>
            <TabsTrigger value="incident-types" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Tipos de Incidentes
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Feedback
            </TabsTrigger>
          </TabsList>

          {/* User Management */}
          <TabsContent value="users">
            <UserManagementPage />
          </TabsContent>

          {/* Sensitive Reports */}
          <TabsContent value="sensitive">
            <SensitiveReportsPage userRole="superuser" />
          </TabsContent>

          {/* Pages Management */}
          <TabsContent value="pages">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Layout className="h-6 w-6" />
                  Gestión de Páginas del Sistema
                </CardTitle>
                <CardDescription>
                  Controla qué páginas están disponibles para todos los usuarios del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availablePages.map(page => {
                    const Icon = page.icon;
                    const isEnabled = systemConfig.enabledPages.includes(page.id);
                    
                    return (
                      <Card key={page.id} className={`transition-all ${isEnabled ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Icon className={`h-6 w-6 ${isEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                              <div>
                                <h3 className="font-medium">{page.name}</h3>
                                <p className="text-sm text-gray-500">Página: {page.id}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={isEnabled ? 'bg-green-500' : 'bg-gray-500'}>
                                {isEnabled ? 'Activa' : 'Inactiva'}
                              </Badge>
                              <Switch
                                checked={isEnabled}
                                onCheckedChange={() => togglePage(page.id)}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sedes Management */}
          <TabsContent value="sedes">
            <div className="space-y-6">
              {/* Add Sede */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Plus className="h-6 w-6" />
                    Agregar Nueva Sede
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      placeholder="Nombre de la sede"
                      value={newSede.name}
                      onChange={(e) => setNewSede(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Input
                      placeholder="Dirección de la sede"
                      value={newSede.address}
                      onChange={(e) => setNewSede(prev => ({ ...prev, address: e.target.value }))}
                    />
                    <Button onClick={addSede} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Sede
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Existing Sedes */}
              <Card>
                <CardHeader>
                  <CardTitle>Sedes Existentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {systemConfig.sedes.map(sede => (
                      <Card key={sede.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          {editingSede === sede.id ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                  value={editSedeData.name}
                                  onChange={(e) => setEditSedeData(prev => ({ ...prev, name: e.target.value }))}
                                  placeholder="Nombre de la sede"
                                />
                                <Input
                                  value={editSedeData.address}
                                  onChange={(e) => setEditSedeData(prev => ({ ...prev, address: e.target.value }))}
                                  placeholder="Dirección"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={saveSedeChanges} size="sm" className="bg-green-600 hover:bg-green-700">
                                  <Save className="h-4 w-4 mr-1" />
                                  Guardar
                                </Button>
                                <Button onClick={cancelEditingSede} variant="outline" size="sm">
                                  <X className="h-4 w-4 mr-1" />
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <h3 className="font-medium text-lg">{sede.name}</h3>
                                  <p className="text-gray-600">{sede.address}</p>
                                  <Badge className={sede.isActive ? 'bg-green-500' : 'bg-gray-500'}>
                                    {sede.isActive ? 'Activa' : 'Inactiva'}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => startEditingSede(sede)}
                                    className="text-blue-600"
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Editar
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteSede(sede.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Eliminar
                                  </Button>
                                </div>
                              </div>

                              {/* Zones for this sede */}
                              <div className="border-t pt-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-medium">Zonas ({sede.zones.length})</h4>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      placeholder="Nueva zona"
                                      value={newZone}
                                      onChange={(e) => setNewZone(e.target.value)}
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                          setSelectedSede(sede.id);
                                          addZone();
                                        }
                                      }}
                                      className="w-48"
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        setSelectedSede(sede.id);
                                        addZone();
                                      }}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                  {sede.zones.map(zone => (
                                    <div key={zone.id} className="flex items-center justify-between bg-gray-100 rounded p-2">
                                      <span className="text-sm">{zone.name}</span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteZone(sede.id, zone.id)}
                                        className="text-red-600 h-6 w-6 p-0"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Incident Types Management */}
          <TabsContent value="incident-types">
            <div className="space-y-6">
              {/* Add Incident Type */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Plus className="h-6 w-6" />
                    Agregar Tipo de Incidente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input
                      placeholder="Nombre del tipo de incidente"
                      value={newIncidentType.name}
                      onChange={(e) => setNewIncidentType(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Input
                      placeholder="Descripción"
                      value={newIncidentType.description}
                      onChange={(e) => setNewIncidentType(prev => ({ ...prev, description: e.target.value }))}
                    />
                    <Input
                      placeholder="Ícono (emoji)"
                      value={newIncidentType.icon}
                      onChange={(e) => setNewIncidentType(prev => ({ ...prev, icon: e.target.value }))}
                    />
                    <select
                      value={newIncidentType.priority}
                      onChange={(e) => setNewIncidentType(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' | 'critical' }))}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                      <option value="critical">Crítica</option>
                    </select>
                  </div>
                  <Button onClick={addNewIncidentType} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Tipo de Incidente
                  </Button>
                </CardContent>
              </Card>

              {/* Existing Incident Types */}
              <Card>
                <CardHeader>
                  <CardTitle>Tipos de Incidentes Existentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {systemConfig.incidentTypes.map(incidentType => (
                      <Card key={incidentType.id} className="border-l-4 border-l-purple-500">
                        <CardContent className="p-4">
                          {editingIncidentType === incidentType.id ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 gap-4">
                                <Input
                                  value={editIncidentTypeData.name}
                                  onChange={(e) => setEditIncidentTypeData(prev => ({ ...prev, name: e.target.value }))}
                                  placeholder="Nombre"
                                />
                                <Input
                                  value={editIncidentTypeData.description}
                                  onChange={(e) => setEditIncidentTypeData(prev => ({ ...prev, description: e.target.value }))}
                                  placeholder="Descripción"
                                />
                                <Input
                                  value={editIncidentTypeData.icon}
                                  onChange={(e) => setEditIncidentTypeData(prev => ({ ...prev, icon: e.target.value }))}
                                  placeholder="Ícono"
                                />
                                <select
                                  value={editIncidentTypeData.priority}
                                  onChange={(e) => setEditIncidentTypeData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' | 'critical' }))}
                                  className="px-3 py-2 border border-gray-300 rounded-md"
                                >
                                  <option value="low">Baja</option>
                                  <option value="medium">Media</option>
                                  <option value="high">Alta</option>
                                  <option value="critical">Crítica</option>
                                </select>
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={updateIncidentTypeData} size="sm" className="bg-green-600 hover:bg-green-700">
                                  <Save className="h-4 w-4 mr-1" />
                                  Guardar
                                </Button>
                                <Button onClick={cancelEditingIncidentType} variant="outline" size="sm">
                                  <X className="h-4 w-4 mr-1" />
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{incidentType.icon}</span>
                                  <div>
                                    <h3 className="font-medium">{incidentType.name}</h3>
                                    <p className="text-sm text-gray-600">{incidentType.description}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="outline" className="text-xs">
                                        {incidentType.category}
                                      </Badge>
                                      <Badge 
                                        className={`text-xs ${
                                          incidentType.priority === 'critical' ? 'bg-red-500' :
                                          incidentType.priority === 'high' ? 'bg-orange-500' :
                                          incidentType.priority === 'medium' ? 'bg-yellow-500' :
                                          'bg-green-500'
                                        }`}
                                      >
                                        {incidentType.priority === 'critical' ? 'Crítica' :
                                         incidentType.priority === 'high' ? 'Alta' :
                                         incidentType.priority === 'medium' ? 'Media' : 'Baja'}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge className={incidentType.isEnabled ? 'bg-green-500' : 'bg-gray-500'}>
                                    {incidentType.isEnabled ? 'Activo' : 'Inactivo'}
                                  </Badge>
                                  <Switch
                                    checked={incidentType.isEnabled}
                                    onCheckedChange={() => toggleIncidentType(incidentType.id)}
                                  />
                                </div>
                              </div>
                              
                              {/* Incident Type Controls */}
                              {editingIncidentType !== incidentType.id && (
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => startEditingIncidentType(incidentType)}
                                    className="text-blue-600"
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Editar
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeIncidentType(incidentType.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Eliminar
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Feedback Management */}
          <TabsContent value="feedback">
            <FeedbackManagementTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}