'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ServiceForm } from '../service-form';
import { useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NewServicePage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    if (!firestore) return;
    setIsSubmitting(true);
    try {
      const collectionRef = collection(firestore, 'services');
      await addDocumentNonBlocking(collectionRef, data);
      
      toast({
        title: 'Başarılı!',
        description: 'Yeni hizmet başarıyla oluşturuldu.',
      });
      router.push('/admin/services');
      router.refresh();
    } catch (error) {
      console.error('Error creating service:', error);
      toast({
        variant: 'destructive',
        title: 'Hata!',
        description: 'Hizmet oluşturulurken bir hata oluştu.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex items-center gap-4">
             <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Geri</span>
            </Button>
            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                Yeni Hizmet Oluştur
            </h1>
        </div>
        <ServiceForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
