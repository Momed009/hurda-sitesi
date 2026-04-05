'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';

export default function PhoneButton({ phoneNumber }: { phoneNumber: string }) {
  if (!phoneNumber) return null;

  // Remove non-digit characters for the tel: link
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  const phoneUrl = `tel:${cleanNumber}`;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <Button asChild size="icon" className="w-14 h-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground animate-bounce-subtle">
        <Link href={phoneUrl} aria-label="Bizi arayın">
          <Phone className="w-7 h-7"/>
        </Link>
      </Button>
    </div>
  );
}
