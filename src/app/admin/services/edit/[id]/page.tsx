'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import type { Service } from '@/lib/types';
import { ServiceForm } from '../../service-form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const docRef = useMemoFirebase(() => {
    if (!firestore || typeof id !== 'string') return null;
    return doc(firestore, 'services', id);
  }, [firestore, id]);

  const { data: service, isLoading } = useDoc<Service>(docRef);

  const handleSubmit = async (data: any) => {
    if (!firestore || typeof id !== 'string') return;
    setIsSubmitting(true);
    try {
      const serviceRef = doc(firestore, 'services', id);
      await updateDocumentNonBlocking(serviceRef, data);
      toast({
        title: 'Başarılı!',
        description: 'Hizmet başarıyla güncellendi.',
      });
      router.push('/admin/services');
      router.refresh();
    } catch (error) {
      console.error('Error updating service:', error);
      toast({
        variant: 'destructive',
        title: 'Hata!',
        description: 'Hizmet güncellenirken bir hata oluştu.',
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

  if (!service) {
    return (
        <Card>
            <CardContent className='pt-6 text-center'>
                <p>Hizmet bulunamadı veya yüklenemedi.</p>
                 <Button variant="outline" className="mt-4" onClick={() => router.push('/admin/services')}>
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
                Hizmeti Düzenle
            </h1>
        </div>
        <ServiceForm initialData={service} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
