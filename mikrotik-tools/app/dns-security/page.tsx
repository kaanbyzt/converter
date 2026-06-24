"use client";

import { useState } from "react";

export default function DnsSecurityBuilder() {
  const [dnsProvider, setDnsProvider] = useState("cloudflare-family");
  const [blockAds, setBlockAds] = useState(true);
  const [allowRemoteRequests, setAllowRemoteRequests] = useState(true);

  const generateScript = () => {
    let script = `# 1. Güvenli Yukarı Akış (Upstream) DNS Sunucularını Ayarla\n`;
    script += `/ip dns\n`;

    let servers = "1.1.1.1,8.8.8.8";
    if (dnsProvider === "cloudflare-family") {
      servers = "1.1.1.3,1.0.0.3";
    } else if (dnsProvider === "quad9") {
      servers = "9.9.9.9,149.112.112.112";
    } else if (dnsProvider === "adguard") {
      servers = "94.140.14.14,94.140.15.15";
    }

    const remoteReq = allowRemoteRequests ? "yes" : "no";
    script += `set servers=${servers} allow-remote-requests=${remoteReq}\n\n`;

    if (blockAds) {
      script += `# 2. Popüler Zararlı ve Reklam Alan Adlarını Router Üzerinde Engelle (Sinkhole)\n`;
      script += `/ip dns static\n`;
      script += `add name="doubleclick.net" address=0.0.0.0 comment="Reklam Engelleme"\n`;
      script += `add name="analytics.google.com" address=0.0.0.0 comment="Izleyici Engelleme"\n`;
      script += `add name="telemetry.microsoft.com" address=0.0.0.0 comment="Telemetri Engelleme"\n`;
    }

    return script;
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-blue-500 mb-2">DNS Güvenliği ve Reklam Engelleme</h1>
        <p className="text-gray-400">Güvenli DNS protokolleri tanımlayın, reklam ve izleyici (tracker) domainlerini ağ seviyesinde filtreleyin.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Taraf: Ayarlar */}
        <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg border border-gray-700 h-fit space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Güvenli DNS Sağlayıcısı</label>
            <select
              value={dnsProvider}
              onChange={(e) => setDnsProvider(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="cloudflare-family">Cloudflare Family (Malware + Yetişkin Engeli)</option>
              <option value="quad9">Quad9 Secure (Zararlı Yazılım & Phishing Koruması)</option>
              <option value="adguard">AdGuard DNS (Varsayılan Reklam Engelleme)</option>
            </select>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={blockAds}
                onChange={(e) => setBlockAds(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-900 border-gray-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-300">Temel Reklam/İzleyici Engelleme</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={allowRemoteRequests}
                onChange={(e) => setAllowRemoteRequests(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-900 border-gray-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-300">Yerel İsteklere İzin Ver (Sorgu Önbelleği)</span>
            </label>
          </div>

        </div>

        {/* Sağ Taraf: Üretilen Script */}
        <div className="lg:col-span-2 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden flex flex-col">
          <div className="bg-gray-900 p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
              DNS Konfigürasyon Scripti
            </h2>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(generateScript());
                alert("DNS güvenlik kodları kopyalandı!");
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