'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, MapPin, Loader2, Instagram, Facebook, MessageCircle, Navigation } from 'lucide-react';
import { useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { formatWhatsAppNumber } from '@/lib/utils';
import type { CompanyInfo, Image as ImageType, SiteSetting } from '@/lib/types';
import { findImageById, getFallbackImage } from '@/lib/placeholder-images';
import { getImagePath } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AboutPageClient() {
  const firestore = useFirestore();

  const companyInfoRef = useMemoFirebase(() => firestore ? doc(firestore, 'companyInfo', 'main') : null, [firestore]);
  const siteSettingsRef = useMemoFirebase(() => firestore ? doc(firestore, 'siteSettings', 'main') : null, [firestore]);
  const imagesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'images') : null, [firestore]);

  const { data: companyInfo, isLoading: infoLoading } = useDoc<CompanyInfo>(companyInfoRef);
  const { data: siteSettings, isLoading: settingsLoading } = useDoc<SiteSetting>(siteSettingsRef);
  const { data: allImages, isLoading: imagesLoading } = useCollection<ImageType>(imagesQuery);
  
  const ownerImage = (companyInfo?.ownerImageId ? findImageById(companyInfo.ownerImageId, allImages) : null) ?? getFallbackImage(companyInfo?.ownerImageId || 'about-us-owner');
  const whatsappUrl = `https://wa.me/${formatWhatsAppNumber(siteSettings?.whatsappPhoneNumber ?? '')}?text=Merhaba,%20hurda%20fiyatları%20hakkında%20bilgi%20almak%20istiyorum.`;

  const isLoading = infoLoading || imagesLoading || settingsLoading;

  return (
    <>
      <div className="container py-16 lg:py-24">
        {isLoading ? (
          <div className="flex justify-center mt-16"><Loader2 className="h-10 w-10 animate-spin" /></div>
        ) : (
          <div className="text-center max-w-3xl mx-auto">
             <h1 className="text-4xl font-bold tracking-tight mb-4">{siteSettings?.aboutPageTitle || 'Temur Hurdacılık İletişim ve Adres Bilgileri'}</h1>
             <p className="text-lg text-muted-foreground">
                {siteSettings?.aboutPageSubtitle || 'Antalya ve çevresinde hurda satmak için bize dilediğiniz zaman ulaşabilirsiniz.'}
             </p>
          </div>
        )}
      </div>

       {!isLoading && (
        <div className="py-16 lg:py-24 bg-card">
            <div className="container grid lg:grid-cols-2 gap-12 items-center">
                <div className='space-y-6'>
                    <MessageCircle className="w-12 h-12 text-primary" />
                    <h2 className="text-3xl font-bold tracking-tight">{siteSettings?.aboutWhatsappTitle || 'WhatsApp Üzerinden Anında Hurda Fiyatı Alın'}</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        {siteSettings?.aboutWhatsappText || 'Satmak istediğiniz hurdaların fotoğraflarını WhatsApp üzerinden bize gönderin, uzman ekibimiz en kısa sürede inceleyerek size en iyi fiyat teklifini sunsun. Hızlı, kolay ve pratik bir şekilde hurdalarınızın değerini öğrenin.'}
                    </p>
                    <Button asChild size="lg" className="bg-[#25D366] hover:bg-[#128C7E] text-white">
                        <Link href={whatsappUrl} target="_blank">
                           WhatsApp'tan Fiyat Al
                        </Link>
                    </Button>
                </div>
                 <div className='space-y-6'>
                    <Navigation className="w-12 h-12 text-primary" />
                    <h2 className="text-3xl font-bold tracking-tight">{siteSettings?.aboutServiceAreasTitle || 'Antalya Kepez ve Çevresi Hizmet Bölgelerimiz'}</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        {siteSettings?.aboutServiceAreasText || 'Başta Kepez, Muratpaşa, Konyaaltı, Döşemealtı ve Aksu olmak üzere Antalya\'nın tüm ilçelerine hizmet veriyoruz.'}
                    </p>
                     <h3 className="text-xl font-semibold pt-4">{siteSettings?.aboutServiceAreasSubtitle || 'Adresten Alım İçin Bize Nasıl Ulaşabilirsiniz?'}</h3>
                     <p className="text-muted-foreground leading-relaxed">
                        {siteSettings?.aboutServiceAreasSubtext || 'Tek yapmanız gereken iletişim numaralarımızdan bizi aramak veya WhatsApp\'tan konumunuzu göndermek. Mobil ekiplerimiz en kısa sürede adresinize gelerek hurdalarınızı yerinde tartar ve nakit ödemeyle satın alır.'}
                    </p>
                </div>
            </div>
        </div>
       )}

      <div className="container py-16 lg:py-24">
        {isLoading ? (
          <div className="flex justify-center mt-16"><Loader2 className="h-10 w-10 animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            <div className="lg:col-span-2 flex flex-col items-center justify-center text-center">
              <div className="relative mb-4 h-40 w-40">
                <Image
                  src={getImagePath(ownerImage.url)}
                  alt={ownerImage.altText}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold">{companyInfo?.ownerFullName ?? 'Firma Sahibi'}</h3>
              <p className="text-muted-foreground">Firma Sahibi</p>
            </div>
            <div className="lg:col-span-3">
              <h2 className="text-2xl font-semibold mb-4">İletişim Kanallarımız</h2>
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <Phone className="w-6 h-6 text-primary" />
                    <div>
                      <h4 className="font-semibold">Telefon</h4>
                      <a href={`tel:${companyInfo?.contactPhoneNumber?.replace(/\s/g, '')}`} className="text-muted-foreground hover:text-primary">
                        {companyInfo?.contactPhoneNumber ?? 'Telefon bilgisi yok'}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <MapPin className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold">Adres</h4>
                      <p className="text-muted-foreground">{companyInfo?.companyAddress ?? 'Adres bilgisi yok'}</p>
                    </div>
                  </div>
                  {companyInfo?.instagramUrl && (
                    <div className="flex items-center gap-4">
                        <Instagram className="w-6 h-6 text-primary" />
                        <div>
                            <h4 className="font-semibold">Instagram</h4>
                            <a href={companyInfo.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                                @{companyInfo.instagramUrl.split('/').filter(Boolean).pop()?.split('?')[0]}
                            </a>
                        </div>
                    </div>
                  )}
                  {companyInfo?.facebookUrl && (
                      <div className="flex items-center gap-4">
                          <Facebook className="w-6 h-6 text-primary" />
                          <div>
                              <h4 className="font-semibold">Facebook</h4>
                              <a href={companyInfo.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                                  {companyInfo.facebookUrl.split('/').filter(Boolean).pop()?.split('?')[0]}
                              </a>
                          </div>
                      </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
      {!isLoading && companyInfo?.mapEmbedUrl && (
        <div className="w-full h-[450px] bg-muted">
          <iframe
              src={companyInfo.mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="İşletme Konumu"
          ></iframe>
        </div>
      )}
    </>
  );
}
