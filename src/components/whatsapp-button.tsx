'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatWhatsAppNumber } from '@/lib/utils';

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
  );

export default function WhatsAppButton({ phoneNumber }: { phoneNumber: string }) {
  if (!phoneNumber) return null;

  const formattedNumber = formatWhatsAppNumber(phoneNumber);
  const whatsappUrl = `https://wa.me/${formattedNumber}`;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button asChild size="icon" className="w-14 h-14 rounded-full shadow-lg bg-[#25D366] hover:bg-[#128C7E] text-white animate-bounce-subtle">
        <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp üzerinden iletişime geçin">
          <WhatsAppIcon className="w-8 h-8"/>
        </Link>
      </Button>
    </div>
  );
}
