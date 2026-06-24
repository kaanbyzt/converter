"use client";

import { useState } from "react";

export default function SrcNatBuilder() {
  const [natType, setNatType] = useState("masquerade");
  const [outInterface, setOutInterface] = useState("pppoe-out1");
  const [localSubnet, setLocalSubnet] = useState("192.168.1.0/24");
  const [publicIp, setPublicIp] = useState("85.105.x.x");

  const generateScript = () => {
    let script = `# Yerel Ağın İnternete Çıkış (Source NAT) Yapılandırması\n`;
    script += `/ip firewall nat\n`;

    if (natType === "masquerade") {
      script += `add action=masquerade chain=srcnat comment="Dinamik IP ile internete cikis (Masquerade)" src-address=${localSubnet} out-interface=${outInterface}\n`;
    } else {
      script += `add action=src-nat chain=srcnat comment="Statik IP ile internete cikis (Src-NAT)" src-address=${localSubnet} out-interface=${outInterface} to-addresses=${publicIp}\n`;
    }

    return script;
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-blue-500 mb-2">İnternet Çıkış (Src-NAT) Asistanı</h1>
        <p className="text-gray-400">İç ağdaki cihazlarınızın internete erişebilmesi için Masquerade veya Statik Src-NAT kurallarını güvenli bir şekilde yapılandırın.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Taraf: Ayarlar */}
        <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg border border-gray-700 h-fit space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">NAT Yöntemi</label>
            <select
              value={natType}
              onChange={(e) => setNatType(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="masquerade">Masquerade (Dinamik IP / Standart)</option>
              <option value="srcnat">Src-NAT (Statik / Sabit Dış IP)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Yerel Ağ Bloğu (Src. Address)</label>
            <input
              type="text"
              value={localSubnet}
              onChange={(e) => setLocalSubnet(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Dış Hat Arayüzü (Out. Interface)</label>
            <input
              type="text"
              value={outInterface}
              onChange={(e) => setOutInterface(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="Örn: pppoe-out1 veya ether1"
            />
          </div>

          {natType === "srcnat" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Statik Dış IP Adresiniz (To Addresses)</label>
              <input
                type="text"
                value={publicIp}
                onChange={(e) => setPublicIp(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="Örn: 85.105.42.12"
              />
            </div>
          )}

        </div>

        {/* Sağ Taraf: Üretilen Script */}
        <div className="lg:col-span-2 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden flex flex-col">
          <div className="bg-gray-900 p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
              Source NAT Komut Satırı
            </h2>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(generateScript());
                alert("NAT kuralları kopyalandı!");
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