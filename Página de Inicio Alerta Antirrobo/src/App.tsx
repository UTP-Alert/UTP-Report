import React from 'react';
import { Navigation } from './components/Navigation';
import { HomePage } from './components/HomePage';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { SecurityDashboard } from './components/SecurityDashboard';
import { SuperuserDashboard } from './components/SuperuserDashboard';
import { ZonasPage } from './components/pages/ZonasPage';
import { LoginPage } from './components/pages/LoginPage';
import { UserManagementPage } from './components/pages/UserManagementPage';
import { SensitiveReportsPage } from './components/pages/SensitiveReportsPage';
import { SoportePage } from './components/pages/SoportePage';
import { ReportModal } from './components/ReportModal';
import { QuickAccessPanel } from './components/QuickAccessPanel';
import { DebugPanel } from './components/DebugPanel';
import { ReportServiceProvider } from './components/services/ReportService';
import { SecurityServiceProvider } from './components/services/SecurityService';
import { UserServiceProvider } from './components/services/UserService';
import { SystemConfigServiceProvider } from './components/services/SystemConfigService';
import { NotificationServiceProvider, useNotificationService } from './components/services/NotificationService';
import { WorkflowServiceProvider } from './components/services/WorkflowService';
import { FeedbackServiceProvider } from './components/services/FeedbackService';
import { Toaster } from './components/ui/sonner';

type UserRole = 'public' | 'user' | 'admin' | 'security' | 'superuser';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Algo salió mal</h1>
            <p className="text-gray-600 mb-6">Ha ocurrido un error inesperado. Por favor, recarga la página.</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
            >
              Recargar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Component
