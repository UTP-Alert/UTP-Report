import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  ArrowRight, 
  ArrowLeft, 
  X, 
  CheckCircle, 
  Eye, 
  FileText, 
  MapPin, 
  Bell,
  Shield,
  Navigation,
  Info,
  Lightbulb
} from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector del elemento a destacar
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  icon: React.ReactNode;
  action?: 'click' | 'hover' | 'none';
  tip?: string;
}

interface UserOnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function UserOnboardingTour({ isOpen, onClose, onComplete }: UserOnboardingTourProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isVisible, setIsVisible] = React.useState(false);
  const [tooltipPosition, setTooltipPosition] = React.useState({ top: 0, left: 0 });

  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      title: '¡Bienvenido a UTP+Report! 👋',
      description: 'Te guiaremos paso a paso para que conozcas todas las funciones de seguridad disponibles.',
      target: '.user-dashboard-welcome',
      position: 'center',
      icon: <Shield className="h-5 w-5 text-primary" />,
      action: 'none',
      tip: 'Puedes cerrar este tutorial en cualquier momento y continuar explorando.'
    },
    {
      id: 'report-button',
      title: 'Reportar Incidentes 🚨',
      description: 'Botón principal para reportar cualquier incidente de seguridad. Totalmente anónimo y seguro.',
      target: '.report-main-button',
      position: 'bottom',
      icon: <Eye className="h-5 w-5 text-primary" />,
      action: 'hover',
      tip: 'Haz clic aquí cuando necesites reportar algo urgente.'
    },
    {
      id: 'zones-status',
      title: 'Estado de Zonas 🗺️',
      description: 'Monitoreo en tiempo real. Verde = Seguro | Amarillo = Precaución | Rojo = Peligroso.',
      target: '.zones-status-section',
      position: 'left',
      icon: <MapPin className="h-5 w-5 text-primary" />,
      action: 'none',
      tip: 'Revisa esto antes de dirigirte a una zona del campus.'
    },
    {
      id: 'quick-actions',
      title: 'Acciones Rápidas ⚡',
      description: 'Herramientas útiles: tus reportes, consejos de seguridad y contacto directo.',
      target: '.quick-actions-section',
      position: 'top',
      icon: <Navigation className="h-5 w-5 text-primary" />,
      action: 'none',
      tip: 'Estas acciones están siempre disponibles para ti.'
    },
    {
      id: 'notifications',
      title: 'Notificaciones 🔔',
      description: 'Alertas importantes: zonas peligrosas, actualizaciones de reportes y resoluciones.',
      target: '.notification-bell',
      position: 'bottom',
      icon: <Bell className="h-5 w-5 text-primary" />,
      action: 'click',
      tip: 'Mantente informado de todo lo importante.'
    },
    {
      id: 'my-reports',
      title: 'Mis Reportes 📋',
      description: 'Sigue el progreso de tus reportes desde "En Investigación" hasta "Resuelto".',
      target: '.user-report-tracker',
      position: 'top',
      icon: <FileText className="h-5 w-5 text-primary" />,
      action: 'none',
      tip: 'Recibirás notificaciones automáticas de cada progreso.'
    },
    {
      id: 'complete',
      title: '¡Listo! ✅',
      description: 'Ya conoces el sistema. Cada reporte ayuda a mantener segura toda la comunidad UTP.',
      target: '.user-dashboard-welcome',
      position: 'center',
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      action: 'none',
      tip: '¡No dudes en usar el sistema cuando lo necesites!'
    }
  ];

  React.useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      updateTooltipPosition();
    }
  }, [isOpen, currentStep]);

  const updateTooltipPosition = () => {
    const currentStepData = tourSteps[currentStep];
    if (!currentStepData) return;

    const targetElement = document.querySelector(currentStepData.target);
    if (!targetElement) return;

    const rect = targetElement.getBoundingClientRect();
    const tooltipWidth = 350;
    const tooltipHeight = 200;
    
    let top = rect.top;
    let left = rect.left;

    // Ajustar posición según el target
    switch (currentStepData.position) {
      case 'top':
        top = rect.top - tooltipHeight - 20;
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        break;
      case 'bottom':
        top = rect.bottom + 20;
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        break;
      case 'left':
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        left = rect.left - tooltipWidth - 20;
        break;
      case 'right':
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        left = rect.right + 20;
        break;
      case 'center':
        top = window.innerHeight / 2 - tooltipHeight / 2;
        left = window.innerWidth / 2 - tooltipWidth / 2;
        break;
    }

    // Asegurar que el tooltip esté dentro de la pantalla
    top = Math.max(20, Math.min(top, window.innerHeight - tooltipHeight - 20));
    left = Math.max(20, Math.min(left, window.innerWidth - tooltipWidth - 20));

    setTooltipPosition({ top, left });
  };

  const currentStepData = tourSteps[currentStep];

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('userOnboardingCompleted', 'true');
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleComplete = () => {
    localStorage.setItem('userOnboardingCompleted', 'true');
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
      onClose();
    }, 300);
  };

  if (!isOpen || !isVisible) return null;

  const isLastStep = currentStep === tourSteps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <>
      {/* Overlay sutil que no bloquea interacciones */}
      <div className="fixed inset-0 z-[9998] bg-black/20 pointer-events-none" />
      
      {/* Highlight del elemento actual */}
      {currentStepData.target !== '.user-dashboard-welcome' && (
        <style>
          {`
            ${currentStepData.target} {
              position: relative !important;
              z-index: 9999 !important;
              box-shadow: 0 0 0 3px rgba(255, 57, 92, 0.8), 0 0 0 6px rgba(255, 57, 92, 0.3) !important;
              border-radius: 8px !important;
              transition: all 0.3s ease-in-out !important;
              animation: gentle-pulse 2s ease-in-out infinite !important;
            }
            
            @keyframes gentle-pulse {
              0%, 100% { 
                box-shadow: 0 0 0 3px rgba(255, 57, 92, 0.8), 0 0 0 6px rgba(255, 57, 92, 0.3);
              }
              50% { 
                box-shadow: 0 0 0 4px rgba(255, 57, 92, 0.9), 0 0 0 8px rgba(255, 57, 92, 0.4);
              }
            }
          `}
        </style>
      )}

      {/* Tooltip flotante */}
      <div 
        className={`fixed z-[10000] transition-all duration-300 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          width: '350px',
          maxWidth: 'calc(100vw - 40px)'
        }}
      >
        <Card className="border-2 border-primary shadow-xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {currentStepData.icon}
                <Badge variant="outline" className="text-xs">
                  {currentStep + 1}/{tourSteps.length}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-gray-500 hover:text-gray-700 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            
            <CardTitle className="text-lg leading-tight">{currentStepData.title}</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              {currentStepData.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {/* Indicador de progreso compacto */}
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
              />
            </div>

            {/* Tip adicional */}
            {currentStepData.tip && (
              <div className="bg-blue-50 p-2 rounded-md border border-blue-200">
                <div className="flex items-start gap-2 text-xs text-blue-800">
                  <Lightbulb className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>{currentStepData.tip}</span>
                </div>
              </div>
            )}

            {/* Botones de navegación compactos */}
            <div className="flex items-center justify-between gap-2">
              <div>
                {!isFirstStep && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    className="h-8 px-3 text-xs"
                  >
                    <ArrowLeft className="h-3 w-3 mr-1" />
                    Anterior
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-gray-600 h-8 px-3 text-xs"
                >
                  Saltar
                </Button>
                
                <Button
                  size="sm"
                  onClick={isLastStep ? handleComplete : handleNext}
                  className="bg-primary hover:bg-primary/90 h-8 px-3 text-xs"
                >
                  {isLastStep ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      ¡Listo!
                    </>
                  ) : (
                    <>
                      Siguiente
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flecha indicadora */}
        {currentStepData.position !== 'center' && (
          <div 
            className={`absolute w-3 h-3 bg-white border-2 border-primary transform rotate-45 ${
              currentStepData.position === 'top' ? 'bottom-[-8px] left-1/2 -translate-x-1/2' :
              currentStepData.position === 'bottom' ? 'top-[-8px] left-1/2 -translate-x-1/2' :
              currentStepData.position === 'left' ? 'right-[-8px] top-1/2 -translate-y-1/2' :
              currentStepData.position === 'right' ? 'left-[-8px] top-1/2 -translate-y-1/2' : ''
            }`}
          />
        )}
      </div>
    </>
  );
}