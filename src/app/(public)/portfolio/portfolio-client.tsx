'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, FolderOpen } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import type { Portfolio, Image as ImageType, SiteSetting } from '@/lib/types';
import { findImageById, getFallbackImage } from '@/lib/placeholder-images';
import { getImagePath } from '@/lib/utils';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function PortfolioPageClient() {
  const firestore = useFirestore();
  const [selectedItem, setSelectedItem] = useState<{ portfolio: Portfolio; image: ImageType } | null>(null);

  const portfolioQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'portfolio'), orderBy('displayOrder', 'asc'));
  }, [firestore]);

  const imagesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'images') : null, [firestore]);

  const siteSettingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'siteSettings', 'main');
  }, [firestore]);

  const { data: portfolioItems, isLoading: portfolioLoading } = useCollection<Portfolio>(portfolioQuery);
  const { data: allImages, isLoading: imagesLoading } = useCollection<ImageType>(imagesQuery);
  const { data: siteSettingsData, isLoading: settingsLoading } = useDoc<SiteSetting>(siteSettingsRef);

  const isLoading = portfolioLoading || imagesLoading || settingsLoading;

  return (
    <>
      <div className="container py-16 lg:py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          {isLoading ? (
            <Loader2 className="h-8 w-8 mx-auto animate-spin" />
          ) : (
            <>
              <h1 className="text-4xl font-bold tracking-tight">
                {siteSettingsData?.portfolioPageTitle || 'Yapılan İşler'}
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                {siteSettingsData?.portfolioPageSubtitle || 'Gerçekleştirdiğimiz projeleri ve tamamlanan işleri aşağıda inceleyebilirsiniz.'}
              </p>
            </>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center">
            <Loader2 className="h-10 w-10 animate-spin" />
          </div>
        ) : (
          <>
            {portfolioItems && portfolioItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolioItems.map((item) => {
                  const itemImage = findImageById(item.imageId, allImages) ?? getFallbackImage(item.imageId);
                  return (
                    <Card
                      key={item.id}
                      className="group overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                      onClick={() => setSelectedItem({ portfolio: item, image: itemImage })}
                    >
                      <div className="relative h-64 w-full overflow-hidden">
                        <Image
                          src={getImagePath(itemImage.url)}
                          alt={itemImage.altText || item.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <CardContent className="p-5">
                        <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 px-4 bg-muted rounded-lg">
                <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Henüz İş Eklenmedi</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Tamamlanan projeler olduğunda burada listelenecektir.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          {selectedItem && (
            <>
              <DialogTitle className="sr-only">{selectedItem.portfolio.title}</DialogTitle>
              <DialogDescription className="sr-only">{selectedItem.portfolio.description}</DialogDescription>
              <div className="relative w-full aspect-video">
                <Image
                  src={getImagePath(selectedItem.image.url)}
                  alt={selectedItem.image.altText || selectedItem.portfolio.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{selectedItem.portfolio.title}</h3>
                <p className="text-muted-foreground">{selectedItem.portfolio.description}</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
