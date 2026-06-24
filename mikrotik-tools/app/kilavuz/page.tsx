"use client";

import { 
  BookOpen, 
  Terminal, 
  Copy, 
  ShieldAlert, 
  HelpCircle, 
  Network,
  Cpu,
  Layers
} from "lucide-react";

export default function KilavuzPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-bold text-blue-500 mb-2 flex items-center justify-center md:justify-start gap-3">
          <BookOpen className="w-8 h-8" />
          Kullanım Kılavuzu & Yardım
        </h1>
        <p className="text-gray-400">
          MikroTik araçlarımızı, AI asistanımızı ve diğer ağ araçlarımızı en etkili şekilde nasıl kullanacağınızı öğrenin.
        </p>
      </div>

      {/* Main Guide Section */}
      <div className="space-y-8">
        
        {/* Step-by-Step RouterOS script guide */}
        <section className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-400" />
            🚀 MikroTik Scriptleri Nasıl Uygulanır?
          </h2>
          
          <p className="text-gray-300 text-sm mb-6 leading-relaxed">
            Bu platformda oluşturduğunuz subnet hesaplamaları, port yönlendirme (NAT) kuralları ve firewall şablonları gibi tüm çıktılar, MikroTik RouterOS işletim sistemine uygun terminal komutları biçimindedir. Bu komutları cihazınıza uygulamak için aşağıdaki adımları takip edin:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700/60 hover:border-blue-500/40 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">1</span>
                <span className="font-semibold text-white text-sm">Kodu Kopyalayın</span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                İlgili aracın sayfasında parametrelerinizi belirleyin. Sağ tarafta üretilen script kutusunun üstündeki <span className="text-blue-400">Kopyala</span> butonuna basarak komutları kopyalayın.
              </p>
            </div>

            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700/60 hover:border-blue-500/40 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">2</span>
                <span className="font-semibold text-white text-sm">Winbox ile Bağlanın</span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                Bilgisayarınızda Winbox programını çalıştırarak MikroTik yönlendiricinizin IP veya MAC adresi ile admin girişi yapın.
              </p>
            </div>

            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700/60 hover:border-blue-500/40 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">3</span>
                <span className="font-semibold text-white text-sm">New Terminal Açın</span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                Winbox sol menüsünde en altta bulunan <span className="text-blue-400">"New Terminal"</span> seçeneğine tıklayın. Karşınıza siyah terminal (CLI) ekranı gelecektir.
              </p>
            </div>

            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700/60 hover:border-blue-500/40 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">4</span>
                <span className="font-semibold text-white text-sm">Yapıştırın ve Çalıştırın</span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                Terminal ekranına sağ tıklayıp <span className="text-blue-400">"Paste"</span> (Yapıştır) deyin. Komutlar otomatik olarak satır satır işlenecektir. Hata vermeden bittiğinden emin olun.
              </p>
            </div>

          </div>
        </section>

        {/* Warnings and Best Practices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <section className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
            <h2 className="text-lg font-semibold text-orange-400 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-orange-400" />
              ⚠️ Önemli Güvenlik Uyarıları
            </h2>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex gap-2">
                <span className="text-orange-400 font-bold">•</span>
                <span><strong>Önce Yedek Alın:</strong> Kodları yönlendiricinize yapıştırmadan önce mutlaka <em>Files -> Backup</em> adımı ile sistem yedeği oluşturun.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-orange-400 font-bold">•</span>
                <span><strong>Arayüz İsimleri:</strong> Üretilen scriptlerdeki <code>ether1</code>, <code>bridge</code> gibi arayüz isimlerinin sizin cihazınızla birebir aynı olduğundan emin olun.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-orange-400 font-bold">•</span>
                <span><strong>Erişim Engeli Riski:</strong> Firewall veya servis port kurallarını uygularken kendi bilgisayarınızın IP adresini veya bağlantı portunu engellememeye dikkat edin.</span>
              </li>
            </ul>
          </section>

          <section className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
            <h2 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-green-400" />
              💡 Diğer Araçların Kullanımı
            </h2>
            <div className="space-y-4 text-sm text-gray-300">
              <div>
                <h3 className="font-semibold text-white flex items-center gap-1.5 mb-1">
                  <Network className="w-4 h-4 text-blue-400" />
                  Subnet Hesaplayıcı:
                </h3>
                <p className="text-gray-400 text-xs">
                  IP adresini ve CIDR maskesini girdikten sonra, ağ adresinizi, yayın adresinizi (broadcast) ve o aralıktaki kullanılabilir IP aralıklarını anında görebilirsiniz.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white flex items-center gap-1.5 mb-1">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  AI Asistan:
                </h3>
                <p className="text-gray-400 text-xs">
                  MikroTik RouterOS v6 veya v7 ile ilgili tüm konfigürasyon, hata giderme ve senaryo tasarımı sorularınızı Türkçe olarak sorup anında yanıt ve komut alabilirsiniz.
                </p>
              </div>
            </div>
          </section>

        </div>

        {/* Tip banner */}
        <div className="bg-blue-500/10 border border-blue-500/25 rounded-xl p-4 text-sm text-blue-300 flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>İpucu:</strong> Eğer scriptleri terminale yapıştırmak yerine bir dosya halinde yüklemek isterseniz, scripti <code>.rsc</code> uzantılı bir dosyaya (örn: <code>ayarlar.rsc</code>) kaydedip Winbox Files menüsüne sürükleyebilir ve terminalde <code>/import ayarlar.rsc</code> komutunu çalıştırabilirsiniz.
          </p>
        </div>

      </div>
    </div>
  );
}
