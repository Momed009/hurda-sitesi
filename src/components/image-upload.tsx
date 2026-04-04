'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { initializeFirebase } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface ImageUploadProps {
  onUploadSuccess: (urlOrFilename: string) => void;
}

export function ImageUpload({ onUploadSuccess }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Hatalı Dosya!',
        description: 'Lütfen sadece görsel (resim) dosyası yükleyin.',
      });
      return;
    }

    // Dosya boyutu kontrolü (10MB'a yükseltildi)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'Dosya Çok Büyük!',
        description: 'Lütfen 10MB\'dan küçük görseller yükleyin.',
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const { storage } = initializeFirebase();
      
      // Benzersiz dosya adı oluştur
      const timestamp = Date.now();
      const cleanName = file.name.replace(/\s+/g, '-').toLowerCase();
      const fileName = `uploads/${timestamp}-${cleanName}`;
      
      const storageRef = ref(storage, fileName);
      
      // Doğrudan Firebase Storage'a yükle
      const snapshot = await uploadBytes(storageRef, file);
      
      // Yüklenen dosyanın internet adresini (URL) al
      const downloadURL = await getDownloadURL(snapshot.ref);

      toast({
        title: 'Başarılı!',
        description: 'Görsel buluta yüklendi.',
      });
      
      // Form'a dosya adını değil, direkt internet adresini veriyoruz
      onUploadSuccess(downloadURL);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Yükleme Hatası!',
        description: 'Bulut depolama sunucusuna erişilemedi. Lütfen internet bağlantınızı kontrol edin.',
      });
    } finally {
      setIsUploading(false);
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
      <Button 
        type="button" 
        variant="secondary" 
        disabled={isUploading} 
        onClick={triggerFileInput}
        className="w-full flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
      >
        {isUploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Upload className="w-4 h-4" />
        )}
        {isUploading ? 'Buluta Yükleniyor...' : 'Galeriden / Dosyadan Yükle'}
      </Button>
    </div>
  );
}
