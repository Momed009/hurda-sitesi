'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import type { Blog } from '@/lib/types';
import { BlogForm } from '../../blog-form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const docRef = useMemoFirebase(() => {
    if (!firestore || typeof id !== 'string') return null;
    return doc(firestore, 'blogs', id);
  }, [firestore, id]);

  const { data: blog, isLoading } = useDoc<Blog>(docRef);

  const handleSubmit = async (data: any) => {
    if (!firestore || typeof id !== 'string') return;
    setIsSubmitting(true);
    try {
      const postRef = doc(firestore, 'blogs', id);
      await updateDocumentNonBlocking(postRef, data);
      toast({
        title: 'Başarılı!',
        description: 'Blog yazısı başarıyla güncellendi.',
      });
      router.push('/admin/blog');
      router.refresh();
    } catch (error) {
      console.error('Error updating blog post:', error);
      toast({
        variant: 'destructive',
        title: 'Hata!',
        description: 'Blog yazısı güncellenirken bir hata oluştu.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!blog) {
    return (
        <Card>
            <CardContent className='pt-6 text-center'>
                <p>Blog yazısı bulunamadı veya yüklenemedi.</p>
                 <Button variant="outline" className="mt-4" onClick={() => router.push('/admin/blog')}>
                    Geri Dön
                </Button>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
             <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Geri</span>
            </Button>
            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                Yazıyı Düzenle
            </h1>
        </div>
        <BlogForm initialData={blog} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
