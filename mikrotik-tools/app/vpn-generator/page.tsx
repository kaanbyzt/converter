"use client";

import { useState, useMemo } from "react";

export default function VpnGenerator() {
  const [wgInterface, setWgInterface] = useState("wireguard1");
  const [listenPort, setListenPort] = useState("13231");
  const [vpnNetwork, setVpnNetwork] = useState("10.252.1.0");
  const [serverIp, setServerIp] = useState("10.252.1.1");
  const [clientIp, setClientIp] = useState("10.252.1.2");
  const [clientName, setClientName] = useState("Telefon_veya_Laptop");
  const [addFirewall, setAddFirewall] = useState(true);

  const generatedScript = useMemo(() => {
    const firewallScript = addFirewall
      ? `# 3. Güvenlik Duvarı (Firewall) İzni (Dışarıdan VPN'e bağlanabilmek için)\n/ip firewall filter\nadd action=accept chain=input comment="WireGuard VPN İzni" dst-port=${listenPort} protocol=udp place-before=1\n\n`
      : `# 3. Güvenlik Duvarı Kuralı Atlandı\n\n`;

    return `# 1. WireGuard Arayüzünü Oluştur (Anahtarlar otomatik üretilecektir)\n/interface wireguard\nadd listen-port=${listenPort} mt=1420 name=${wgInterface}\n\n# 2. VPN Ağı İçin Sunucuya IP Adresi Ver\n/ip address\nadd address=${serverIp}/24 interface=${wgInterface} network=${vpnNetwork}\n\n${firewallScript}# 4. İstemci (Peer / Client) Ekleme\n# NOT: "public-key" kısmına, bağlayacağınız cihazın ürettiği Public Key'i girmelisiniz.\n/interface wireguard peers\nadd allowed-address=${clientIp}/32 interface=${wgInterface} public-key="ISTEMCININ_PUBLIC_KEY_BURAYA" comment="${clientName}"\n`;
  }, [
    wgInterface,
    listenPort,
    vpnNetwork,
    serverIp,
    clientIp,
    clientName,
    addFirewall,
  ]);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-blue-500 mb-2">WireGuard VPN Kurulumu</h1>
        <p className="text-gray-400">RouterOS v7 için en hızlı ve güvenli VPN olan WireGuard altyapısını saniyeler içinde oluşturun.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Taraf: Ayarlar */}
        <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg border border-gray-700 h-fit space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Arayüz Adı</label>
            <input
              type="text"
              value={wgInterface}
              onChange={(e) => setWgInterface(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Dinleme Portu (UDP)</label>
            <input
              type="text"
              value={listenPort}
              onChange={(e) => setListenPort(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-4 border-t border-gray-700 mt-2">
            <label className="block text-sm font-medium text-blue-400 mb-1">VPN Ağ Bloğu (Subnet)</label>
            <input
              type="text"
              value={vpnNetwork}
              onChange={(e) => setVpnNetwork(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Sunucu IP Adresi</label>
              <input
                type="text"
                value={serverIp}
                onChange={(e) => setServerIp(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">İlk İstemci IP Adresi</label>
              <input
                type="text"
                value={clientIp}
                onChange={(e) => setClientIp(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">İstemci Adı (Yorum)</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-4 border-t border-gray-700 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={addFirewall}
                onChange={(e) => setAddFirewall(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-900 border-gray-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-300">Gerekli Firewall Kuralını Ekle</span>
            </label>
          </div>

        </div>

        {/* Sağ Taraf: Üretilen Script */}
        <div className="lg:col-span-2 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden flex flex-col">
          <div className="bg-gray-900 p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
              Üretilen WireGuard Komutları
            </h2>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(generatedScript);
                alert("VPN kurulum kodları kopyalandı!");
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