'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Recycle, Loader2, ArrowLeft, ShieldAlert, Timer } from "lucide-react";
import Link from "next/link";
import { useToast } from '@/hooks/use-toast';
import { useAuth, useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { doc, getDoc } from 'firebase/firestore';
import type { AdminSettings } from '@/lib/types';

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Brute-force koruması ---
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 dakika

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // Sayfa yüklendiğinde localStorage'dan oku
  useEffect(() => {
    const stored = localStorage.getItem('admin_login_lockout');
    if (stored) {
      const parsed = JSON.parse(stored);
      const now = Date.now();
      if (parsed.lockoutUntil && parsed.lockoutUntil > now) {
        setLockoutUntil(parsed.lockoutUntil);
        setFailedAttempts(parsed.failedAttempts);
      } else if (parsed.failedAttempts > 0 && !parsed.lockoutUntil) {
        setFailedAttempts(parsed.failedAttempts);
      } else {
        // Süre dolmuş, temizle
        localStorage.removeItem('admin_login_lockout');
      }
    }
  }, []);

  // Geri sayım timer'ı
  useEffect(() => {
    if (!lockoutUntil) {
      setRemainingSeconds(0);
      return;
    }

    const tick = () => {
      const diff = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
      setRemainingSeconds(diff);
      if (diff <= 0) {
        // Süre doldu, kilidi kaldır
        setLockoutUntil(null);
        setFailedAttempts(0);
        localStorage.removeItem('admin_login_lockout');
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const registerFailedAttempt = () => {
    const newCount = failedAttempts + 1;
    setFailedAttempts(newCount);

    if (newCount >= MAX_ATTEMPTS) {
      const until = Date.now() + LOCKOUT_DURATION_MS;
      setLockoutUntil(until);
      localStorage.setItem('admin_login_lockout', JSON.stringify({ failedAttempts: newCount, lockoutUntil: until }));
      toast({
        variant: 'destructive',
        title: '🔒 Hesap Kilitlendi',
        description: `Çok fazla başarısız deneme yaptınız. 5 dakika bekleyin.`,
      });
    } else {
      localStorage.setItem('admin_login_lockout', JSON.stringify({ failedAttempts: newCount, lockoutUntil: null }));
      toast({
        variant: 'destructive',
        title: 'Giriş Başarısız',
        description: `Kalan deneme hakkı: ${MAX_ATTEMPTS - newCount}`,
      });
    }
  };

  const isLockedOut = lockoutUntil !== null && lockoutUntil > Date.now();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/admin');
    }
  }, [user, isUserLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Kilitlenme kontrolü
    if (isLockedOut) {
      toast({
        variant: 'destructive',
        title: '🔒 Hesap Kilitli',
        description: `Lütfen ${Math.ceil(remainingSeconds / 60)} dakika bekleyin.`,
      });
      return;
    }

    setIsSubmitting(true);

    if (!firestore) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Veritabanı bağlantısı kurulamadı. Lütfen tekrar deneyin.' });
      setIsSubmitting(false);
      return;
    }

    // Kullanıcı adını veritabanından çek (veya varsayılan 'temur'u kullan)
    let storedUsername = 'temur';
    try {
        const settingsRef = doc(firestore, 'adminSettings', 'main');
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
            const data = settingsSnap.data() as AdminSettings;
            if (data.adminUsername) {
                storedUsername = data.adminUsername;
            }
        }
    } catch (e) {
        console.warn("Admin kullanıcı adı veritabanından çekilemedi, varsayılana ('temur') güveniliyor.");
    }

    if (username.trim().toLowerCase() !== storedUsername.toLowerCase()) {
        registerFailedAttempt();
        setIsSubmitting(false);
        return;
    }

    const email = 'temur@atikrehber.com';

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Başarılı giriş - deneme sayacını sıfırla
      setFailedAttempts(0);
      setLockoutUntil(null);
      localStorage.removeItem('admin_login_lockout');
      toast({
        title: 'Giriş Başarılı',
        description: 'Yönetici paneline yönlendiriliyorsunuz.',
      });
    } catch (signInError) {
      if (signInError instanceof FirebaseError && (signInError.code === 'auth/invalid-credential' || signInError.code === 'auth/user-not-found')) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          
          // On first-time sign-up, create an entry in the roles_admin collection
          if (userCredential.user) {
            const adminRoleRef = doc(firestore, 'roles_admin', userCredential.user.uid);
            setDocumentNonBlocking(adminRoleRef, {
              email: userCredential.user.email,
              createdAt: new Date().toISOString()
            }, {});
          }

          toast({
            title: 'Admin Hesabı Oluşturuldu',
            description: 'İlk girişinizde yönetici hesabınız oluşturuldu ve yetkilendirildi.',
          });
        } catch (signUpError) {
          if (signUpError instanceof FirebaseError) {
            if (signUpError.code === 'auth/email-already-in-use') {
              registerFailedAttempt();
            } else if (signUpError.code === 'auth/weak-password') {
              toast({
                variant: 'destructive',
                title: 'Kayıt Başarısız',
                description: 'Şifre en az 6 karakter olmalıdır.',
              });
            } else {
              console.error(signUpError);
              toast({ variant: 'destructive', title: 'Beklenmedik Bir Hata Oluştu', description: signUpError.message });
            }
          } else {
            console.error(signUpError);
            toast({ variant: 'destructive', title: 'Beklenmedik Bir Hata Oluştu' });
          }
        }
      } else if (signInError instanceof FirebaseError) {
        console.error(signInError);
        toast({ variant: 'destructive', title: 'Giriş Hatası', description: signInError.message });
      }
       else {
        console.error(signInError);
        toast({ variant: 'destructive', title: 'Giriş Hatası', description: 'Giriş sırasında bir hata oluştu.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isUserLoading || user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Recycle className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative p-4 bg-muted/20">
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
        <Button variant="ghost" asChild className="gap-2 text-muted-foreground hover:text-primary">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Ana Sayfaya Dön
          </Link>
        </Button>
      </div>
      <Card className="mx-auto w-full max-w-sm shadow-lg border-border/50">
        <CardHeader className="text-center pt-8">
          <Recycle className={`mx-auto h-12 w-12 mb-2 ${isLockedOut ? 'text-destructive' : 'text-primary'}`} />
          <CardTitle className="text-2xl">Yönetici Paneli</CardTitle>
          <CardDescription>
            {isLockedOut ? 'Hesap geçici olarak kilitlendi' : 'Devam etmek için giriş yapın'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Kilitlenme uyarısı */}
          {isLockedOut && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-center space-y-2 animate-in fade-in">
              <ShieldAlert className="w-8 h-8 text-destructive mx-auto" />
              <p className="text-sm font-bold text-destructive">Çok fazla başarısız deneme!</p>
              <div className="flex items-center justify-center gap-2 text-destructive">
                <Timer className="w-4 h-4" />
                <span className="text-2xl font-mono font-bold">
                  {Math.floor(remainingSeconds / 60).toString().padStart(2, '0')}:{(remainingSeconds % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">sonra tekrar deneyebilirsiniz.</p>
            </div>
          )}

          {/* Kalan deneme hakkı uyarısı */}
          {!isLockedOut && failedAttempts > 0 && failedAttempts < MAX_ATTEMPTS && (
            <div className="mb-4 p-2.5 bg-amber-100 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-lg text-center">
              <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                ⚠️ Kalan deneme hakkı: <span className="font-bold">{MAX_ATTEMPTS - failedAttempts}</span>
              </p>
            </div>
          )}

          <form onSubmit={handleLogin} autoComplete="off">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Kullanıcı Adı</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Kullanıcı adınız"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isSubmitting || isLockedOut}
                  autoComplete="off"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Şifre</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting || isLockedOut}
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting || isLockedOut}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLockedOut ? '🔒 Kilitli' : isSubmitting ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
