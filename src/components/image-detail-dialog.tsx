'use client';

import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Image as ImageType } from '@/lib/types';
import Image from 'next/image';
import { getImagePath } from '@/lib/utils';
import React from 'react';

interface ImageDetailDialogProps {
  image: ImageType;
  children: React.ReactNode; // This will be the trigger
}

export function ImageDetailDialog({ image, children }: ImageDetailDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl w-[90vw] h-auto p-2 bg-transparent border-0 shadow-none">
        <div className="relative w-full h-auto aspect-video">
            <Image
                src={getImagePath(image.url)}
                alt={image.altText}
                fill
                className="object-contain"
            />
        </div>
      </DialogContent>
    </Dialog>
  );
}
