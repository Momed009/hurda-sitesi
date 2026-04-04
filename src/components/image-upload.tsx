'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onUploadSuccess: (filename: string) => void;
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

    // Dosya boyutu kontrolü (Örn: 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'Dosya Çok Büyük!',
        description: 'Lütfen 5MB\'dan küçük görseller yükleyin.',
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Başarılı!',
          description: 'Görsel yüklendi ve seçildi.',
        });
        onUploadSuccess(data.filename);
      } else {
        throw new Error(data.error || 'Yükleme başarısız.');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Yükleme Hatası!',
        description: error.message || 'Görsel yüklenirken bir sorun oluştu.',
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
        {isUploading ? 'Yükleniyor...' : 'Galeriden / Dosyadan Yükle'}
      </Button>
    </div>
  );
}
