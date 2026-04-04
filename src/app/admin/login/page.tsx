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
import { Recycle, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useToast } from '@/hooks/use-toast';
import { useAuth, useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { doc } from 'firebase/firestore';

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/admin');
    }
  }, [user, isUserLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (username.toLowerCase() !== 'temur') {
        toast({
            variant: 'destructive',
            title: 'Giriş Başarısız',
            description: 'Kullanıcı adı yanlış.',
        });
        setIsSubmitting(false);
        return;
    }
    
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Veritabanı bağlantısı kurulamadı. Lütfen tekrar deneyin.' });
      setIsSubmitting(false);
      return;
    }

    const email = 'temur@atikrehber.com';

    try {
      await signInWithEmailAndPassword(auth, email, password);
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
              toast({
                variant: 'destructive',
                title: 'Giriş Başarısız',
                description: 'Girilen şifre yanlış.',
              });
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
          <Recycle className="mx-auto h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-2xl">Yönetici Paneli</CardTitle>
          <CardDescription>
            Devam etmek için giriş yapın
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
