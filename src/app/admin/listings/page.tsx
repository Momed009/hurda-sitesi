'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusCircle, MoreHorizontal, Trash2, FilePenLine, Loader2, ShoppingCart } from 'lucide-react';
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
import type { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function AdminListingsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const productsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'products'), orderBy('createdAt', 'desc')) : null),
    [firestore]
  );
  
  const { data: productsFromHook, isLoading } = useCollection<Product>(productsQuery);
  const [displayedProducts, setDisplayedProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    setDisplayedProducts(productsFromHook);
  }, [productsFromHook]);

  const handleDelete = () => {
    if (!productToDelete || !firestore) return;

    const productId = productToDelete.id;
    const productTitle = productToDelete.name;

    // Optimistic UI Update
    setDisplayedProducts((currentProducts) =>
      currentProducts ? currentProducts.filter((product) => product.id !== productId) : []
    );

    // Close the dialog
    setProductToDelete(null);

    // Perform deletion in background
    const docRef = doc(firestore, 'products', productId);
    deleteDocumentNonBlocking(docRef).then(() => {
      toast({
        title: 'İlan Silindi',
        description: `"${productTitle}" başarıyla silindi.`,
      });
    }).catch(() => {
      // If deletion fails, the hook will eventually bring it back.
      // You can add a toast to inform about the failure if needed.
    });
  };

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Ürün İlanları</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button asChild size="sm" className="h-8 gap-1">
            <Link href="/admin/listings/new">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Yeni İlan Ekle</span>
            </Link>
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>İlan Yönetimi</CardTitle>
          <CardDescription>Mevcut ürün ilanlarını düzenleyin, silin veya yenilerini oluşturun.</CardDescription>
        </CardHeader>
        <CardContent>
          {(isLoading && displayedProducts === null) ? (
             <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ürün Adı</TableHead>
                <TableHead>Fiyat</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead className="hidden md:table-cell">Eklenme Tarihi</TableHead>
                <TableHead>
                  <span className="sr-only">Eylemler</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedProducts && displayedProducts.length > 0 ? (
                displayedProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.price.toLocaleString('tr-TR')} TL</TableCell>
                    <TableCell>
                      <Badge variant={product.stock > 0 ? 'default' : 'destructive'}>
                        {product.stock > 0 ? `${product.stock} Adet` : 'Tükendi'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(product.createdAt).toLocaleDateString('tr-TR', {
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
                             <Link href={`/admin/listings/edit/${product.id}`} className="flex items-center gap-2 cursor-pointer">
                                <FilePenLine className="h-4 w-4" /> Düzenle
                             </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setProductToDelete(product)}
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
                         <ShoppingCart className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        Henüz ürün ilanı yok. Başlamak için "Yeni İlan Ekle" butonunu kullanın.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu eylem geri alınamaz. "{productToDelete?.name}" adlı ilanı kalıcı olarak silecektir.
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
