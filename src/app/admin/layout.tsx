'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Newspaper, Settings, LogOut, Package, Image as ImageIcon, Info, Wrench, FolderOpen, User, Recycle, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Kontrol Paneli', icon: Home },
  { href: '/admin/blog', label: 'Blog Yazıları', icon: Newspaper },
  { href: '/admin/services', label: 'Hizmetler', icon: Wrench },
  { href: '/admin/listings', label: 'Ürün İlanları', icon: Package },
  { href: '/admin/portfolio', label: 'Yapılan İşler', icon: FolderOpen },
  { href: '/admin/images', label: 'Görsel Yönetimi', icon: ImageIcon },
  { href: '/admin/company-info', label: 'Firma Bilgileri', icon: Info },
  { href: '/admin/site-settings', label: 'Site Ayarları', icon: Settings },
  { href: '/admin/profile', label: 'Hesap Ayarları', icon: User },
];

function NavContent({ onLinkClick }: { onLinkClick?: () => void }) {
    const pathname = usePathname();
    const router = useRouter();
    const auth = useAuth();
    const { user } = useUser();
    const { toast } = useToast();

    const handleLogout = async () => {
        try {
            if (onLinkClick) onLinkClick();
            await signOut(auth);
            toast({ title: 'Başarıyla çıkış yaptınız.' });
            router.replace('/admin/login');
        } catch (error) {
            console.error("Logout error:", error);
            toast({ variant: 'destructive', title: 'Çıkış yapılırken bir hata oluştu.' });
        }
    };
    
    return (
        <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/admin" className="flex items-center gap-2 font-semibold">
                    <Recycle className="h-6 w-6 text-primary" />
                    <span>Yönetim Paneli</span>
                </Link>
            </div>
            <div className="flex-1">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                    {navItems.map((item) => {
                        const isActive = item.href === '/admin' 
                            ? pathname === item.href 
                            : pathname.startsWith(item.href);
                        
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onLinkClick}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                                    isActive && 'bg-muted text-primary'
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="mt-auto p-4">
                 <div className='p-2 mb-2 border rounded-lg'>
                    <div className='flex items-center gap-3'>
                        <div className='flex flex-col'>
                            <span className='text-sm font-medium'>{user?.displayName || 'Admin'}</span>
                            <span className='text-xs text-muted-foreground'>{user?.email}</span>
                        </div>
                    </div>
                </div>
                <Button type="button" size="sm" variant="outline" className="w-full justify-start gap-2 cursor-pointer relative z-50 pointer-events-auto" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    Çıkış Yap
                </Button>
            </div>
        </div>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const isLoginPage = pathname === '/admin/login';

    useEffect(() => {
        // Yönlendirme döngüsünü kırmak için, bu kontrolü sadece giriş sayfasında DEĞİLSEK yap.
        if (!isLoginPage && !isUserLoading && !user) {
            router.push('/admin/login');
        }
    }, [isLoginPage, user, isUserLoading, router]);

    // Eğer gösterilecek sayfa giriş sayfasıysa, hiçbir koruma veya ek layout olmadan doğrudan onu render et.
    // Giriş sayfası kendi içinde, zaten giriş yapmış bir kullanıcıyı yönlendirme mantığını barındırıyor.
    if (isLoginPage) {
        return <>{children}</>;
    }

    // Eğer korunmuş bir sayfadaysak ve kullanıcı durumu hala yükleniyorsa veya kullanıcı yoksa
    // (ve yönlendirilmek üzereyse), tam ekran bir yükleme göstergesi göster.
    // Bu, arayüzün anlık olarak "yanıp sönmesini" engeller.
    if (isUserLoading || !user) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Recycle className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    // Bu noktaya ulaşıldıysa, kullanıcı doğrulanmış ve korunmuş bir sayfada demektir.
    // Tam yönetici panelini güvenle render et.
    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-muted/40 md:block">
                <NavContent />
            </div>
            <div className="flex flex-col">
                <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:hidden">
                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                            <Button size="icon" variant="outline" className="shrink-0">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col p-0">
                           <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                           <NavContent onLinkClick={() => setIsSheetOpen(false)} />
                        </SheetContent>
                    </Sheet>
                    <div className="w-full flex-1">
                        <h1 className="text-lg font-semibold">Yönetim Paneli</h1>
                    </div>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
