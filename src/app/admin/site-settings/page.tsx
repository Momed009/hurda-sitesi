'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import type { SiteSetting } from '@/lib/types';
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  // Genel
  siteName: z.string().min(3, 'Site adı zorunludur.'),
  whatsappPhoneNumber: z.string().min(10, 'WhatsApp numarası zorunludur.'),
  contactEmail: z.string().email('Geçerli bir e-posta adresi girin.').optional().or(z.literal('')),
  
  // Ana Sayfa
  homepageHeroTitle: z.string().min(10, 'Ana sayfa başlığı zorunludur.'),
  homepageHeroSubtitle: z.string().min(10, 'Ana sayfa alt başlığı zorunludur.'),
  homepageHeroImageId: z.string().min(3, 'Ana sayfa görsel ID\'si zorunludur.'),
  homepageServicesTitle: z.string().min(10, 'Hizmetler bölüm başlığı zorunludur.'),
  homepageServicesSubtitle: z.string().min(10, 'Hizmetler bölüm alt başlığı zorunludur.'),
  homepageWhyUsTitle: z.string().min(10, 'Neden Biz bölüm başlığı zorunludur.'),
  homepageWhyUsSubtitle: z.string().min(10, 'Neden Biz bölüm alt başlığı zorunludur.'),
  whyUsItem1Title: z.string().min(3, 'Madde 1 başlığı zorunludur.'),
  whyUsItem1Text: z.string().min(10, 'Madde 1 metni zorunludur.'),
  whyUsItem2Title: z.string().min(3, 'Madde 2 başlığı zorunludur.'),
  whyUsItem2Text: z.string().min(10, 'Madde 2 metni zorunludur.'),
  whyUsItem3Title: z.string().min(3, 'Madde 3 başlığı zorunludur.'),
  whyUsItem3Text: z.string().min(10, 'Madde 3 metni zorunludur.'),
  
  // Hizmetler Sayfası
  servicesPageTitle: z.string().min(10, 'Hizmetler sayfası başlığı zorunludur.'),
  servicesPageSubtitle: z.string().min(10, 'Hizmetler sayfası alt başlığı zorunludur.'),
  servicesIndustrialTitle: z.string().min(10, 'Sanayi bölümü başlığı zorunludur.'),
  servicesIndustrialText: z.string().min(10, 'Sanayi bölümü metni zorunludur.'),
  servicesIndustrialImageId: z.string().min(3, 'Sanayi bölümü görsel ID\'si zorunludur.'),
  servicesElectronicsTitle: z.string().min(10, 'Elektronik bölümü başlığı zorunludur.'),
  servicesElectronicsText: z.string().min(10, 'Elektronik bölümü metni zorunludur.'),
  servicesElectronicsSubtitle: z.string().min(10, 'Elektronik alt bölüm başlığı zorunludur.'),
  servicesElectronicsSubtext: z.string().min(10, 'Elektronik alt bölüm metni zorunludur.'),
  servicesElectronicsImageId: z.string().min(3, 'Elektronik bölümü görsel ID\'si zorunludur.'),
  servicesWholesaleTitle: z.string().min(10, 'Toptan alım bölümü başlığı zorunludur.'),
  servicesWholesaleText: z.string().min(10, 'Toptan alım bölümü metni zorunludur.'),

  // İlanlar Sayfası
  listingsPageTitle: z.string().min(5, 'İlanlar sayfası başlığı zorunludur.'),
  listingsPageSubtitle: z.string().min(10, 'İlanlar sayfası alt başlığı zorunludur.'),

  // Blog Sayfası
  blogPageTitle: z.string().min(3, 'Blog sayfası başlığı zorunludur.'),
  blogPageSubtitle: z.string().min(10, 'Blog sayfası alt başlığı zorunludur.'),

  // İletişim Sayfası
  aboutPageTitle: z.string().min(10, 'İletişim sayfası başlığı zorunludur.'),
  aboutPageSubtitle: z.string().min(10, 'İletişim sayfası alt başlığı zorunludur.'),
  aboutWhatsappTitle: z.string().min(10, 'WhatsApp bölümü başlığı zorunludur.'),
  aboutWhatsappText: z.string().min(10, 'WhatsApp bölümü metni zorunludur.'),
  aboutServiceAreasTitle: z.string().min(10, 'Hizmet Bölgeleri bölümü başlığı zorunludur.'),
  aboutServiceAreasText: z.string().min(10, 'Hizmet Bölgeleri bölümü metni zorunludur.'),
  aboutServiceAreasSubtitle: z.string().min(10, 'Adresten alım bölümü başlığı zorunludur.'),
  aboutServiceAreasSubtext: z.string().min(10, 'Adresten alım bölümü metni zorunludur.'),
});

