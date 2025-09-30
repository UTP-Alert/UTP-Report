import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  AlertTriangle, 
  MapPin, 
  Camera, 
  Shield, 
  Send,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Star,
  FileText,
  Users
} from 'lucide-react';

interface FirstReportTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function FirstReportTutorial({ isOpen, onClose, onComplete }: FirstReportTutorialProps) {
  const [currentStep, setCurrentStep] = React.useState(0);

  const tutorialSteps = [
    {
      title: "¡Bienvenido al Sistema de Reportes!",
      content: (
        <div className="text-center space-y-4">
          <div className="bg-primary/10 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Tu seguridad es nuestra prioridad</h3>
          <p className="text-gray-600">
            Te guiaremos paso a paso para crear tu primer reporte de incidente. 
            Este sistema nos ayuda a mantener el campus seguro para todos.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Recuerda:</strong> Si es una emergencia en curso, llama al <strong>911</strong> primero.
            </p>
          </div>
        </div>
      ),
      icon: <Shield className="h-6 w-6" />
    },
    {
      title: "Paso 1: Selecciona el Tipo de Incidente",
      content: (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <AlertTriangle className="h-8 w-8 text-primary mb-3" />
            <h4 className="font-semibold mb-2">Tipos de incidentes más comunes:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span>🔴 Robo o intento de robo</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <span>🟠 Actividad sospechosa</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span>🔴 Acoso o intimidación</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <span>🟡 Vandalismo</span>
              </div>
            </div>
          </div>
          <p className="text-gray-600">
            Selecciona la categoría que mejor describa lo que ocurrió. Esto nos ayuda a priorizar y asignar el reporte correctamente.
          </p>
        </div>
      ),
      icon: <AlertTriangle className="h-6 w-6" />
    },
    {
      title: "Paso 2: Indica la Ubicación",
      content: (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <MapPin className="h-8 w-8 text-primary mb-3" />
            <h4 className="font-semibold mb-2">Ubicación del incidente:</h4>
            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <p className="text-sm text-blue-800">
                Las zonas del campus aparecerán en pantalla para que selecciones la más apropiada.
              </p>
            </div>
          </div>
          <p className="text-gray-600">
            Ser específico con la ubicación ayuda a nuestro personal de seguridad a responder más rápido y efectivamente.
          </p>
        </div>
      ),
      icon: <MapPin className="h-6 w-6" />
    },
    {
      title: "Paso 3: Describe lo Ocurrido",
      content: (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <FileText className="h-8 w-8 text-primary mb-3" />
            <h4 className="font-semibold mb-2">Incluye estos detalles importantes:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>¿Qué ocurrió exactamente?</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>¿Cuándo sucedió? (hora aproximada)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>¿Había otras personas presentes?</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Descripción del agresor (si aplica)</span>
              </div>
            </div>
          </div>
          <p className="text-gray-600">
            Entre más detalles proporciones, más útil será para la comunidad y para resolver el incidente.
          </p>
        </div>
      ),
      icon: <FileText className="h-6 w-6" />
    },
    {
      title: "Paso 4: Agrega Evidencia (Opcional)",
      content: (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <Camera className="h-8 w-8 text-primary mb-3" />
            <h4 className="font-semibold mb-2">Consejos para fotos de evidencia:</h4>
            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Formato:</strong> JPG o PNG, hasta 50MB
              </p>
            </div>
          </div>
          <p className="text-gray-600">
            Las fotos son muy útiles pero completamente opcionales. Solo comparte lo que te sientas cómodo/a compartiendo.
          </p>
        </div>
      ),
      icon: <Camera className="h-6 w-6" />
    },
    {
      title: "Paso 5: Privacidad y Anonimato",
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <Shield className="h-8 w-8 text-blue-600 mb-3" />
            <h4 className="font-semibold mb-2">Tienes dos opciones:</h4>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                <h5 className="font-medium text-blue-800">Reporte Anónimo</h5>
                <p className="text-sm text-blue-700">
                  Tu identidad estará completamente protegida. No guardamos ningún dato que pueda identificarte.
                </p>
              </div>
              <div className="bg-white p-3 rounded border-l-4 border-green-500">
                <h5 className="font-medium text-green-800">Reporte Identificado</h5>
                <p className="text-sm text-green-700">
                  Podemos contactarte para seguimiento si necesitamos más información. Tu reporte será agregado a lista del tablero.
                </p>
              </div>
            </div>
          </div>
          <p className="text-gray-600">
            Ambas opciones son válidas y ayudan a mejorar la seguridad del campus.
          </p>
        </div>
      ),
      icon: <Shield className="h-6 w-6" />
    },
    {
      title: "¡Listo para Reportar!",
      content: (
        <div className="text-center space-y-4">
          <div className="bg-green-50 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-green-800">Ya sabes cómo funciona</h3>
          <p className="text-gray-600">
            Ahora puedes crear reportes de forma rápida y efectiva. Recuerda que cada reporte contribuye a hacer nuestro campus más seguro.
          </p>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <h4 className="font-semibold text-yellow-800">¿Qué pasa después?</h4>
            </div>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>1. Tu reporte será revisado por el administrador</p>
              <p>2. Se asignará prioridad según la gravedad</p>
              <p>3. Personal de seguridad atenderá el caso</p>
              <p>4. Recibirás notificaciones del progreso</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Users className="h-4 w-4" />
            <span>Juntos hacemos el campus más seguro</span>
          </div>
        </div>
      ),
      icon: <CheckCircle className="h-6 w-6" />
    }
  ];

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Marcar como completado en localStorage
    localStorage.setItem('firstReportTutorialCompleted', 'true');
    onComplete();
    onClose();
  };

  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                {tutorialSteps[currentStep].icon}
              </div>
              <div>
                <DialogTitle className="text-xl">{tutorialSteps[currentStep].title}</DialogTitle>
                <DialogDescription className="text-sm text-gray-500">
                  Paso {currentStep + 1} de {tutorialSteps.length}
                </DialogDescription>
              </div>
            </div>
            <Badge variant="outline" className="ml-4">
              Tutorial
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progreso</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </DialogHeader>

        <div className="py-6">
          {tutorialSteps[currentStep].content}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>
          
          <div className="flex items-center gap-2">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep 
                    ? 'bg-primary w-6' 
                    : index < currentStep 
                      ? 'bg-green-500' 
                      : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {currentStep === tutorialSteps.length - 1 ? (
            <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              ¡Entendido!
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Siguiente
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Skip Tutorial */}
        <div className="text-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              localStorage.setItem('firstReportTutorialCompleted', 'true');
              onClose();
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            Saltar tutorial
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}