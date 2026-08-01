# Online Web Araçları & Dönüştürücüler (toolboxquick)

Bu proje, ağ yöneticileri ve genel kullanıcılar için çeşitli web tabanlı araçlar sunan **%100 yerel ve güvenli** bir koleksiyondur. Proje bünyesinde hiçbir yapay zeka/API bağlantısı bulunmamaktadır; tüm hesaplamalar ve dosya işlemleri doğrudan tarayıcınızda veya yerel sunucunuzda matematiksel yöntemlerle gerçekleştirilir.

---

## 🌟 Ana Özellikler

1.  **Tema Desteği (Dark / Light Mode)**: Tüm arayüzde tek tıklamayla karanlık ve aydınlık temalar arasında geçiş yapabilirsiniz. Tema tercihiniz tarayıcınızın `localStorage` alanında saklanır.
2.  **Kategori Düzeni**: Ana sayfa tamamen yenilenerek video, ses, PDF ve dönüştürme araçları olmak üzere 4 ana bölüme ayrılmıştır.
3.  **Yerel Çalışan Fonksiyonel Araçlar**:
    *   **PDF Birleştirici**: Birden fazla PDF dosyasını tek dosyada birleştirir.
    *   **PDF Bölücü / Sayfa Ayıklayıcı**: PDF dosyalarından belirli sayfa veya sayfa aralıklarını ayıklar.
    *   **Ses Kesici & Kırpıcı**: Ses dosyalarını görsel dalga boyutu üzerinden kesip kaydeder (Web Audio API).
    *   **Ses Kaydedici**: Mikrofon üzerinden yerel ses kaydı yapar ve dalga görselleştirici sunar.
    *   **Ekran Kaydedici**: Belirli pencereleri veya tüm ekranı tarayıcı üzerinden kaydeder.
    *   **Görüntü Dönüştürücü**: Resimleri JPG, PNG, WebP, BMP formatları arasında yerel olarak dönüştürür.
4.  **MikroTik Script Jeneratörü**: RouterOS v6 ve v7 için subnet hesaplama, port yönlendirme, DHCP sunucu kurulumu gibi otomasyon scriptleri üreten bağımsız yönetim paneli.

---

## 🚀 Projeyi Yerel Makinede Çalıştırma

Bu web uygulamasını kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin:

1.  **Bağımlılıkları Yükleyin**:
    ```bash
    pip install -r requirements.txt
    ```

2.  **Uygulamayı Başlatın**:
    ```bash
    flask --app api/index run
    ```

3.  **Tarayıcıda Açın**:
    Uygulama varsayılan olarak `http://127.0.0.1:5000` adresinde çalışacaktır. Bu adresi tarayıcınızda açarak araçları kullanmaya başlayabilirsiniz.