type SiteSettingsFormValues = z.infer<typeof formSchema>;

export default function SiteSettingsPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const docRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'siteSettings', 'main');
  }, [firestore]);

  const { data: siteSettings, isLoading } = useDoc<SiteSetting>(docRef);

  const form = useForm<SiteSettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (siteSettings) {
      form.reset(siteSettings);
    }
  }, [siteSettings, form]);

  const handleSubmit = async (data: SiteSettingsFormValues) => {
    if (!firestore) return;
    setIsSubmitting(true);
    try {
      const settingsRef = doc(firestore, 'siteSettings', 'main');
      await setDocumentNonBlocking(settingsRef, data, { merge: true });
      toast({
        title: 'Başarılı!',
        description: 'Site ayarları başarıyla güncellendi.',
      });
      router.refresh();
    } catch (error) {
      console.error('Error updating site settings:', error);
      toast({
        variant: 'destructive',
        title: 'Hata!',
        description: 'Site ayarları güncellenirken bir hata oluştu.',
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
          <h1 className="text-lg font-semibold md:text-2xl">Site Ayarları</h1>
        </div>

        <Accordion type="multiple" defaultValue={['general', 'homepage']} className="w-full">
          {/* Genel Ayarlar */}
          <AccordionItem value="general">
            <AccordionTrigger className="text-lg font-medium">Genel Ayarlar</AccordionTrigger>
            <AccordionContent>
              <Card className="border-0 shadow-none">
                <CardHeader>
                  <CardTitle>Temel Bilgiler</CardTitle>
                  <CardDescription>Sitenin tamamında geçerli olan temel ayarlar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="siteName" render={({ field }) => (
                      <FormItem><FormLabel>Site Adı</FormLabel><Input placeholder="Atık Rehber" {...field} value={field.value ?? ''} /><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="whatsappPhoneNumber" render={({ field }) => (
                      <FormItem><FormLabel>WhatsApp Numarası</FormLabel><Input placeholder="+905551234567" {...field} value={field.value ?? ''} /><FormDescription>Lütfen WhatsApp'a kayıtlı, gerçek bir telefon numarası girin. Örn: +905xxxxxxxxx</FormDescription><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="contactEmail" render={({ field }) => (
                      <FormItem><FormLabel>İletişim E-postası</FormLabel><Input placeholder="info@siteadi.com" {...field} value={field.value ?? ''} /><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
          
          {/* Ana Sayfa */}
          <AccordionItem value="homepage">
            <AccordionTrigger className="text-lg font-medium">Ana Sayfa</AccordionTrigger>
            <AccordionContent>
               <Card className="border-0 shadow-none">
                    <CardHeader>
                        <CardTitle>Ana Bölüm (Hero)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="homepageHeroTitle" render={({ field }) => (
                            <FormItem><FormLabel>Ana Başlık (H1)</FormLabel><Input placeholder="Antalya'nın Güvenilir Hurdacı Firması..." {...field} value={field.value ?? ''} /><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="homepageHeroSubtitle" render={({ field }) => (
                            <FormItem><FormLabel>Ana Alt Başlık (Paragraf)</FormLabel><Textarea placeholder="Antalya ve Kepez'de demir, bakır..." {...field} value={field.value ?? ''} /><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="homepageHeroImageId" render={({ field }) => (
                            <FormItem><FormLabel>Ana Bölüm Arkaplan Görsel ID</FormLabel><Input placeholder="gorsel-id-123" {...field} value={field.value ?? ''} /><FormDescription>Görsel Yönetimi'nden kopyaladığınız ID'yi yapıştırın.</FormDescription><FormMessage /></FormItem>
                        )} />
                    </CardContent>
                </Card>
                <Card className="mt-6 border-0 shadow-none">
                    <CardHeader>
                        <CardTitle>Hizmetler Bölümü</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="homepageServicesTitle" render={({ field }) => (
                            <FormItem><FormLabel>Bölüm Başlığı</FormLabel><Input placeholder="Adresten ve Değerinde Hurda Alım Hizmetleri" {...field} value={field.value ?? ''} /><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="homepageServicesSubtitle" render={({ field }) => (
                            <FormItem><FormLabel>Bölüm Alt Başlığı</FormLabel><Textarea placeholder="Size en uygun çözümlerle, hurda demir..." {...field} value={field.value ?? ''} /><FormMessage /></FormItem>
                        )} />
                    </CardContent>
                </Card>
                <Card className="mt-6 border-0 shadow-none">
                    <CardHeader>
                        <CardTitle>"Neden Biz?" Bölümü</CardTitle>
                    </CardHeader>
                     <CardContent className="space-y-6">
                        <FormField control={form.control} name="homepageWhyUsTitle" render={({ field }) => (
                            <FormItem><FormLabel>Bölüm Başlığı</FormLabel><Input placeholder="Neden Temur Hurdacılık'ı Tercih Etmelisiniz?" {...field} value={field.value ?? ''} /><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="homepageWhyUsSubtitle" render={({ field }) => (
                            <FormItem><FormLabel>Bölüm Alt Başlığı</FormLabel><Input placeholder="Sektördeki tecrübemiz ve müşteri odaklı yaklaşımımızla..." {...field} value={field.value ?? ''} /><FormMessage /></FormItem>
                        )} />
                         <div className="grid md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="whyUsItem1Title" render={({ field }) => (<FormItem><FormLabel>Kart 1 Başlık</FormLabel><Input {...field} value={field.value ?? ''} /><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="whyUsItem1Text" render={({ field }) => (<FormItem><FormLabel>Kart 1 Metin</FormLabel><Input {...field} value={field.value ?? ''} /><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="whyUsItem2Title" render={({ field }) => (<FormItem><FormLabel>Kart 2 Başlık</FormLabel><Input {...field} value={field.value ?? ''} /><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="whyUsItem2Text" render={({ field }) => (<FormItem><FormLabel>Kart 2 Metin</FormLabel><Input {...field} value={field.value ?? ''} /><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="whyUsItem3Title" render={({ field }) => (<FormItem><FormLabel>Kart 3 Başlık</FormLabel><Input {...field} value={field.value ?? ''} /><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="whyUsItem3Text" render={({ field }) => (<FormItem><FormLabel>Kart 3 Metin</FormLabel><Input {...field} value={field.value ?? ''} /><FormMessage /></FormItem>)} />
                         </div>
                    </CardContent>
                </Card>
            </AccordionContent>
          </AccordionItem>

          {/* Hizmetler Sayfası */}
          <AccordionItem value="services">
             <AccordionTrigger className="text-lg font-medium">Hizmetler Sayfası</AccordionTrigger>
             <AccordionContent>
                 <Card className="border-0 shadow-none">
                     <CardContent className="space-y-4 pt-6">
                        <FormField control={form.control} name="servicesPageTitle" render={({ field }) => (<FormItem><FormLabel>Sayfa Ana Başlığı</FormLabel><Input {...field} value={field.value ?? ''} /><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="servicesPageSubtitle" render={({ field }) => (<FormItem><FormLabel>Sayfa Alt Başlığı</FormLabel><Textarea {...field} value={field.value ?? ''} /><FormMessage /></FormItem>)} />
                         <hr className="my-4" />
                        <FormField control={form.control} name="servicesIndustrialTitle" render={({ field }) => (<FormItem><FormLabel>Sanayi Bölümü Başlığı</FormLabel><Input {...field} value={field.value ?? ''} /><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="servicesIndustrialText" render={({ field }) => (<FormItem><FormLabel>Sanayi Bölümü Metni</FormLabel><Textarea {...field} value={field.value ?? ''} /><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="servicesIndustrialImageId" render={({ field }) => (<FormItem><FormLabel>Sanayi Bölümü Görsel ID</FormLabel><Input {...field} value={field.value ?? ''} /><FormMessage /></FormItem>)} />
                         <hr className="my-4" />
                        <FormField control={form.control} name="servicesElectronicsTitle" render={({ field }) => (<FormItem><FormLabel>Elektronik Bölümü Başlığı</FormLabel><Input {...field} value={field.value ?? ''} /><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="servicesElectronicsText" render={({ field }) => (<FormItem><FormLabel>Elektronik Bölümü Metni</FormLabel><Textarea {...field} value={field.value ?? ''} /><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="servicesElectronicsSubtitle" render={({ field }) => (<FormItem><FormLabel>Elektronik Alt Başlık</FormLabel><Input {...field} value={field.value ?? ''} /><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="servicesElectronicsSubtext" render={({ field }) => (<FormItem><FormLabel>Elektronik Alt Metin</FormLabel><Textarea {...field} value={field.value ?? ''} /><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="servicesElectronicsImageId" render={({ field }) => (<FormItem><FormLabel>Elektronik Bölümü Görsel ID</FormLabel><Input {...field} value={field.value ?? ''} /><FormMessage /></FormItem>)} />
                         <hr className="my-4" />
                        <FormField control={form.control} name="servicesWholesaleTitle" render={({ field }) => (<FormItem><FormLabel>Toptan Alım Bölümü Başlığı</FormLabel><Input {...field} value={field.value ?? ''} /><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="servicesWholesaleText" render={({ field }) => (<FormItem><FormLabel>Toptan Alım Bölümü Metni</FormLabel><Textarea {...field} value={field.value ?? ''} /><FormMessage /></FormItem>)} />
                    </CardContent>
                </Card>
             </AccordionContent>
          </AccordionItem>

          {/* Diğer Sayfalar */}
           <AccordionItem value="other-pages">
             <AccordionTrigger className="text-lg font-medium">Diğer Sayfalar</AccordionTrigger>
             <AccordionContent>
                <Card className="border-0 shadow-none">
                    <CardHeader><CardTitle>İlanlar Sayfası</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="listingsPageTitle" render={({ field }) => (<FormItem><FormLabel>Sayfa Başlığı</FormLabel><Input {...field} value={field.value ?? ''} /><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="listingsPageSubtitle" render={({ field }) => (<FormItem><FormLabel>Sayfa Alt Başlığı</FormLabel><Textarea {...field} value={field.value ?? ''} /><FormMessage /></FormItem>)} />
                    </CardContent>
                </Card>
                 <Card className="mt-6 border-0 shadow-none">
                    <CardHeader><CardTitle>Blog Sayfası</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="blogPageTitle" render={({ field }) => (<FormItem><FormLabel>Sayfa Başlığı</FormLabel><Input {...field} value={field.value ?? ''} /><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="blogPageSubtitle" render={({ field }) => (<FormItem><FormLabel>Sayfa Alt Başlığı</FormLabel><Textarea {...field} value={field.value ?? ''} /><FormMessage /></FormItem>)} />
                    </CardContent>
                </Card>
                <Card className="mt-6 border-0 shadow-none">
                    <CardHeader><CardTitle>İletişim Sayfası</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="aboutPageTitle" render={({ field }) => (<FormItem><FormLabel>Sayfa Başlığı</FormLabel><Input {...field} value={field.value ?? ''} /><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="aboutPageSubtitle" render={({ field }) => (<FormItem><FormLabel>Sayfa Alt Başlığı</FormLabel><Textarea {...field} value={field.value ?? ''} /><FormMessage /></FormItem>)} />
                        <hr className='my-4' />
                        <FormField control={form.control} name="aboutWhatsappTitle" render={({ field }) => (<FormItem><FormLabel>WhatsApp Bölüm Başlığı</FormLabel><Input {...field} value={field.value ?? ''} /><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="aboutWhatsappText" render={({ field }) => (<FormItem><FormLabel>WhatsApp Bölüm Metni</FormLabel><Textarea {...field} value={field.value ?? ''} /><FormMessage /></FormItem>)} />
                        <hr className='my-4' />
                        <FormField control={form.control} name="aboutServiceAreasTitle" render={({ field }) => (<FormItem><FormLabel>Hizmet Bölgeleri Başlığı</FormLabel><Input {...field} value={field.value ?? ''} /><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="aboutServiceAreasText" render={({ field }) => (<FormItem><FormLabel>Hizmet Bölgeleri Metni</FormLabel><Textarea {...field} value={field.value ?? ''} /><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="aboutServiceAreasSubtitle" render={({ field }) => (<FormItem><FormLabel>Adresten Alım Başlığı</FormLabel><Input {...field} value={field.value ?? ''} /><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="aboutServiceAreasSubtext" render={({ field }) => (<FormItem><FormLabel>Adresten Alım Metni</FormLabel><Textarea {...field} value={field.value ?? ''} /><FormMessage /></FormItem>)} />
                    </CardContent>
                </Card>
             </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <Button type="submit" disabled={isSubmitting} className="mt-6">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Değişiklikleri Kaydet
        </Button>
      </form>
    </Form>
  );
}
