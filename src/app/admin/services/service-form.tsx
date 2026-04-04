'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Service } from '@/lib/types';

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
import { useEffect } from 'react';

const formSchema = z.object({
  title: z.string().min(3, { message: 'Hizmet adı en az 3 karakter olmalıdır.' }),
  description: z.string().min(10, { message: 'Açıklama en az 10 karakter olmalıdır.' }),
  imageIds: z.string().min(3, { message: 'En az bir görsel ID girilmelidir.' }),
  displayOrder: z.coerce.number().int({ message: 'Sıralama bir tam sayı olmalıdır.' }),
});

type ServiceFormValues = z.infer<typeof formSchema>;

interface ServiceFormProps {
  initialData?: Service | null;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
}

export function ServiceForm({ initialData, onSubmit, isSubmitting }: ServiceFormProps) {
  const router = useRouter();

  const defaultValues = initialData
    ? { 
        ...initialData,
        imageIds: initialData.imageIds.join(', '),
      }
    : {
        title: '',
        description: '',
        imageIds: '',
        displayOrder: 0,
      };

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        imageIds: initialData.imageIds.join(', ')
      });
    }
  }, [initialData, form]);

  const handleFormSubmit = async (data: ServiceFormValues) => {
    const processedData = {
      ...data,
      imageIds: data.imageIds.split(',').map(id => id.trim()).filter(Boolean),
    };
    await onSubmit(processedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Hizmet Bilgileri</CardTitle>
            <CardDescription>Sitenizde sunulan bir hizmetin detaylarını girin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Hizmet Adı</FormLabel>
                      <FormControl>
                          <Input placeholder="Örn: Demir & Çelik Hurda Alımı" {...field} />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
              />

              <FormField
                  control={form.control}
                  name="imageIds"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Görsel ID'leri</FormLabel>
                      <FormControl>
                          <Input placeholder="gorsel-1, gorsel-2, gorsel-3" {...field} />
                      </FormControl>
                      <FormDescription>Virgülle ayırın (örn: gorsel-1, gorsel-2)</FormDescription>
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
                        <Textarea rows={5} placeholder="Hizmetin detayları hakkında bilgi verin." {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />

            <div className="w-full md:w-1/2">
                <FormField
                    control={form.control}
                    name="displayOrder"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Görüntülenme Sırası</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormDescription>Küçükten büyüğe sıralanır (örn: 1, 10, 20).</FormDescription>
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
                {initialData ? 'Değişiklikleri Kaydet' : 'Hizmeti Oluştur'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
                İptal
            </Button>
        </div>
      </form>
    </Form>
  );
}
