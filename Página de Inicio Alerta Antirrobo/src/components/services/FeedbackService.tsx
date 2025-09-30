import React, { createContext, useContext, useState, useCallback } from 'react';

export interface UserFeedback {
  id: string;
  userId: string;
  username: string;
  userEmail: string;
  rating: number; // 1-5 stars
  comment: string;
  timestamp: string;
  reportId?: string;
  isFirstReport: boolean;
}

interface FeedbackServiceContextType {
  feedbacks: UserFeedback[];
  addFeedback: (feedback: Omit<UserFeedback, 'id' | 'timestamp'>) => void;
  getUserFeedback: (userId: string) => UserFeedback[];
  getAllFeedbacks: () => UserFeedback[];
  hasUserProvidedFeedback: (userId: string) => boolean;
  markUserAsFeedbackProvided: (userId: string) => void;
  getUsersWhoProvidedFeedback: () => string[];
}

const FeedbackServiceContext = createContext<FeedbackServiceContextType | undefined>(undefined);

export function FeedbackServiceProvider({ children }: { children: React.ReactNode }) {
  const [feedbacks, setFeedbacks] = useState<UserFeedback[]>([
    // Mock data para demostración
    {
      id: 'fb-001',
      userId: 'user-001',
      username: 'Juan Pérez',
      userEmail: 'U1234567@utp.edu.pe',
      rating: 5,
      comment: 'Excelente sistema, muy fácil de usar y respuesta rápida del personal de seguridad.',
      timestamp: new Date('2024-01-15T10:30:00').toISOString(),
      reportId: 'report-001',
      isFirstReport: true
    },
    {
      id: 'fb-002',
      userId: 'user-002',
      username: 'María García',
      userEmail: 'U2345678@utp.edu.pe',
      rating: 4,
      comment: 'Muy buena herramienta para reportar incidentes. Me gustó poder subir fotos como evidencia.',
      timestamp: new Date('2024-01-14T15:45:00').toISOString(),
      reportId: 'report-002',
      isFirstReport: true
    },
    {
      id: 'fb-003',
      userId: 'user-003',
      username: 'Carlos Rodríguez',
      userEmail: 'U3456789@utp.edu.pe',
      rating: 5,
      comment: 'Perfecto! Pude reportar un incidente y recibí seguimiento inmediato. Muy seguro el sistema.',
      timestamp: new Date('2024-01-13T09:20:00').toISOString(),
      reportId: 'report-003',
      isFirstReport: true
    }
  ]);

  const [usersWhoProvidedFeedback, setUsersWhoProvidedFeedback] = useState<string[]>([
    'user-001', 'user-002', 'user-003'
  ]);

  const addFeedback = useCallback((feedbackData: Omit<UserFeedback, 'id' | 'timestamp'>) => {
    const newFeedback: UserFeedback = {
      ...feedbackData,
      id: `fb-${Date.now()}`,
      timestamp: new Date().toISOString()
    };

    setFeedbacks(prev => [newFeedback, ...prev]);
    setUsersWhoProvidedFeedback(prev => [...prev, feedbackData.userId]);
  }, []);

  const getUserFeedback = useCallback((userId: string) => {
    return feedbacks.filter(feedback => feedback.userId === userId);
  }, [feedbacks]);

  const getAllFeedbacks = useCallback(() => {
    return feedbacks.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [feedbacks]);

  const hasUserProvidedFeedback = useCallback((userId: string) => {
    return usersWhoProvidedFeedback.includes(userId);
  }, [usersWhoProvidedFeedback]);

  const markUserAsFeedbackProvided = useCallback((userId: string) => {
    setUsersWhoProvidedFeedback(prev => 
      prev.includes(userId) ? prev : [...prev, userId]
    );
  }, []);

  const value = {
    feedbacks,
    addFeedback,
    getUserFeedback,
    getAllFeedbacks,
    hasUserProvidedFeedback,
    markUserAsFeedbackProvided,
    getUsersWhoProvidedFeedback: () => usersWhoProvidedFeedback
  };

  return (
    <FeedbackServiceContext.Provider value={value}>
      {children}
    </FeedbackServiceContext.Provider>
  );
}

export function useFeedbackService() {
  const context = useContext(FeedbackServiceContext);
  if (context === undefined) {
    throw new Error('useFeedbackService must be used within a FeedbackServiceProvider');
  }
  return context;
}

// Helper function to get average rating
export function getAverageRating(feedbacks: UserFeedback[]): number {
  if (feedbacks.length === 0) return 0;
  const sum = feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
  return Math.round((sum / feedbacks.length) * 10) / 10; // Round to 1 decimal
}

// Helper function to get rating distribution
export function getRatingDistribution(feedbacks: UserFeedback[]): Record<number, number> {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  feedbacks.forEach(feedback => {
    distribution[feedback.rating as keyof typeof distribution]++;
  });
  return distribution;
}