# Web Araçları & MikroTik Script Jeneratörü Kullanım Kılavuzu

Bu proje; ağ yöneticileri, sistem mühendisleri ve genel kullanıcılar için hazırlanmış, **%100 yerel çalışan, yapay zekasız ve güvenli** bir web araçları koleksiyonudur. Tüm hesaplamalar tarayıcınızda veya yerel sunucunuzda matematiksel yöntemlerle yapılır.

Proje iki bölümden oluşmaktadır:
1.  **Flask Tabanlı Ana Uygulama (`/api`)**: PDF birleştirici, ses/video taslak araçları ve zengin MikroTik script oluşturucu seti.
2.  **Next.js Tabanlı MikroTik Araçları (`/mikrotik-tools`)**: Modern React arayüzü ile yeniden tasarlanmış yerel ağ yönetim araçları.

---

## 🚀 1. MikroTik Scriptleri Cihaza Nasıl Uygulanır?

Sitedeki tüm MikroTik araçları, girdileriniz doğrultusunda RouterOS uyumlu terminal scriptleri üretir. Bu kodları yönlendiricinize uygulamak için en pratik yöntem şudur:

1.  **Kodu Kopyalayın**: İlgili aracın sayfasında ayarlarınızı yapın ve script kutusunun sağ üstündeki **"Kopyala"** butonuna tıklayın.
2.  **Winbox ile Bağlanın**: Bilgisayarınızda Winbox uygulamasını açın ve router cihazınızın IP/MAC adresi ile giriş yapın.
3.  **New Terminal Ekranını Açın**: Winbox sol menüsündeki **"New Terminal"** butonuna tıklayarak komut satırını açın.
4.  **Kodu Yapıştırın**: Terminal ekranına sağ tıklayıp **"Paste"** (Yapıştır) seçeneğine tıklayın. Komutlar otomatik olarak satır satır işlenecektir.

> [!IMPORTANT]
> **Güvenlik Önemlidir:** Herhangi bir scripti çalıştırmadan önce mutlaka Winbox'ta **Files -> Backup** yolunu izleyerek cihazınızın yedeğini alın. Arayüz isimlerinin (örn: `ether1`, `bridge`) cihazınızla eşleştiğinden emin olun.

---

## 🛠️ 2. MikroTik Araçları Detaylı Kullanım Kılavuzu

### 🌐 2.1. Subnet (Alt Ağ) Hesaplayıcı
IP adresinizi ve CIDR alt ağ maskesini girerek ağın tüm sınırlarını hesaplamanızı sağlar.
*   **Girişler**: IP Adresi (örn: `192.168.1.50`) ve CIDR (örn: `24` -> `255.255.255.0`).
*   **Çıktılar**: Ağ Adresi (Network), Yayın Adresi (Broadcast), Subnet Maskesi, Kullanılabilir IP Aralığı ve Toplam Kullanılabilir Host Sayısı.
*   **Uç Durumlar**: `/31` (Noktadan noktaya bağlantı) ve `/32` (Tek host) durumlarında sistem kullanılabilir hostları otomatik olarak algılar ve "Yok" olarak işaretler.

### 🔌 2.2. Port Yönlendirme (Dst-NAT)
Dış ağdan (İnternet) yerel ağınızdaki bir sunucuya veya cihaza erişmek için gereken yönlendirme kodlarını hazırlar.
*   **Kullanım Adımları**: 
    1.  Dış ağdan gelecek isteklerin dinleneceği arayüzü (WAN Interface, örn: `ether1`) seçin.
    2.  Dış portu (örn: `80` HTTP veya `3389` RDP) belirleyin.
    3.  İsteklerin yönlendirileceği yerel IP adresini (örn: `192.168.1.100`) ve yerel port numarasını girin.
*   **Script Sonucu**: `/ip firewall nat` altında `dst-nat` kuralını oluşturur.

