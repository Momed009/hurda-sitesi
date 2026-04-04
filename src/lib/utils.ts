import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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
