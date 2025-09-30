import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { useReportService } from './services/ReportService';
import { useNotificationService } from './services/NotificationService';
import { useSystemConfig } from './services/SystemConfigService';
import { useUserService } from './services/UserService';
import { useFeedbackService } from './services/FeedbackService';
import { FirstReportFeedbackModal } from './FirstReportFeedbackModal';
import { 
  AlertTriangle, 
  MapPin, 
  Camera, 
  Shield, 
  Send,
  X,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReportModal({ isOpen, onClose }: ReportModalProps) {
  const { addReport, reports, canCreateReport, getUserTodayReportsCount, isUserFirstReport } = useReportService();
  const { triggerNotification, checkDangerousZones, notifyReportProgress } = useNotificationService();
  const { getEnabledIncidentTypes, systemConfig } = useSystemConfig();
  const { getUserByEmail } = useUserService();
  const { hasUserProvidedFeedback } = useFeedbackService();
  const [reportForm, setReportForm] = React.useState({
    incidentType: '',
    zone: '',
    description: '',
    isAnonymous: true,
    contactInfo: ''
  });
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [showContactInfo, setShowContactInfo] = React.useState(false);
  const [showLimitMessage, setShowLimitMessage] = React.useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = React.useState(false);
  const [createdReportId, setCreatedReportId] = React.useState<string | null>(null);
  
  // Obtener datos del usuario logueado desde el servicio de usuarios
  // En este caso, obtenemos el usuario de prueba U1234567@utp.edu.pe
  const loggedUser = getUserByEmail('U1234567@utp.edu.pe');
  const currentUser = {
    id: loggedUser?.id || 'user_demo',
    name: loggedUser?.name || 'Juan Pérez',
    email: loggedUser?.email || 'U1234567@utp.edu.pe',
    studentId: loggedUser?.email?.split('@')[0] || 'U1234567'
  };

  // Verificar límite diario de reportes usando el ID del usuario
  const userCanCreateReport = React.useMemo(() => 
    canCreateReport(currentUser.id), 
    [canCreateReport, currentUser.id, reports]
  );
  
  const todayReportsCount = React.useMemo(() => 
    getUserTodayReportsCount(currentUser.id), 
    [getUserTodayReportsCount, currentUser.id, reports]
  );

  // Mostrar mensaje de límite cuando se abra el modal y esté en el límite
  React.useEffect(() => {
    if (isOpen && !reportForm.isAnonymous && todayReportsCount >= 3) {
      setShowLimitMessage(true);
    }
  }, [isOpen, reportForm.isAnonymous, todayReportsCount]);

  // Obtener tipos de incidentes habilitados desde la configuración
  const incidentTypes = getEnabledIncidentTypes();

  // Obtener zonas de todas las sedes activas
  const universityZones = React.useMemo(() => {
    const zones: string[] = [];
    systemConfig.sedes.forEach(sede => {
      if (sede.isActive) {
        sede.zones.forEach(zone => {
          if (zone.isActive) {
            zones.push(`${sede.name} - ${zone.name}`);
          }
        });
      }
    });
    zones.push('Otro (especificar en descripción)');
    return zones;
  }, [systemConfig.sedes]);

  const handleFormChange = (field: string, value: string | boolean) => {
    setReportForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Auto-rellenar información cuando cambia de anónimo a no anónimo
    if (field === 'isAnonymous' && value === false) {
      setReportForm(prev => ({
        ...prev,
        contactInfo: currentUser.email
      }));
      setShowContactInfo(true);
    } else if (field === 'isAnonymous' && value === true) {
      setReportForm(prev => ({
        ...prev,
        contactInfo: ''
      }));
      setShowContactInfo(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Verificar que sea una imagen
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
      } else {
        alert('Por favor selecciona solo archivos de imagen (JPG, PNG, etc.)');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportForm.incidentType || !reportForm.zone || !reportForm.description.trim()) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }

    // Verificar límite diario para reportes no anónimos
    if (!reportForm.isAnonymous && !userCanCreateReport) {
      alert('🚫 Has alcanzado el límite de 3 reportes por día. Los reportes anónimos no tienen límite. Intenta mañana con reportes identificados.');
      return;
    }

    // Preparar los datos del reporte
    const reportData = {
      ...reportForm,
      timestamp: new Date().toISOString(),
      hasPhoto: !!selectedFile,
      photoName: selectedFile?.name || null,
      // Si no es anónimo, agregar información del usuario
      reportedBy: !reportForm.isAnonymous ? {
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        userRole: 'user'
      } : undefined
    };

    let reportId: string;
    
    try {
      // Agregar el reporte al servicio
      addReport(reportData);
      // Generar un ID temporal para el reporte (simular el ID real)
      reportId = `report-${Date.now()}`;
      setCreatedReportId(reportId);
    } catch (error: any) {
      if (error.message === 'DAILY_LIMIT_EXCEEDED') {
        alert('Has alcanzado el límite de 3 reportes por día. Intenta mañana.');
        return;
      }
      throw error;
    }

    // Disparar notificaciones del sistema
    triggerNotification('normal', 
      '📢 Reporte Enviado Exitosamente',
      'Gracias por contribuir a la seguridad de la comunidad universitaria.',
      reportData.timestamp
    );

    // Notificar al admin sobre el nuevo reporte
    notifyReportProgress(reportData.timestamp, 'created', 'admin');

    // Verificar si hay zonas peligrosas
    const updatedReports = [...reports, reportData];
    checkDangerousZones(updatedReports);

    // Verificar si es el primer reporte del usuario y no es anónimo
    const shouldShowFeedback = !reportForm.isAnonymous && 
                               isUserFirstReport(currentUser.id) && 
                               !hasUserProvidedFeedback(currentUser.id);

    // Limpiar formulario después de que se actualice el estado
    setTimeout(() => {
      setReportForm({
        incidentType: '',
        zone: '',
        description: '',
        isAnonymous: true,
        contactInfo: ''
      });
      setSelectedFile(null);
      setShowContactInfo(false);
    }, 100);
    
    onClose();

    // Mostrar modal de feedback si es el primer reporte
    if (shouldShowFeedback) {
      setTimeout(() => {
        setShowFeedbackModal(true);
      }, 500); // Esperar un poco después de cerrar el modal de reporte
    }
  };

  const resetForm = () => {
    setReportForm({
      incidentType: '',
      zone: '',
      description: '',
      isAnonymous: true,
      contactInfo: ''
    });
    setSelectedFile(null);
    setShowContactInfo(false);
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl">Reportar Incidente</DialogTitle>
                <DialogDescription className="text-base">
                  Ayuda a mantener segura a la comunidad universitaria
                </DialogDescription>
              </div>
            </div>
            
            {/* Contador de reportes diarios */}
            <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${todayReportsCount >= 3 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                <span className="font-medium">
                  {todayReportsCount}/3 reportes hoy
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Emergency Alert */}
        <Alert className="border-red-200 bg-red-50 mb-6">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>¿Es una emergencia en curso?</strong> Si estás en peligro inmediato o presencias un crimen, 
            llama al <strong>911</strong> primero y reporta aquí después.
          </AlertDescription>
        </Alert>

        {/* Mensaje especial de límite alcanzado */}
        {!reportForm.isAnonymous && todayReportsCount >= 3 && (
          <div className="mb-6">
            <Alert className="border-red-400 bg-red-100 mb-4">
              <X className="h-6 w-6 text-red-700" />
              <AlertDescription className="text-red-900">
                <div className="space-y-3">
                  <div>
                    <strong className="text-lg">🚫 ¡Límite Diario Alcanzado!</strong>
                  </div>
                  <div className="text-base">
                    Has realizado <strong>3 reportes</strong> hoy, que es el límite máximo permitido.
                  </div>
                  <div className="text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                    <strong>¿Por qué existe este límite?</strong>
                    <ul className="mt-2 space-y-1 list-disc list-inside">
                      <li>Previene el abuso del sistema</li>
                      <li>Asegura calidad en los reportes</li>
                      <li>Permite procesamiento eficiente</li>
                    </ul>
                  </div>
                  <div className="text-base">
                    <strong>📅 Podrás crear nuevos reportes identificados mañana.</strong>
                  </div>
                  <div className="text-sm bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <strong>💡 ¿Sabías que?</strong> Los reportes anónimos <strong>no tienen límite diario</strong>. 
                    Puedes marcar la casilla "Enviar como denuncia anónima" para continuar reportando.
                  </div>
                  <div className="text-sm text-red-700">
                    Si tienes una emergencia, contacta directamente a seguridad: <strong>📞 911</strong>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {!reportForm.isAnonymous && todayReportsCount === 2 && (
          <Alert className="border-yellow-400 bg-yellow-100 mb-6">
            <AlertTriangle className="h-6 w-6 text-yellow-700" />
            <AlertDescription className="text-yellow-900">
              <div className="space-y-2">
                <div>
                  <strong className="text-base">⚠️ ¡Último Reporte del Día!</strong>
                </div>
                <div>
                  Este será tu <strong>tercer y último reporte</strong> de hoy. 
                  Asegúrate de incluir toda la información importante y necesaria.
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Incidente */}
          <div>
            <Label htmlFor="incidentType" className="text-base mb-3 block">
              Tipo de Incidente *
            </Label>
            <Select 
              value={reportForm.incidentType} 
              onValueChange={(value) => handleFormChange('incidentType', value)}
              disabled={!reportForm.isAnonymous && !userCanCreateReport}
            >
              <SelectTrigger 
                className={`h-12 text-base ${!reportForm.isAnonymous && !userCanCreateReport ? 'opacity-50 cursor-not-allowed' : ''}`} 
                aria-label="Selecciona el tipo de incidente"
              >
                <SelectValue placeholder={!reportForm.isAnonymous && !userCanCreateReport ? "Límite de reportes alcanzado" : "Selecciona el tipo de incidente que quieres reportar"} />
              </SelectTrigger>
              <SelectContent>
                {incidentTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id} className="text-base py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{type.icon}</span>
                      <div>
                        <span>{type.name}</span>
                        <p className="text-xs text-gray-500">{type.description}</p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ubicación/Zona */}
          <div>
            <Label htmlFor="zone" className="text-base mb-3 block">
              Ubicación del Incidente *
            </Label>
            <Select 
              value={reportForm.zone} 
              onValueChange={(value) => handleFormChange('zone', value)}
              disabled={!reportForm.isAnonymous && !userCanCreateReport}
            >
              <SelectTrigger 
                className={`h-12 text-base ${!reportForm.isAnonymous && !userCanCreateReport ? 'opacity-50 cursor-not-allowed' : ''}`} 
                aria-label="Selecciona la zona donde ocurrió el incidente"
              >
                <MapPin className="h-4 w-4 mr-2" />
                <SelectValue placeholder={!reportForm.isAnonymous && !userCanCreateReport ? "Límite alcanzado" : "¿En qué zona de la sede ocurrió?"} />
              </SelectTrigger>
              <SelectContent>
                {universityZones.map((zone) => (
                  <SelectItem key={zone} value={zone} className="text-base py-2">
                    {zone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Descripción */}
          <div>
            <Label htmlFor="description" className="text-base mb-3 block">
              Descripción del Incidente *
            </Label>
            <Textarea
              id="description"
              value={reportForm.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              placeholder={!reportForm.isAnonymous && !userCanCreateReport ? "Has alcanzado el límite de reportes diarios" : "Describe lo que pasó con el mayor detalle posible:&#10;• ¿Qué ocurrió exactamente?&#10;• ¿Cuándo sucedió? (hora aproximada)&#10;• ¿Había otras personas presentes?&#10;• Descripción del agresor (si aplica)&#10;• ¿Qué objetos fueron sustraídos? (si aplica)"}
              rows={6}
              className={`text-base resize-none ${!reportForm.isAnonymous && !userCanCreateReport ? 'opacity-50 cursor-not-allowed' : ''}`}
              required
              disabled={!reportForm.isAnonymous && !userCanCreateReport}
              aria-label="Describe detalladamente lo que ocurrió"
            />
            <p className="text-sm text-gray-600 mt-2">
              Entre más detalles proporciones, más útil será para la comunidad.
            </p>
          </div>

          {/* Subir Foto */}
          <div>
            <Label className="text-base mb-3 block">
              Evidencia Fotográfica (Opcional)
            </Label>
            <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${!reportForm.isAnonymous && !userCanCreateReport ? 'border-gray-200 opacity-50' : 'border-gray-300 hover:border-primary'}`}>
              <input
                type="file"
                id="photo"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={!reportForm.isAnonymous && !userCanCreateReport}
                aria-label="Seleccionar foto como evidencia"
              />
              <label htmlFor="photo" className={`${!reportForm.isAnonymous && !userCanCreateReport ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                <div className="flex flex-col items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Camera className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-base mb-1">
                      {!reportForm.isAnonymous && !userCanCreateReport ? 'Límite de reportes alcanzado' : 'Subir foto de evidencia'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {!reportForm.isAnonymous && !userCanCreateReport ? 'No puedes subir archivos cuando has alcanzado el límite diario' : 'JPG, PNG hasta 10MB. No incluyas caras de personas sin su consentimiento.'}
                    </p>
                  </div>
                </div>
              </label>
              
              {selectedFile && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-800">{selectedFile.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                      aria-label="Eliminar foto seleccionada"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reporte Anónimo */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="anonymous"
                checked={reportForm.isAnonymous}
                onChange={(e) => {
                  handleFormChange('isAnonymous', e.target.checked);
                  if (e.target.checked) {
                    setShowContactInfo(false);
                    handleFormChange('contactInfo', '');
                  }
                }}
                className="w-5 h-5 mt-1 text-primary border-gray-300 rounded focus:ring-primary"
                aria-label="Enviar como denuncia anónima"
              />
              <div className="flex-1">
                <label htmlFor="anonymous" className="cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <span className="text-base">Enviar como denuncia anónima</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Tu reporte será completamente anónimo. No se guardará ninguna información que pueda identificarte.
                    {todayReportsCount >= 3 && reportForm.isAnonymous && (
                      <span className="block mt-2 font-medium text-green-700 bg-green-50 p-2 rounded">
                        ✅ Los reportes anónimos no tienen límite diario. Puedes continuar reportando.
                      </span>
                    )}
                  </p>
                </label>
              </div>
            </div>

            {/* Contact Info (if not anonymous) */}
            {!reportForm.isAnonymous && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowContactInfo(!showContactInfo)}
                    className="text-blue-700 hover:text-blue-800"
                    aria-label={showContactInfo ? "Ocultar información de contacto" : "Mostrar información de contacto"}
                  >
                    {showContactInfo ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                    {showContactInfo ? 'Ocultar' : 'Agregar'} información de contacto
                  </Button>
                </div>
                
                {showContactInfo && (
                  <div>
                    <Label htmlFor="contactInfo" className="text-sm mb-2 block">
                      Información de contacto
                    </Label>
                    <div className="space-y-2 mb-3">
                      <div className="bg-green-50 border border-green-200 rounded p-3">
                        <p className="text-sm text-green-800">
                          <strong>Usuario:</strong> {currentUser.name} ({currentUser.studentId})
                        </p>
                        <p className="text-sm text-green-800">
                          <strong>Email:</strong> {currentUser.email}
                        </p>
                      </div>
                    </div>
                    <Input
                      id="contactInfo"
                      value={reportForm.contactInfo}
                      onChange={(e) => handleFormChange('contactInfo', e.target.value)}
                      placeholder="Email adicional o teléfono (opcional)"
                      className="h-10"
                      aria-label="Información de contacto adicional"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Ya tenemos tu información de estudiante. Puedes agregar contacto adicional si lo deseas.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="flex-1 h-12"
              aria-label="Cancelar reporte y cerrar ventana"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className={`flex-1 h-12 ${!reportForm.isAnonymous && !userCanCreateReport ? 'bg-red-500 hover:bg-red-600 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'}`}
              disabled={!reportForm.isAnonymous && !userCanCreateReport}
              aria-label="Enviar reporte de incidente"
            >
              {!reportForm.isAnonymous && !userCanCreateReport ? (
                <>
                  <X className="h-5 w-5 mr-2" />
                  🚫 Límite Diario Alcanzado (3/3)
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Enviar Reporte
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Footer Info */}
        <div className="mt-6 pt-4 border-t text-center">
          <p className="text-sm text-gray-600">
            Al enviar este reporte, confirmas que la información proporcionada es veraz y 
            ayudará a mejorar la seguridad de toda la comunidad universitaria.
          </p>
        </div>
      </DialogContent>
    </Dialog>

    {/* First Report Feedback Modal */}
    <FirstReportFeedbackModal
      isOpen={showFeedbackModal}
      onClose={() => setShowFeedbackModal(false)}
      reportId={createdReportId || undefined}
    />
    </>
  );
}