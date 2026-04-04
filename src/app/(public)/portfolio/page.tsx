import type { Metadata } from 'next';
import PortfolioPageClient from './portfolio-client';

export const metadata: Metadata = {
  title: 'Yapılan İşler | Referanslarımız | Temur Hurdacılık',
  description: 'Antalya Temur Hurdacılık tarafından gerçekleştirilen hurda toplama, yıkım ve geri dönüşüm projelerini inceleyin.',
};

export default function PortfolioPage() {
  return <PortfolioPageClient />;
}
