'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Portfolio } from '@/lib/types';

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

const formSchema = z.object({
  title: z.string().min(3, { message: 'Başlık en az 3 karakter olmalıdır.' }),
  description: z.string().min(10, { message: 'Açıklama en az 10 karakter olmalıdır.' }),
  imageId: z.string().min(3, { message: 'Görsel ID girilmelidir.' }),
  displayOrder: z.coerce.number().int().min(0, { message: 'Sıralama 0 veya daha büyük olmalıdır.' }),
});

type PortfolioFormValues = z.infer<typeof formSchema>;

interface PortfolioFormProps {
  initialData?: Portfolio | null;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
}

export function PortfolioForm({ initialData, onSubmit, isSubmitting }: PortfolioFormProps) {
  const router = useRouter();

  const defaultValues = initialData
    ? { ...initialData }
    : {
        title: '',
        description: '',
        imageId: '',
        displayOrder: 0,
      };

  const form = useForm<PortfolioFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  const handleFormSubmit = async (data: PortfolioFormValues) => {
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
            <CardTitle>İş Bilgileri</CardTitle>
            <CardDescription>Tamamlanan işin detaylarını ve fotoğrafını girin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İş Başlığı</FormLabel>
                    <FormControl>
                      <Input placeholder="Örn: Fabrika Yıkım Projesi" {...field} />
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
                        onSelect={(id) => field.onChange(id)} 
                        currentValue={field.value}
                      />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="gorsel-kimligi" {...field} />
                    </FormControl>
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
                    <Textarea rows={4} placeholder="Yapılan iş hakkında kısa bir açıklama yazın." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="displayOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sıralama</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormDescription>Küçük sayı önce gösterilir.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Değişiklikleri Kaydet' : 'İşi Yayınla'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            İptal
          </Button>
        </div>
      </form>
    </Form>
  );
}
