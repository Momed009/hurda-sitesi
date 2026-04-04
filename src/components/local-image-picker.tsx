'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, FolderOpen, ImageIcon } from 'lucide-react';
import { getImagePath } from '@/lib/utils';
import Image from 'next/image';

interface LocalImagePickerProps {
  onSelect: (filename: string) => void;
}

export function LocalImagePicker({ onSelect }: LocalImagePickerProps) {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchImages();
    }
  }, [isOpen]);

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/local-images');
      const data = await response.json();
      if (Array.isArray(data)) {
        setImages(data);
      }
    } catch (error) {
      console.error('Error fetching local images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (filename: string) => {
    onSelect(filename);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" type="button" className="w-full flex items-center justify-center gap-2">
          <FolderOpen className="w-4 h-4" />
          Klasörden Resim Seç
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            Klasördeki Görseller (public/images)
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse">Klasör taranıyor...</p>
          </div>
        ) : images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 overflow-y-auto">
            {images.map((img) => (
              <div 
                key={img}
                onClick={() => handleSelect(img)}
                className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border bg-muted transition-all hover:ring-2 hover:ring-primary hover:border-primary"
              >
                <img
                  src={getImagePath(img)}
                  alt={img}
                  className="object-cover w-full h-full transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-end p-2 transition-opacity">
                  <span className="text-[10px] text-white truncate w-full bg-black/60 px-1 rounded">
                    {img}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
            <p className="text-lg font-medium">Klasör Boş!</p>
            <p className="text-muted-foreground text-sm">
                `public/images` klasöründe herhangi bir görsel bulunamadı.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
