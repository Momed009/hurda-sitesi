import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
      <div className="relative">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <div className="absolute inset-0 flex items-center justify-center">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">
        Yükleniyor...
      </p>
    </div>
  );
}
