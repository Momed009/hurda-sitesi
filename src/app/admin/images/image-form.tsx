'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Image } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { getImagePath } from '@/lib/utils';
import { LocalImagePicker } from '@/components/local-image-picker';
import { ImageUpload } from '@/components/image-upload';

const formSchema = z.object({
  url: z.string().min(3, { message: 'URL veya dosya adı girmelisiniz.' }),
  altText: z.string().min(3, { message: 'Alternatif metin en az 3 karakter olmalıdır.' }),
  caption: z.string().optional(),
  usageContext: z.string().min(3, { message: 'Kullanım bağlamı en az 3 karakter olmalıdır.' }),
});

type ImageFormValues = z.infer<typeof formSchema>;

interface ImageFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Image | null;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
}

export function ImageForm({ isOpen, onOpenChange, initialData, onSubmit, isSubmitting }: ImageFormProps) {
  const form = useForm<ImageFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? { ...initialData }
      : {
          url: '',
          altText: '',
          caption: '',
          usageContext: '',
        },
  });

  const imageUrl = form.watch('url');

  // Reset form when initialData changes or dialog opens for a new image
  React.useEffect(() => {
    if(isOpen) {
        form.reset(initialData ? { ...initialData } : { url: '', altText: '', caption: '', usageContext: '' });
    }
  }, [initialData, isOpen, form]);

  const handleFormSubmit = async (data: ImageFormValues) => {
    await onSubmit({
      ...data,
      uploadDate: initialData?.uploadDate || new Date().toISOString(),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Görseli Düzenle' : 'Yeni Görsel Ekle'}</DialogTitle>
          <DialogDescription>
            Görselin bilgilerini buradan ekleyin veya güncelleyin.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <div className="max-h-[70vh] overflow-y-auto pr-4 py-4">
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Görsel URL / Dosya Adı</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-2 p-3 border rounded-lg bg-muted/30">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">1. Görseli Seç veya Yükle</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <LocalImagePicker onSelect={(filename) => form.setValue('url', filename)} />
                                <ImageUpload onUploadSuccess={(filename) => form.setValue('url', filename)} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 p-3 border rounded-lg bg-muted/30">
                             <Label className="text-xs font-semibold uppercase text-muted-foreground">2. Dosya Adı / URL (Otomatik Dolar)</Label>
                             <Input placeholder="https://... veya ornek-gorsel.jpg" {...field} />
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      İster klasörden seçin, ister galeriden yeni bir fotoğraf yükleyin. Dosya adı otomatik olarak kutucuğa dolacaktır.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {imageUrl && (
                  <div className="space-y-2">
                      <FormLabel>Önizleme</FormLabel>
                      <div className="relative aspect-video w-full rounded-md border overflow-hidden bg-muted">
                          <img
                              src={getImagePath(imageUrl)}
                              alt="Görsel Önizlemesi"
                              className="object-contain w-full h-full"
                          />
                      </div>
                  </div>
              )}

              <FormField
                control={form.control}
                name="altText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alternatif Metin (SEO için)</FormLabel>
                    <FormControl>
                      <Input placeholder="Örn: Hurda bakır kablolar" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="usageContext"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kullanım Bağlamı</FormLabel>
                    <FormControl>
                      <Input placeholder="Örn: Blog, Logo, Hizmet" {...field} />
                    </FormControl>
                     <FormDescription>Görselin nerede kullanıldığını belirtin (örn: 'Hizmetler Sayfası', 'Blog Yazısı').</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="caption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Görsel Açıklaması (Opsiyonel)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Görselle ilgili kısa açıklama" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </div>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              İptal
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting} onClick={form.handleSubmit(handleFormSubmit)}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Kaydet' : 'Oluştur'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
