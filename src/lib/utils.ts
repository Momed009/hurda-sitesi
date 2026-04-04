import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ... (existing code)
export function getImagePath(url: string = '') {
  if (!url) return '/placeholder-image.jpg';
  
  // Eğer tam bir URL ise (Firebase Storage veya dış link) direkt döndür
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Klasik yerel dosya ise public/images'dan oku
  return `/images/${url}`;
}

export function formatWhatsAppNumber(phoneNumber: string): string {
  if (!phoneNumber) return '';
  let cleaned = phoneNumber.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  if (cleaned.length === 10 && (cleaned.startsWith('5') || cleaned.startsWith('8'))) {
    cleaned = '90' + cleaned;
  } else if (cleaned.length === 12 && cleaned.startsWith('90')) {
    // Correct
  } else if (!cleaned.startsWith('90') && cleaned.length > 0) {
    cleaned = '90' + cleaned;
  }
  return cleaned;
}
