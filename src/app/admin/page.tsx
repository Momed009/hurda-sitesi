'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function AdminDashboardPage() {
    const { user } = useUser();

    return (
        <>
            <div className="flex items-center mb-4">
                <h1 className="text-lg font-semibold md:text-2xl">Hoşgeldin, {user?.displayName || 'Admin'}!</h1>
            </div>
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm bg-card">
                <div className="flex flex-col items-center gap-2 text-center p-8">
                    <h3 className="text-2xl font-bold tracking-tight">
                        İçerik Yönetimine Hoşgeldiniz
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                        Sol taraftaki menüyü kullanarak sitenizin tüm içeriğini yönetebilirsiniz: blog yazıları, hizmetler, ürün ilanları, görseller, firma bilgileri ve site ayarları.
                    </p>
                    <Button asChild className="mt-4">
                        <Link href="/admin/blog">
                            Blog Yazılarını Yönet <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
             <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Hızlı Erişim</CardTitle>
                    <CardDescription>
                        Sitenizi yönetmek için sol menüdeki bölümleri kullanın. Blog, hizmetler, ürün ilanları, görseller, firma bilgileri ve site ayarları modülleri hazırdır.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline" size="sm"><Link href="/admin/services">Hizmetler</Link></Button>
                        <Button asChild variant="outline" size="sm"><Link href="/admin/listings">İlanlar</Link></Button>
                        <Button asChild variant="outline" size="sm"><Link href="/admin/portfolio">Yapılan İşler</Link></Button>
                        <Button asChild variant="outline" size="sm"><Link href="/admin/images">Görseller</Link></Button>
                        <Button asChild variant="outline" size="sm"><Link href="/admin/company-info">Firma Bilgileri</Link></Button>
                        <Button asChild variant="outline" size="sm"><Link href="/admin/site-settings">Site Ayarları</Link></Button>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
