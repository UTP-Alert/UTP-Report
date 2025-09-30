import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { SOSButton } from '../SOSButton';
import { UserOnboardingTour } from '../UserOnboardingTour';
import { FirstReportTutorial } from '../FirstReportTutorial';
import { 
  HelpCircle, 
  Phone, 
  Mail, 
  MessageCircle, 
  FileText,
  Shield,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Send,
  Download,
  Play,
  BookOpen,
  Video,
  Lightbulb
} from 'lucide-react';

interface SoportePageProps {
  onOpenReport: () => void;
  isGuideMode?: boolean;
}

export function SoportePage({ onOpenReport, isGuideMode = false }: SoportePageProps) {
  const [contactForm, setContactForm] = React.useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'media'
  });

  // Estados para los tutoriales en modo guía
  const [showOnboardingTour, setShowOnboardingTour] = React.useState(false);
  const [showReportTutorial, setShowReportTutorial] = React.useState(false);

  const faqItems = [
    {
      question: "¿Cómo reporto un incidente de seguridad?",
      answer: "Puedes reportar un incidente usando el botón 'REPORTAR ROBO' en la página principal, o navegando a la sección de Alertas. Todos los reportes son anónimos y seguros. Si es una emergencia inmediata, llama al 911 primero."
    },
    {
      question: "¿Los reportes son realmente anónimos?",
      answer: "Sí, completamente. Nuestro sistema está diseñado para proteger tu identidad. No recopilamos información personal identificable y todos los datos están encriptados. Tu seguridad y privacidad son nuestra prioridad."
    },
    {
      question: "¿Qué hago si presencio un robo en curso?",
      answer: "Si presencias un crimen en progreso: 1) Llama inmediatamente al 911, 2) No intervengas directamente, 3) Mantente a distancia segura, 4) Reporta en nuestra plataforma después para ayudar a otros estudiantes."
    },
    {
      question: "¿Cómo funcionan las alertas en tiempo real?",
      answer: "Las alertas se actualizan cada 30 segundos con información verificada de la comunidad. Los reportes pasan por un filtro automático y son confirmados por múltiples usuarios antes de mostrarse públicamente."
    },
    {
      question: "¿Puedo editar o eliminar un reporte que hice?",
      answer: "Como los reportes son anónimos, no es posible editarlos después de enviarlos. Sin embargo, puedes agregar información adicional creando un nuevo reporte relacionado o contactando a soporte."
    },
    {
      question: "¿Qué información debo incluir en un reporte?",
      answer: "Incluye: ubicación específica, hora aproximada, descripción detallada de lo ocurrido, descripción del perpetrador (si es seguro), y cualquier objeto sustraído. Más detalles ayudan a la comunidad."
    },
    {
      question: "¿La universidad tiene acceso a mi información?",
      answer: "No recopilamos datos personales. La universidad recibe estadísticas generales y reportes anónimos para mejorar la seguridad del campus, pero nunca información que pueda identificarte."
    },
    {
      question: "¿Puedo reportar actividad sospechosa?",
      answer: "¡Absolutamente! Es mejor reportar actividad sospechosa que esperar a que ocurra un incidente. Usa la categoría 'Actividad Sospechosa' en el formulario de reporte."
    }
  ];

  const supportChannels = [
    {
      title: "Chat en Vivo",
      description: "Respuesta inmediata para consultas urgentes",
      icon: MessageCircle,
      availability: "24/7",
      responseTime: "&lt; 2 minutos",
      action: "Iniciar Chat"
    },
    {
      title: "Correo Electrónico",
      description: "Para consultas detalladas y no urgentes",
      icon: Mail,
      availability: "Lunes a Viernes",
      responseTime: "&lt; 24 horas",
      action: "Enviar Email"
    },
    {
      title: "Línea Telefónica",
      description: "Soporte telefónico directo",
      icon: Phone,
      availability: "8:00 AM - 10:00 PM",
      responseTime: "Inmediato",
      action: "Llamar Ahora"
    },
    {
      title: "Seguridad Campus",
      description: "Contacto directo con seguridad universitaria",
      icon: Shield,
      availability: "24/7",
      responseTime: "&lt; 5 minutos",
      action: "Contactar Seguridad"
    }
  ];

  const handleFormChange = (field: string, value: string) => {
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí se procesaría el formulario
    alert('Mensaje enviado. Te contactaremos pronto.');
    setContactForm({
      name: '',
      email: '',
      subject: '',
      message: '',
      priority: 'media'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {isGuideMode ? (
              <BookOpen className="h-10 w-10 text-primary" />
            ) : (
              <HelpCircle className="h-10 w-10 text-primary" />
            )}
            <div>
              <h1 className="text-3xl">
                {isGuideMode ? 'GUÍA Y TUTORIALES' : 'CENTRO DE SOPORTE'}
              </h1>
              <p className="text-lg text-gray-600">
                {isGuideMode 
                  ? 'Aprende a usar el sistema paso a paso con nuestros tutoriales interactivos.'
                  : 'Estamos aquí para ayudarte. Encuentra respuestas o contáctanos directamente.'
                }
              </p>
            </div>
          </div>

          {/* Quick Stats - Solo para soporte */}
          {!isGuideMode && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-2xl">98%</p>
                      <p className="text-sm text-gray-600">Satisfacción</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-2xl">&lt; 2min</p>
                      <p className="text-sm text-gray-600">Tiempo Respuesta</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-2xl">24/7</p>
                      <p className="text-sm text-gray-600">Disponibilidad</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-8 w-8 text-orange-600" />
                    <div>
                      <p className="text-2xl">1,247</p>
                      <p className="text-sm text-gray-600">Consultas Resueltas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Tutoriales Interactivos - Solo en modo guía */}
        {isGuideMode && (
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Tutorial de Bienvenida */}
              <Card className="border-2 border-blue-200 hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Video className="h-8 w-8 text-blue-600" />
                    Tour del Sistema
                  </CardTitle>
                  <CardDescription className="text-base">
                    Conoce las funciones principales paso a paso
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setShowOnboardingTour(true)}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Iniciar Tour Completo
                  </Button>
                </CardContent>
              </Card>

              {/* Tutorial de Reporte */}
              <Card className="border-2 border-red-200 hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <AlertTriangle className="h-8 w-8 text-primary" />
                    Cómo Reportar
                  </CardTitle>
                  <CardDescription className="text-base">
                    Aprende a crear reportes de incidentes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setShowReportTutorial(true)}
                    className="w-full h-12 bg-primary hover:bg-primary/90"
                    size="lg"
                  >
                    <Lightbulb className="h-5 w-5 mr-2" />
                    Tutorial de Reportes
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <div className={isGuideMode ? "max-w-4xl mx-auto" : "grid grid-cols-1 lg:grid-cols-2 gap-8"}>
          {/* Left Column - Contact Form (Solo para soporte) */}
          {!isGuideMode && (
            <div className="space-y-6">
              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Send className="h-6 w-6 text-primary" />
                    Contactar Soporte
                  </CardTitle>
                  <CardDescription className="text-base">
                    ¿No encuentras lo que buscas? Envíanos un mensaje y te ayudaremos.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm mb-2">
                          Nombre (Opcional)
                        </label>
                        <Input
                          id="name"
                          value={contactForm.name}
                          onChange={(e) => handleFormChange('name', e.target.value)}
                          placeholder="Tu nombre"
                          aria-label="Ingresa tu nombre (opcional)"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm mb-2">
                          Email (Opcional)
                        </label>
                        <Input
                          id="email"
                          type="email"
                          value={contactForm.email}
                          onChange={(e) => handleFormChange('email', e.target.value)}
                          placeholder="tu@email.com"
                          aria-label="Ingresa tu email (opcional)"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm mb-2">
                        Asunto *
                      </label>
                      <Input
                        id="subject"
                        value={contactForm.subject}
                        onChange={(e) => handleFormChange('subject', e.target.value)}
                        placeholder="¿En qué podemos ayudarte?"
                        required
                        aria-label="Describe brevemente tu consulta"
                      />
                    </div>

                    <div>
                      <label htmlFor="priority" className="block text-sm mb-2">
                        Prioridad
                      </label>
                      <select
                        id="priority"
                        value={contactForm.priority}
                        onChange={(e) => handleFormChange('priority', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        aria-label="Selecciona la prioridad de tu consulta"
                      >
                        <option value="baja">Baja - Consulta general</option>
                        <option value="media">Media - Necesito ayuda</option>
                        <option value="alta">Alta - Problema urgente</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm mb-2">
                        Mensaje *
                      </label>
                      <Textarea
                        id="message"
                        value={contactForm.message}
                        onChange={(e) => handleFormChange('message', e.target.value)}
                        placeholder="Describe tu consulta con el mayor detalle posible..."
                        rows={6}
                        required
                        aria-label="Describe tu consulta detalladamente"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-primary hover:bg-primary/90"
                      aria-label="Enviar mensaje de soporte"
                    >
                      <Send className="h-5 w-5 mr-2" />
                      Enviar Mensaje
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Support Channels */}
              <Card>
                <CardHeader>
                  <CardTitle>Canales de Soporte</CardTitle>
                  <CardDescription>
                    Elige el canal que mejor se adapte a tu necesidad
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {supportChannels.map((channel, index) => {
                      const Icon = channel.icon;
                      return (
                        <div key={index} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="bg-primary/10 p-3 rounded-lg">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{channel.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{channel.description}</p>
                            <div className="flex gap-4 text-xs text-gray-500">
                              <span>📅 {channel.availability}</span>
                              <span>⚡ {channel.responseTime}</span>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            aria-label={`${channel.action} - ${channel.description}`}
                          >
                            {channel.action}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Content Column - FAQ and Resources */}
          <div className="space-y-6">
            {/* Emergency Contact */}
            <Card className="border-2 border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-red-700">
                  <AlertTriangle className="h-6 w-6" />
                  Contacto de Emergencia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-700 mb-4">
                  Si estás en peligro inmediato o presencias un crimen en progreso:
                </p>
                <div className="space-y-3">
                  <Button 
                    size="lg" 
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    aria-label="Llamar al número de emergencia 911"
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    LLAMAR 911
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full border-red-300 text-red-700 hover:bg-red-100"
                    aria-label="Contactar seguridad del campus"
                  >
                    <Shield className="h-5 w-5 mr-2" />
                    SEGURIDAD CAMPUS: (555) 123-4567
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-primary" />
                  Preguntas Frecuentes
                </CardTitle>
                <CardDescription>
                  Respuestas a las consultas más comunes sobre el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  {faqItems.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* Resources - Solo para soporte */}
            {!isGuideMode && (
              <Card>
                <CardHeader>
                  <CardTitle>Recursos Adicionales</CardTitle>
                  <CardDescription>
                    Documentos y guías útiles para usar el sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      aria-label="Descargar guía de seguridad personal"
                    >
                      <Download className="h-4 w-4 mr-3" />
                      Guía de Seguridad Personal
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      aria-label="Descargar manual de uso del sistema"
                    >
                      <Download className="h-4 w-4 mr-3" />
                      Manual de Usuario
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      aria-label="Ver política de privacidad"
                    >
                      <FileText className="h-4 w-4 mr-3" />
                      Política de Privacidad
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      aria-label="Ver términos de servicio"
                    >
                      <FileText className="h-4 w-4 mr-3" />
                      Términos de Servicio
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Bottom Help Section - Solo para soporte */}
        {!isGuideMode && (
          <Card className="mt-8 bg-primary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Users className="h-8 w-8 text-primary" />
                <h3 className="text-xl">¿Necesitas ayuda inmediata?</h3>
              </div>
              <p className="text-lg text-gray-600 mb-6">
                Nuestro equipo de soporte está disponible 24/7 para ayudarte con cualquier consulta o problema.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Badge variant="outline" className="text-base px-4 py-2">
                  ⚡ Respuesta en menos de 2 minutos
                </Badge>
                <Badge variant="outline" className="text-base px-4 py-2">
                  🛡️ Soporte especializado en seguridad
                </Badge>
                <Badge variant="outline" className="text-base px-4 py-2">
                  🔒 Confidencialidad garantizada
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Botón SOS */}
      <SOSButton />

      {/* Tutoriales - Solo en modo guía */}
      {isGuideMode && (
        <>
          {/* Tour de Bienvenida */}
          <UserOnboardingTour
            isOpen={showOnboardingTour}
            onClose={() => setShowOnboardingTour(false)}
            onComplete={() => setShowOnboardingTour(false)}
          />

          {/* Tutorial de Reporte */}
          <FirstReportTutorial
            isOpen={showReportTutorial}
            onClose={() => setShowReportTutorial(false)}
            onComplete={() => {
              setShowReportTutorial(false);
              // Opcional: abrir el modal de reporte después del tutorial
              setTimeout(() => onOpenReport(), 500);
            }}
          />
        </>
      )}
    </div>
  );
}