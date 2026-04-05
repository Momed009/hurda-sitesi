import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center px-4 bg-background">
      <div className="relative w-24 h-24 mb-6 animate-spin" style={{ animationDuration: '8s' }}>
        <Image 
            src="/logo.jpg" 
            alt="Temur Hurda Logo" 
            fill 
            className="object-contain rounded-full"
        />
      </div>
      <h1 className="text-8xl font-bold text-primary">404</h1>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight">Sayfa Bulunamadı</h2>
      <p className="mt-2 text-lg text-muted-foreground max-w-md">
        Aradığınız sayfa mevcut değil veya taşınmış olabilir.
      </p>
      <Button asChild className="mt-8" size="lg">
        <Link href="/">Ana Sayfaya Dön</Link>
      </Button>
    </div>
  );
}
