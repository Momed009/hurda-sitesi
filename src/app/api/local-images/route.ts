import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const imagesDirectory = path.join(process.cwd(), 'public/images');
    
    // Klasör yoksa oluştur veya boş dön
    if (!fs.existsSync(imagesDirectory)) {
      return NextResponse.json([]);
    }

    const files = fs.readdirSync(imagesDirectory);
    
    // Sadece görsel dosyalarını filtrele
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext);
    });

    return NextResponse.json(imageFiles);
  } catch (error) {
    console.error('Error listing local images:', error);
    return NextResponse.json({ error: 'Görseller listelenirken bir hata oluştu.' }, { status: 500 });
  }
}
