import React from 'react';
import { ReportModal } from './ReportModal';
import { FirstReportFeedbackModal } from './FirstReportFeedbackModal';
import { useReportService } from './services/ReportService';
import { useFeedbackService } from './services/FeedbackService';
import { useUserService } from './services/UserService';

interface ReportModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReportModalWrapper({ isOpen, onClose }: ReportModalWrapperProps) {
  const [showFeedbackModal, setShowFeedbackModal] = React.useState(false);
  const [pendingReportId, setPendingReportId] = React.useState<string | null>(null);
  
  const { isUserFirstReport } = useReportService();
  const { hasUserProvidedFeedback } = useFeedbackService();
  const { getUserByEmail } = useUserService();

  // Get current user
  const loggedUser = getUserByEmail('U1234567@utp.edu.pe');
  const currentUser = {
    id: loggedUser?.id || 'user_demo',
    name: loggedUser?.name || 'Juan Pérez',
    email: loggedUser?.email || 'U1234567@utp.edu.pe',
    studentId: loggedUser?.email?.split('@')[0] || 'U1234567'
  };

  // Listen for successful report submissions
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'newReportSubmitted' && e.newValue) {
        const reportData = JSON.parse(e.newValue);
        
        // Check if should show feedback
        const shouldShowFeedback = !reportData.isAnonymous && 
                                   isUserFirstReport(currentUser.id) && 
                                   !hasUserProvidedFeedback(currentUser.id);

        if (shouldShowFeedback) {
          setPendingReportId(reportData.id || `report-${Date.now()}`);
          setTimeout(() => {
            setShowFeedbackModal(true);
          }, 1000);
        }

        // Clear the storage
        localStorage.removeItem('newReportSubmitted');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentUser.id, isUserFirstReport, hasUserProvidedFeedback]);

  const handleReportModalClose = () => {
    onClose();
  };

  const handleFeedbackModalClose = () => {
    setShowFeedbackModal(false);
    setPendingReportId(null);
  };

  return (
    <>
      <ReportModal 
        isOpen={isOpen} 
        onClose={handleReportModalClose}
      />
      
      <FirstReportFeedbackModal
        isOpen={showFeedbackModal}
        onClose={handleFeedbackModalClose}
        reportId={pendingReportId || undefined}
      />
    </>
  );
}