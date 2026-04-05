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
import { MediaPicker } from '@/components/media-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getImagePath } from '@/lib/utils';

const formSchema = z.object({
  // Genel
  siteName: z.string().min(1, 'Site adı zorunludur.'),
  whatsappPhoneNumber: z.string().min(1, 'WhatsApp numarası zorunludur.'),
  contactEmail: z.string().email('Geçerli bir e-posta adresi girin.').optional().or(z.literal('')),

  // Ana Sayfa
  homepageHeroTitle: z.string().optional().or(z.literal('')),
  homepageHeroSubtitle: z.string().optional().or(z.literal('')),
  homepageHeroImageId: z.string().optional().or(z.literal('')),
  homepageHeroImageUrl: z.string().optional().or(z.literal('')),
  homepageServicesTitle: z.string().optional().or(z.literal('')),
  homepageServicesSubtitle: z.string().optional().or(z.literal('')),
  homepageWhyUsTitle: z.string().optional().or(z.literal('')),
  homepageWhyUsSubtitle: z.string().optional().or(z.literal('')),
  whyUsItem1Title: z.string().optional().or(z.literal('')),
  whyUsItem1Text: z.string().optional().or(z.literal('')),
  whyUsItem2Title: z.string().optional().or(z.literal('')),
  whyUsItem2Text: z.string().optional().or(z.literal('')),
  whyUsItem3Title: z.string().optional().or(z.literal('')),
  whyUsItem3Text: z.string().optional().or(z.literal('')),

  // Hizmetler Sayfası
  servicesPageTitle: z.string().optional().or(z.literal('')),
  servicesPageSubtitle: z.string().optional().or(z.literal('')),
  servicesIndustrialTitle: z.string().optional().or(z.literal('')),
  servicesIndustrialText: z.string().optional().or(z.literal('')),
  servicesIndustrialImageId: z.string().optional().or(z.literal('')),
  servicesIndustrialImageUrl: z.string().optional().or(z.literal('')),
  servicesElectronicsTitle: z.string().optional().or(z.literal('')),
  servicesElectronicsText: z.string().optional().or(z.literal('')),
  servicesElectronicsSubtitle: z.string().optional().or(z.literal('')),
  servicesElectronicsSubtext: z.string().optional().or(z.literal('')),
  servicesElectronicsImageId: z.string().optional().or(z.literal('')),
  servicesElectronicsImageUrl: z.string().optional().or(z.literal('')),
  servicesWholesaleTitle: z.string().optional().or(z.literal('')),
  servicesWholesaleText: z.string().optional().or(z.literal('')),

  // İlanlar Sayfası
  listingsPageTitle: z.string().optional().or(z.literal('')),
  listingsPageSubtitle: z.string().optional().or(z.literal('')),

  // Blog Sayfası
  blogPageTitle: z.string().optional().or(z.literal('')),
  blogPageSubtitle: z.string().optional().or(z.literal('')),

  // İletişim Sayfası
  aboutPageTitle: z.string().optional().or(z.literal('')),
  aboutPageSubtitle: z.string().optional().or(z.literal('')),
  aboutWhatsappTitle: z.string().optional().or(z.literal('')),
  aboutWhatsappText: z.string().optional().or(z.literal('')),
  aboutServiceAreasTitle: z.string().optional().or(z.literal('')),
  aboutServiceAreasText: z.string().optional().or(z.literal('')),
  aboutServiceAreasSubtitle: z.string().optional().or(z.literal('')),
  aboutServiceAreasSubtext: z.string().optional().or(z.literal('')),
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
      <form onSubmit={form.handleSubmit(handleSubmit, (errors) => {
        console.log('Form hataları:', errors);
        toast({
          variant: 'destructive',
          title: 'Form Hatası!',
          description: 'Lütfen zorunlulu alanları kontrol edin. Bazı alanlar eksik veya hatalı.',
        });
      })} className="space-y-6">
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
                    <FormItem>
                      <FormLabel className="flex items-center justify-between">
                        Ana Bölüm Arkaplan Görsel ID
                        <MediaPicker
                          onSelect={(image) => {
                            field.onChange(image.id);
                            form.setValue('homepageHeroImageUrl', image.url);
                          }}
                          currentValue={field.value}
                        />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="gorsel-id-123" {...field} value={field.value ?? ''} />
                      </FormControl>
                      {form.watch('homepageHeroImageUrl') && (
                        <div className="mt-2 relative w-full h-44 rounded-lg overflow-hidden border border-border group bg-muted/40 shadow-inner">
                          <img
                            src={getImagePath(form.watch('homepageHeroImageUrl'))}
                            alt="Hero Önizleme"
                            className="w-full h-full object-contain transition-all"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <p className="text-xs text-white font-medium">Hero Görseli (Tam Görünüm)</p>
                          </div>
                        </div>
                      )}
                      <FormDescription>Görsel Yönetimi'nden kopyaladığınız ID'yi yapıştırın.</FormDescription>
                      <FormMessage />
                    </FormItem>
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
                  <FormField control={form.control} name="servicesIndustrialImageId" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center justify-between">
                        Sanayi Bölümü Görsel ID
                        <MediaPicker
                          onSelect={(image) => {
                            field.onChange(image.id);
                            form.setValue('servicesIndustrialImageUrl', image.url);
                          }}
                          currentValue={field.value}
                        />
                      </FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ''} />
                      </FormControl>
                      {form.watch('servicesIndustrialImageUrl') && (
                        <div className="mt-2 relative w-full h-36 rounded-lg overflow-hidden border border-border group bg-muted/30">
                          <img
                            src={getImagePath(form.watch('servicesIndustrialImageUrl'))}
                            alt="Sanayi Önizleme"
                            className="w-full h-full object-contain transition-all"
                          />
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )} />
                  <hr className="my-4" />
                  <FormField control={form.control} name="servicesElectronicsTitle" render={({ field }) => (<FormItem><FormLabel>Elektronik Bölümü Başlığı</FormLabel><Input {...field} value={field.value ?? ''} /><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="servicesElectronicsText" render={({ field }) => (<FormItem><FormLabel>Elektronik Bölümü Metni</FormLabel><Textarea {...field} value={field.value ?? ''} /><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="servicesElectronicsSubtitle" render={({ field }) => (<FormItem><FormLabel>Elektronik Alt Başlık</FormLabel><Input {...field} value={field.value ?? ''} /><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="servicesElectronicsSubtext" render={({ field }) => (<FormItem><FormLabel>Elektronik Alt Metin</FormLabel><Textarea {...field} value={field.value ?? ''} /><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="servicesElectronicsImageId" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center justify-between">
                        Elektronik Bölümü Görsel ID
                        <MediaPicker
                          onSelect={(image) => {
                            field.onChange(image.id);
                            form.setValue('servicesElectronicsImageUrl', image.url);
                          }}
                          currentValue={field.value}
                        />
                      </FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ''} />
                      </FormControl>
                      {form.watch('servicesElectronicsImageUrl') && (
                        <div className="mt-2 relative w-full h-36 rounded-lg overflow-hidden border border-border group bg-muted/30">
                          <img
                            src={getImagePath(form.watch('servicesElectronicsImageUrl'))}
                            alt="Elektronik Önizleme"
                            className="w-full h-full object-contain transition-all"
                          />
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )} />
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
