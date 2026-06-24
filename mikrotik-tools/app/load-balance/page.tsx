"use client";

import { useState } from "react";

export default function LoadBalance() {
  const [wanCount, setWanCount] = useState(2);
  const [lanInterface, setLanInterface] = useState("bridge-local");

  // WAN isimlerini dinamik olarak oluştur (WAN1, WAN2...)
  const wanInterfaces = Array.from({ length: wanCount }, (_, i) => `ether${i + 1}`);

  // PCC (Per Connection Classifier) kurallarını üreten fonksiyon
  const generateScript = () => {
    let script = `/ip firewall mangle\n`;
    
    // 1. Gelen bağlantıları kabul et (Accept)
    script += `add action=accept chain=prerouting in-interface=${lanInterface}\n`;
    wanInterfaces.forEach(wan => {
      script += `add action=accept chain=prerouting in-interface=${wan}\n`;
    });
    script += `\n`;

    // 2. Bağlantı işaretleme (Connection Mark)
    wanInterfaces.forEach((wan, index) => {
      script += `add action=mark-connection chain=input in-interface=${wan} new-connection-mark=${wan}_conn passthrough=yes\n`;
    });
    script += `\n`;

    // 3. Yönlendirme işaretleme (Routing Mark)
    wanInterfaces.forEach((wan, index) => {
      script += `add action=mark-routing chain=output connection-mark=${wan}_conn new-routing-mark=to_${wan} passthrough=yes\n`;
    });
    script += `\n`;

    // 4. PCC Kuralı (Yük Dağıtımı)
    wanInterfaces.forEach((wan, index) => {
      script += `add action=mark-connection chain=prerouting dst-address-type=!local in-interface=${lanInterface} new-connection-mark=${wan}_conn passthrough=yes per-connection-classifier=both-addresses-and-ports:${wanCount}/${index}\n`;
    });
    script += `\n`;

    // 5. İçeriden dışarı çıkan paketleri işaretle
    wanInterfaces.forEach((wan, index) => {
      script += `add action=mark-routing chain=prerouting connection-mark=${wan}_conn in-interface=${lanInterface} new-routing-mark=to_${wan} passthrough=yes\n`;
    });

    script += `\n/ip route\n`;
    
    // 6. Yönlendirme tablosu (Route)
    wanInterfaces.forEach((wan, index) => {
      // Örnek Gateway adresleri: 192.168.1.1, 192.168.2.1 ...
      script += `add check-gateway=ping distance=1 gateway=192.168.${index + 1}.1 routing-mark=to_${wan}\n`;
    });

    return script;
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-blue-500 mb-2">PCC Load Balance Sihirbazı</h1>
        <p className="text-gray-400">Çoklu internet hatlarınızı (WAN) birleştirmek için RouterOS komutlarınızı otomatik oluşturun.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Taraf: Ayarlar */}
        <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg border border-gray-700 h-fit">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            WAN (İnternet) Hat Sayısı
          </label>
          <select
            value={wanCount}
            onChange={(e) => setWanCount(Number(e.target.value))}
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white mb-6 focus:outline-none focus:border-blue-500"
          >
            <option value={2}>2 Hat (Dual WAN)</option>
            <option value={3}>3 Hat</option>
            <option value={4}>4 Hat</option>
          </select>

          <label className="block text-sm font-medium text-gray-300 mb-2">
            Yerel Ağ (LAN) Arayüzü
          </label>
          <input
            type="text"
            value={lanInterface}
            onChange={(e) => setLanInterface(e.target.value)}
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            placeholder="Örn: bridge-local veya ether5"
          />
        </div>

        {/* Sağ Taraf: Üretilen Script */}
        <div className="lg:col-span-2 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden flex flex-col">
          <div className="bg-gray-900 p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
              Üretilen RouterOS Komutları
            </h2>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(generateScript());
                alert("Komutlar kopyalandı! MikroTik terminaline yapıştırabilirsiniz.");
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