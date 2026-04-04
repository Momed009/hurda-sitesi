import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Dosya seçilmedi.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Dosya adını temizle ve benzersiz yap (timestamp ekle)
    const timestamp = Date.now();
    const originalName = file.name.replace(/\s+/g, '-').toLowerCase();
    const filename = `${timestamp}-${originalName}`;
    
    const imagesDirectory = path.join(process.cwd(), 'public/images');
    
    // Klasör yoksa oluştur
    if (!fs.existsSync(imagesDirectory)) {
      fs.mkdirSync(imagesDirectory, { recursive: true });
    }

    const filePath = path.join(imagesDirectory, filename);
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({ 
        message: 'Görsel başarıyla yüklendi.',
        filename: filename,
        url: filename // İlerde /images/${filename} olarak kullanılacak
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: 'Görsel yüklenirken bir hata oluştu.' }, { status: 500 });
  }
}
