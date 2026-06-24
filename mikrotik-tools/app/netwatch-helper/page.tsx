"use client";

import { useState } from "react";

export default function NetwatchHelper() {
  const [targetHost, setTargetHost] = useState("8.8.8.8");
  const [intervalTime, setIntervalTime] = useState("1m");
  const [timeoutTime, setTimeoutTime] = useState("1000");
  const [actionScenario, setActionScenario] = useState("logging");

  const generateScript = () => {
    let script = `# 1. Netwatch ile İzleme Noktası Oluştur\n`;
    script += `/tool netwatch\n`;
    script += `add host=${targetHost} interval=${intervalTime} timeout=${timeoutTime}ms \\\n`;

    if (actionScenario === "logging") {
      script += `    up-script={ :log info "Netwatch: ${targetHost} erisilebilir durumda." } \\\n`;
      script += `    down-script={ :log error "Netwatch: ${targetHost} erisilemez oldu! Hat kesintisi var." }\n`;
    } else if (actionScenario === "failover") {
      script += `    up-script={ /ip route enable [find comment="Ana_Hat"] ; :log info "Ana hat geri geldi, aktif edildi." } \\\n`;
      script += `    down-script={ /ip route disable [find comment="Ana_Hat"] ; :log warning "Ana hat koptu, yedek hatta geciliyor!" }\n`;
    } else if (actionScenario === "interface-reset") {
      script += `    up-script={ :log info "Arayuz stabil." } \\\n`;
      script += `    down-script={ /interface disable ether1 ; :delay 5s ; /interface enable ether1 ; :log warning "Hat koptugu icin ether1 arayuzu kapatilip tekrar acildi!" }\n`;
    }

    return script;
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-blue-500 mb-2">Netwatch İzleme Asistanı</h1>
        <p className="text-gray-400">Belirli IP adreslerinin gecikme ve erişilebilirlik durumlarını otomatik izleyin, hat kopmalarında refleks senaryoları tetikleyin.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Taraf: Ayarlar */}
        <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg border border-gray-700 h-fit space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">İzlenecek IP / Host</label>
            <input
              type="text"
              value={targetHost}
              onChange={(e) => setTargetHost(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="Örn: 8.8.8.8"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Sıklık (Interval)</label>
              <input
                type="text"
                value={intervalTime}
                onChange={(e) => setIntervalTime(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="Örn: 30s veya 1m"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Zaman Aşımı (ms)</label>
              <input
                type="number"
                value={timeoutTime}
                onChange={(e) => setTimeoutTime(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-700 mt-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Aksiyon Senaryosu</label>
            <select
              value={actionScenario}
              onChange={(e) => setActionScenario(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="logging">Sadece Log Defterine Yaz (Bilgilendirme)</option>
              <option value="failover">Otomatik Yedek Hat Değişimi (Failover)</option>
              <option value="interface-reset">Bağlantı Kopunca Portu Yeniden Başlat</option>
            </select>
          </div>

        </div>

        {/* Sağ Taraf: Üretilen Script */}
        <div className="lg:col-span-2 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden flex flex-col">
          <div className="bg-gray-900 p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
              Netwatch Komut Satırı
            </h2>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(generateScript());
                alert("Netwatch kuralları kopyalandı!");
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