### 🔋 2.3. DHCP Sunucu ve IP Havuzu Oluşturucu
Yerel ağa bağlanan cihazların IP, Gateway ve DNS adreslerini otomatik alabilmesi için gereken servisleri kurar.
*   **Kullanım Adımları**: 
    1.  Ağda dağıtılacak IP adres havuzunun adını ve aralığını (örn: `192.168.1.100-192.168.1.200`) tanımlayın.
    2.  DHCP servisinin çalışacağı yerel arayüzü (örn: `bridge-local`) belirtin.
    3.  Ağ geçidi (Gateway) ve DNS sunucularını (virgülle ayırarak) girin.
*   **Script Sonucu**: IP havuzu (Pool) oluşturur, DHCP Server ekler ve DHCP Network yapılandırmasını tamamlar.

### 🛡️ 2.4. Güvenlik Duvarı (Firewall) Şablonları
RouterOS cihazınızı dışarıdan gelecek saldırılara karşı korumak için optimize edilmiş güvenlik şablonları üretir.
*   **Seçenekler**:
    *   *DDoS Saldırı Koruması*: Aşırı paket gönderimi yapan IP adreslerini geçici olarak engeller.
    *   *Port Tarama Engelleme (Port Scanner)*: Cihazın açık portlarını bulmaya çalışan saldırganları kara listeye alır.
    *   *DNS Amplification Koruması*: DNS servisinizin dış saldırılarda aracı olarak kullanılmasını önler.
*   **Script Sonucu**: `/ip firewall filter` altına koruma kuralları yazar.

### 🔒 2.5. DNS Güvenliği (Sinkhole)
Ağ seviyesinde istenmeyen alan adlarını (reklamlar, izleyiciler, telemetri verileri) engeller ve güvenli DNS sağlayıcıları atar.
*   **Kullanım Adımları**:
    1.  Güvenli yukarı akış DNS sağlayıcısını (Cloudflare Family, Quad9 veya AdGuard) seçin.
    2.  Reklam engelleme seçeneğini aktif ettiğinizde, sistem popüler reklam ağlarını `0.0.0.0` IP'sine yönlendirerek (Sinkhole) ağ genelinde engeller.

### 📡 2.6. WireGuard VPN Jeneratörü (RouterOS v7)
MikroTik yönlendiriciniz üzerinde modern, hızlı ve şifreli bir WireGuard tüneli oluşturur.
*   **Kullanım Adımları**:
    1.  WireGuard servis portunu (varsayılan: `13231`) girin.
    2.  Sunucunun yerel tünel IP adresini (örn: `10.0.0.1/24`) belirleyin.
    3.  Bağlanacak istemciye (Peer) atanacak IP adresini tanımlayın.
*   **Script Sonucu**: WireGuard arayüzünü açar, portu dinler, yerel IP'leri tanımlar ve istemci erişim profilini ekler.

### 📊 2.7. Netwatch & Log İzleme (Otomasyon)
Cihazınızda ping izlemesi veya sistem günlüğü (log) takibi yaparak otomatik bildirim (E-Posta veya Telegram) almanızı sağlar.
*   **Telegram Bot Entegrasyonu**: Kodu çalıştırmadan önce script içeriğindeki `BOT_TOKEN_BURAYA` alanına kendi bot tokeninizi yazmanız gerekir.
*   **E-Posta Entegrasyonu**: RouterOS e-posta ayarlarınızın önceden yapılmış olması gerekmektedir.

---

## 📄 3. PDF Birleştirici Nasıl Kullanılır?

Ana sayfadaki **PDF Araçları** sekmesi altından erişebileceğiniz bu araç, birden fazla PDF dosyasını yükleme sıranıza göre tek bir PDF dosyası haline getirir.

1.  **PDF Birleştiriciyi Açın**: Arayüzden PDF araçları sayfasına gidin.
2.  **Dosyaları Yükleyin**: **"Dosya Seç"** butonuna basarak bilgisayarınızdan en az iki adet PDF dosyası seçin.
3.  **Birleştirin**: **"PDF Dosyalarını Birleştir"** butonuna basın. Birleştirilmiş dosyanız otomatik olarak `toolboxquick-merged.pdf` adıyla tarayıcınıza indirilecektir.