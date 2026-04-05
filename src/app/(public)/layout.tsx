'use client';

import type { ReactNode } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import WhatsAppButton from '@/components/whatsapp-button';
import { useDoc, useCollection } from '@/firebase';
import type { CompanyInfo, SiteSetting, Service } from '@/lib/types';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase';

export default function PublicLayout({ children }: { children: ReactNode }) {
  const firestore = useFirestore();

  const siteSettingsRef = useMemoFirebase(() => {
      if (!firestore) return null;
      return doc(firestore, 'siteSettings', 'main');
  }, [firestore]);

  const companyInfoRef = useMemoFirebase(() => {
      if (!firestore) return null;
      return doc(firestore, 'companyInfo', 'main');
  }, [firestore]);

  const servicesQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return query(collection(firestore, 'services'), orderBy('displayOrder'));
  }, [firestore]);

  const { data: siteSettingsData } = useDoc<SiteSetting>(siteSettingsRef);
  const { data: companyInfoData } = useDoc<CompanyInfo>(companyInfoRef);
  const { data: servicesData } = useCollection<Service>(servicesQuery);

  const siteConfig = {
    siteName: siteSettingsData?.siteName ?? 'Atık Rehber',
    whatsappNumber: siteSettingsData?.whatsappPhoneNumber ?? '',
    address: companyInfoData?.companyAddress ?? '',
    phone: companyInfoData?.contactPhoneNumber ?? '',
    email: siteSettingsData?.contactEmail ?? '',
    mapUrl: companyInfoData?.mapEmbedUrl ?? '',
    ownerName: companyInfoData?.ownerFullName ?? '',
    services: (servicesData ?? []).map(s => ({ id: s.id, title: s.title })),
    instagramUrl: companyInfoData?.instagramUrl ?? '',
    facebookUrl: companyInfoData?.facebookUrl ?? '',
  };
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header siteName={siteConfig.siteName} />
      <main className="flex-1">{children}</main>
      <Footer siteConfig={siteConfig} />
      <WhatsAppButton phoneNumber={siteConfig.whatsappNumber} />
    </div>
  );
}
