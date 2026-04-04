'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          Bir Hata Oluştu
        </h2>
        <p className="text-muted-foreground mb-6">
          Sayfa yüklenirken beklenmedik bir hata meydana geldi. Lütfen tekrar deneyin.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>
            Tekrar Dene
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Ana Sayfaya Dön
          </Button>
        </div>
      </div>
    </div>
  );
}
