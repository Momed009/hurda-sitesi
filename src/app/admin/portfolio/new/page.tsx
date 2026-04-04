'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PortfolioForm } from '../portfolio-form';
import { useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NewPortfolioPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    if (!firestore) return;
    setIsSubmitting(true);
    try {
      const collectionRef = collection(firestore, 'portfolio');
      await addDocumentNonBlocking(collectionRef, data);

      toast({
        title: 'Başarılı!',
        description: 'Yeni iş başarıyla eklendi.',
      });
      router.push('/admin/portfolio');
      router.refresh();
    } catch (error) {
      console.error('Error creating portfolio item:', error);
      toast({
        variant: 'destructive',
        title: 'Hata!',
        description: 'İş eklenirken bir hata oluştu.',
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
          Yeni İş Ekle
        </h1>
      </div>
      <PortfolioForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
