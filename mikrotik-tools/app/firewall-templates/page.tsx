"use client";

import { useState } from "react";

export default function FirewallTemplates() {
  const [scenario, setScenario] = useState("basic-protection");
  const [secureIp, setSecureIp] = useState("192.168.1.100");

  const generateScript = () => {
    let script = `/ip firewall filter\n`;

    if (scenario === "basic-protection") {
      script += `# 1. Geçersiz (Invalid) Bağlantıları Engelle\n`;
      script += `add action=drop chain=input connection-state=invalid comment="Gecersiz baglantilari engelle"\n`;
      script += `# 2. Halihazırda Kurulmuş ve Güvenli Bağlantılara İzin Ver\n`;
      script += `add action=accept chain=input connection-state=established,related comment="Guvenli baglantilara izin ver"\n`;
      script += `# 3. Ping (ICMP) İsteklerini Sınırla (Ping Flood Koruması)\n`;
      script += `add action=accept chain=input icmp-options=8:0-0 protocol=icmp limit=5,5:packet comment="Ping sinirla"\n`;
      script += `add action=drop chain=input protocol=icmp comment="Fazla pingleri engelle"\n`;
      script += `# 4. Geri Kalan Tüm Dış Girişleri Kapat\n`;
      script += `add action=drop chain=input in-interface-list=WAN comment="WAN uzerinden gelen diger her seyi engelle"\n`;
    } 
    
    else if (scenario === "brute-force") {
      script += `# SSH Brute Force Koruması (Aşamalı Engelleme)\n`;
      script += `add action=drop chain=input dst-port=22 protocol=tcp src-address-list=SSH_Kara_Liste comment="Kara listedekileri engelle"\n`;
      script += `add action=add-src-to-address-list address-list=SSH_Kara_Liste address-list-timeout=4w2d chain=input dst-port=22 protocol=tcp src-address-list=SSH_Asama3\n`;
      script += `add action=add-src-to-address-list address-list=SSH_Asama3 address-list-timeout=1m chain=input dst-port=22 protocol=tcp src-address-list=SSH_Asama2\n`;
      script += `add action=add-src-to-address-list address-list=SSH_Asama2 address-list-timeout=1m chain=input dst-port=22 protocol=tcp src-address-list=SSH_Asama1\n`;
      script += `add action=add-src-to-address-list address-list=SSH_Asama1 address-list-timeout=1m chain=input dst-port=22 protocol=tcp comment="Ilk hatali denemeyi izle"\n`;
    } 
    
    else if (scenario === "winbox-security") {
      script += `# Winbox (8291) Portuna Sadece Güvenli Bilgisayarın Erişmesine İzin Ver\n`;
      script += `add action=accept chain=input dst-port=8291 protocol=tcp src-address=${secureIp} comment="Sadece guvenli IPye Winbox izni ver"\n`;
      script += `add action=drop chain=input dst-port=8291 protocol=tcp comment="Geri kalan herkese Winboxu kapat"\n`;
    }

    return script;
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-blue-500 mb-2">Güvenlik Duvarı (Firewall) Şablonları</h1>
        <p className="text-gray-400">RouterOS cihazınızı siber saldırılara, taramalara ve yetkisiz erişimlere karşı koruyacak kurallar.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Taraf: Senaryo Seçimi */}
        <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg border border-gray-700 h-fit space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Güvenlik Senaryosu</label>
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="basic-protection">Temel Router Koruması (Önerilen)</option>
              <option value="brute-force">SSH Brute-Force Önleyici (Saldırı Engelleme)</option>
              <option value="winbox-security">Winbox Erişim Kısıtlama (Whitelist)</option>
            </select>
          </div>

          {scenario === "winbox-security" && (
            <div className="pt-2">
              <label className="block text-xs font-medium text-gray-400 mb-1">Yönetici (Güvenli) IP Adresi</label>
              <input
                type="text"
                value={secureIp}
                onChange={(e) => setSecureIp(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="Örn: 192.168.1.100"
              />
              <p className="text-[11px] text-orange-400 mt-1">⚠️ Dikkat: Kendi IP adresinizi doğru girdiğinizden emin olun, aksi takdirde cihazın erişimini engelleyebilirsiniz.</p>
            </div>
          )}

        </div>

        {/* 右 Taraf: Komut Çıktısı */}
        <div className="lg:col-span-2 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden flex flex-col">
          <div className="bg-gray-900 p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
              Filtre Kuralları (Filter Rules)
            </h2>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(generateScript());
                alert("Güvenlik kuralları kopyalandı!");
              }}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded transition"
            >
              Kopyala
            </button>
          </div>
          
          <pre className="p-4 text-green-400 font-mono text-sm overflow-x-auto whitespace-pre-wrap flex-1 bg-black/50">
            {generateScript()}
          </pre>
        </div>
      </div>
    </div>
  );
}