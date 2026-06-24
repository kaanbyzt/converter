"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calculator,
  BookUser,
  Share2,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Araçlar Paneli", icon: LayoutDashboard },
  { href: "/subnet", label: "Subnet Hesaplayıcı", icon: Calculator },
  { href: "/port-forward", label: "Port Yönlendirme", icon: Share2 },
  { href: "/kilavuz", label: "Kullanım Kılavuzu", icon: BookUser },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-700 p-4 flex flex-col h-screen sticky top-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          MikroTik<span className="text-blue-500">Tools</span>
        </h1>
        <p className="text-sm text-gray-400">Web Tabanlı Araç Seti</p>
      </div>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              pathname === item.href
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-gray-700 hover:text-white"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}