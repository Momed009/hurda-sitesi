'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusCircle, MoreHorizontal, Trash2, FilePenLine, Loader2, Wand2 } from 'lucide-react';
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
import { useCollection, useFirestore, useMemoFirebase, deleteDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import type { Blog } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { generateBlogContent } from '@/ai/flows/generate-blog-content';

export default function AdminBlogPage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const [postToDelete, setPostToDelete] = useState<Blog | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const blogQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'blogs'), orderBy('publishDate', 'desc')) : null),
    [firestore]
  );
  
  const { data: postsFromHook, isLoading } = useCollection<Blog>(blogQuery);
  const [displayedPosts, setDisplayedPosts] = useState<Blog[] | null>(null);

  useEffect(() => {
    setDisplayedPosts(postsFromHook);
  }, [postsFromHook]);

  const handleDelete = () => {
    if (!postToDelete || !firestore) return;

    const postToDeleteId = postToDelete.id;
    const postToDeleteTitle = postToDelete.title;
    
    // 1. Optimistic UI Update: Remove the post from the local state immediately.
    setDisplayedPosts((currentPosts) =>
      currentPosts ? currentPosts.filter((post) => post.id !== postToDeleteId) : []
    );

    // 2. Close the dialog immediately.
    setPostToDelete(null);

    // 3. Perform the actual deletion in the background.
    const docRef = doc(firestore, 'blogs', postToDeleteId);
    deleteDocumentNonBlocking(docRef).then(() => {
      toast({
        title: 'Yazı Silindi',
        description: `"${postToDeleteTitle}" başarıyla silindi.`,
      });
    }).catch(() => {
      // If deletion fails, the live hook will eventually bring the post back.
      // A toast could be added here to inform the user about the failure.
    });
  };
  
  const handleGeneratePosts = async () => {
    if (!firestore) return;

    setIsGenerating(true);
    toast({
      title: 'Yapay Zeka Çalışıyor...',
      description: 'Sizin için SEO odaklı blog yazıları oluşturuluyor. Bu işlem biraz zaman alabilir.',
    });

    try {
      const keywords = [
        'hurda fiyatları', 'güncel hurda fiyatları', 'hurdacı', 'en yakın hurdacı', 'adresten hurda alanlar',
        'demir hurdası', 'bakır hurdası', 'alüminyum hurdası', 'sarı hurdası', 'kablo hurdası', 'geri dönüşüm',
      ];
      
      const postsToGenerate = 9;
      let generatedCount = 0;

      for (let i = 0; i < postsToGenerate; i++) {
        const randomKeywords = keywords.sort(() => 0.5 - Math.random()).slice(0, 3);
        const post = await generateBlogContent({ keywords: randomKeywords });

        if (post && post.title) {
          const collectionRef = collection(firestore, 'blogs');
          const newPostData = {
              title: post.title,
              slug: post.slug,
              content: post.draft,
              metaDescription: post.summary,
              keywords: randomKeywords,
              author: 'Atık Rehber Ekibi (AI)',
              publishDate: new Date().toISOString(),
              thumbnailImageId: 'lutfen-gorsel-ekleyin',
              isFeaturedOnHomepage: false,
          };
          addDocumentNonBlocking(collectionRef, newPostData);
          generatedCount++;
        }
      }

      if (generatedCount > 0) {
         toast({
          title: 'Başarılı!',
          description: `${generatedCount} adet yeni blog yazısı başarıyla oluşturuldu.`,
        });
      } else {
        throw new Error('AI did not return any blog posts.');
      }
    } catch (error) {
      console.error("Error generating blog posts:", error);
      toast({
        variant: 'destructive',
        title: 'Hata!',
        description: 'Yapay zeka ile yazı oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.',
      });
    } finally {
      setIsGenerating(false);
    }
  };


  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Blog Yazıları</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1"
            onClick={handleGeneratePosts}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Wand2 className="h-3.5 w-3.5" />
            )}
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              9 Adet AI Yazı Oluştur
            </span>
          </Button>
          <Button asChild size="sm" className="h-8 gap-1">
            <Link href="/admin/blog/new">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Yeni Yazı Ekle</span>
            </Link>
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Yazı Yönetimi</CardTitle>
          <CardDescription>Mevcut blog yazılarını düzenleyin, silin veya yapay zeka ile yenilerini oluşturun.</CardDescription>
        </CardHeader>
        <CardContent>
          {(isLoading && displayedPosts === null) ? (
             <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Başlık</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="hidden md:table-cell">Yayınlanma Tarihi</TableHead>
                <TableHead>
                  <span className="sr-only">Eylemler</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedPosts && displayedPosts.length > 0 ? (
                displayedPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>
                      <Badge variant={post.isFeaturedOnHomepage ? 'default' : 'outline'}>
                        {post.isFeaturedOnHomepage ? 'Öne Çıkan' : 'Normal'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(post.publishDate).toLocaleDateString('tr-TR', {
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
                             <Link href={`/admin/blog/edit/${post.id}`} className="flex items-center gap-2 cursor-pointer">
                                <FilePenLine className="h-4 w-4" /> Düzenle
                             </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setPostToDelete(post)}
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
                        Henüz blog yazısı yok. Başlamak için "9 Adet AI Yazı Oluştur" veya "Yeni Yazı Ekle" butonunu kullanın.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!postToDelete} onOpenChange={(open) => !open && setPostToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu eylem geri alınamaz. "{postToDelete?.title}" başlıklı yazıyı kalıcı olarak silecektir.
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
