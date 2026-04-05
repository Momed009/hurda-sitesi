'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import type { Service, Image as ImageType, SiteSetting } from '@/lib/types';
import { findImageById, getFallbackImage } from '@/lib/placeholder-images';
import { Loader2, HardHat, Cpu, CheckCircle } from 'lucide-react';
import { getImagePath } from '@/lib/utils';

export default function ServicesPageClient() {
  const firestore = useFirestore();

  const servicesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'services'), orderBy('displayOrder'));
  }, [firestore]);
  
  const imagesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'images') : null, [firestore]);
  const siteSettingsRef = useMemoFirebase(() => firestore ? doc(firestore, 'siteSettings', 'main') : null, [firestore]);

  const { data: services, isLoading: servicesLoading } = useCollection<Service>(servicesQuery);
  const { data: allImages, isLoading: imagesLoading } = useCollection<ImageType>(imagesQuery);
  const { data: siteSettings, isLoading: settingsLoading } = useDoc<SiteSetting>(siteSettingsRef);

  const isLoading = servicesLoading || imagesLoading || settingsLoading;
  
  const industrialImageUrl = siteSettings?.servicesIndustrialImageUrl || '';
  const industrialImage = industrialImageUrl 
    ? { url: industrialImageUrl, altText: siteSettings?.servicesIndustrialTitle || 'Sanayi' }
    : (findImageById(siteSettings?.servicesIndustrialImageId || 'factory-scrap', allImages) ?? getFallbackImage(siteSettings?.servicesIndustrialImageId || 'factory-scrap'));

  const electronicsImageUrl = siteSettings?.servicesElectronicsImageUrl || '';
  const electronicsImage = electronicsImageUrl 
    ? { url: electronicsImageUrl, altText: siteSettings?.servicesElectronicsTitle || 'Elektronik' }
    : (findImageById(siteSettings?.servicesElectronicsImageId || 'electronics-scrap', allImages) ?? getFallbackImage(siteSettings?.servicesElectronicsImageId || 'electronics-scrap'));

  return (
    <>
      <div className="container py-12 lg:py-16">
        <div className="text-center max-w-3xl mx-auto">
          {isLoading ? <Loader2 className='w-8 h-8 mx-auto animate-spin' /> : <>
            <h1 className="text-4xl font-bold tracking-tight">{siteSettings?.servicesPageTitle || 'Antalya Hurda Alım Hizmetlerimiz ve Çeşitleri'}</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {siteSettings?.servicesPageSubtitle || 'Sanayi, şantiye, fabrika, elektronik ve beyaz eşya gibi geniş bir yelpazede hurda alım hizmetleri sunuyoruz.'}
            </p>
          </>}
        </div>
      </div>
      
      <div className='py-16 lg:py-24 bg-gradient-to-b from-card to-background'>
        <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
                {/* Sanayi, Şantiye ve Fabrika Bölümü */}
                <div className="group flex flex-col space-y-6">
                     <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden shadow-xl border border-primary/10 bg-muted/20">
                        <Image 
                            src={getImagePath(industrialImage.url)} 
                            alt={industrialImage.altText} 
                            fill 
                            className="object-contain transition-transform duration-700 group-hover:scale-105" 
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-6 left-6 flex items-center gap-3 text-white">
                            <div className="p-2 bg-primary/20 backdrop-blur-md rounded-lg">
                                <HardHat className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <span className="font-bold text-lg">Fabrika & Sanayi</span>
                        </div>
                    </div>
                    {isLoading ? <Loader2 className='w-8 h-8 animate-spin' /> : 
                        <div className="space-y-4 pr-0 lg:pr-8">
                            <h2 className='text-2xl md:text-3xl font-extrabold tracking-tight underline-offset-8 decoration-primary/30 decoration-4 underline'>{siteSettings?.servicesIndustrialTitle || 'Sanayi, Şantiye ve Fabrika Hurdası Çözümleri'}</h2>
                            <p className='text-muted-foreground leading-relaxed text-lg'>
                                {siteSettings?.servicesIndustrialText || 'İnşaat demiri, çelik konstrüksiyon, makine parçaları ve üretim artığı gibi büyük hacimli endüstriyel hurdalarınızı yerinde söküm ve nakliye hizmetlerimizle değerlendiriyoruz.'}
                            </p>
                        </div>
                    }
                </div>

                {/* Elektronik ve Beyaz Eşya Bölümü */}
                <div className="group flex flex-col space-y-6">
                    <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden shadow-xl border border-primary/10 bg-muted/20">
                        <Image 
                            src={getImagePath(electronicsImage.url)} 
                            alt={electronicsImage.altText} 
                            fill 
                            className="object-contain transition-transform duration-700 group-hover:scale-105" 
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-6 left-6 flex items-center gap-3 text-white">
                            <div className="p-2 bg-primary/20 backdrop-blur-md rounded-lg">
                                <Cpu className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <span className="font-bold text-lg">Elektronik & E-Atık</span>
                        </div>
                    </div>
                    {isLoading ? <Loader2 className='w-8 h-8 animate-spin' /> : 
                        <div className="space-y-4 pl-0 lg:pl-8">
                            <h2 className='text-2xl md:text-3xl font-extrabold tracking-tight underline-offset-8 decoration-primary/30 decoration-4 underline'>{siteSettings?.servicesElectronicsTitle || 'Elektronik ve Beyaz Eşya Geri Dönüşümü'}</h2>
                            <p className='text-muted-foreground leading-relaxed text-lg'>
                                {siteSettings?.servicesElectronicsText || 'Ömrünü tamamlamış beyaz eşyalar (buzdolabı, çamaşır makinesi vb.) ve her türlü elektronik kart, kablo, bilgisayar gibi e-atıkları geri dönüşüme kazandırıyoruz.'}
                            </p>
                            <div className="pt-2 border-t border-primary/10">
                                <h3 className="text-xl font-bold mb-2 text-primary">{siteSettings?.servicesElectronicsSubtitle || 'Eski ve Bozuk Beyaz Eşya Alımı'}</h3>
                                <p className='text-muted-foreground leading-relaxed'>
                                    {siteSettings?.servicesElectronicsSubtext || 'Bozuk veya eski beyaz eşyalarınızı adresinizden teslim alarak size hem yer açıyor hem de ek gelir sağlıyoruz.'}
                                </p>
                            </div>
                        </div>
                    }
                </div>
            </div>
        </div>
      </div>
      <div className='py-4 lg:py-6 bg-card border-y border-border/50'>
        <div className="container text-center max-w-4xl mx-auto">
            {isLoading ? <Loader2 className='w-8 h-8 mx-auto animate-spin' /> : <>
              <CheckCircle className="w-12 h-12 text-primary mb-4 mx-auto" />
              <h2 className='text-3xl font-bold tracking-tight mb-4'>{siteSettings?.servicesWholesaleTitle || 'Toptan Hurda Alımında Şeffaf Tartım Garantisi'}</h2>
              <p className='text-lg text-muted-foreground leading-relaxed'>
                  {siteSettings?.servicesWholesaleText || 'Tüm hurda alım işlemlerimizde, hassas ve kalibreli dijital kantarlar kullanıyoruz. Tartım işlemini sizin gözetiminizde, tamamen şeffaf bir şekilde gerçekleştirerek hakkınız olan doğru değeri almanızı sağlıyoruz. Güveniniz bizim için en önemli önceliktir.'}
              </p>
            </>}
        </div>
      </div>
      <div className="container py-16 lg:py-24">
        <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Tüm Hizmet Alanlarımız</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Aşağıda sunduğumuz tüm hurda alım ve geri dönüşüm hizmetlerini görebilirsiniz.
            </p>
        </div>
        {isLoading ? (
          <div className="flex justify-center"><Loader2 className="h-10 w-10 animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(services ?? []).map((service) => {
              const serviceImageUrl = service.mainImageUrl;
              const serviceImage = serviceImageUrl 
                ? { url: serviceImageUrl, altText: service.title }
                : (findImageById(service.imageIds[0], allImages) ?? getFallbackImage(service.imageIds[0]));
              return (
                <Card key={service.id} className="group overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-border/50">
                  <div className="relative h-56 w-full bg-muted/10">
                    <Image
                      src={getImagePath(serviceImage.url)}
                      alt={serviceImage.altText}
                      fill
                      className="object-contain transition-transform duration-500 group-hover:scale-105 p-2"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
