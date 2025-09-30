import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useFeedbackService } from './services/FeedbackService';
import { useUserService } from './services/UserService';
import { toast } from 'sonner@2.0.3';
import { Star, Heart, Send, MessageCircle } from 'lucide-react';

interface FirstReportFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId?: string;
}

export function FirstReportFeedbackModal({ isOpen, onClose, reportId }: FirstReportFeedbackModalProps) {
  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState('');
  const [hoveredRating, setHoveredRating] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const { addFeedback } = useFeedbackService();
  const { currentUser } = useUserService();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Por favor, selecciona una calificación');
      return;
    }

    if (!comment.trim()) {
      toast.error('Por favor, escribe un comentario');
      return;
    }

    if (!currentUser) {
      toast.error('Usuario no identificado');
      return;
    }

    setIsSubmitting(true);

    try {
      addFeedback({
        userId: currentUser.id,
        username: currentUser.name,
        userEmail: currentUser.email,
        rating,
        comment: comment.trim(),
        reportId,
        isFirstReport: true
      });

      toast.success('¡Gracias por tu feedback!', {
        description: 'Tu opinión nos ayuda a mejorar el sistema de seguridad.'
      });

      // Reset form
      setRating(0);
      setComment('');
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Error al enviar feedback', {
        description: 'Por favor, inténtalo de nuevo.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starNumber = index + 1;
      const isActive = starNumber <= (hoveredRating || rating);
      
      return (
        <button
          key={starNumber}
          type="button"
          className={`p-1 transition-all duration-150 ${
            isActive ? 'text-yellow-400 scale-110' : 'text-gray-300 hover:text-yellow-300'
          }`}
          onMouseEnter={() => setHoveredRating(starNumber)}
          onMouseLeave={() => setHoveredRating(0)}
          onClick={() => setRating(starNumber)}
        >
          <Star 
            className={`h-8 w-8 ${isActive ? 'fill-current' : ''}`} 
          />
        </button>
      );
    });
  };

  const getRatingText = () => {
    const currentRating = hoveredRating || rating;
    switch (currentRating) {
      case 1: return 'Muy Insatisfecho';
      case 2: return 'Insatisfecho';
      case 3: return 'Neutral';
      case 4: return 'Satisfecho';
      case 5: return 'Muy Satisfecho';
      default: return 'Selecciona tu calificación';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-blue-100 rounded-full">
              <Heart className="h-6 w-6 text-blue-600" />
            </div>
            ¿Qué tal te pareció nuestro sistema?
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Welcome message */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <MessageCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-blue-800 font-medium mb-1">
                  ¡Gracias por usar nuestro sistema de reportes!
                </p>
                <p className="text-blue-700 text-sm">
                  Acabas de completar tu primer reporte. Tu opinión es muy valiosa para mejorar 
                  la seguridad en el campus. Por favor, compártenos tu experiencia.
                </p>
              </div>
            </div>
          </div>

          {/* Rating Section */}
          <div className="text-center">
            <label className="block text-lg font-medium text-gray-700 mb-3">
              Califica tu experiencia
            </label>
            <div className="flex justify-center items-center gap-1 mb-2">
              {renderStars()}
            </div>
            <p className={`text-sm transition-all duration-200 ${
              (hoveredRating || rating) > 0 ? 'text-gray-700 font-medium' : 'text-gray-500'
            }`}>
              {getRatingText()}
            </p>
          </div>

          {/* Comment Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cuéntanos más sobre tu experiencia
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="¿Fue fácil usar el sistema? ¿El proceso fue claro? ¿Qué te gustó más? ¿Algo que podríamos mejorar?"
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                Comparte detalles sobre la facilidad de uso, claridad del proceso, etc.
              </p>
              <span className="text-xs text-gray-500">
                {comment.length}/500
              </span>
            </div>
          </div>

          {/* Privacy note */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <strong>Nota de privacidad:</strong> Este feedback es confidencial y solo será 
            visible para el equipo administrativo para mejorar el sistema. No se compartirá 
            con terceros.
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={handleSkip}
            disabled={isSubmitting}
          >
            Omitir por ahora
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0 || !comment.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              'Enviando...'
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Feedback
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}