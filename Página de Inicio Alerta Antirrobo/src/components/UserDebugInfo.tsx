import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useUserService } from './services/UserService';
import { useReportService } from './services/ReportService';
import { User, FileText, RefreshCw } from 'lucide-react';

export function UserDebugInfo() {
  const { getUserByEmail } = useUserService();
  const { reports, getUserTodayReportsCount } = useReportService();
  
  // Obtener usuario logueado
  const loggedUser = getUserByEmail('U1234567@utp.edu.pe');
  const currentUserId = loggedUser?.email?.split('@')[0] || 'U1234567';
  const currentUserName = loggedUser?.name || 'Juan Pérez';
  
  // Filtrar reportes del usuario actual
  const userReports = Array.isArray(reports) ? reports.filter(report => 
    report?.reportedBy?.userName === currentUserName || 
    report?.reportedBy?.userId === currentUserId ||
    report?.reportedBy?.userEmail === loggedUser?.email ||
    (!report?.isAnonymous && report?.contactInfo?.includes(currentUserId.toLowerCase()))
  ) : [];

  const todayCount = getUserTodayReportsCount(currentUserId);

  return (
    <Card className="border-2 border-blue-200 bg-blue-50 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <User className="h-5 w-5" />
          Debug: Información del Usuario
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Usuario Logueado:</h4>
            <p><strong>Nombre:</strong> {currentUserName}</p>
            <p><strong>Email:</strong> {loggedUser?.email || 'No encontrado'}</p>
            <p><strong>ID:</strong> {currentUserId}</p>
            <p><strong>Usuario encontrado:</strong> {loggedUser ? '✅ Sí' : '❌ No'}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Reportes del Usuario:</h4>
            <p><strong>Total reportes:</strong> {userReports.length}</p>
            <p><strong>Reportes hoy:</strong> {todayCount}/3</p>
            <p><strong>Total reportes sistema:</strong> {reports.length}</p>
          </div>
        </div>

        {userReports.length > 0 && (
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Últimos reportes del usuario:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {userReports.slice(0, 3).map((report, index) => (
                <div key={report.id} className="bg-white p-2 rounded border text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{report.incidentType}</span>
                    <Badge variant="outline" className="text-xs">
                      {report.status}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mt-1">
                    Reportado por: {report.reportedBy?.userName || 'Anónimo'} 
                    ({report.reportedBy?.userId || 'Sin ID'})
                  </p>
                  <p className="text-gray-500">
                    {new Date(report.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-blue-200">
          <div className="flex items-center gap-2 text-xs text-blue-600">
            <RefreshCw className="h-3 w-3" />
            <span>Esta información se actualiza automáticamente</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}