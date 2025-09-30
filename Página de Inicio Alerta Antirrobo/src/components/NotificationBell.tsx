import React from 'react';
import { Bell, BellRing, X, Clock, CheckCircle, AlertTriangle, Shield, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useNotificationService } from './services/NotificationService';

interface NotificationBellProps {
  userRole: 'user' | 'admin' | 'security';
}

export function NotificationBell({ userRole }: NotificationBellProps) {
  const { 
    notifications: allNotifications, 
    unreadCount: allUnreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotifications 
  } = useNotificationService();

  // Filter notifications based on user role and allowed statuses
  const filteredNotifications = React.useMemo(() => {
    if (userRole === 'user') {
      // Users should only see notifications about reports in allowed statuses:
      // - danger_zone: alertas de zonas peligrosas (3+ reportes)
      // - status_update: cuando su reporte pasa a investigación/proceso
      // - report_resolved: cuando su reporte se resuelve
      const allowedNotificationTypes = ['danger_zone', 'status_update', 'report_resolved'];
      return allNotifications.filter(notification => 
        allowedNotificationTypes.includes(notification.type)
      );
    }
    return allNotifications;
  }, [allNotifications, userRole]);

  const notifications = filteredNotifications;
  const unreadCount = filteredNotifications.filter(n => !n.read).length;

  const [isOpen, setIsOpen] = React.useState(false);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Hace un momento';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
    return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'high_priority':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'danger_zone':
        return <Zap className="h-4 w-4 text-orange-600" />;
      case 'assignment':
        return <Shield className="h-4 w-4 text-purple-600" />;
      case 'report_resolved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'status_update':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'high_priority':
        return 'bg-red-50 border-red-200';
      case 'danger_zone':
        return 'bg-orange-50 border-orange-200';
      case 'assignment':
        return 'bg-purple-50 border-purple-200';
      case 'report_resolved':
        return 'bg-green-50 border-green-200';
      case 'status_update':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`relative text-secondary-foreground hover:bg-white/10 hover:text-white transition-all ${
            unreadCount > 0 ? 'animate-pulse' : ''
          }`}
          aria-label={`Notificaciones${unreadCount > 0 ? ` - ${unreadCount} sin leer` : ''}`}
        >
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5 text-primary animate-bounce" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs animate-pulse"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-96 p-0 max-h-96" 
        side="bottom" 
        align="end"
        sideOffset={8}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notificaciones
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              <div className="flex gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      markAllAsRead();
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Marcar todas
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    clearNotifications();
                  }}
                  className="text-xs text-gray-600 hover:text-gray-700"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No hay notificaciones</p>
              </div>
            ) : (
              <ScrollArea className="max-h-80">
                <div className="space-y-1 p-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                        notification.read 
                          ? 'bg-gray-50 border-gray-200 opacity-75' 
                          : getNotificationBgColor(notification.type)
                      }`}
                      onClick={() => handleNotificationClick(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-medium break-words ${
                              notification.read ? 'text-gray-600' : 'text-gray-900'
                            }`}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                          {notification.description && (
                            <p className={`text-xs mt-1 break-words ${
                              notification.read ? 'text-gray-500' : 'text-gray-600'
                            }`}>
                              {notification.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            {formatTimeAgo(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}