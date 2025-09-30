import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { 
  Star,
  Smile,
  Meh,
  Frown,
  ThumbsUp,
  ThumbsDown,
  Clock,
  CheckCircle,
  MessageCircle,
  Send
} from 'lucide-react';

interface ReportFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  reportType: string;
  resolutionTime: string;
}

export function ReportFeedbackModal({ 
  isOpen, 
  onClose, 
  reportId, 
  reportType, 
  resolutionTime 
}: ReportFeedbackModalProps) {
  const [rating, setRating] = React.useState<number>(0);
  const [satisfaction, setSatisfaction] = React.useState<'very_satisfied' | 'satisfied' | 'neutral' | 'dissatisfied' | null>(null);
  const [speedRating, setSpeedRating] = React.useState<'fast' | 'adequate' | 'slow' | null>(null);
  const [communicationRating, setCommunicationRating] = React.useState<'excellent' | 'good' | 'poor' | null>(null);
  const [recommendations, setRecommendations] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Por favor, selecciona una calificación general');
      return;
    }

    setIsSubmitting(true);

    // Simular envío de encuesta
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const feedbackData = {
        reportId,
        rating,
        satisfaction,
        speedRating,
        communicationRating,
        recommendations,
        timestamp: new Date().toISOString()
      };

      console.log('Feedback enviado:', feedbackData);
      
      setSubmitted(true);
      
      // Cerrar modal después de mostrar confirmación
      setTimeout(() => {
        onClose();
        // Reset form
        setRating(0);
        setSatisfaction(null);
        setSpeedRating(null);
        setCommunicationRating(null);
        setRecommendations('');
        setSubmitted(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error enviando feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const satisfactionOptions = [
    { value: 'very_satisfied', label: 'Muy Satisfecho', icon: Smile, color: 'text-green-600' },
    { value: 'satisfied', label: 'Satisfecho', icon: ThumbsUp, color: 'text-blue-600' },
    { value: 'neutral', label: 'Neutral', icon: Meh, color: 'text-yellow-600' },
    { value: 'dissatisfied', label: 'Insatisfecho', icon: Frown, color: 'text-red-600' },
  ];

  const speedOptions = [
    { value: 'fast', label: 'Rápido', color: 'bg-green-100 text-green-800' },
    { value: 'adequate', label: 'Adecuado', color: 'bg-blue-100 text-blue-800' },
    { value: 'slow', label: 'Lento', color: 'bg-red-100 text-red-800' },
  ];

  const communicationOptions = [
    { value: 'excellent', label: 'Excelente', color: 'bg-green-100 text-green-800' },
    { value: 'good', label: 'Bueno', color: 'bg-blue-100 text-blue-800' },
    { value: 'poor', label: 'Deficiente', color: 'bg-red-100 text-red-800' },
  ];

  if (submitted) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="sr-only">Encuesta Enviada</DialogTitle>
            <DialogDescription className="sr-only">
              Tu retroalimentación ha sido enviada exitosamente
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-800 mb-2">
              ¡Gracias por tu retroalimentación!
            </h3>
            <p className="text-gray-600">
              Tu opinión nos ayuda a mejorar nuestro servicio de seguridad
            </p>
            <div className="mt-4">
              <Badge className="bg-green-100 text-green-800">
                Encuesta enviada exitosamente
              </Badge>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Evaluación del Servicio
          </DialogTitle>
          <DialogDescription>
            Tu reporte ha sido resuelto. Nos gustaría conocer tu experiencia para mejorar nuestro servicio.
          </DialogDescription>
        </DialogHeader>

        {/* Información del reporte */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-green-800">Reporte #{reportId.slice(-6)}</p>
                <p className="text-sm text-green-600">{reportType}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Clock className="h-4 w-4" />
                  Resuelto en {resolutionTime}
                </div>
                <CheckCircle className="h-5 w-5 text-green-500 ml-auto mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Calificación general */}
          <div>
            <h4 className="font-medium mb-3">Calificación General</h4>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`p-1 rounded ${
                    star <= rating ? 'text-yellow-500' : 'text-gray-300'
                  } hover:text-yellow-400 transition-colors`}
                >
                  <Star className={`h-8 w-8 ${star <= rating ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {rating > 0 && (
                rating >= 4 ? 'Excelente servicio' :
                rating >= 3 ? 'Buen servicio' :
                rating >= 2 ? 'Servicio regular' : 'Servicio mejorable'
              )}
            </p>
          </div>

          {/* Satisfacción con la resolución */}
          <div>
            <h4 className="font-medium mb-3">¿Qué tan satisfecho estás con la resolución?</h4>
            <div className="grid grid-cols-2 gap-3">
              {satisfactionOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setSatisfaction(option.value as any)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      satisfaction === option.value
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${option.color}`} />
                      <span className="font-medium">{option.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Velocidad de respuesta */}
          <div>
            <h4 className="font-medium mb-3">Velocidad de Respuesta</h4>
            <div className="flex gap-3">
              {speedOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSpeedRating(option.value as any)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    speedRating === option.value
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Badge className={option.color}>
                    {option.label}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {/* Comunicación */}
          <div>
            <h4 className="font-medium mb-3">Calidad de la Comunicación</h4>
            <div className="flex gap-3">
              {communicationOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setCommunicationRating(option.value as any)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    communicationRating === option.value
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Badge className={option.color}>
                    {option.label}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {/* Recomendaciones */}
          <div>
            <h4 className="font-medium mb-3">Recomendaciones y Comentarios (Opcional)</h4>
            <Textarea
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              placeholder="Comparte tu experiencia y sugerencias para mejorar nuestro servicio..."
              className="min-h-[100px]"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={isSubmitting}
            >
              Omitir Encuesta
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Evaluación
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}