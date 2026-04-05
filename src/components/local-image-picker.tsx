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
      
      // JSON kontrolü
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setImages(data);
          } else if (data.error) {
              console.error('API Error:', data.error);
              setImages([]);
          }
      } else {
          // HTML hataları durumunda burası yakalayacak
          console.error('API did not return JSON');
          setImages([]);
      }
    } catch (error) {
      console.error('Error fetching local images:', error);
      setImages([]);
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
        ) : (
          <div className="flex-1 overflow-y-auto p-4 md:p-6 min-h-[300px]">
            {images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {images.map((img) => (
                  <div 
                    key={img}
                    onClick={() => handleSelect(img)}
                    className="group relative cursor-pointer overflow-hidden rounded-xl border bg-background shadow-sm hover:shadow-lg hover:border-primary transition-all duration-300"
                    style={{ aspectRatio: '1/1' }}
                  >
                    <img
                      src={getImagePath(img)}
                      alt={img}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm translate-y-full group-hover:translate-y-0 transition-transform p-1.5">
                      <p className="text-[9px] text-white truncate text-center">
                        {img}
                      </p>
                    </div>
                    <div className="absolute inset-0 ring-inset group-hover:ring-2 ring-primary transition-all rounded-xl" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 gap-2 text-center">
                <p className="text-lg font-medium">Klasör Boş!</p>
                <p className="text-muted-foreground text-sm max-w-xs">
                    `public/images` klasöründe herhangi bir görsel bulunamadı.
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
