'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { updatePassword } from 'firebase/auth';
import { useDoc, useFirestore, setDocumentNonBlocking, useMemoFirebase, useAuth, useUser } from '@/firebase';
import type { AdminSettings } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Lock, Save, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  adminUsername: z.string().min(3, { message: 'Kullanıcı adı en az 3 karakter olmalıdır.' }),
  newPassword: z.string().min(6, { message: 'Yeni şifre en az 6 karakter olmalıdır.' }).optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
}).refine((data) => {
    if (data.newPassword && data.newPassword !== data.confirmPassword) {
        return false;
    }
    return true;
}, {
    message: "Şifreler eşleşmiyor.",
    path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof formSchema>;

export default function AdminProfilePage() {
  const router = useRouter();
  const firestore = useFirestore();
  const auth = useAuth();
  const { user } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const docRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'adminSettings', 'main');
  }, [firestore]);

  const { data: adminSettings, isLoading } = useDoc<AdminSettings>(docRef);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        adminUsername: 'temur',
        newPassword: '',
        confirmPassword: '',
    },
  });

  useEffect(() => {
    if (adminSettings) {
      form.reset({
          adminUsername: adminSettings.adminUsername || 'temur',
          newPassword: '',
          confirmPassword: '',
      });
    }
  }, [adminSettings, form]);

  const handleSubmit = async (data: ProfileFormValues) => {
    if (!firestore || !auth.currentUser) return;
    setIsSubmitting(true);
    
    try {
      // 1. Update Username in Firestore
      const settingsRef = doc(firestore, 'adminSettings', 'main');
      await setDocumentNonBlocking(settingsRef, { 
          adminUsername: data.adminUsername,
          adminEmail: auth.currentUser.email // Keep current email for auth
      }, { merge: true });

      // 2. Update Password if provided
      if (data.newPassword) {
          try {
              await updatePassword(auth.currentUser, data.newPassword);
              toast({
                  title: 'Şifre Güncellendi',
                  description: 'Şifreniz başarıyla değiştirildi.',
              });
          } catch (passError: any) {
              if (passError.code === 'auth/requires-recent-login') {
                  toast({
                      variant: 'destructive',
                      title: 'Güvenlik Hatası',
                      description: 'Şifre değiştirmek için yeni giriş yapmış olmanız gerekiyor. Lütfen çıkış yapıp tekrar girin.',
                  });
                  setIsSubmitting(false);
                  return;
              }
              throw passError;
          }
      }

      toast({
        title: 'Profil Güncellendi',
        description: 'Admin ayarlarınız başarıyla kaydedildi.',
      });
      
      form.reset({
          ...data,
          newPassword: '',
          confirmPassword: '',
      });
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Hata!',
        description: 'Profil güncellenirken bir hata oluştu.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <User className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Admin Hesabı Ayarları</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Giriş Bilgileri</CardTitle>
              <CardDescription>
                Panel girişinde kullandığınız kullanıcı adı ve şifreyi buradan yönetin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="adminUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kullanıcı Adı</FormLabel>
                    <FormControl>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input className="pl-10" placeholder="Örn: temur" {...field} />
                        </div>
                    </FormControl>
                    <FormDescription>Giriş yaparken bu ismi kullanacaksınız.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                      <Lock className="w-4 h-4" /> Şifre Değiştir
                  </h3>
                  <div className="grid gap-4">
                    <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Yeni Şifre</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} placeholder="••••••" />
                            </FormControl>
                            <FormDescription>Değiştirmek istemiyorsanız boş bırakın.</FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Yeni Şifre (Yeniden)</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} placeholder="••••••" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                  </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg p-4 flex gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 dark:text-amber-300 space-y-1">
                  <p className="font-bold">Önemli Güvenlik Notu:</p>
                  <p>Şifre değişikliği yaptıktan sonra, yeni şifrenizle giriş yapmanız gerekecektir. Güvenlik nedeniyle tarayıcınız sizi otomatik olarak tekrar giriş yapmaya zorlayabilir.</p>
              </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto gap-2">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Ayarları Kaydet
          </Button>
        </form>
      </Form>
    </div>
  );
}
