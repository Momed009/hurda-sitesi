'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { initializeFirebase } from '@/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Progress } from '@/components/ui/progress';

interface ImageUploadProps {
  onUploadSuccess: (url: string) => void;
}

export function ImageUpload({ onUploadSuccess }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Görseli sıkıştırmak için yardımcı fonksiyon (Browser-side)
  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1600; // Maksimum genişlik
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Kaliteyi %80 yaparak WebP olarak dışa aktar (Hız ve Kalite Dengesi)
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Sıkıştırma hatası!'));
            },
            'image/webp',
            0.8
          );
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Hatalı Dosya!',
        description: 'Lütfen sadece görsel (resim) dosyası yükleyin.',
      });
      return;
    }

    setIsUploading(true);
    setProgress(0);
    
    try {
      // 1. ADIM: GÖRSELİ SIKILŞTIR (Hızlandırma Mekanizması)
      const compressedBlob = await compressImage(file);
      
      const { storage } = initializeFirebase();
      const timestamp = Date.now();
      const cleanName = file.name.replace(/\s+/g, '-').toLowerCase().split('.')[0];
      const fileName = `uploads/${timestamp}-${cleanName}.webp`; // Hepsi WebP olacak (Yüksek Verim)
      
      const storageRef = ref(storage, fileName);
      
      // 2. ADIM: YÜKLEMEYİ BAŞLAT (Resumable - İlerleme Takibi İçin)
      const uploadTask = uploadBytesResumable(storageRef, compressedBlob);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // İLERLEME HESAPLA (%)
          const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setProgress(percent);
        },
        (error) => {
          console.error('Upload task error:', error);
          throw error;
        },
        async () => {
          // YÜKLEME BİTTİ
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          toast({
            title: 'Tamamlandı!',
            description: 'Görsel optimize edildi ve yüklendi.',
          });
          onUploadSuccess(downloadURL);
          setIsUploading(false);
          setProgress(0);
        }
      );
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Yükleme Hatası!',
        description: 'Bulut depolama sunucusuna erişilemedi.',
      });
      setIsUploading(false);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <div className="space-y-2">
        <Button 
          type="button" 
          variant="secondary" 
          disabled={isUploading} 
          onClick={triggerFileInput}
          className="w-full flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 relative overflow-hidden"
        >
          {isUploading ? (
            <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Yükleniyor: %{progress}</span>
            </div>
          ) : (
            <>
                <Upload className="w-4 h-4" />
                <span>Galeriden / Dosyadan Yükle</span>
            </>
          )}
        </Button>

        {isUploading && (
            <div className="space-y-1">
                <Progress value={progress} className="h-2" />
                <p className="text-[10px] text-center text-muted-foreground animate-pulse">
                    Görsel kalitesi optimize ediliyor ve buluta gönderiliyor...
                </p>
            </div>
        )}
      </div>
    </div>
  );
}
