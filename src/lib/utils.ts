import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ... (existing code)
export function getImagePath(path?: string): string {
  if (!path || path === 'lutfen-gorsel-ekleyin') {
    const seed = path || 'fallback';
    return `https://picsum.photos/seed/${seed}/600/400`;
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Assumes the path is a filename in the public/images directory
  return `/images/${path}`;
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
