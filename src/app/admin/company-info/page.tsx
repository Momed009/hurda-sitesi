'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import type { CompanyInfo } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  ownerFullName: z.string().min(3, { message: 'Firma sahibi adı en az 3 karakter olmalıdır.' }),
  ownerImageId: z.string().min(3, { message: "Görsel ID'si zorunludur." }),
  contactPhoneNumber: z.string().min(10, { message: 'Telefon numarası en az 10 karakter olmalıdır.' }),
  companyAddress: z.string().min(10, { message: 'Adres en az 10 karakter olmalıdır.' }),
  mapEmbedUrl: z.string().url({ message: 'Lütfen geçerli bir URL girin.' }).min(10, { message: 'Harita URL\'si zorunludur.' }),
  aboutUsContent: z.string().min(50, { message: 'Hakkımızda yazısı en az 50 karakter olmalıdır.' }),
  instagramUrl: z.string().url({ message: "Lütfen geçerli bir Instagram URL'si girin." }).optional().or(z.literal('')),
  facebookUrl: z.string().url({ message: "Lütfen geçerli bir Facebook URL'si girin." }).optional().or(z.literal('')),
});

type CompanyInfoFormValues = z.infer<typeof formSchema>;

export default function CompanyInfoPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const docRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'companyInfo', 'main');
  }, [firestore]);

  const { data: companyInfo, isLoading } = useDoc<CompanyInfo>(docRef);

  const form = useForm<CompanyInfoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        ownerFullName: '',
        ownerImageId: '',
        contactPhoneNumber: '',
        companyAddress: '',
        mapEmbedUrl: '',
        aboutUsContent: '',
        instagramUrl: '',
        facebookUrl: '',
    },
  });

  useEffect(() => {
    if (companyInfo) {
      form.reset(companyInfo);
    }
  }, [companyInfo, form]);

  const handleSubmit = async (data: CompanyInfoFormValues) => {
    if (!firestore) return;
    setIsSubmitting(true);
    try {
      const infoRef = doc(firestore, 'companyInfo', 'main');
      await setDocumentNonBlocking(infoRef, data, { merge: true });
      toast({
        title: 'Başarılı!',
        description: 'Firma bilgileri başarıyla güncellendi.',
      });
      router.refresh();
    } catch (error) {
      console.error('Error updating company info:', error);
      toast({
        variant: 'destructive',
        title: 'Hata!',
        description: 'Firma bilgileri güncellenirken bir hata oluştu.',
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">Firma Bilgileri & Hakkımızda</h1>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Hakkımızda Sayfası Yönetimi</CardTitle>
                <CardDescription>
                    Bu bölümdeki bilgileri güncelleyerek sitenizin "Hakkımızda" sayfasını ve alt bilgileri (footer) yönetebilirsiniz.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="ownerFullName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Firma Sahibi Adı Soyadı</FormLabel>
                                <FormControl>
                                    <Input placeholder="Örn: Mehmet Yılmaz" {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="ownerImageId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Firma Sahibi Görsel ID</FormLabel>
                                <FormControl>
                                    <Input placeholder="gorsel-id-123" {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormDescription>Görsel Yönetimi'nden ID kopyalayın.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="contactPhoneNumber"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>İletişim Telefon Numarası</FormLabel>
                            <FormControl>
                                <Input placeholder="Örn: 0555 123 45 67" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="companyAddress"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Firma Adresi</FormLabel>
                            <FormControl>
                                <Textarea rows={3} placeholder="Mahalle, sokak, numara, ilçe/il" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="mapEmbedUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Google Harita Gömme (Embed) URL'i</FormLabel>
                            <FormControl>
                                <Input placeholder="https://www.google.com/maps/embed?pb=..." {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormDescription>Google Haritalar'dan "Harita yerleştirme" seçeneği ile aldığınız &lt;iframe&gt; kodunun içindeki `src` linkini buraya yapıştırın.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="instagramUrl"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Instagram URL</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://www.instagram.com/kullaniciadi" {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="facebookUrl"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Facebook URL</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://www.facebook.com/sayfaadi" {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="aboutUsContent"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Hakkımızda Sayfası İçeriği</FormLabel>
                            <FormControl>
                                <Textarea rows={8} placeholder="Firmanızın misyonu, vizyonu ve tarihçesi hakkında detaylı bilgi verin." {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
        <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Değişiklikleri Kaydet
        </Button>
      </form>
    </Form>
  );
}

    
    