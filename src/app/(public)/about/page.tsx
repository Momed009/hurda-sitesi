import type { Metadata } from 'next';
import AboutPageClient from './about-client';

export const metadata: Metadata = {
  title: 'İletişim ve Kepez Hurda Konumu | Temur Hurdacılık',
  description: "Antalya'da hurda satmak mı istiyorsunuz? Temur Hurdacılık'a WhatsApp üzerinden fotoğraf gönderin, anında fiyat alın. Konum ve telefon için tıklayın!",
};

export default function AboutPage() {
  return <AboutPageClient />;
}
