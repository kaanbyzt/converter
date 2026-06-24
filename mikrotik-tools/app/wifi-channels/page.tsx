"use client";

import { useState } from "react";

export default function WifiChannels() {
  const [band, setBand] = useState("2.4ghz");
  const [channelWidth, setChannelWidth] = useState("20mhz");

  // Wi-Fi Kanalları Veritabanı
  const getChannels = () => {
    if (band === "2.4ghz") {
      if (channelWidth === "20mhz") {
        return [
          { channel: "1", freq: "2412 MHz", status: "Mükemmel", desc: "Tamamen bağımsız, çakışmayan ana kanal." },
          { channel: "6", freq: "2437 MHz", status: "Mükemmel", desc: "Tamamen bağımsız, çakışmayan ana kanal." },
          { channel: "11", freq: "2462 MHz", status: "Mükemmel", desc: "Tamamen bağımsız, çakışmayan ana kanal." },
        ];
      } else {
        return [
          { channel: "1 eC / Ce", freq: "2412 MHz", status: "Riskli", desc: "40 MHz genişlik 2.4 GHz bandında yoğun çevre kirliliğine ve paket kayıplarına neden olabilir." },
          { channel: "6 eC / Ce", freq: "2437 MHz", status: "Riskli", desc: "Çevrede çok fazla Wi-Fi varsa bağlantı kalitesi ciddi oranda düşebilir." },
        ];
      }
    } else {
      // 5 GHz Bandı
      if (channelWidth === "20mhz" || channelWidth === "40mhz") {
        return [
          { channel: "36", freq: "5180 MHz", status: "Mükemmel", desc: "Kapsama alanı dış mekanlar için uygundur, DFS kontrolü gerektirmez." },
          { channel: "40", freq: "5200 MHz", status: "Mükemmel", desc: "İç mekanlar için temiz ve stabil frekans." },
          { channel: "44", freq: "5220 MHz", status: "Mükemmel", desc: "Yüksek hızlar için ideal parazitsiz kanal." },
          { channel: "48", freq: "5240 MHz", status: "Mükemmel", desc: "Uyum sorunu yaşamayan standart UNII-1 kanalı." },
        ];
      } else {
        // 80 MHz (Ultra Hız)
        return [
          { channel: "36-48 (Ceee)", freq: "5180-5240 MHz", status: "Ultra Hız", desc: "AC/AX cihazlarda maksimum hız sunar ancak duvar geçişlerinde sinyal kaybı artar." },
        ];
      }
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-blue-500 mb-2">Wi-Fi Frekans ve Kanal Rehberi</h1>
        <p className="text-gray-400">MikroTik kablosuz arayüzlerinde (Wireless/WiFi-Wave2) çakışmaları önlemek için en temiz frekansları bulun.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sol Taraf: Seçim Alanı */}
        <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg border border-gray-700 h-fit space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Frekans Bandı</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setBand("2.4ghz"); setChannelWidth("20mhz"); }}
                className={`py-2 rounded-lg text-sm font-medium border transition ${band === "2.4ghz" ? "bg-blue-600 border-blue-500 text-white" : "bg-gray-900 border-gray-700 text-gray-400"}`}
              >
                2.4 GHz
              </button>
              <button
                onClick={() => { setBand("5ghz"); setChannelWidth("20mhz"); }}
                className={`py-2 rounded-lg text-sm font-medium border transition ${band === "5ghz" ? "bg-blue-600 border-blue-500 text-white" : "bg-gray-900 border-gray-700 text-gray-400"}`}
              >
                5 GHz
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Kanal Genişliği (Width)</label>
            <select
              value={channelWidth}
              onChange={(e) => setChannelWidth(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="20mhz">20 MHz (Standart / Kararlı)</option>
              <option value="40mhz">40 MHz (Hızlı / Geniş)</option>
              {band === "5ghz" && <option value="80mhz">80 MHz (Ultra Hız / Sadece 5GHz)</option>}
            </select>
          </div>
        </div>

        {/* Sağ Taraf: Önerilen Temiz Kanallar */}
        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
            📡 Önerilen Çakışmayan Kanallar
          </h2>

          <div className="grid grid-cols-1 gap-3">
            {getChannels().map((ch, idx) => (
              <div key={idx} className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-900 w-16 h-16 rounded-lg flex flex-col justify-center items-center border border-gray-700 shrink-0">
                    <span className="text-[10px] text-gray-500 block uppercase">Kanal</span>
                    <span className="text-xl font-bold text-blue-400">{ch.channel}</span>
                  </div>
                  <div>
                    <span className="text-sm font-mono text-gray-400 block">{ch.freq}</span>
                    <p className="text-gray-200 text-sm mt-0.5">{ch.desc}</p>
                  </div>
                </div>
                
                <span className={`text-xs px-2.5 py-1 rounded font-bold uppercase shrink-0 font-mono ${
                  ch.status === "Mükemmel" ? "bg-green-950 text-green-400 border border-green-800" :
                  ch.status === "Ultra Hız" ? "bg-blue-950 text-blue-400 border border-blue-800" :
                  "bg-orange-950 text-orange-400 border border-orange-800"
                }`}>
                  {ch.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}