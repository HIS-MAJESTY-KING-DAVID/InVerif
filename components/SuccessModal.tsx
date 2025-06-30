'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Create some animated circles for a simple celebration effect
  const circles = Array.from({ length: 12 }).map((_, i) => (
    <div 
      key={i}
      className="absolute w-2 h-2 rounded-full bg-blue-400 animate-float"
      style={{
        left: `${50 + Math.cos((i * 30 * Math.PI) / 180) * 40}%`,
        top: `${50 + Math.sin((i * 30 * Math.PI) / 180) * 40}%`,
        animationDelay: `${i * 0.1}s`,
      }}
    />
  ));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md overflow-hidden border-0 shadow-xl">
        <div className="relative bg-gradient-to-b from-white to-blue-50 p-6">
          {/* Animated background circles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {circles}
          </div>
          
          <div className="relative z-10 flex flex-col items-center justify-center space-y-6 py-6 text-center">
            {/* InVerif Branding */}
            <div className="mb-2">
              <div className="text-blue-600 font-bold text-xl tracking-tight">InVerif</div>
              <div className="h-1 w-12 bg-blue-400 mx-auto mt-1 rounded-full"></div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-blue-100 rounded-full opacity-75 animate-ping"></div>
              <div className="relative rounded-full bg-gradient-to-br from-blue-100 to-green-100 p-4 shadow-inner">
                <CheckCircle2 className="h-14 w-14 text-green-600 animate-scale-in" strokeWidth={1.5} />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900 animate-fade-in-up">
                Soumission réussie !
              </h3>
              <p className="text-sm text-gray-600 max-w-md animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                Vos documents ont été envoyés avec succès. Notre équipe va les examiner et vous contactera sous peu.
              </p>
            </div>
            
            <Button 
              onClick={onClose}
              className="mt-2 w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-md"
            >
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
