"use client";

import { useState } from "react";

export default function HotspotManager() {
  const [profileName, setProfileName] = useState("Vip_Misafir");
  const [rateLimit, setRateLimit] = useState("10M/2M"); // download/upload
  const [sessionTimeout, setSessionTimeout] = useState("02:00:00"); // 2 saat
  const [username, setUsername] = useState("misafir01");
  const [password, setPassword] = useState("mikrotik2026");

  const generateScript = () => {
    let script = `# 1. Hotspot Kullanıcı Profili Oluştur (Hız ve Süre Limitli)\n`;
    script += `/ip hotspot user profile\n`;
    script += `add name="${profileName}" rate-limit="${rateLimit}" session-timeout=${sessionTimeout} shared-users=1 comment="Web uzerinden olusturuldu"\n\n`;

    script += `# 2. Bu Profile Bağlı Kullanıcı Hesabı Tanımla\n`;
    script += `/ip hotspot user\n`;
    script += `add name="${username}" password="${password}" profile="${profileName}" comment="Aktif kullanici"\n`;

    return script;
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-blue-500 mb-2">Hotspot Kullanıcı ve Profil Yönetimi</h1>
        <p className="text-gray-400">Misafir ağlarınız için hız sınırları ve oturum süreleri belirlenmiş kullanıcı hesapları ile profiller oluşturun.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Taraf: Ayarlar */}
        <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg border border-gray-700 h-fit space-y-4">
          
          <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider border-b border-gray-700 pb-2">Profil Ayarları</h2>
          
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Profil Adı</label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Hız Limiti (Rx/Tx)</label>
            <input
              type="text"
              value={rateLimit}
              onChange={(e) => setRateLimit(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              placeholder="Örn: 10M/2M"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Oturum Süresi (Süre Sonu Çıkış)</label>
            <input
              type="text"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              placeholder="saat:dakika:saniye"
            />
          </div>

          <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider border-b border-gray-700 pb-2 pt-2">Kullanıcı Tanımlama</h2>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Kullanıcı Adı</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Şifre</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

        </div>

        {/* Sağ Taraf: Üretilen Script */}
        <div className="lg:col-span-2 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden flex flex-col">
          <div className="bg-gray-900 p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
              Hotspot Komut Scripti
            </h2>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(generateScript());
                alert("Hotspot komutları kopyalandı!");
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