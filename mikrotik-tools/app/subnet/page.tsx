"use client";

import { useState } from "react";

// IP Adresinin geçerli olup olmadığını kontrol eden fonksiyon
const isValidIP = (ip: string) => {
  const regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return regex.test(ip);
};

export default function SubnetCalculator() {
  const [ipAddress, setIpAddress] = useState("192.168.1.1");
  const [cidr, setCidr] = useState(24);

  // useEffect KULLANMADAN: Doğrudan render sırasında hesaplama yapıyoruz
  // Bu hem Typescript hatasını hem de useEffect hatasını tamamen çözer
  let results = null;

  if (isValidIP(ipAddress)) {
    const ipNum = ipAddress.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
    const maskNum = (0xffffffff << (32 - cidr)) >>> 0;
    const networkNum = (ipNum & maskNum) >>> 0;
    const broadcastNum = (networkNum | ~maskNum) >>> 0;

    const numToIp = (num: number) => [
      (num >>> 24) & 255,
      (num >>> 16) & 255,
      (num >>> 8) & 255,
      num & 255
    ].join('.');

    const totalHosts = cidr < 31 ? Math.pow(2, 32 - cidr) - 2 : 0;
    const firstHost = cidr < 31 ? numToIp(networkNum + 1) : "Yok";
    const lastHost = cidr < 31 ? numToIp(broadcastNum - 1) : "Yok";

    results = {
      network: numToIp(networkNum),
      broadcast: numToIp(broadcastNum),
      mask: numToIp(maskNum),
      firstHost,
      lastHost,
      totalHosts,
      cidrMask: `/${cidr}`
    };
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-blue-500 mb-2">Subnet (Alt Ağ) Hesaplayıcı</h1>
        <p className="text-gray-400">IPv4 adresleri için ağ aralığını, kullanılabilir IP sayısını ve subnet maskesini hesaplayın.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sol Taraf: Giriş Formu */}
        <div className="md:col-span-1 bg-gray-800 p-6 rounded-lg border border-gray-700 h-fit">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            IP Adresi
          </label>
          <input
            type="text"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white mb-6 focus:outline-none focus:border-blue-500"
            placeholder="Örn: 192.168.1.1"
          />

          <label className="block text-sm font-medium text-gray-300 mb-2">
            CIDR (Alt Ağ Maskesi)
          </label>
          <select
            value={cidr}
            onChange={(e) => setCidr(Number(e.target.value))}
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            {[...Array(32)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                /{i + 1}
              </option>
            ))}
          </select>
        </div>

        {/* Sağ Taraf: Sonuçlar */}
        <div className="md:col-span-2 bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-6 border-b border-gray-700 pb-2">Ağ Detayları</h2>
          
          {results ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-gray-900 p-3 rounded border border-gray-700">
                <span className="text-gray-400">Ağ Adresi (Network)</span>
                <span className="font-mono text-blue-400 font-bold">{results.network}</span>
              </div>
              
              <div className="flex justify-between items-center bg-gray-900 p-3 rounded border border-gray-700">
                <span className="text-gray-400">Yayın Adresi (Broadcast)</span>
                <span className="font-mono text-orange-400 font-bold">{results.broadcast}</span>
              </div>

              <div className="flex justify-between items-center bg-gray-900 p-3 rounded border border-gray-700">
                <span className="text-gray-400">Subnet Maskesi</span>
                <span className="font-mono text-green-400">{results.mask}</span>
              </div>

              <div className="flex justify-between items-center bg-gray-900 p-3 rounded border border-gray-700">
                <span className="text-gray-400">Kullanılabilir IP Aralığı</span>
                <span className="font-mono text-gray-200">
                  {results.firstHost} <span className="text-gray-500 mx-1">-</span> {results.lastHost}
                </span>
              </div>

              <div className="flex justify-between items-center bg-blue-900/30 p-3 rounded border border-blue-800/50 mt-6">
                <span className="text-blue-300 font-medium">Toplam Kullanılabilir Host</span>
                <span className="font-bold text-xl text-white">{results.totalHosts.toLocaleString('tr-TR')}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-red-400">
              Lütfen geçerli bir IPv4 adresi girin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}