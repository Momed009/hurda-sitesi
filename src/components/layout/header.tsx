
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const navItems = [
  { href: '/', label: 'Ana Sayfa' },
  { href: '/services', label: 'Hizmetlerimiz' },
  { href: '/listings', label: 'İlanlar' },
  { href: '/portfolio', label: 'Yapılan İşler' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'İletişim' },
];

export default function Header({ siteName }: { siteName: string }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  const NavLinks = ({ isMobile = false }: { isMobile?: boolean }) => (
    <nav
      className={cn(
        'flex items-center gap-8 text-base font-semibold',
        isMobile && 'flex-col items-start gap-4'
      )}
    >
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => isMobile && setIsMobileMenuOpen(false)}
          className={cn(
            'relative py-1 transition-all duration-300 ease-out',
            'hover:-translate-y-0.5 hover:text-primary active:scale-95',
            "after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full",
            pathname === item.href ? 'text-primary after:w-full' : 'text-foreground/80'
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm transition-shadow duration-300">
      <div className="w-full px-4 md:px-8 lg:px-12 flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 transition-transform duration-300 hover:scale-105 active:scale-95">
          <div className="relative w-12 h-12 overflow-hidden rounded-full border border-primary/20 shadow-sm bg-white p-0.5">
            <Image 
                src="/logo.jpg" 
                alt="Temur Hurda Logo" 
                fill 
                className="object-contain"
            />
          </div>
          <span className="font-bold text-2xl tracking-tight">{siteName}</span>
        </Link>

        <div className="hidden md:flex">
          <NavLinks />
        </div>

        {isClient && (
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menüyü aç</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex flex-col gap-8 pt-8">
                   <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className="relative w-10 h-10 overflow-hidden rounded-full border border-primary/20 bg-white p-0.5">
                        <Image 
                            src="/logo.jpg" 
                            alt="Temur Hurda Logo" 
                            fill 
                            className="object-contain"
                        />
                      </div>
                      <span className="font-bold text-lg">{siteName}</span>
                  </Link>
                  <NavLinks isMobile />
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </header>
  );
}
