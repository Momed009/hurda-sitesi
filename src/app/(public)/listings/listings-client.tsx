'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, ShoppingCart, Tag, Package, Loader2 } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import type { Product, Image as ImageType, SiteSetting } from '@/lib/types';
import { findImageById, getFallbackImage } from '@/lib/placeholder-images';
import Link from 'next/link';
import { useDoc } from '@/firebase/firestore/use-doc';
import { getImagePath, formatWhatsAppNumber } from '@/lib/utils';

export default function ListingsPageClient() {
  const firestore = useFirestore();

  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'products'), orderBy('createdAt', 'desc'));
  }, [firestore]);
  
  const imagesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'images') : null, [firestore]);
  
  const siteSettingsRef = useMemoFirebase(() => {
      if (!firestore) return null;
      return doc(firestore, 'siteSettings', 'main');
  }, [firestore]);

  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsQuery);
  const { data: allImages, isLoading: imagesLoading } = useCollection<ImageType>(imagesQuery);
  const { data: siteSettingsData, isLoading: settingsLoading } = useDoc<SiteSetting>(siteSettingsRef);
  
  const isLoading = productsLoading || imagesLoading || settingsLoading;
  
  const whatsappUrl = `https://wa.me/${formatWhatsAppNumber(siteSettingsData?.whatsappPhoneNumber ?? '')}`;

  return (
    <div className="container py-16 lg:py-24">
      <div className="text-center max-w-3xl mx-auto mb-12">
         {isLoading ? <Loader2 className="h-8 w-8 mx-auto animate-spin" /> : <>
            <h1 className="text-4xl font-bold tracking-tight">{siteSettingsData?.listingsPageTitle || 'Satıştaki Ürünler'}</h1>
            <p className="mt-4 text-lg text-muted-foreground">
                {siteSettingsData?.listingsPageSubtitle || 'İkinci el ve hurda ürünlerimizi buradan inceleyebilirsiniz. Satın almak için bizimle iletişime geçin.'}
            </p>
         </>}
      </div>

      {isLoading ? (
        <div className="flex justify-center"><Loader2 className="h-10 w-10 animate-spin" /></div>
      ) : (
        <>
          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => {
                const productImageUrl = product.imageUrl;
                const productImage = productImageUrl 
                    ? { url: productImageUrl, altText: product.name }
                    : (findImageById(product.imageId, allImages) ?? getFallbackImage(product.imageId));
                return (
                  <Card key={product.id} className="group flex flex-col overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-border/50">
                    <div className="relative h-64 w-full bg-muted/20">
                      <Image
                        src={getImagePath(productImage.url)}
                        alt={productImage.altText}
                        fill
                        className="object-contain transition-transform duration-500 group-hover:scale-105 p-3"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      {product.stock > 0 ? (
                         <Badge className="absolute top-3 right-3" variant="default">Stokta</Badge>
                      ) : (
                         <Badge className="absolute top-3 right-3" variant="destructive">Tükendi</Badge>
                      )}
                    </div>
                    <CardHeader>
                      <CardTitle>{product.name}</CardTitle>
                      <CardDescription className="text-sm pt-1">{product.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                        <div className="flex items-center gap-2 text-primary font-bold text-2xl">
                           <Tag className="w-6 h-6"/>
                           <span>{product.price.toLocaleString('tr-TR')} TL</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                           <Package className="w-5 h-5"/>
                           <span>Stok: {product.stock} adet</span>
                        </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      {(() => {
                        const message = `Merhaba, ${product.name} (${product.price.toLocaleString('tr-TR')} TL) ürünü hakkında bilgi almak istiyorum.`;
                        const productWhatsappUrl = `https://wa.me/${formatWhatsAppNumber(siteSettingsData?.whatsappPhoneNumber ?? '')}?text=${encodeURIComponent(message)}`;
                        
                        return (
                          <Button asChild className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white transition-all active:scale-95" disabled={product.stock <= 0}>
                            <Link href={productWhatsappUrl} target="_blank">
                              <ShoppingCart className="mr-2 h-5 w-5" /> WhatsApp'tan Sor
                            </Link>
                          </Button>
                        );
                      })()}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
             <div className="text-center py-16 px-4 bg-muted rounded-lg">
                <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Henüz İlan Yok</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Satışa çıkarılan ürünler olduğunda burada listelenecektir.
                </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
