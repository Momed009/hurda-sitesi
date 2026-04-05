'use client';

import { useState, useEffect } from 'react';
import NextImage from 'next/image';
import { PlusCircle, MoreHorizontal, Trash2, FilePenLine, Loader2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useCollection, useFirestore, useMemoFirebase, deleteDocumentNonBlocking, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import type { Image as ImageType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ImageForm } from './image-form';
import { getImagePath } from '@/lib/utils';

export default function AdminImagesPage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [imageToEdit, setImageToEdit] = useState<ImageType | null>(null);
  const [imageToDelete, setImageToDelete] = useState<ImageType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const imagesQuery = useMemoFirebase(() => (firestore ? query(collection(firestore, 'images'), orderBy('uploadDate', 'desc')) : null), [firestore]);
  
  const { data: imagesFromHook, isLoading } = useCollection<ImageType>(imagesQuery);
  const [displayedImages, setDisplayedImages] = useState<ImageType[] | null>(null);

  useEffect(() => {
    setDisplayedImages(imagesFromHook);
  }, [imagesFromHook]);

  const handleOpenDialog = (image?: ImageType) => {
    setImageToEdit(image || null);
    setDialogOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    if (!firestore) return;
    setIsSubmitting(true);
    try {
      if (imageToEdit) {
        const docRef = doc(firestore, 'images', imageToEdit.id);
        await updateDocumentNonBlocking(docRef, data);
        toast({ title: 'Başarılı!', description: 'Görsel başarıyla güncellendi.' });
      } else {
        await addDocumentNonBlocking(collection(firestore, 'images'), data);
        toast({ title: 'Başarılı!', description: 'Yeni görsel başarıyla eklendi.' });
      }
      setDialogOpen(false);
    } catch (error) {
      console.error('Error submitting image form:', error);
      toast({ variant: 'destructive', title: 'Hata!', description: 'İşlem sırasında bir hata oluştu.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!imageToDelete || !firestore) return;

    const imageId = imageToDelete.id;
    
    // 1. Close the dialog FIRST
    setImageToDelete(null);

    // 2. Wait for Radix UI dialog unmount animation to finish before DOM is mutated
    // This perfectly prevents the pointer-events UI freeze bug.
    setTimeout(() => {
      // 3. Perform deletion in background
      const docRef = doc(firestore, 'images', imageId);
      deleteDocumentNonBlocking(docRef).then(() => {
        toast({ title: 'Görsel Silindi', description: `Görsel başarıyla silindi.` });
      });
    }, 300);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Kopyalandı!', description: 'Görsel ID panoya kopyalandı.' });
  };

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Görsel Yönetimi</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" className="h-8 gap-1" onClick={() => handleOpenDialog()}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Yeni Görsel Ekle</span>
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Tüm Görseller</CardTitle>
          <CardDescription>
            Sitede kullanılan tüm görselleri buradan yönetin. Blog yazılarında kullanmak için ID'yi kopyalayabilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && displayedImages === null ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Önizleme</TableHead>
                  <TableHead>Alternatif Metin (alt)</TableHead>
                  <TableHead>Görsel ID</TableHead>
                  <TableHead className="hidden md:table-cell">Yüklenme Tarihi</TableHead>
                  <TableHead><span className="sr-only">Eylemler</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedImages && displayedImages.length > 0 ? (
                  displayedImages.map((image) => (
                    <TableRow key={image.id}>
                      <TableCell>
                        <NextImage src={getImagePath(image.url)} alt={image.altText} width={64} height={64} className="rounded-md object-cover aspect-square" />
                      </TableCell>
                      <TableCell className="font-medium">{image.altText}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">{image.id}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(image.id)}>
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date(image.uploadDate).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Menüyü aç</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Eylemler</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleOpenDialog(image)} className="flex items-center gap-2 cursor-pointer">
                              <FilePenLine className="h-4 w-4" /> Düzenle
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setImageToDelete(image)} className="flex items-center gap-2 text-red-500 cursor-pointer">
                              <Trash2 className="h-4 w-4" /> Sil
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Henüz görsel yok. Başlamak için "Yeni Görsel Ekle" butonunu kullanın.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ImageForm
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={imageToEdit}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      <AlertDialog open={!!imageToDelete} onOpenChange={(open) => !open && setImageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>Bu eylem geri alınamaz. Bu görseli kalıcı olarak silecektir.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Sil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
