"use client";

import { useState, useMemo } from "react";

const SERVICES = {
  winbox: { name: "Winbox", defaultPort: "8291" },
  ssh: { name: "SSH", defaultPort: "22" },
  www: { name: "WebFig / HTTP", defaultPort: "80" },
  api: { name: "API", defaultPort: "8728" },
};

type ServiceKey = keyof typeof SERVICES;

export default function PortServices() {
  const [targetService, setTargetService] = useState<ServiceKey>("winbox");
  const [newPort, setNewPort] = useState(SERVICES.winbox.defaultPort);
  const [serviceAction, setServiceAction] = useState("change-port");
  const [secureSubnet, setSecureSubnet] = useState("192.168.1.0/24");

  const generatedScript = useMemo(() => {
    let script = `# MikroTik Servis Güvenlik Yapılandırması\n`;
    script += `/ip service\n`;

    if (serviceAction === "change-port") {
      script += `set ${targetService} port=${newPort} disabled=no comment="Guvenlik amaciyla port degistirildi"\n`;
    } else if (serviceAction === "disable") {
      script += `set ${targetService} disabled=yes comment="Kullanilmadigi icin kapatildi"\n`;
    } else if (serviceAction === "secure-subnet") {
      script += `set ${targetService} address=${secureSubnet} disabled=no comment="Sadece belirtilen aga izin verildi"\n`;
    }

    return script;
  }, [serviceAction, targetService, newPort, secureSubnet]);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-blue-500 mb-2">Port ve Servis Yönetimi</h1>
        <p className="text-gray-400">RouterBOARD üzerindeki açık servisleri görüntüleyin, varsayılan portları değiştirerek dışarıdan gelecek taramaları engelleyin.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Taraf: Ayarlar */}
        <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg border border-gray-700 h-fit space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Yöneteceğiniz Servis</label>
            <select
              value={targetService}
              onChange={(e) => { 
                const selectedService = e.target.value as ServiceKey;
                setTargetService(selectedService);
                setNewPort(SERVICES[selectedService].defaultPort);
              }}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              {Object.entries(SERVICES).map(([key, { name, defaultPort }]) => (
                <option key={key} value={key}>
                  {name} (Varsayılan: {defaultPort})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Uygulanacak Eylem</label>
            <select
              value={serviceAction}
              onChange={(e) => setServiceAction(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="change-port">Port Numarasını Değiştir (Önerilen)</option>
              <option value="secure-subnet">Sadece Belirli Ağ Bloklarına Aç (IP Whitelist)</option>
              <option value="disable">Servisi Tamamen Kapat (Disable)</option>
            </select>
          </div>

          {serviceAction === "change-port" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Yeni Port Numarası</label>
              <input
                type="number"
                value={newPort}
                onChange={(e) => setNewPort(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {serviceAction === "secure-subnet" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">İzin Verilecek Ağ (Subnet)</label>
              <input
                type="text"
                value={secureSubnet}
                onChange={(e) => setSecureSubnet(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

        </div>

        {/* Sağ Taraf: Üretilen Script */}
        <div className="lg:col-span-2 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden flex flex-col">
          <div className="bg-gray-900 p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
              Servis Yapılandırma Komutu
            </h2>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(generatedScript);
                alert("Servis komutları kopyalandı!");
              }}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded transition"
            >
              Kopyala
            </button>
          </div>
          
          <pre className="p-4 text-green-400 font-mono text-sm overflow-x-auto whitespace-pre-wrap flex-1 bg-black/50">
            {generatedScript}
          </pre>
        </div>
      </div>
    </div>
  );
}