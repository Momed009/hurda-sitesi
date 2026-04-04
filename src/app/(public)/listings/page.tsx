import type { Metadata } from 'next';
import ListingsPageClient from './listings-client';

export const metadata: Metadata = {
  title: 'Satıştaki Ürünler | İkinci El Hurda İlanları | Temur Hurdacılık',
  description: 'Antalya Temur Hurdacılık satıştaki ikinci el ve hurda ürün ilanları. Uygun fiyatlarla ikinci el ürünler için hemen göz atın.',
};

export default function ListingsPage() {
  return <ListingsPageClient />;
}
