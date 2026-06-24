"use client";

import { useState } from "react";

export default function FastTrackOptimizer() {
  const [optimizerMode, setOptimizerMode] = useState("enable");
  const [excludeVpn, setExcludeVpn] = useState(true);

  const generateScript = () => {
    let script = `# MikroTik FastTrack CPU Performans Optimizasyonu\n`;
    script += `/ip firewall filter\n`;

    if (optimizerMode === "enable") {
      if (excludeVpn) {
        script += `# NOT: VPN trafiğinin FastTrack yüzünden bozulmaması için VPN paketleri hariç tutulmuştur.\n`;
        script += `add action=fasttrack-connection chain=forward connection-state=established,related comment="CPU Yukunu Hafiflet (FastTrack) - VPN Haric" connection-mark=!VPN_Trafigi\n`;
      } else {
        script += `add action=fasttrack-connection chain=forward connection-state=established,related comment="CPU Yukunu Hafiflet (FastTrack) - Tum Trafik"\n`;
      }
      script += `add action=accept chain=forward connection-state=established,related comment="FastTrack sonrasi kalan guvenli paketlere izin ver"\n`;
    } else {
      script += `# FastTrack Kurallarını Kaldırma / Pasife Alma\n`;
      script += `disable [find comment~"FastTrack"]\n`;
    }

    return script;
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-blue-500 mb-2">FastTrack Performans Optimizasyonu</h1>
        <p className="text-gray-400">Yüksek hızlı internet hatlarında RouterBOARD işlemci (CPU) kullanımını düşürmek için donanımsal hızlandırma kuralları oluşturun.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Taraf: Ayarlar */}
        <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg border border-gray-700 h-fit space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">FastTrack Durumu</label>
            <select
              value={optimizerMode}
              onChange={(e) => setOptimizerMode(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="enable">Aktif Et (İşlemci Yükünü Azalt)</option>
              <option value="disable">Devre Dışı Bırak / Temizle</option>
            </select>
          </div>

          {optimizerMode === "enable" && (
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={excludeVpn}
                  onChange={(e) => setExcludeVpn(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-900 border-gray-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-300">VPN Trafiğini Hariç Tut (Önerilen)</span>
              </label>
              <p className="text-xs text-gray-500 mt-2 ml-6">
                Mingo, IPsec veya WireGuard gibi VPN tünelleri FastTrack ile çakışabilir ve bağlantı kopmalarına yol açabilir. Bu seçeneğin aktif kalması kararlılık için önemlidir.
              </p>
            </div>
          )}

        </div>

        {/* Sağ Taraf: Üretilen Script */}
        <div className="lg:col-span-2 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden flex flex-col">
          <div className="bg-gray-900 p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
              Firewall Optimizasyon Komutları
            </h2>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(generateScript());
                alert("Performans kuralları kopyalandı!");
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