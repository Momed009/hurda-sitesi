'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, CalendarDays, Loader2 } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import type { Blog, Image as ImageType, SiteSetting } from '@/lib/types';
import { findImageById, getFallbackImage } from '@/lib/placeholder-images';
import { getImagePath } from '@/lib/utils';
import { BlogDetailDialog } from '@/components/blog-detail-dialog';

export default function BlogPageClient() {
  const firestore = useFirestore();
  const blogQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'blogs'), orderBy('publishDate', 'desc')) : null, [firestore]);
  const imagesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'images') : null, [firestore]);
  const siteSettingsRef = useMemoFirebase(() => firestore ? doc(firestore, 'siteSettings', 'main') : null, [firestore]);

  const { data: posts, isLoading: postsLoading } = useCollection<Blog>(blogQuery);
  const { data: allImages, isLoading: imagesLoading } = useCollection<ImageType>(imagesQuery);
  const { data: siteSettings, isLoading: settingsLoading } = useDoc<SiteSetting>(siteSettingsRef);

  const isLoading = postsLoading || imagesLoading || settingsLoading;

  return (
    <div className="container py-16 lg:py-24">
      <div className="text-center max-w-3xl mx-auto mb-12">
        {isLoading ? <Loader2 className="h-8 w-8 mx-auto animate-spin" /> : <>
          <h1 className="text-4xl font-bold tracking-tight">{siteSettings?.blogPageTitle || 'Blog'}</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {siteSettings?.blogPageSubtitle || 'Hurdacılık ve geri dönüşüm dünyasından en son haberler, ipuçları ve faydalı bilgiler.'}
          </p>
        </>}
      </div>

      {isLoading ? (
        <div className="flex justify-center"><Loader2 className="h-10 w-10 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(posts ?? []).map((post) => {
            const postImage = findImageById(post.thumbnailImageId, allImages) ?? getFallbackImage(post.thumbnailImageId);
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
                  <CardTitle className="text-xl">
                      {post.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 text-sm pt-2">
                      <CalendarDays className="w-4 h-4"/>
                      {new Date(post.publishDate).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground line-clamp-4">
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
      )}
    </div>
  );
}
