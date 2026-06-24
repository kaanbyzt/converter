"use client";

import { useState } from "react";

export default function InterfaceIpManager() {
  const [interfaceName, setInterfaceName] = useState("ether2");
  const [ipAddress, setIpAddress] = useState("192.168.10.1/24");
  const [interfaceStatus, setInterfaceStatus] = useState("enable");
  const [comment, setComment] = useState("Sirket_Yerel_Agi");

  const generateScript = () => {
    let script = `# 1. Arayüz Durumunu Yapılandır\n`;
    script += `/interface\n`;
    if (interfaceStatus === "enable") {
      script += `enable ${interfaceName}\n\n`;
    } else {
      script += `disable ${interfaceName}\n\n`;
    }

    script += `# 2. Belirtilen Arayüze IP Adresi Ata\n`;
    script += `/ip address\n`;
    const commentStr = comment ? ` comment="${comment}"` : "";
    script += `add address=${ipAddress} interface=${interfaceName}${commentStr}\n`;

    return script;
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-blue-500 mb-2">Arayüz ve IP Adres Yönetimi</h1>
        <p className="text-gray-400">RouterBOARD üzerindeki fiziksel veya sanal portlara toplu IP atamaları yapın ve port durumlarını kontrol edin.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Taraf: Ayarlar */}
        <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg border border-gray-700 h-fit space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Arayüz Adı (Interface)</label>
            <input
              type="text"
              value={interfaceName}
              onChange={(e) => setInterfaceName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="Örn: ether2 veya bridge-lan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Atanacak IP & Subnet</label>
            <input
              type="text"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="Örn: 192.168.10.1/24"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Kural Açıklaması (Comment)</label>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="Örn: Muhasebe_Blogu"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Port Durumu</label>
            <select
              value={interfaceStatus}
              onChange={(e) => setInterfaceStatus(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="enable">Arayüzü Aktif Et (Enable)</option>
              <option value="disable">Arayüzü Kapat (Disable / Shutdown)</option>
            </select>
          </div>

        </div>

        {/* Sağ Taraf: Üretilen Script */}
        <div className="lg:col-span-2 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden flex flex-col">
          <div className="bg-gray-900 p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
              Arayüz ve IP Komut Satırı
            </h2>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(generateScript());
                alert("Arayüz konfigürasyon kuralları kopyalandı!");
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