import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Star, MessageCircle, ThumbsUp, Send } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ReportRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  reportType: string;
}

export function ReportRatingModal({ isOpen, onClose, reportId, reportType }: ReportRatingModalProps) {
  const [rating, setRating] = React.useState(0);
  const [hoveredRating, setHoveredRating] = React.useState(0);
  const [comment, setComment] = React.useState('');
  const [selectedAspects, setSelectedAspects] = React.useState<string[]>([]);

  const satisfactionAspects = [
    { id: 'response_time', label: 'Tiempo de respuesta', icon: '⚡' },
    { id: 'communication', label: 'Comunicación clara', icon: '💬' },
    { id: 'resolution', label: 'Resolución del problema', icon: '✅' },
    { id: 'professionalism', label: 'Profesionalismo', icon: '🎯' },
    { id: 'safety_feeling', label: 'Me sentí más seguro/a', icon: '🛡️' }
  ];

  const handleAspectToggle = (aspectId: string) => {
    setSelectedAspects(prev => 
      prev.includes(aspectId) 
        ? prev.filter(id => id !== aspectId)
        : [...prev, aspectId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Por favor selecciona una calificación');
      return;
    }

    const feedback = {
      reportId,
      reportType,
      rating,
      comment: comment.trim(),
      aspects: selectedAspects,
      submittedAt: new Date().toISOString()
    };

    // Aquí se enviaría al backend
    console.log('Feedback enviado:', feedback);
    
    // Guardar en localStorage para persistencia de demo
    const existingFeedbacks = JSON.parse(localStorage.getItem('reportFeedbacks') || '[]');
    existingFeedbacks.push(feedback);
    localStorage.setItem('reportFeedbacks', JSON.stringify(existingFeedbacks));

    toast.success('¡Gracias por tu feedback! Nos ayuda a mejorar el servicio.');
    
    // Reset form
    setRating(0);
    setHoveredRating(0);
    setComment('');
    setSelectedAspects([]);
    onClose();
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Muy insatisfecho';
      case 2: return 'Insatisfecho';
      case 3: return 'Neutral';
      case 4: return 'Satisfecho';
      case 5: return 'Muy satisfecho';
      default: return 'Selecciona una calificación';
    }
  };

  const getRatingColor = (rating: number) => {
    switch (rating) {
      case 1: return 'text-red-500';
      case 2: return 'text-orange-500';
      case 3: return 'text-yellow-500';
      case 4: return 'text-green-500';
      case 5: return 'text-green-600';
      default: return 'text-gray-400';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Califica Tu Experiencia
          </DialogTitle>
          <DialogDescription>
            Tu opinión nos ayuda a mejorar nuestro servicio de seguridad
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              Tu reporte de <strong>{reportType}</strong> ha sido resuelto.
            </p>
            <p className="text-sm text-gray-500">
              ¿Cómo calificarías la atención recibida?
            </p>
          </div>

          {/* Rating Stars */}
          <div className="text-center">
            <div className="flex justify-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-all hover:scale-110"
                  aria-label={`Calificar con ${star} estrella${star > 1 ? 's' : ''}`}
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className={`text-sm font-medium ${getRatingColor(hoveredRating || rating)}`}>
              {getRatingText(hoveredRating || rating)}
            </p>
          </div>

          {/* Satisfaction Aspects */}
          {rating > 0 && (
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                ¿Qué aspectos te parecieron bien? (opcional)
              </Label>
              <div className="grid grid-cols-1 gap-2">
                {satisfactionAspects.map((aspect) => (
                  <button
                    key={aspect.id}
                    type="button"
                    onClick={() => handleAspectToggle(aspect.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                      selectedAspects.includes(aspect.id)
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-lg">{aspect.icon}</span>
                    <span className="text-sm font-medium">{aspect.label}</span>
                    {selectedAspects.includes(aspect.id) && (
                      <ThumbsUp className="h-4 w-4 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          {rating > 0 && (
            <div>
              <Label htmlFor="comment" className="text-sm font-medium text-gray-700 mb-2 block">
                Comentarios adicionales (opcional)
              </Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Cuéntanos más sobre tu experiencia o sugerencias para mejorar el servicio..."
                rows={4}
                className="resize-none"
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Saltar
            </Button>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90"
              disabled={rating === 0}
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar Calificación
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}