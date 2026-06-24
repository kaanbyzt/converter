"use client";

import { useState } from "react";

export default function DhcpServerBuilder() {
  const [poolName, setPoolName] = useState("dhcp_havuzu");
  const [poolRange, setPoolRange] = useState("192.168.1.100-192.168.1.200");
  const [interfaceName, setInterfaceName] = useState("bridge-local");
  const [dnsServers, setDnsServers] = useState("8.8.8.8,1.1.1.1");
  const [gateway, setGateway] = useState("192.168.1.1");

  const generateScript = () => {
    let script = `# 1. IP Havuzunu (IP Pool) Tanımla\n`;
    script += `/ip pool\n`;
    script += `add name=${poolName} ranges=${poolRange}\n\n`;

    script += `# 2. DHCP Sunucusunu Oluştur ve Havuza Bağla\n`;
    script += `/ip dhcp-server\n`;
    script += `add address-pool=${poolName} disabled=no interface=${interfaceName} lease-time=10h name="DHCP_Sunucusu"\n\n`;

    script += `# 3. Dağıtılacak Ağ Detaylarını (Gateway ve DNS) Belirt\n`;
    // Ağ aralığını subnet formatına çevirmek için basit bir varsayım (örneğin gateway'in son octetini 0 yapıyoruz)
    const baseNetwork = gateway.substring(0, gateway.lastIndexOf(".")) + ".0/24";
    script += `/ip dhcp-server network\n`;
    script += `add address=${baseNetwork} comment="Yerel LAN Agi" dns-server=${dnsServers} gateway=${gateway}\n`;

    return script;
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-blue-500 mb-2">DHCP Sunucu ve IP Havuzu Oluşturucu</h1>
        <p className="text-gray-400">Cihazlarınızın ağdan otomatik IP, Gateway ve DNS alabilmesi için gerekli servis kurulum kodlarını hazırlayın.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Taraf: Ayarlar */}
        <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg border border-gray-700 h-fit space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">IP Havuz Adı</label>
            <input
              type="text"
              value={poolName}
              onChange={(e) => setPoolName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Dağıtılacak IP Aralığı</label>
            <input
              type="text"
              value={poolRange}
              onChange={(e) => setPoolRange(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="Örn: 192.168.1.100-192.168.1.200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Arayüz (Interface)</label>
            <input
              type="text"
              value={interfaceName}
              onChange={(e) => setInterfaceName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Varsayılan Geçit (Gateway)</label>
            <input
              type="text"
              value={gateway}
              onChange={(e) => setGateway(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">DNS Sunucuları (Virgülle Ayır)</label>
            <input
              type="text"
              value={dnsServers}
              onChange={(e) => setDnsServers(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

        </div>

        {/* Sağ Taraf: Üretilen Script */}
        <div className="lg:col-span-2 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden flex flex-col">
          <div className="bg-gray-900 p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
              DHCP Konfigürasyon Scripti
            </h2>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(generateScript());
                alert("DHCP kurulum kodları kopyalandı!");
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