const LoadingSpinner = ({ message = "Cargando..." }: { message?: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

function AppContent() {
  const [currentPage, setCurrentPage] = React.useState('login');
  const [userRole, setUserRole] = React.useState<UserRole>('public');
  const [isReportModalOpen, setIsReportModalOpen] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [pageError, setPageError] = React.useState<string | null>(null);
  const [showDebugPanel, setShowDebugPanel] = React.useState(false);
  
  // Use notification service with error handling
  const notificationService = useNotificationService();

  // Debug panel keyboard shortcut
  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ctrl + Shift + D to toggle debug panel
      if (event.ctrlKey && event.shiftKey && event.code === 'KeyD') {
        event.preventDefault();
        setShowDebugPanel(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const openReportModal = React.useCallback(() => {
    setIsReportModalOpen(true);
  }, []);

  const closeReportModal = React.useCallback(() => {
    setIsReportModalOpen(false);
  }, []);

  const handleRoleChange = React.useCallback((newRole: UserRole) => {
    try {
      setIsLoading(true);
      setPageError(null);
      
      setUserRole(newRole);
      if (notificationService?.setCurrentUserRole) {
        notificationService.setCurrentUserRole(newRole);
      }
      setIsLoggedIn(true);
      setCurrentPage('inicio');
      
      setTimeout(() => setIsLoading(false), 100);
    } catch (error) {
      console.error('Error changing role:', error);
      setPageError('Error al cambiar de rol');
      setIsLoading(false);
    }
  }, [notificationService]);

  const handleLogout = React.useCallback(() => {
    try {
      setIsLoading(true);
      setPageError(null);
      
      setIsLoggedIn(false);
      setUserRole('public');
      if (notificationService?.setCurrentUserRole) {
        notificationService.setCurrentUserRole('public');
      }
      setCurrentPage('login');
      
      setTimeout(() => setIsLoading(false), 100);
    } catch (error) {
      console.error('Error during logout:', error);
      setPageError('Error al cerrar sesión');
      setIsLoading(false);
    }
  }, [notificationService]);

  const handlePageChange = React.useCallback((page: string) => {
    try {
      setPageError(null);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error changing page:', error);
      setPageError('Error al cambiar de página');
    }
  }, []);

  const renderCurrentPage = React.useCallback(() => {
    try {
      // Always show login if not logged in
      if (!isLoggedIn) {
        return (
          <ErrorBoundary>
            <LoginPage 
              currentUserRole={userRole} 
              onRoleSelect={handleRoleChange}
            />
          </ErrorBoundary>
        );
      }

      const pageProps = {
        onOpenReport: openReportModal,
        onPageChange: handlePageChange,
        userRole
      };

      // Route based on user role and current page
      switch (userRole) {
        case 'superuser':
          switch (currentPage) {
            case 'inicio':
              return <SuperuserDashboard onOpenReport={openReportModal} />;
            case 'usuarios':
              return <UserManagementPage />;
            case 'reportes-sensibles':
              return <SensitiveReportsPage userRole={userRole} />;
            case 'zonas':
              return <ZonasPage onOpenReport={openReportModal} userRole={userRole} />;
            case 'login':
              return <LoginPage currentUserRole={userRole} onRoleSelect={handleRoleChange} />;
            default:
              return <SuperuserDashboard onOpenReport={openReportModal} />;
          }

        case 'admin':
          switch (currentPage) {
            case 'inicio':
              return <AdminDashboard onOpenReport={openReportModal} />;
            case 'zonas':
              return <ZonasPage onOpenReport={openReportModal} userRole={userRole} />;
            case 'login':
              return <LoginPage currentUserRole={userRole} onRoleSelect={handleRoleChange} />;
            default:
              return <AdminDashboard onOpenReport={openReportModal} />;
          }

        case 'security':
          switch (currentPage) {
            case 'inicio':
              return <SecurityDashboard onOpenReport={openReportModal} />;
            case 'zonas':
              return <ZonasPage onOpenReport={openReportModal} userRole={userRole} />;
            case 'login':
              return <LoginPage currentUserRole={userRole} onRoleSelect={handleRoleChange} />;
            default:
              return <SecurityDashboard onOpenReport={openReportModal} />;
          }

        case 'user':
          switch (currentPage) {
            case 'inicio':
              return <UserDashboard onOpenReport={openReportModal} onPageChange={handlePageChange} />;
            case 'zonas':
              return <ZonasPage onOpenReport={openReportModal} userRole={userRole} />;
            case 'guia':
              return <SoportePage onOpenReport={openReportModal} isGuideMode={true} />;
            case 'login':
              return <LoginPage currentUserRole={userRole} onRoleSelect={handleRoleChange} />;
            default:
              return <UserDashboard onOpenReport={openReportModal} onPageChange={handlePageChange} />;
          }

        default: // 'public'
          switch (currentPage) {
            case 'inicio':
              return <HomePage onOpenReport={openReportModal} onPageChange={handlePageChange} />;
            case 'zonas':
              return <ZonasPage onOpenReport={openReportModal} userRole={userRole} />;
            case 'login':
              return <LoginPage currentUserRole={userRole} onRoleSelect={handleRoleChange} />;
            default:
              return <HomePage onOpenReport={openReportModal} onPageChange={handlePageChange} />;
          }
      }
    } catch (error) {
      console.error('Error rendering page:', error);
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error de Página</h1>
            <p className="text-gray-600 mb-6">No se pudo cargar la página solicitada.</p>
            <button 
              onClick={() => {
                setPageError(null);
                setCurrentPage('inicio');
              }}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 mr-4"
            >
              Volver al Inicio
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Recargar Página
            </button>
          </div>
        </div>
      );
    }
  }, [userRole, currentPage, isLoggedIn, openReportModal, handlePageChange, handleRoleChange]);

  // Show loading spinner during transitions
  if (isLoading) {
    return <LoadingSpinner message="Cargando página..." />;
  }

  // Show error state if there's a page error
  if (pageError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{pageError}</p>
          <button 
            onClick={() => {
              setPageError(null);
              setCurrentPage('inicio');
            }}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="size-full">
      <ErrorBoundary>
        {/* Only show navigation when logged in */}
        {isLoggedIn && (
          <Navigation 
            currentPage={currentPage} 
            onPageChange={handlePageChange}
            onOpenReport={openReportModal}
            userRole={userRole}
            onLogout={handleLogout}
          />
        )}
        
        {/* Main content */}
        <ErrorBoundary>
          {renderCurrentPage()}
        </ErrorBoundary>
        
        {/* Report Modal */}
        <ErrorBoundary>
          <ReportModal 
            isOpen={isReportModalOpen} 
            onClose={closeReportModal} 
          />
        </ErrorBoundary>
        
        {/* Quick Access Panel */}
        <ErrorBoundary>
          <QuickAccessPanel 
            currentRole={userRole}
            onRoleChange={handleRoleChange}
            isLoggedIn={isLoggedIn}
            currentPage={currentPage}
          />
        </ErrorBoundary>

        {/* Toast notifications */}
        <Toaster />

        {/* Debug Panel (Ctrl+Shift+D) */}
        <DebugPanel 
          isOpen={showDebugPanel}
          onClose={() => setShowDebugPanel(false)}
        />
      </ErrorBoundary>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SystemConfigServiceProvider>
        <NotificationServiceProvider>
          <UserServiceProvider>
            <FeedbackServiceProvider>
              <ReportServiceProvider>
                <SecurityServiceProvider>
                  <WorkflowServiceProvider>
                    <AppContent />
                  </WorkflowServiceProvider>
                </SecurityServiceProvider>
              </ReportServiceProvider>
            </FeedbackServiceProvider>
          </UserServiceProvider>
        </NotificationServiceProvider>
      </SystemConfigServiceProvider>
    </ErrorBoundary>
  );
}