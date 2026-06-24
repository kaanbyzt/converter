"use client";

import Link from "next/link";
import { 
  Calculator, 
  Share2, 
  BookOpen, 
  LayoutDashboard,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

export default function Home() {
  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen flex flex-col justify-between">
      {/* Hero section */}
      <div>
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
            MikroTik <span className="text-blue-500">Araç Kutusu</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-2xl leading-relaxed">
            RouterOS cihazlarınız için ağ yapılandırmalarını ve alt ağ hesaplamalarını tarayıcınızda yerel ve matematiksel yöntemlerle yapın. Herhangi bir yapay zeka/bulut bağlantısı barındırmaz, %100 güvenli ve hızlı çalışır.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          
          {/* Card 1: Subnet Calculator */}
          <div className="bg-gray-800 border border-gray-700/80 rounded-xl p-6 flex flex-col justify-between hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all group">
            <div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Calculator className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Subnet Hesaplayıcı</h2>
              <p className="text-gray-400 text-xs leading-relaxed mb-4">
                Ağ aralığını, alt ağ maskesini, yayın adresini ve kullanılabilir IP adreslerini yerel formüllerle hesaplayın.
              </p>
            </div>
            <Link 
              href="/subnet" 
              className="text-blue-400 hover:text-blue-300 text-xs font-semibold flex items-center gap-1 mt-auto"
            >
              Hesaplayıcıyı Aç &rarr;
            </Link>
          </div>

          {/* Card 2: Port Forwarding */}
          <div className="bg-gray-800 border border-gray-700/80 rounded-xl p-6 flex flex-col justify-between hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all group">
            <div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Share2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Port Yönlendirme (NAT)</h2>
              <p className="text-gray-400 text-xs leading-relaxed mb-4">
                Dış ağlardan yerel sunucularınıza (RDP, HTTP, FTP vb.) erişim sağlamak için gereken RouterOS Dst-NAT scriptlerini oluşturun.
              </p>
            </div>
            <Link 
              href="/port-forward" 
              className="text-blue-400 hover:text-blue-300 text-xs font-semibold flex items-center gap-1 mt-auto"
            >
              Sihirbazı Başlat &rarr;
            </Link>
          </div>

          {/* Card 3: User Manual */}
          <div className="bg-gray-800 border border-gray-700/80 rounded-xl p-6 flex flex-col justify-between hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all group">
            <div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Kullanım Kılavuzu</h2>
              <p className="text-gray-400 text-xs leading-relaxed mb-4">
                Oluşturulan komutların ve betiklerin (script) Winbox veya terminal aracılığıyla router'a nasıl uygulanacağını öğrenin.
              </p>
            </div>
            <Link 
              href="/kilavuz" 
              className="text-blue-400 hover:text-blue-300 text-xs font-semibold flex items-center gap-1 mt-auto"
            >
              Rehberi Oku &rarr;
            </Link>
          </div>

        </div>

        {/* Feature Highlights */}
        <div className="bg-gray-800/40 border border-gray-700/60 rounded-2xl p-6 mb-8">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            Neden Yapay Zekasız Yerel Hesaplama?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-300">
                <strong>%100 Gizlilik ve Güvenlik:</strong> Cihaz IP'leriniz, alt ağ tasarımlarınız veya port numaralarınız asla bir dış sunucuya veya yapay zeka servisine gönderilmez.
              </p>
            </div>
            <div className="flex gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-300">
                <strong>Hız ve Kararlılık:</strong> İnternet bağlantısı koptuğunda dahi tüm araçlar ve hesaplamalar yerel formüllerle anında çalışmaya devam eder.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
        <span>MikroTik Web Araçları &copy; Yerel Ağ Çözümleri</span>
      </div>
    </div>
  );
}