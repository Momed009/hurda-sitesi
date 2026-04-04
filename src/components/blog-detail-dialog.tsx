'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Blog, Image as ImageType } from '@/lib/types';
import Image from 'next/image';
import { getImagePath } from '@/lib/utils';
import { CalendarDays } from 'lucide-react';
import React from 'react';

interface BlogDetailDialogProps {
  post: Blog;
  postImage: ImageType;
  children: React.ReactNode; // This will be the trigger
}

export function BlogDetailDialog({ post, postImage, children }: BlogDetailDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl w-[90vw] h-[90vh] flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 text-center px-6 pt-6 border-b pb-4">
          <DialogTitle className="text-2xl md:text-3xl font-bold tracking-tight">
            {post.title}
          </DialogTitle>
          <div className="flex items-center justify-center gap-2 text-muted-foreground pt-2">
            <CalendarDays className="w-4 h-4" />
            <time dateTime={post.publishDate}>
              {new Date(post.publishDate).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </div>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto px-6">
            <div className="relative w-full h-64 md:h-96 my-6 rounded-lg overflow-hidden">
                <Image
                src={getImagePath(postImage.url)}
                alt={postImage.altText}
                fill
                className="object-cover"
                />
            </div>
            <div className="prose prose-lg max-w-none mx-auto text-foreground/90 leading-relaxed pb-6">
                 <p className="text-xl text-muted-foreground italic">{post.metaDescription}</p>
                 <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
