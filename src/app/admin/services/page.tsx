'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusCircle, MoreHorizontal, Trash2, FilePenLine, Loader2, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useCollection, useFirestore, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import type { Service } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function AdminServicesPage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  const servicesQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'services'), orderBy('displayOrder', 'asc')) : null),
    [firestore]
  );
  
  const { data: servicesFromHook, isLoading } = useCollection<Service>(servicesQuery);
  const [displayedServices, setDisplayedServices] = useState<Service[] | null>(null);

  useEffect(() => {
    setDisplayedServices(servicesFromHook);
  }, [servicesFromHook]);

  const handleDelete = () => {
    if (!serviceToDelete || !firestore) return;

    const serviceId = serviceToDelete.id;
    const serviceTitle = serviceToDelete.title;

    setDisplayedServices((currentServices) =>
      currentServices ? currentServices.filter((service) => service.id !== serviceId) : []
    );

    setServiceToDelete(null);

    const docRef = doc(firestore, 'services', serviceId);
    deleteDocumentNonBlocking(docRef).then(() => {
      toast({
        title: 'Hizmet Silindi',
        description: `"${serviceTitle}" başarıyla silindi.`,
      });
    });
  };

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Hizmetler</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button asChild size="sm" className="h-8 gap-1">
            <Link href="/admin/services/new">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Yeni Hizmet Ekle</span>
            </Link>
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Hizmet Yönetimi</CardTitle>
          <CardDescription>Mevcut hizmetleri düzenleyin, silin veya yenilerini oluşturun.</CardDescription>
        </CardHeader>
        <CardContent>
          {(isLoading && displayedServices === null) ? (
             <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Sıralama</TableHead>
                <TableHead>Hizmet Adı</TableHead>
                <TableHead className="hidden md:table-cell">Açıklama</TableHead>
                <TableHead>
                  <span className="sr-only">Eylemler</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedServices && displayedServices.length > 0 ? (
                displayedServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.displayOrder}</TableCell>
                    <TableCell>{service.title}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground line-clamp-2">
                      {service.description}
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
                          <DropdownMenuItem asChild>
                             <Link href={`/admin/services/edit/${service.id}`} className="flex items-center gap-2 cursor-pointer">
                                <FilePenLine className="h-4 w-4" /> Düzenle
                             </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setServiceToDelete(service)}
                            className="flex items-center gap-2 text-red-500 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" /> Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                         <Wrench className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        Henüz hizmet eklenmemiş. Başlamak için "Yeni Hizmet Ekle" butonunu kullanın.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!serviceToDelete} onOpenChange={(open) => !open && setServiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu eylem geri alınamaz. "{serviceToDelete?.title}" adlı hizmeti kalıcı olarak silecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className='bg-destructive hover:bg-destructive/90'>Sil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
