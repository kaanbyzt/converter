import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MikroTik Web Araçları",
  description: "MikroTik RouterOS için web tabanlı yönetim ve otomasyon araçları",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <div className="flex"><Sidebar /><main className="flex-1 overflow-y-auto">{children}</main></div>
      </body>
    </html>
  );
}