import os
import pandas as pd
from PIL import Image, ImageDraw, ImageFont

# 1. Klasör Oluştur
klasor = "Yeni_Test_Dosyalari"
os.makedirs(klasor, exist_ok=True)
print(f"📂 '{klasor}' klasörü hazırlanıyor...\n")

# ==========================================
# A. RESİM DÖNÜŞTÜRÜCÜ İÇİN DOSYALAR
# ==========================================
print("🖼️  Resim dosyaları oluşturuluyor...")

# 1. WEBP (Genelde webden indirilen, açması zor format)
img_webp = Image.new('RGB', (400, 400), color='darkred')
d = ImageDraw.Draw(img_webp)
d.text((50, 180), "BU BIR WEBP DOSYASIDIR", fill="white")
img_webp.save(f"{klasor}/ornek_web.webp", "WEBP")

# 2. BMP (Eski ve büyük boyutlu format)
img_bmp = Image.new('RGB', (400, 400), color='navy')
d = ImageDraw.Draw(img_bmp)
d.text((50, 180), "BU BIR BMP DOSYASIDIR", fill="white")
img_bmp.save(f"{klasor}/eski_format.bmp", "BMP")

# 3. TIFF (Matbaa formatı)
img_tiff = Image.new('RGB', (400, 400), color='green')
d = ImageDraw.Draw(img_tiff)
d.text((50, 180), "TIFF FORMATI", fill="white")
img_tiff.save(f"{klasor}/matbaa_resmi.tiff", "TIFF")

# ==========================================
# B. EXCEL VE CSV DÖNÜŞTÜRÜCÜ İÇİN DOSYALAR
# ==========================================
print("📊 Excel ve CSV dosyaları oluşturuluyor...")

# Rastgele veri seti oluştur
data = {
    'Ad': ['Ahmet', 'Ayşe', 'Mehmet', 'Zeynep', 'Fatma'],
    'Soyad': ['Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Öztürk'],
    'Yaş': [25, 30, 22, 28, 35],
    'Şehir': ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya'],
    'Maaş': [25000, 32000, 21000, 29000, 40000]
}
df = pd.DataFrame(data)

# 1. Excel Dosyası (.xlsx)
df.to_excel(f"{klasor}/personel_listesi.xlsx", index=False)

# 2. CSV Dosyası (.csv)
df.to_csv(f"{klasor}/satis_verileri.csv", index=False)

# ==========================================
# C. PDF BİRLEŞTİRİCİ VE AYIKLAYICI İÇİN
# ==========================================
print("📄 PDF dosyaları oluşturuluyor...")

# PDF 1 (Sayfa 1 olacak)
img_pdf1 = Image.new('RGB', (595, 842), color='white') # A4 boyutuna yakın
d1 = ImageDraw.Draw(img_pdf1)
d1.text((50, 50), "BİRİNCİ DOSYA (BÖLÜM 1)", fill="black")
d1.rectangle([100, 100, 300, 300], fill="orange") # İçine resim çıkarma testi için şekil
img_pdf1.save(f"{klasor}/Rapor_Part_1.pdf", "PDF")

# PDF 2 (Sayfa 2 olacak - Birleştirme testi için)
img_pdf2 = Image.new('RGB', (595, 842), color='lightgrey')
d2 = ImageDraw.Draw(img_pdf2)
d2.text((50, 50), "İKİNCİ DOSYA (BÖLÜM 2)", fill="black")
d2.text((50, 100), "Bu dosya diğerinin arkasına eklenecek.", fill="blue")
img_pdf2.save(f"{klasor}/Rapor_Part_2.pdf", "PDF")

# ==========================================
# D. ARKA PLAN SİLİCİ İÇİN
# ==========================================
print("🪄 Arka plan silme testi için resim oluşturuluyor...")

# Arka planı mavi, ortası sarı bir resim (Yapay zeka kontrası algılasın diye)
img_bg = Image.new('RGB', (500, 500), color='blue') # Arka plan Mavi
d_bg = ImageDraw.Draw(img_bg)
# Ortaya Sarı bir daire çizelim (İnsan kafası gibi düşünelim)
d_bg.ellipse([150, 150, 350, 350], fill='yellow', outline='black')
d_bg.text((180, 240), "OBJE", fill="black")
img_bg.save(f"{klasor}/arka_plan_testi.jpg", "JPEG")

print("\n✅ İŞLEM TAMAM!")
print(f"Masaüstündeki '{klasor}' klasöründe tüm test dosyaların hazır.")