'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, ImageIcon, Search, Check } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { getImagePath } from '@/lib/utils';
import type { Image as ImageType } from '@/lib/types';
import { Input } from '@/components/ui/input';

interface MediaPickerProps {
  onSelect: (id: string) => void;
  currentValue?: string;
}

export function MediaPicker({ onSelect, currentValue }: MediaPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const firestore = useFirestore();

  const imagesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'images'), orderBy('uploadDate', 'desc'));
  }, [firestore]);

  const { data: images, isLoading } = useCollection<ImageType>(imagesQuery);

  const filteredImages = images?.filter(img => 
    img.altText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    img.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    img.url?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (id: string) => {
    onSelect(id);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" type="button" className="flex items-center gap-1 h-9 px-3 shrink-0">
          <ImageIcon className="w-4 h-4" />
          Seç
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ImageIcon className="w-6 h-6 text-primary" />
            Medya Kütüphanesi
          </DialogTitle>
        </DialogHeader>

        <div className="relative my-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Görsel ara (ID, Alt metin veya dosya adı)..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse font-medium">Kütüphane yükleniyor...</p>
          </div>
        ) : filteredImages && filteredImages.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 overflow-y-auto p-1">
            {filteredImages.map((img) => (
              <div 
                key={img.id}
                onClick={() => handleSelect(img.id)}
                className={`group relative aspect-square cursor-pointer overflow-hidden rounded-xl border-2 transition-all hover:ring-2 hover:ring-primary ${
                  currentValue === img.id ? 'border-primary ring-2 ring-primary/30' : 'border-transparent bg-muted/50'
                }`}
              >
                <img
                  src={getImagePath(img.url)}
                  alt={img.altText}
                  className="object-cover w-full h-full transition-transform group-hover:scale-105"
                />
                
                {currentValue === img.id && (
                  <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full shadow-lg">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 text-white">
                  <p className="text-[10px] font-bold truncate">{img.id}</p>
                  <p className="text-[8px] opacity-80 truncate">{img.altText}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="p-4 bg-muted rounded-full">
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold">Görsel Bulunamadı</p>
            <p className="text-muted-foreground text-sm max-w-[300px]">
                Aradığınız kriterlere uygun kayıtlı bir görsel yok veya henüz hiç görsel eklemediniz.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
