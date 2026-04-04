# Firebase Studio

Bu, Firebase Studio'da bir NextJS başlangıç projesidir.

Başlamak için `src/app/page.tsx` dosyasına göz atın.

---

## Projenizi Bilgisayarınıza Nasıl İndirirsiniz?

Projenizi bilgisayarınızda çalıştırmak ve geliştirmeye devam etmek için **tüm proje dosyalarını** indirmeniz gerekmektedir. Sadece `src` klasörü yeterli olmayacaktır.

**Adım Adım İndirme ve Çalıştırma:**

1.  **Projeyi ZIP Olarak İndirin:**
    *   Bulunduğunuz geliştirme ortamının (IDE) sol tarafındaki dosya gezgini paneline bakın.
    *   Genellikle en üstteki proje klasörüne veya paneldeki boş bir alana sağ tıklayarak **"İndir" (Download)** veya **"Download as ZIP"** gibi bir seçenek bulabilirsiniz.
    *   Eğer bu seçeneği bulamazsanız, üst menüde "File" (Dosya), "Project" (Proje) veya üç nokta (`...`) menüsü altında **"Dışa Aktar" (Export as ZIP)** benzeri bir seçenek arayın.

2.  **ZIP Dosyasını Açın:**
    *   İndirdiğiniz `.zip` uzantılı dosyayı bilgisayarınızda istediğiniz bir klasöre çıkartın.

3.  **Gerekli Kütüphaneleri Yükleyin:**
    *   Bilgisayarınızda bir terminal (macOS/Linux için) veya Komut İstemi/PowerShell (Windows için) açın.
    *   `cd` komutunu kullanarak projeyi çıkardığınız klasörün içine gidin. Örneğin: `cd C:\Users\KullaniciAdiniz\Downloads\proje-klasoru`
    *   Klasörün içindeyken, projenin ihtiyaç duyduğu tüm kütüphaneleri yüklemek için aşağıdaki komutu çalıştırın ve bitmesini bekleyin:
      ```bash
      npm install
      ```

4.  **Projeyi Çalıştırın:**
    *   Yükleme tamamlandıktan sonra, geliştirme sunucusunu başlatmak için aşağıdaki komutu çalıştırın:
      ```bash
      npm run dev
      ```

5.  **Siteyi Görüntüleyin:**
    *   Terminalde size gösterilen adresi (genellikle `http://localhost:3000` veya `http://localhost:9002`) tarayıcınızda açın. Siteniz artık bilgisayarınızda çalışıyor olacak!

---

## Web Sitenize Yerel Görseller Nasıl Eklenir?

Bu proje, kendi bilgisayarınızdan ekleyeceğiniz görselleri kullanacak şekilde ayarlanmıştır. Bu sayede görsellerinizi harici bir servise yüklemeden doğrudan projeniz üzerinden yönetebilirsiniz.

**ÖNEMLİ:** Gerekli olan `public` ve `images` klasörleri varsayılan olarak mevcut olmayabilir. Bu klasörleri sizin **manuel olarak (elle)** oluşturmanız gerekmektedir. Bu, sadece bir kerelik bir kurulum işlemidir.

### Adım Adım Talimatlar:

**1. `public` Klasörünü Oluşturun:**
   - Ekranınızın sol tarafındaki dosya gezgini panelinde, proje dosyalarınızın en üst dizinine gidin.
   - Bu en üst seviyedeki boş bir alana sağ tıklayın (dikkat, `src` veya başka bir dosyanın üzerine tıklamadığınızdan emin olun).
   - Açılan menüden **"New Folder" (Yeni Klasör)** seçeneğini seçin.
   - Yeni klasöre **`public`** adını verin ve Enter'a basın.

**2. `images` Klasörünü Oluşturun:**
   - Şimdi, az önce oluşturduğunuz `public` klasörüne sağ tıklayın.
   - Tekrar **"New Folder" (Yeni Klasör)** seçeneğini seçin.
   - Bu yeni klasöre **`images`** adını verin.

Klasör yapınız artık şu şekilde görünmelidir:
```
/
├── public/
│   └── images/
├── src/
├── package.json
└── ... diğer dosyalar
```

**3. Resim Dosyalarınızı Ekleyin:**
   - Bilgisayarınızdaki resim dosyasını bulun.
   - Dosyayı bilgisayarınızdan sürükleyip doğrudan dosya gezgini panelindeki `images` klasörünün üzerine bırakın.
   - Alternatif olarak, `images` klasörüne sağ tıklayıp "Upload" (Yükle) gibi bir seçenek arayabilirsiniz.

**4. Admin Panelinde Görseli Kullanın:**
   - Sitenizin yönetici paneline gidin ve **"Görsel Yönetimi"** bölümünü açın.
   - Bir görsel eklerken veya düzenlerken, "Görsel URL / Dosya Adı" alanına, yüklediğiniz görselin **dosya adını birebir aynı şekilde** yazın (örneğin: `benim-resmim.jpg`).
   - Sistem, görselinizi otomatik olarak bulup sitede gösterecektir.
