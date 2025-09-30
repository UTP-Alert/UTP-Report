import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface DebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DebugPanel({ isOpen, onClose }: DebugPanelProps) {
  const [performance, setPerformance] = React.useState<any>({});
  const [errors, setErrors] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setPerformance({
          memory: (performance as any).memory ? {
            used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
            total: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024),
            limit: Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024)
          } : null,
          timing: window.performance.timing ? {
            loadTime: window.performance.timing.loadEventEnd - window.performance.timing.navigationStart,
            domReady: window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart
          } : null
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setErrors(prev => [...prev.slice(-9), `${event.filename}:${event.lineno} - ${event.message}`]);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] w-80">
      <Card className="border-yellow-500 bg-yellow-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-yellow-800">Debug Panel</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-yellow-800 hover:text-yellow-900"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Performance */}
          {performance.memory && (
            <div>
              <h4 className="font-medium text-yellow-800 mb-2">Memory Usage</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Used:</span>
                  <Badge variant="outline">{performance.memory.used} MB</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <Badge variant="outline">{performance.memory.total} MB</Badge>
                </div>
              </div>
            </div>
          )}

          {/* Timing */}
          {performance.timing && (
            <div>
              <h4 className="font-medium text-yellow-800 mb-2">Load Times</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Load:</span>
                  <Badge variant="outline">{performance.timing.loadTime} ms</Badge>
                </div>
                <div className="flex justify-between">
                  <span>DOM Ready:</span>
                  <Badge variant="outline">{performance.timing.domReady} ms</Badge>
                </div>
              </div>
            </div>
          )}

          {/* Errors */}
          <div>
            <h4 className="font-medium text-yellow-800 mb-2">Recent Errors</h4>
            <div className="max-h-32 overflow-y-auto">
              {errors.length === 0 ? (
                <p className="text-sm text-green-600">No errors</p>
              ) : (
                <div className="space-y-1">
                  {errors.map((error, index) => (
                    <div key={index} className="text-xs text-red-600 bg-red-50 p-1 rounded">
                      {error}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Clear Errors */}
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setErrors([])}
            className="w-full"
          >
            Clear Errors
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}