import type { Metadata } from 'next';
import HomePageClient from './home-client';

export const metadata: Metadata = {
  title: 'Antalya Hurdacı | Değerinde Hurda Alımı | Temur Hurdacılık',
  description: "Antalya ve Kepez'de demir, bakır ve alüminyum hurdalarınızı adresinizden en yüksek fiyatla alıyoruz. Nakit ödeme için Temur Hurdacılık'ı hemen arayın!",
};

export default function HomePage() {
  return <HomePageClient />;
}
