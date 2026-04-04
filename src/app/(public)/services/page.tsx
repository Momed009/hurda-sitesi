import type { Metadata } from 'next';
import ServicesPageClient from './services-client';

export const metadata: Metadata = {
  title: 'Hurda Bakır, Demir ve Kablo Alımı | Temur Hurdacılık',
  description: "Antalya'da inşaat, fabrika, beyaz eşya ve elektronik hurdalarınızı yerinde tartarak alıyoruz. En iyi fiyat teklifi ve hızlı hizmet için bize ulaşın!",
};

export default function ServicesPage() {
  return <ServicesPageClient />;
}
