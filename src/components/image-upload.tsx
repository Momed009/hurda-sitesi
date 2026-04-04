'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface ImageUploadProps {
  onUploadSuccess: (urlOrFilename: string) => void;
}

export function ImageUpload({ onUploadSuccess }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Cloudinary Bilgileri (Unsigned Upload için)
  const CLOUD_NAME = 'dyxjsdus1';
  const UPLOAD_PRESET = 'temur-preset';

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
    
    // Cloudinary için FormData hazırla
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      // XMLHttpRequest kullanarak yükleme ilerlemesini takibi (%)
      const xhr = new XMLHttpRequest();
      
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, true);

      // İlerleme Takibi
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          const downloadURL = response.secure_url;
          
          toast({
            title: 'Başarılı!',
            description: 'Görsel Cloudinary bulutuna yüklendi.',
          });
          
          onUploadSuccess(downloadURL);
          setIsUploading(false);
          setProgress(0);
        } else {
          console.error('Cloudinary error response:', xhr.responseText);
          throw new Error('Yükleme başarısız oldu.');
        }
      };

      xhr.onerror = () => {
        throw new Error('Ağ hatası oluştu.');
      };

      xhr.send(formData);
      
    } catch (error: any) {
      console.error('Cloudinary upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Yükleme Hatası!',
        description: 'Bulut depolama sunucusuna erişilemedi. Lütfen internet bağlantınızı kontrol edin.',
      });
      setIsUploading(false);
      setProgress(0);
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
          className="w-full flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 relative overflow-hidden transition-all active:scale-95"
        >
          {isUploading ? (
            <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Buluta Uçuyor: %{progress}</span>
            </div>
          ) : (
            <>
                <Upload className="w-4 h-4" />
                <span>Hızlı Galeri Yüklemesi</span>
            </>
          )}
        </Button>

        {isUploading && (
            <div className="space-y-1">
                <Progress value={progress} className="h-2" />
                <p className="text-[10px] text-center text-muted-foreground animate-pulse">
                    Cloudinary CDN üzerinden optimize ediliyor...
                </p>
            </div>
        )}
      </div>
    </div>
  );
}
