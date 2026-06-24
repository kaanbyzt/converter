"use client";

import { useState } from "react";

export default function BandwidthPCQ() {
  const [targetSubnet, setTargetSubnet] = useState("192.168.1.0/24");
  const [downloadSpeed, setDownloadSpeed] = useState("100");
  const [uploadSpeed, setUploadSpeed] = useState("20");
  const [distributionType, setDistributionType] = useState("dynamic"); // dynamic or strict
  const [perUserDownload, setPerUserDownload] = useState("10");
  const [perUserUpload, setPerUserUpload] = useState("2");

  const generateScript = () => {
    let script = `# 1. PCQ Kuyruk Tiplerini (Queue Types) Oluştur\n`;
    script += `/queue type\n`;
    
    if (distributionType === "dynamic") {
      // Dinamik dağıtım: pcq-rate=0 (MikroTik o anki hızı aktif kullanıcılara eşit böler)
      script += `add kind=pcq name=PCQ_Download pcq-classifier=dst-address pcq-rate=0\n`;
      script += `add kind=pcq name=PCQ_Upload pcq-classifier=src-address pcq-rate=0\n\n`;
    } else {
      // Katı Limit: Her kullanıcıya sabit bir üst limit atanır
      script += `add kind=pcq name=PCQ_Download pcq-classifier=dst-address pcq-rate=${perUserDownload}M\n`;
      script += `add kind=pcq name=PCQ_Upload pcq-classifier=src-address pcq-rate=${perUserUpload}M\n\n`;
    }

    script += `# 2. Ana Basit Kuyruğu (Simple Queue) Uygula\n`;
    script += `/queue simple\n`;
    script += `add max-limit=${uploadSpeed}M/${downloadSpeed}M name="Genel_PCQ_Kurali" target=${targetSubnet} queue=PCQ_Upload/PCQ_Download\n`;

    return script;
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-blue-500 mb-2">PCQ Bant Genişliği Yöneticisi</h1>
        <p className="text-gray-400">İnternet hızınızı ağınızdaki kullanıcılar arasında adil ve dinamik bir şekilde dağıtın.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Taraf: Ayarlar */}
        <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg border border-gray-700 h-fit space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Hedef Ağ (Subnet)</label>
            <input
              type="text"
              value={targetSubnet}
              onChange={(e) => setTargetSubnet(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="Örn: 192.168.1.0/24"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-blue-400 mb-1">Toplam Download (Mbps)</label>
              <input
                type="number"
                value={downloadSpeed}
                onChange={(e) => setDownloadSpeed(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-orange-400 mb-1">Toplam Upload (Mbps)</label>
              <input
                type="number"
                value={uploadSpeed}
                onChange={(e) => setUploadSpeed(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-700 mt-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Dağıtım Stratejisi</label>
            <select
              value={distributionType}
              onChange={(e) => setDistributionType(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="dynamic">Dinamik (Adil ve Esnek Paylaşım)</option>
              <option value="strict">Katı Limit (Kullanıcı Başına Sınır)</option>
            </select>
            <p className="text-xs text-gray-400 mt-2">
              {distributionType === "dynamic" 
                ? "Dinamik modda, hat boşsa bir kullanıcı tüm hızı kullanabilir. Başka biri gelirse hız otomatik olarak eşit bölünür." 
                : "Katı modda, ana hat boş olsa bile bir kullanıcı belirlediğiniz sınırın üstüne kesinlikle çıkamaz."}
            </p>
          </div>

          {distributionType === "strict" && (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Max Download (Kişi Başı)</label>
                <input
                  type="number"
                  value={perUserDownload}
                  onChange={(e) => setPerUserDownload(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Max Upload (Kişi Başı)</label>
                <input
                  type="number"
                  value={perUserUpload}
                  onChange={(e) => setPerUserUpload(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sağ Taraf: Üretilen Script */}
        <div className="lg:col-span-2 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden flex flex-col">
          <div className="bg-gray-900 p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
              PCQ Kural Scripti
            </h2>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(generateScript());
                alert("PCQ kodları kopyalandı! Terminale yapıştırabilirsiniz.");
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