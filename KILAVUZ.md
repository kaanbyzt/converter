# Web Araçları Kullanım Kılavuzu

Bu proje, ağ yöneticileri ve genel kullanıcılar için çeşitli web tabanlı araçlar sunan bir koleksiyondur. Proje, iki ana bölümden oluşmaktadır:
1.  **Flask Tabanlı Ana Uygulama**: MikroTik, PDF, video ve ses araçlarını içeren ana sunucu uygulaması.
2.  **Next.js Tabanlı MikroTik Araçları**: Modern bir arayüze sahip, yeniden yazılmış MikroTik araçları.

---

## 1. Flask Tabanlı Ana Uygulama (`/api`)

Bu web uygulamasını yerel makinenizde çalıştırmak için aşağıdaki adımları izleyin:

1.  **Gereksinimleri Yükleyin**: Projenin Python bağımlılıklarını yüklemeniz gerekir. Terminal veya komut istemcisinde şu komutu çalıştırın:
    ```bash
    pip install -r requirements.txt
    ```
    *(Not: Projede bir `requirements.txt` dosyası olduğu varsayılmıştır. Eğer yoksa, `pip install Flask PyPDF2 groq` komutu ile kütüphaneler manuel olarak yüklenebilir.)*

2.  **API Anahtarını Ayarlayın**: MikroTik AI asistanını kullanmak için bir Groq API anahtarına ihtiyacınız vardır. `api/index.py` dosyasında `GROQ_API_KEY` ortam değişkeni olarak ayarlanmıştır. Terminalde şu şekilde ayarlayabilirsiniz:
    *   **Windows (CMD)**: `set GROQ_API_KEY=sizin_api_anahtarınız`
    *   **Windows (PowerShell)**: `$env:GROQ_API_KEY="sizin_api_anahtarınız"`
    *   **Linux/macOS**: `export GROQ_API_KEY=sizin_api_anahtarınız`

3.  **Uygulamayı Başlatın**: Flask uygulamasını başlatmak için terminalde `api` klasörüne gidin ve şu komutu çalıştırın:
    ```bash
    flask --app index run
    ```

4.  **Tarayıcıda Açın**: Uygulama varsayılan olarak `http://127.0.0.1:5000` adresinde çalışacaktır. Bu adresi web tarayıcınızda açarak araçları kullanmaya başlayabilirsiniz.

### Flask Uygulamasındaki Araçlar

-   **MikroTik AI Asistanı (`/mikrotik`)**: MikroTik ile ilgili sorularınıza komut setleri ve açıklamalar üretir.
-   **PDF Araçları (`/pdf-tools`)**: Birden fazla PDF dosyasını tek bir dosyada birleştirir.
-   **Video ve Ses Araçları (`/video-tools`, `/audio-tools`)**: Geliştirme aşamasındadır.
-   **Diğer MikroTik Araçları**: Subnet hesaplayıcı, port yönlendirme, DHCP sunucu kurulumu gibi birçok otomasyon aracı `/mikrotik/...` altında mevcuttur.

---

## 2. Next.js Tabanlı MikroTik Araçları (`/mikrotik-tools`)

Bu bölüm, daha modern bir teknoloji yığını (Next.js, React, Tailwind CSS) ile geliştirilmiş MikroTik araçlarını içerir.

### Projeyi Çalıştırma

1.  **Klasöre Gidin**: Terminalde `mikrotik-tools` klasörüne gidin.
    ```bash
    cd mikrotik-tools
    ```

2.  **Bağımlılıkları Yükleyin**:
    ```bash
    npm install
    ```

3.  **API Anahtarını Ayarlayın**: Bu projenin AI asistanı da Groq API kullanır. Proje ana dizininde (`mikrotik-tools`) `.env.local` adında bir dosya oluşturun ve içine API anahtarınızı ekleyin:
    ```
    GROQ_API_KEY=sizin_api_anahtarınız
    ```

4.  **Geliştirme Sunucusunu Başlatın**:
    ```bash
    npm run dev
    ```

5.  **Tarayıcıda Açın**: Uygulamayı `http://localhost:3000` adresinde görüntüleyebilirsiniz.

### Next.js Uygulamasındaki Araçlar

Bu uygulama, Flask projesindeki MikroTik araçlarının daha gelişmiş ve interaktif versiyonlarını sunmayı hedefler. Mevcut araçlar:

-   **MikroTik AI Asistanı**: `/` ana sayfasında yer alır.
-   **Subnet Hesaplayıcı**: `/subnet` adresindedir.
-   **Port Yönlendirme Sihirbazı**: `/port-forward` adresindedir.

---

Bu kılavuz, projedeki araçları etkili bir şekilde kullanmanıza yardımcı olmak için hazırlanmıştır. Yeni araçlar eklendikçe kılavuz güncellenecektir.