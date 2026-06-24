"use client";

import { useState } from "react";

export default function IpGuide() {
  const [activeClass, setActiveClass] = useState("all");

  const classes = [
    { name: "A Sınıfı", range: "1.0.0.0 - 126.255.255.255", mask: "255.0.0.0 (/8)", private: "10.0.0.0 - 10.255.255.255", usage: "Çok büyük ölçekli ağlar ve telekom operatörleri için tasarlanmıştır." },
    { name: "B Sınıfı", range: "128.0.0.0 - 191.255.255.255", mask: "255.255.0.0 (/16)", private: "172.16.0.0 - 172.31.255.255", usage: "Orta ve büyük ölçekli şirketler, üniversiteler ve kurumsal ağlar içindir." },
    { name: "C Sınıfı", range: "192.0.0.0 - 223.255.255.255", mask: "255.255.255.0 (/24)", private: "192.168.0.0 - 192.168.255.255", usage: "Küçük işletmeler, ev ağları ve yerel lokal ağların (LAN) vazgeçilmez standardıdır." }
  ];

  const filteredClasses = activeClass === "all" ? classes : classes.filter(c => c.name.toLowerCase().includes(activeClass));

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-blue-500 mb-2">IPv4 Adresleme ve Sınıf Rehberi</h1>
        <p className="text-gray-400">Ağ tasarımlarınızda doğru IP bloklarını seçmek, yerel ve dış ağ sınırlarını belirlemek için temel başvuru kılavuzu.</p>
      </div>

      <div className="space-y-8">
        {/* Filtre Butonları */}
        <div className="flex gap-2 bg-gray-800 p-1.5 rounded-lg border border-gray-700 w-fit">
          <button onClick={() => setActiveClass("all")} className={`px-4 py-2 text-sm rounded-md transition ${activeClass === "all" ? "bg-blue-600 text-white font-medium" : "text-gray-400 hover:text-white"}`}>Tümü</button>
          <button onClick={() => setActiveClass("a")} className={`px-4 py-2 text-sm rounded-md transition ${activeClass === "a" ? "bg-blue-600 text-white font-medium" : "text-gray-400 hover:text-white"}`}>A Sınıfı</button>
          <button onClick={() => setActiveClass("b")} className={`px-4 py-2 text-sm rounded-md transition ${activeClass === "b" ? "bg-blue-600 text-white font-medium" : "text-gray-400 hover:text-white"}`}>B Sınıfı</button>
          <button onClick={() => setActiveClass("c")} className={`px-4 py-2 text-sm rounded-md transition ${activeClass === "c" ? "bg-blue-600 text-white font-medium" : "text-gray-400 hover:text-white"}`}>C Sınıfı</button>
        </div>

        {/* Bilgi Kartları */}
        <div className="grid grid-cols-1 gap-4">
          {filteredClasses.map((c, idx) => (
            <div key={idx} className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                <h2 className="text-xl font-bold text-blue-400">{c.name}</h2>
                <span className="text-xs bg-gray-950 px-3 py-1 rounded text-green-400 font-mono border border-green-950">Varsayılan: {c.mask}</span>
              </div>

              <p className="text-gray-300 text-sm leading-relaxed">{c.usage}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-sm font-mono">
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-750">
                  <span className="text-xs text-gray-500 block mb-1 uppercase tracking-wider">Genel (Public) IP Aralığı</span>
                  <span className="text-gray-200 font-bold">{c.range}</span>
                </div>
                <div className="bg-gray-950 p-4 rounded-lg border border-gray-850">
                  <span className="text-xs text-blue-400 block mb-1 uppercase tracking-wider">Yerel (Private - LAN) IP Aralığı</span>
                  <span className="text-blue-300 font-bold">{c.private}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Özel Hatırlatma Notu */}
        <div className="bg-blue-950/20 border border-blue-900/50 p-4 rounded-lg text-sm text-blue-300 leading-relaxed">
          💡 <strong>Ağ Mühendisi Notu:</strong> <code>127.0.0.0/8</code> bloğu Loopback (yerel cihaz testi) için, <code>169.254.0.0/16</code> bloğu ise DHCP sunucusundan IP alamayan cihazların otomatik atadığı APIPA (Automatic Private IP Addressing - Otomatik Özel IP Adresleme) adresi için rezerve edilmiştir. Ağ tasarlarken yerel arayüzlerinize bu blokları tanımlamaktan kaçının.
        </div>
      </div>
    </div>
  );
}