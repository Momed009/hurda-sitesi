'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusCircle, MoreHorizontal, Trash2, FilePenLine, Loader2, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useCollection, useFirestore, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import type { Portfolio } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function AdminPortfolioPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [itemToDelete, setItemToDelete] = useState<Portfolio | null>(null);

  const portfolioQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'portfolio'), orderBy('displayOrder', 'asc')) : null),
    [firestore]
  );

  const { data: itemsFromHook, isLoading } = useCollection<Portfolio>(portfolioQuery);
  const [displayedItems, setDisplayedItems] = useState<Portfolio[] | null>(null);

  useEffect(() => {
    setDisplayedItems(itemsFromHook);
  }, [itemsFromHook]);

  const handleDelete = () => {
    if (!itemToDelete || !firestore) return;

    const itemId = itemToDelete.id;
    const itemTitle = itemToDelete.title;

    // 1. Close the dialog FIRST
    setItemToDelete(null);

    // 2. Wait for Radix UI dialog unmount animation to finish before DOM is mutated
    setTimeout(() => {
      const docRef = doc(firestore, 'portfolio', itemId);
      deleteDocumentNonBlocking(docRef).then(() => {
        toast({
          title: 'İş Silindi',
          description: `"${itemTitle}" başarıyla silindi.`,
        });
      });
    }, 300);
  };

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Yapılan İşler</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button asChild size="sm" className="h-8 gap-1">
            <Link href="/admin/portfolio/new">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Yeni İş Ekle</span>
            </Link>
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>İş Yönetimi</CardTitle>
          <CardDescription>Tamamlanan işleri düzenleyin, silin veya yenilerini ekleyin.</CardDescription>
        </CardHeader>
        <CardContent>
          {(isLoading && displayedItems === null) ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Başlık</TableHead>
                  <TableHead>Açıklama</TableHead>
                  <TableHead>Sıra</TableHead>
                  <TableHead className="hidden md:table-cell">Eklenme Tarihi</TableHead>
                  <TableHead>
                    <span className="sr-only">Eylemler</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedItems && displayedItems.length > 0 ? (
                  displayedItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{item.description}</TableCell>
                      <TableCell>{item.displayOrder}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date(item.createdAt).toLocaleDateString('tr-TR', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}
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
                              <Link href={`/admin/portfolio/edit/${item.id}`} className="flex items-center gap-2 cursor-pointer">
                                <FilePenLine className="h-4 w-4" /> Düzenle
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setItemToDelete(item)}
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
                    <TableCell colSpan={5} className="h-24 text-center">
                      <FolderOpen className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      Henüz yapılan iş yok. Başlamak için &quot;Yeni İş Ekle&quot; butonunu kullanın.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu eylem geri alınamaz. &quot;{itemToDelete?.title}&quot; adlı işi kalıcı olarak silecektir.
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
