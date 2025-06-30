import { useState, useCallback } from 'react';

export const useTesseract = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkReadability = useCallback(async (file: File): Promise<{ isReadable: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Skip non-image files for now (PDF support requires additional setup)
      if (!file.type.startsWith('image/')) {
        return { isReadable: true }; // Assume non-image files are readable
      }

      // Dynamic import to avoid SSR issues
      const Tesseract = (await import('tesseract.js')).default;
      
      const worker = await Tesseract.createWorker({
        logger: (m: { status: string; progress: number; }) => 
          console.log(m.status, m.progress),
      });
      
      await worker.loadLanguage('fra+eng');
      await worker.initialize('fra+eng');
      
      const { data } = await worker.recognize(file);
      await worker.terminate();
      
      // Basic readability check
      const text = data.text.trim();
      const confidence = data.confidence;
      const hasEnoughText = text.length > 20; // At least 20 characters
      const hasGoodConfidence = confidence > 60; // At least 60% confidence
      
      if (!hasEnoughText) {
        return { 
          isReadable: false, 
          error: 'Document ne contient pas assez de texte lisible.' 
        };
      }
      
      if (!hasGoodConfidence) {
        return { 
          isReadable: false, 
          error: 'La qualité du document est trop faible pour être lue correctement.' 
        };
      }
      
      return { isReadable: true };
      
    } catch (err) {
      console.error('OCR Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      return { 
        isReadable: false, 
        error: `Erreur lors de la vérification du document: ${errorMessage}` 
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { checkReadability, isLoading, error };
};
