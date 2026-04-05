import type { SiteConfig } from '@/lib/types';
import Link from 'next/link';
import { Phone, Mail, MapPin, Instagram, Facebook, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { formatWhatsAppNumber } from '@/lib/utils';

export default function Footer({ siteConfig }: { siteConfig: SiteConfig }) {
  const footerServices = siteConfig.services.length > 0
    ? siteConfig.services.slice(0, 5)
    : [
        { id: 'fallback-1', title: 'Demir & Çelik Hurda Alımı' },
        { id: 'fallback-2', title: 'Bakır & Kablo Hurda Alımı' },
        { id: 'fallback-3', title: 'Alüminyum Hurda Alımı' },
      ];

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
                <div className="relative w-10 h-10 overflow-hidden rounded-full border border-primary/20 bg-white p-0.5 group-hover:scale-110 transition-transform">
                  <Image 
                      src="/logo.jpg" 
                      alt="Temur Hurda Logo" 
                      fill 
                      className="object-contain"
                  />
                </div>
                <span className="text-xl font-bold">{siteConfig.siteName}</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Atıklarınızı değere dönüştürüyoruz.
            </p>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="font-semibold mb-4">Hizmetlerimiz</h3>
            <ul className="space-y-2">
              {footerServices.map(item => (
                <li key={item.id}>
                   <Link href="/services" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {item.title}
                  </Link>
                </li>
              ))}
               <li>
                  <Link href="/services" className="text-sm font-semibold text-primary hover:underline">
                    Tümünü Gör →
                  </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="font-semibold mb-4">İletişim</h3>
            <ul className="space-y-3 text-sm">
              {siteConfig.address && (
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                  <span className="text-muted-foreground">{siteConfig.address}</span>
                </li>
              )}
              {siteConfig.phone && (
                <li className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary shrink-0" />
                  <a href={`tel:${siteConfig.phone.replace(/\s/g, '')}`} className="text-muted-foreground hover:text-primary transition-colors">
                    {siteConfig.phone}
                  </a>
                </li>
              )}
              {siteConfig.email && (
                <li className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary shrink-0" />
                    <a href={`mailto:${siteConfig.email}`} className="text-muted-foreground hover:text-primary transition-colors">
                    {siteConfig.email}
                    </a>
                </li>
              )}
            </ul>
          </div>

          <div className="md:col-span-1">
            <h3 className="font-semibold mb-4 text-primary">Bize Ulaşın</h3>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Sosyal medyadan bizi takip edin, güncel ilanlardan haberdar olun.
            </p>
            <div className="flex items-center gap-3">
                {/* WhatsApp */}
                <Link 
                    href={`https://wa.me/${formatWhatsAppNumber(siteConfig.whatsappNumber)}`} 
                    target="_blank" 
                    className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-300 border border-[#25D366]/20 shadow-sm"
                    title="WhatsApp"
                >
                    <MessageCircle className="w-5 h-5" />
                </Link>

                {/* Instagram */}
                {siteConfig.instagramUrl && (
                    <Link 
                        href={siteConfig.instagramUrl} 
                        target="_blank" 
                        className="w-10 h-10 rounded-full bg-[#E4405F]/10 flex items-center justify-center text-[#E4405F] hover:bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:text-white transition-all duration-300 border border-[#E4405F]/20 shadow-sm"
                        title="Instagram"
                    >
                        <Instagram className="w-5 h-5" />
                    </Link>
                )}

                {/* Facebook */}
                {siteConfig.facebookUrl && (
                    <Link 
                        href={siteConfig.facebookUrl} 
                        target="_blank" 
                        className="w-10 h-10 rounded-full bg-[#1877F2]/10 flex items-center justify-center text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-all duration-300 border border-[#1877F2]/20 shadow-sm"
                        title="Facebook"
                    >
                        <Facebook className="w-5 h-5" />
                    </Link>
                )}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-x-4 gap-y-2">
            <p>&copy; {new Date().getFullYear()} {siteConfig.siteName}. Tüm hakları saklıdır.</p>
            <span className="hidden sm:inline">|</span>
            <Link href="/admin/login" className="hover:text-primary transition-colors">
              Yönetici Girişi
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
