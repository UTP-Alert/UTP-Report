import React from 'react';
import { Button } from './ui/button';
import { Phone, AlertTriangle } from 'lucide-react';

export function SOSButton() {
  const handleSOSClick = () => {
    // Aquí se puede agregar lógica para llamadas de emergencia
    // Por ejemplo, llamar a números de emergencia, enviar ubicación, etc.
    if (window.confirm('¿Estás en una situación de emergencia?\n\nPresiona OK para llamar al 911 o CANCELAR para contactar a seguridad universitaria.')) {
      // Llamar al 911
      window.open('tel:911', '_self');
    } else {
      // Contactar seguridad universitaria (número ejemplo)
      window.open('tel:+1234567890', '_self');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={handleSOSClick}
        size="lg"
        className="bg-red-600 hover:bg-red-700 text-white shadow-2xl border-4 border-white h-20 w-20 rounded-full p-0 animate-pulse"
        aria-label="Botón de emergencia SOS - Presiona para contactar servicios de emergencia"
      >
        <div className="flex flex-col items-center gap-1">
          <Phone className="h-6 w-6" />
          <span className="font-black text-sm">SOS</span>
        </div>
      </Button>
      
      {/* Indicador de pulsación */}
      <div className="absolute inset-0 bg-red-600 rounded-full animate-ping opacity-30 pointer-events-none"></div>
    </div>
  );
}