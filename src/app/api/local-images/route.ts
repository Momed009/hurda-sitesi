import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const imagesDir = path.join(process.cwd(), 'public', 'images');
    
    // Eğer klasör yoksa boş liste dön
    if (!fs.existsSync(imagesDir)) {
      return NextResponse.json([]);
    }

    const files = fs.readdirSync(imagesDir);
    
    // Sadece görsel dosyalarını filtrele
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif'];
    const images = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    });

    // Dosyaları isme göre sırala (isteğe bağlı)
    images.sort((a, b) => a.localeCompare(b));

    return NextResponse.json(images);
  } catch (error) {
    console.error('Local images fetch error:', error);
    return NextResponse.json({ error: 'Görseller listelenirken bir hata oluştu' }, { status: 500 });
  }
}
