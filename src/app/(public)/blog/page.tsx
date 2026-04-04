import type { Metadata } from 'next';
import BlogPageClient from './blog-client';

export const metadata: Metadata = {
  title: 'Blog | Hurda ve Geri Dönüşüm Haberleri | Temur Hurdacılık',
  description: 'Hurdacılık ve geri dönüşüm dünyasından en son haberler, ipuçları ve faydalı bilgiler. Hurda fiyatları, geri dönüşüm yöntemleri ve sektör haberleri.',
};

export default function BlogPage() {
  return <BlogPageClient />;
}
