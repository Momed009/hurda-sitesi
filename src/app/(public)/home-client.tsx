'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { findImageById, getFallbackImage } from '@/lib/placeholder-images';
import { ArrowRight, Truck, HardHat, Recycle, Layers, Car, Plug, Loader2, ShieldCheck, Scale, ThumbsUp, CalendarDays, Phone, MessageCircle, Navigation } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, orderBy, limit, where, doc } from 'firebase/firestore';
import type { Service, Image as ImageType, Blog, SiteSetting, CompanyInfo } from '@/lib/types';
import { getImagePath, formatWhatsAppNumber } from '@/lib/utils';
import { BlogDetailDialog } from '@/components/blog-detail-dialog';

const serviceIcons: { [key: string]: React.ReactNode } = {
  "on-site-collection": <Truck className="w-8 h-8 text-primary" />,
  "demolition": <HardHat className="w-8 h-8 text-primary" />,
  "container-service": <Recycle className="w-8 h-8 text-primary" />,
  "stainless-steel": <Layers className="w-8 h-8 text-primary" />,
  "cable": <Plug className="w-8 h-8 text-primary" />,
  "vehicle": <Car className="w-8 h-8 text-primary" />,
};

export default function HomePageClient() {
  const firestore = useFirestore();

  const siteSettingsRef = useMemoFirebase(() => firestore ? doc(firestore, 'siteSettings', 'main') : null, [firestore]);
  const companyInfoRef = useMemoFirebase(() => firestore ? doc(firestore, 'companyInfo', 'main') : null, [firestore]);
  const servicesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'services'), orderBy('displayOrder'), limit(3)) : null, [firestore]);
  const imagesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'images') : null, [firestore]);
  const blogQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'blogs'), where('isFeaturedOnHomepage', '==', true)) : null, [firestore]);
  
  const { data: siteSettings, isLoading: settingsLoading } = useDoc<SiteSetting>(siteSettingsRef);
  const { data: companyInfo, isLoading: infoLoading } = useDoc<CompanyInfo>(companyInfoRef);
  const { data: services, isLoading: servicesLoading } = useCollection<Service>(servicesQuery);
  const { data: allImages, isLoading: imagesLoading } = useCollection<ImageType>(imagesQuery);
  const { data: featuredPosts, isLoading: postsLoading } = useCollection<Blog>(blogQuery);

  const sortedFeaturedPosts = useMemo(() => {
    if (!featuredPosts) return [];
    return [...featuredPosts].sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()).slice(0, 3);
  }, [featuredPosts]);

  const heroImageUrl = siteSettings?.homepageHeroImageUrl || '';
  const heroImage = heroImageUrl 
    ? { url: heroImageUrl, altText: siteSettings?.siteName || 'Hero' }
    : (findImageById(siteSettings?.homepageHeroImageId || 'hero-background', allImages) ?? getFallbackImage(siteSettings?.homepageHeroImageId || 'hero-background'));

  const whyUsItems = useMemo(() => [
    {
      icon: <ShieldCheck className="w-8 h-8 text-primary" />,
      title: siteSettings?.whyUsItem1Title || 'Güvenilirlik',
      text: siteSettings?.whyUsItem1Text || 'Şeffaf ve dürüst ticaret anlayışımızla hurdalarınızı güvenle bize satabilirsiniz.'
    },
    {
      icon: <Scale className="w-8 h-8 text-primary" />,
      title: siteSettings?.whyUsItem2Title || 'Değerinde Alım',
      text: siteSettings?.whyUsItem2Text || 'Güncel piyasa fiyatlarını takip ederek hurdalarınıza en iyi fiyat teklifini sunuyoruz.'
    },
    {
      icon: <ThumbsUp className="w-8 h-8 text-primary" />,
      title: siteSettings?.whyUsItem3Title || 'Hızlı Hizmet',
      text: siteSettings?.whyUsItem3Text || 'Antalya\'nın her yerine hızlıca ulaşıyor, hurdalarınızı adresinizden nakit ödemeyle alıyoruz.'
    },
  ], [siteSettings]);
  
  const isLoading = settingsLoading || infoLoading || servicesLoading || imagesLoading || postsLoading;

  const phoneUrl = `tel:${companyInfo?.contactPhoneNumber?.replace(/\D/g, '')}`;
  const whatsappUrl = `https://wa.me/${formatWhatsAppNumber(siteSettings?.whatsappPhoneNumber ?? '')}?text=Merhaba, sitenizden ulaşıyorum.`;
  const mapUrl = companyInfo?.companyAddress
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(companyInfo.companyAddress)}`
    : '#';

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] min-h-[400px] flex items-center justify-center text-center text-white">
        <Image
          src={getImagePath(heroImage.url)}
          alt={heroImage.altText || ''}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 p-4 max-w-3xl animate-fade-in-up">
          {isLoading ? <Loader2 className="w-12 h-12 animate-spin mx-auto"/> : <>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              {siteSettings?.homepageHeroTitle || "Antalya'nın Güvenilir Hurdacı Firması: Temur Hurdacılık"}
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto">
              {siteSettings?.homepageHeroSubtitle || "Antalya ve Kepez'de demir, bakır ve alüminyum hurdalarınızı adresinizden en yüksek fiyatla alıyoruz. Nakit ödeme için Temur Hurdacılık'ı hemen arayın!"}
            </p>
          </>}
        </div>

        {/* Floating "View Listings" Button */}
        {!isLoading && (
            <div className="absolute bottom-4 left-4 z-20">
                <Button asChild>
                    <Link href="/listings">İlanları Görüntüle</Link>
                </Button>
            </div>
        )}
        
        {/* Floating Action Buttons */}
        {!isLoading && (companyInfo?.contactPhoneNumber || siteSettings?.whatsappPhoneNumber || companyInfo?.companyAddress) && (
             <div className="absolute bottom-4 right-4 z-20 flex flex-col sm:flex-row items-end sm:items-center gap-2">
                {companyInfo?.contactPhoneNumber && (
                    <Button asChild className="bg-white hover:bg-gray-100 text-gray-800 font-semibold shadow-md py-2 px-4 rounded-full">
                        <Link href={phoneUrl}>
                            <Phone className="text-pink-500 mr-2"/>
                            Ara
                        </Link>
                    </Button>
                )}
                {siteSettings?.whatsappPhoneNumber && (
                    <Button asChild className="bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold shadow-md py-2 px-4 rounded-full">
                        <Link href={whatsappUrl} target="_blank">
                            <MessageCircle className="mr-2"/>
                            WhatsApp
                        </Link>
                    </Button>
                )}
                {companyInfo?.companyAddress && (
                    <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md py-2 px-4 rounded-full">
                        <Link href={mapUrl} target="_blank">
                            <Navigation className="mr-2"/>
                            Yol Tarifi
                        </Link>
                    </Button>
                )}
            </div>
        )}
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 lg:py-24 bg-card">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            {isLoading ? <Loader2 className="w-8 h-8 animate-spin mx-auto"/> : <>
              <h2 className="text-3xl font-bold tracking-tight">{siteSettings?.homepageServicesTitle || "Adresten ve Değerinde Hurda Alım Hizmetleri"}</h2>
              <p className="mt-4 text-muted-foreground">
                {siteSettings?.homepageServicesSubtitle || "Size en uygun çözümlerle, hurda demir, inşaat hurdası, bakır, kablo ve alüminyum hurdası alım hizmeti sunuyoruz."}
              </p>
            </>}
          </div>
          {servicesLoading ? (
            <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {(services ?? []).map((service) => (
                <div key={service.id} className="group text-center p-6 flex flex-col items-center bg-card rounded-xl border border-transparent hover:border-border/50 hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
                   <div className="p-4 bg-primary/10 rounded-full mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                    {serviceIcons[service.id] || <Truck className="w-8 h-8 text-primary" />}
                   </div>
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                </div>
              ))}
            </div>
          )}
           <div className="text-center mt-12">
            <Button asChild variant="outline">
              <Link href="/services">Tüm Hizmetler</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section id="why-us" className="py-16 lg:py-24">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
             {isLoading ? <Loader2 className="w-8 h-8 animate-spin mx-auto"/> : <>
                <h2 className="text-3xl font-bold tracking-tight">{siteSettings?.homepageWhyUsTitle || "Neden Temur Hurdacılık'ı Tercih Etmelisiniz?"}</h2>
                <p className="mt-4 text-muted-foreground">
                  {siteSettings?.homepageWhyUsSubtitle || "Sektördeki tecrübemiz ve müşteri odaklı yaklaşımımızla fark yaratıyoruz."}
                </p>
             </>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {isLoading ? Array.from({length: 3}).map((_, i) => (
                <Card key={i} className="text-center p-6"><Loader2 className="w-8 h-8 animate-spin mx-auto"/></Card>
            )) : whyUsItems.map((item, index) => (
              <Card key={index} className="group text-center hover:-translate-y-2 hover:shadow-xl transition-all duration-300 border-border/50">
                <CardHeader>
                  <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                    {item.icon}
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Blog Section */}
      <section id="blog" className="py-16 lg:py-24">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Hurda ve Geri Dönüşüm Dünyasından Haberler</h2>
            <p className="mt-4 text-muted-foreground">
              Sektördeki son gelişmeler, ipuçları ve faydalı bilgiler.
            </p>
          </div>
          {postsLoading || imagesLoading ? (
            <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : (
            <>
              {sortedFeaturedPosts && sortedFeaturedPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {sortedFeaturedPosts.map((post) => {
                    const postImageUrl = post.thumbnailImageUrl;
                    const postImage = postImageUrl 
                        ? { url: postImageUrl, altText: post.title }
                        : (findImageById(post.thumbnailImageId, allImages) ?? getFallbackImage(post.thumbnailImageId));
                    return (
                      <Card key={post.id} className="group flex flex-col overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-border/50">
                        <div className="overflow-hidden">
                          <Image
                            src={getImagePath(postImage.url)}
                            alt={postImage.altText}
                            width={600}
                            height={400}
                            className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <CardHeader>
                          <CardTitle className="text-xl h-14 overflow-hidden">{post.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2 text-sm pt-2">
                            <CalendarDays className="w-4 h-4"/>
                            {new Date(post.publishDate).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <p className="text-muted-foreground line-clamp-3">
                            {post.metaDescription}
                          </p>
                        </CardContent>
                        <CardFooter>
                           <BlogDetailDialog post={post} postImage={postImage}>
                              <Button variant="link" className="p-0 h-auto font-semibold cursor-pointer">
                                  Devamını Oku <ArrowRight className="ml-1 w-4 h-4" />
                              </Button>
                          </BlogDetailDialog>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Öne çıkarılan blog yazısı bulunamadı.</p>
                </div>
              )}
               <div className="text-center mt-12">
                  <Button asChild variant="outline">
                    <Link href="/blog">Tüm Yazıları Gör</Link>
                  </Button>
                </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
