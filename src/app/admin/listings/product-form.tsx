'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Product } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { MediaPicker } from '@/components/media-picker';
import { useEffect } from 'react';
import { getImagePath } from '@/lib/utils';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Ürün adı en az 3 karakter olmalıdır.' }),
  description: z.string().min(10, { message: 'Açıklama en az 10 karakter olmalıdır.' }),
  price: z.coerce.number().positive({ message: 'Fiyat 0\'dan büyük olmalıdır.' }),
  stock: z.coerce.number().int().min(0, { message: 'Stok negatif olamaz.' }),
  imageId: z.string().min(3, { message: 'Görsel ID girilmelidir.' }),
  imageUrl: z.string().optional(),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData?: Product | null;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
}

export function ProductForm({ initialData, onSubmit, isSubmitting }: ProductFormProps) {
  const router = useRouter();

  const defaultValues = initialData
    ? { ...initialData }
    : {
        name: '',
        description: '',
        price: 0,
        stock: 0,
        imageId: '',
        imageUrl: '',
      };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  const handleFormSubmit = async (data: ProductFormValues) => {
    const processedData = {
      ...data,
      createdAt: initialData?.createdAt || new Date().toISOString(),
    };
    await onSubmit(processedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Ürün Bilgileri</CardTitle>
            <CardDescription>Satmak istediğiniz ürünün detaylarını girin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Ürün Adı</FormLabel>
                        <FormControl>
                            <Input placeholder="Örn: 2. El Buzdolabı" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="imageId"
                    render={({ field }) => (
                        <FormItem>
                         <FormLabel className="flex items-center justify-between">
                             Görsel ID
                             <MediaPicker 
                                 onSelect={(image) => {
                                     field.onChange(image.id);
                                     form.setValue('imageUrl', image.url);
                                 }} 
                                 currentValue={field.value}
                             />
                         </FormLabel>
                         <FormControl>
                             <Input placeholder="gorsel-kimligi" {...field} />
                         </FormControl>
                         {form.watch('imageUrl') && (
                             <div className="mt-2 relative w-32 h-32 rounded-lg overflow-hidden border border-border group bg-muted/40">
                                 <img 
                                     src={getImagePath(form.watch('imageUrl') || '')} 
                                     alt="Önizleme" 
                                     className="w-full h-full object-contain transition-all"
                                 />
                                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                     <p className="text-[10px] text-white font-medium">Tam Görünüm</p>
                                 </div>
                             </div>
                         )}
                         <FormDescription>Görsel Yönetimi'nden ID seçin.</FormDescription>
                         <FormMessage />
                         </FormItem>
                     )}
                />
            </div>
            
            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Açıklama</FormLabel>
                    <FormControl>
                        <Textarea rows={5} placeholder="Ürünün durumu, markası, modeli gibi bilgileri girin." {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Fiyat (TL)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="500" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Stok (Adet)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="1" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? 'Değişiklikleri Kaydet' : 'İlanı Yayınla'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
                İptal
            </Button>
        </div>
      </form>
    </Form>
  );
}
