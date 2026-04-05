import Image from 'next/image';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
      <div className="relative w-16 h-16 animate-pulse">
        <Image 
            src="/logo.jpg" 
            alt="Yükleniyor" 
            fill 
            className="object-contain rounded-full border border-primary/10"
        />
      </div>
      <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">
        Yükleniyor...
      </p>
    </div>
  );
}
