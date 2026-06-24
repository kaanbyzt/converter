"use client";

import { useState } from "react";

export default function RoutingHelper() {
  const [dstAddress, setDstAddress] = useState("0.0.0.0/0");
  const [gateway, setGateway] = useState("192.168.1.1");
  const [distance, setDistance] = useState(1);
  const [checkGateway, setCheckGateway] = useState(true);
  const [comment, setComment] = useState("Ana_Internet_Hatti");

  const generateScript = () => {
    let script = `# 1. Statik Yönlendirme (Route) Kuralı Ekle\n`;
    script += `/ip route\n`;
    
    const checkStr = checkGateway ? " check-gateway=ping" : "";
    const commentStr = comment ? ` comment="${comment}"` : "";

    script += `add dst-address=${dstAddress} gateway=${gateway} distance=${distance}${checkStr}${commentStr}\n`;

    if (distance > 1 && checkGateway) {
      script += `\n# Not: Mesafe (Distance) değeri 1'den büyük seçildiği için bu hat otomatik olarak bir YEDEK (Failover) hat olarak çalışacaktır.\n`;
    }

    return script;
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-blue-500 mb-2">Yönlendirme (Routing) Asistanı</h1>
        <p className="text-gray-400">Statik rotalar oluşturun, internet çıkışlarınızı belirleyin ve hat yedekleme (Failover) mimarilerini kurgulayın.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Taraf: Ayarlar */}
        <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg border border-gray-700 h-fit space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Kural Adı (Yorum)</label>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="Örn: Ana_Internet"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Hedef Ağ (Dst. Address)</label>
            <input
              type="text"
              value={dstAddress}
              onChange={(e) => setDstAddress(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="Örn: 0.0.0.0/0 veya 10.0.0.0/8"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Gateway (Geçit / Modem IP)</label>
            <input
              type="text"
              value={gateway}
              onChange={(e) => setGateway(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="Örn: 192.168.1.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Mesafe (Distance / Öncelik)</label>
            <input
              type="number"
              value={distance}
              onChange={(e) => setDistance(Number(e.target.value))}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              min={1}
              max={255}
            />
          </div>

          <div className="pt-4 border-t border-gray-700 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={checkGateway}
                onChange={(e) => setCheckGateway(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-900 border-gray-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-300">Gateway Kontrolü Yap (Ping)</span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Modem koptuğunda veya internet gittiğinde routerın bu rotayı otomatik olarak devre dışı bırakmasını sağlar.
            </p>
          </div>

        </div>

        {/* Sağ Taraf: Üretilen Script */}
        <div className="lg:col-span-2 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden flex flex-col">
          <div className="bg-gray-900 p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
              Yönlendirme Komut Satırı
            </h2>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(generateScript());
                alert("Yönlendirme kuralları kopyalandı!");
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