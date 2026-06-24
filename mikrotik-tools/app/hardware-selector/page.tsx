"use client";

import { useState } from "react";

// MikroTik Popüler Cihaz Veritabanı Şablonu
const MIKROTIK_DEVICES = [
  { model: "hEX (RB750Gr3)", type: "home-office", ports: "1G", sfp: "Yok", ipsec: "Var", desc: "Ev ve küçük ofisler için fiyat performans canavarı standart kablolu router." },
  { model: "hAP ax3", type: "home-office", ports: "1G & 2.5G", sfp: "Yok", ipsec: "Var", desc: "Güçlü işlemcili, Wi-Fi 6 destekli üst düzey ev/ofis routerı." },
  { model: "RB4011 iGS+RM", type: "medium-business", ports: "1G", sfp: "1x 10G SFP+", ipsec: "Çok Güçlü", desc: "Orta ölçekli işletmeler, siber kafeler ve yoğun ağlar için 10 çekirdek gücünde router." },
  { model: "RB5009 UG+S+IN", type: "medium-business", ports: "1G & 2.5G", sfp: "1x 10G SFP+", ipsec: "Mükemmel", desc: "Yeni nesil kompakt güç. Ağır yükler ve modern 2.5G/10G ağlar için mükemmel seçim." },
  { model: "CCR2004-16G-2S+", type: "enterprise", ports: "1G", sfp: "2x 10G SFP+", ipsec: "Donanımsal", desc: "Büyük işletmeler ve veri merkezleri için tam donanımlı Cloud Core Router." },
  { model: "CCR2116-12G-4S+", type: "enterprise", ports: "1G", sfp: "4x 10G SFP+", ipsec: "Ultra Güçlü", desc: "Büyük ISP'ler ve devasa trafik yönetimi için geliştirilmiş ekstrem performans routerı." },
];

export default function HardwareSelector() {
  const [selectedType, setSelectedType] = useState("all");
  const [requireSfp, setRequireSfp] = useState(false);

  // Filtreleme Algoritması
  const filteredDevices = MIKROTIK_DEVICES.filter(device => {
    const typeMatch = selectedType === "all" || device.type === selectedType;
    const sfpMatch = !requireSfp || device.sfp !== "Yok";
    return typeMatch && sfpMatch;
  });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-blue-500 mb-2">MikroTik Donanım Seçici</h1>
        <p className="text-gray-400">Projenizin veya işletmenizin ihtiyaçlarına en uygun RouterBOARD modelini hızlıca filtreleyin.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sol Taraf: Filtre Paneli */}
        <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg border border-gray-700 h-fit space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ağ Ölçeği / Tipi</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tüm Cihazlar</option>
              <option value="home-office">Ev / Küçük Ofis (SOHO)</option>
              <option value="medium-business">Orta Ölçekli İşletme</option>
              <option value="enterprise">Kurumsal / Veri Merkezi / ISP</option>
            </select>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={requireSfp}
                onChange={(e) => setRequireSfp(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-900 border-gray-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-300">10G SFP+ Portu Olsun</span>
            </label>
          </div>
        </div>

        {/* Sağ Taraf: Sonuç Listesi */}
        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
            📊 Uygun Modeller ({filteredDevices.length})
          </h2>

          {filteredDevices.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredDevices.map((device, idx) => (
                <div key={idx} className="bg-gray-800 border border-gray-700 rounded-lg p-5 hover:border-blue-500/50 transition">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-blue-400">{device.model}</h3>
                    <span className="text-xs bg-gray-900 px-2.5 py-1 rounded text-gray-400 uppercase font-mono tracking-wider">
                      {device.type.replace('-', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">{device.desc}</p>
                  
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-700/50 text-xs font-mono">
                    <div className="bg-gray-900/50 p-2 rounded text-center">
                      <span className="text-gray-500 block text-[10px]">Port Hızları</span>
                      <span className="text-gray-200 font-bold">{device.ports}</span>
                    </div>
                    <div className="bg-gray-900/50 p-2 rounded text-center">
                      <span className="text-gray-500 block text-[10px]">SFP+ Desteği</span>
                      <span className="text-gray-200 font-bold">{device.sfp}</span>
                    </div>
                    <div className="bg-gray-900/50 p-2 rounded text-center">
                      <span className="text-gray-500 block text-[10px]">IPsec Donanım Hızl.</span>
                      <span className="text-green-400 font-bold">{device.ipsec}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700 text-gray-400">
              Aradığınız kriterlere uygun cihaz bulunamadı. Filtreleri esnetmeyi deneyebilirsiniz.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}