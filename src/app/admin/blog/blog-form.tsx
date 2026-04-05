'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Blog } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, X } from 'lucide-react';
import { MediaPicker } from '@/components/media-picker';
import { useEffect } from 'react';
import { getImagePath } from '@/lib/utils';

const formSchema = z.object({
  title: z.string().min(5, { message: 'Başlık en az 5 karakter olmalıdır.' }),
  slug: z.string().min(5, { message: 'Slug en az 5 karakter olmalıdır.' }),
  content: z.string().min(100, { message: 'İçerik en az 100 karakter olmalıdır.' }),
  metaDescription: z.string().min(10, { message: 'Meta açıklama en az 10 karakter olmalıdır.' }).max(160, { message: 'Meta açıklama en fazla 160 karakter olabilir.' }),
  keywords: z.string().min(3, { message: 'En az bir anahtar kelime girin.' }),
  thumbnailImageId: z.string().min(3, { message: 'Görsel ID girilmelidir.' }),
  thumbnailImageUrl: z.string().optional(),
  isFeaturedOnHomepage: z.boolean().default(false),
});

type BlogFormValues = z.infer<typeof formSchema>;

interface BlogFormProps {
  initialData?: Blog | null;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
}

const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD') // separate accent from letter
    .replace(/[\u0300-\u036f]/g, '') // remove all separated accents
    .replace(/\s+/g, '-') // replace spaces with -
    .replace(/[^\w-]+/g, '') // remove all non-word chars
    .replace(/--+/g, '-'); // replace multiple - with single -

export function BlogForm({ initialData, onSubmit, isSubmitting }: BlogFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const defaultValues = initialData
    ? {
        ...initialData,
        keywords: initialData.keywords.join(', '),
      }
    : {
        title: '',
        slug: '',
        content: '',
        metaDescription: '',
        keywords: '',
        thumbnailImageId: '', // Default placeholder
        thumbnailImageUrl: '',
        isFeaturedOnHomepage: false,
      };

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const titleValue = form.watch('title');
  useEffect(() => {
    if (titleValue && !initialData) { // Only auto-slugify for new posts
        const slug = slugify(titleValue);
        form.setValue('slug', slug, { shouldValidate: true });
    }
  }, [titleValue, form, initialData]);


  const handleFormSubmit = async (data: BlogFormValues) => {
     const processedData = {
        ...data,
        keywords: data.keywords.split(',').map(kw => kw.trim()).filter(Boolean),
        author: 'Atık Rehber Ekibi',
        publishDate: initialData?.publishDate || new Date().toISOString(),
     };
    await onSubmit(processedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Yazı İçeriği</CardTitle>
                        <CardDescription>Blog yazınızın ana bölümünü oluşturun.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Yazı Başlığı</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Örn: Hurda demir fiyatları neden artıyor?" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL (Slug)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="ornek: hurda-demir-fiyatlari" {...field} disabled={!!initialData} />
                                    </FormControl>
                                    <FormDescription>Yazı URL'i. Başlığa göre otomatik oluşturulur.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Yazı İçeriği</FormLabel>
                                    <FormControl>
                                        <Textarea rows={15} placeholder="Yazınızı buraya yazın..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1 space-y-8">
                <Card>
                     <CardHeader>
                        <CardTitle>SEO & Yayınlama</CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-4">
                         <FormField
                            control={form.control}
                            name="metaDescription"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Meta Açıklaması (SEO)</FormLabel>
                                    <FormControl>
                                        <Textarea rows={4} placeholder="Arama motorları için kısa özet..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="keywords"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Anahtar Kelimeler (SEO)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="hurda, geri dönüşüm, demir" {...field} />
                                    </FormControl>
                                    <FormDescription>Kelimeleri virgülle ayırın.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="thumbnailImageId"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="flex items-center justify-between">
                                    Öne Çıkan Görsel ID
                                    <MediaPicker 
                                        onSelect={(image) => {
                                            field.onChange(image.id);
                                            form.setValue('thumbnailImageUrl', image.url);
                                        }} 
                                        currentValue={field.value}
                                    />
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="gorsel-id-123" {...field} />
                                </FormControl>
                                {form.watch('thumbnailImageUrl') && (
                                    <div className="mt-2 relative w-full h-40 rounded-lg overflow-hidden border border-border group">
                                        <img 
                                            src={getImagePath(form.watch('thumbnailImageUrl'))} 
                                            alt="Önizleme" 
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <p className="text-xs text-white font-medium">Öne Çıkan Görsel Önizlemesi</p>
                                        </div>
                                    </div>
                                )}
                                <FormDescription>Görsel Yönetimi'nden ID seçin.</FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="isFeaturedOnHomepage"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Ana Sayfada Göster</FormLabel>
                                        <FormDescription>
                                            Bu yazıyı ana sayfadaki blog bölümünde öne çıkar.
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />
                     </CardContent>
                </Card>
                <div className="flex gap-2">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? 'Değişiklikleri Kaydet' : 'Yazıyı Yayınla'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        İptal
                    </Button>
                </div>
            </div>
        </div>
      </form>
    </Form>
  );
}
