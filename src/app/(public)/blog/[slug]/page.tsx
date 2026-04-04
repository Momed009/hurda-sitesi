'use client';

import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import { findImageById, getFallbackImage } from '@/lib/placeholder-images';
import { CalendarDays, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import type { Blog, Image as ImageType } from '@/lib/types';
import { getImagePath } from '@/lib/utils';


export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const firestore = useFirestore();

  const postQuery = useMemoFirebase(() => {
    if (!firestore || !slug) return null;
    return query(collection(firestore, 'blogs'), where('slug', '==', slug), limit(1));
  }, [firestore, slug]);
  
  const imagesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'images') : null, [firestore]);

  const { data: postData, isLoading: postLoading } = useCollection<Blog>(postQuery);
  const { data: allImages, isLoading: imagesLoading } = useCollection<ImageType>(imagesQuery);
  
  const post = postData?.[0];
  const isLoading = postLoading || imagesLoading;

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-20rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    notFound();
  }
  
  const postImage = findImageById(post.thumbnailImageId, allImages) ?? getFallbackImage(post.thumbnailImageId);

  return (
    <article className="container max-w-4xl py-16 lg:py-24">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{post.title}</h1>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <CalendarDays className="w-4 h-4" />
          <time dateTime={post.publishDate}>
            {new Date(post.publishDate).toLocaleDateString('tr-TR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </div>
      </div>

      <div className="relative w-full h-64 md:h-96 my-8 rounded-lg overflow-hidden">
        <Image
          src={getImagePath(postImage.url)}
          alt={postImage.altText}
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="prose prose-lg max-w-none mx-auto text-foreground/90 leading-relaxed">
        <p className="text-xl text-muted-foreground italic">{post.metaDescription}</p>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
      
      <div className="mt-12 text-center">
        <Button asChild variant="outline">
          <Link href="/blog">Tüm Yazılara Geri Dön</Link>
        </Button>
      </div>

    </article>
  );
}
