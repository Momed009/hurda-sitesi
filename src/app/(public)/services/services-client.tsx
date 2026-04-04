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
  
  const industrialImage = findImageById(siteSettings?.servicesIndustrialImageId || 'factory-scrap', allImages) ?? getFallbackImage(siteSettings?.servicesIndustrialImageId || 'factory-scrap');
  const electronicsImage = findImageById(siteSettings?.servicesElectronicsImageId || 'electronics-scrap', allImages) ?? getFallbackImage(siteSettings?.servicesElectronicsImageId || 'electronics-scrap');

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
      
      <div className='py-16 lg:py-24 bg-card'>
        <div className="container grid md:grid-cols-2 gap-12 items-center">
            {isLoading ? <Loader2 className='w-8 h-8 animate-spin' /> : 
              <div>
                   <HardHat className="w-12 h-12 text-primary mb-4" />
                   <h2 className='text-3xl font-bold tracking-tight mb-4'>{siteSettings?.servicesIndustrialTitle || 'Sanayi, Şantiye ve Fabrika Hurdası Çözümleri'}</h2>
                   <p className='text-muted-foreground leading-relaxed'>
                      {siteSettings?.servicesIndustrialText || 'İnşaat demiri, çelik konstrüksiyon, makine parçaları ve üretim artığı gibi büyük hacimli endüstriyel hurdalarınızı yerinde söküm ve nakliye hizmetlerimizle değerlendiriyoruz. Proje bazlı özel çözümlerimizle işlerinizi kolaylaştırıyoruz.'}
                   </p>
              </div>
            }
            <div className="relative h-80 rounded-lg overflow-hidden">
                <Image src={getImagePath(industrialImage.url)} alt={industrialImage.altText} fill className="object-cover" data-ai-hint="factory industry" />
            </div>
        </div>
      </div>
       <div className='py-16 lg:py-24'>
        <div className="container grid md:grid-cols-2 gap-12 items-center">
             <div className="relative h-80 rounded-lg overflow-hidden md:order-last">
                <Image src={getImagePath(electronicsImage.url)} alt={electronicsImage.altText} fill className="object-cover" data-ai-hint="electronics waste" />
            </div>
            {isLoading ? <Loader2 className='w-8 h-8 animate-spin' /> : 
              <div>
                   <Cpu className="w-12 h-12 text-primary mb-4" />
                   <h2 className='text-3xl font-bold tracking-tight mb-4'>{siteSettings?.servicesElectronicsTitle || 'Elektronik ve Beyaz Eşya Geri Dönüşümü'}</h2>
                   <p className='text-muted-foreground leading-relaxed'>
                     {siteSettings?.servicesElectronicsText || 'Ömrünü tamamlamış beyaz eşyalar (buzdolabı, çamaşır makinesi vb.) ve her türlü elektronik kart, kablo, bilgisayar gibi e-atıkları geri dönüşüme kazandırıyoruz.'}
                   </p>
                    <h3 className="text-xl font-semibold mt-6 mb-2">{siteSettings?.servicesElectronicsSubtitle || 'Eski ve Bozuk Beyaz Eşya Alımı'}</h3>
                    <p className='text-muted-foreground leading-relaxed'>
                      {siteSettings?.servicesElectronicsSubtext || 'Bozuk veya eski beyaz eşyalarınızı adresinizden teslim alarak size hem yer açıyor hem de ek gelir sağlıyoruz.'}
                    </p>
              </div>
            }
        </div>
      </div>
      <div className='py-16 lg:py-24 bg-card'>
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
              // A service might have multiple images, we'll just take the first one.
              const serviceImage = findImageById(service.imageIds[0], allImages) ?? getFallbackImage(service.imageIds[0]);
              return (
                <Card key={service.id} className="group overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-border/50">
                  <div className="relative h-56 w-full">
                    <Image
                      src={getImagePath(serviceImage.url)}
                      alt={serviceImage.altText}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
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
