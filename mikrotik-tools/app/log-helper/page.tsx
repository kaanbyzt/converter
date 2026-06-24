"use client";

import { useState } from "react";

export default function LogHelper() {
  const [alertType, setAlertType] = useState("error");
  const [actionType, setActionType] = useState("email");
  const [adminContact, setAdminContact] = useState("admin@firma.com");

  const generateScript = () => {
    let script = `# 1. Log İzleme İçin Komut Dosyası (Script) Oluştur\n`;
    script += `/system script\n`;
    script += `add name="Log_Uyarici" source={\n`;
    script += `  :local logMessage "";\n`;
    script += `  :foreach i in=[/log find topics~"${alertType}"] do={\n`;
    script += `    :set logMessage [/log get $i message];\n`;
    script += `  }\n`;
    script += `  :if ($logMessage != "") do={\n`;

    if (actionType === "email") {
      script += `    /tool e-mail send to="${adminContact}" subject="MikroTik Log Uyarisi: ${alertType.toUpperCase()}" body=$logMessage;\n`;
    } else {
      script += `    /tool fetch url="https://api.telegram.org/botBOT_TOKEN_BURAYA/sendMessage?chat_id=${adminContact}&text=MikroTik+Kritik+Hata:+\$logMessage" keep-result=no;\n`;
    }

    script += `  }\n`;
    script += `}\n\n`;

    script += `# 2. Bu Betiği Her 5 Dakikada Bir Çalışacak Şekilde Zamanla (Scheduler)\n`;
    script += `/system scheduler\n`;
    script += `add interval=5m name="Log_Kontrol_Zamanlayici" on-event="Log_Uyarici" start-time=startup\n`;

    return script;
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-blue-500 mb-2">Log ve Uyarı Asistanı</h1>
        <p className="text-gray-400">RouterOS üzerindeki kritik logları (Hata, VPN kopması, Saldırı) takip edin ve otomatik bildirim sistemleri kurun.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Taraf: Ayarlar */}
        <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg border border-gray-700 h-fit space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Takip Edilecek Log Türü</label>
            <select
              value={alertType}
              onChange={(e) => setAlertType(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="error">Error (Sistem Hataları)</option>
              <option value="critical">Critical (Kritik Donanım/Yazılım Sorunları)</option>
              <option value="warning">Warning (Genel Uyarılar)</option>
              <option value="account">Account (Kullanıcı Giriş Denemeleri)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Bildirim Kanalı //Yapım aşamasında</label>
            <select
              value={actionType}
              onChange={(e) => {
                setActionType(e.target.value);
                setAdminContact(e.target.value === "email" ? "admin@firma.com" : "CHAT_ID");
              }}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="email">E-Posta (SMTP)</option>
              <option value="telegram">Telegram Bot API</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {actionType === "email" ? "Yönetici E-Posta Adresi //Yapım aşamasında" : "Telegram Chat ID"}
            </label>
            <input
              type="text"
              value={adminContact}
              onChange={(e) => setAdminContact(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

        </div>

        {/* Sağ Taraf: Üretilen Script */}
        <div className="lg:col-span-2 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden flex flex-col">
          <div className="bg-gray-900 p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
              Otomasyon Scripti ve Zamanlayıcı
            </h2>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(generateScript());
                alert("Log takip scripti kopyalandı!");
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