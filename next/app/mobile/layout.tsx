"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Grid3X3, ShoppingCart, User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/mobile", icon: Home, label: "Accueil" },
  { href: "/mobile/categories", icon: Grid3X3, label: "Categories" },
  { href: "/mobile/panier", icon: ShoppingCart, label: "Panier" },
  { href: "/mobile/compte", icon: User, label: "Compte" },
];

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-16">
      {children}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E5EA] z-50">
        <div className="flex items-center justify-around py-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/mobile" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
                  isActive ? "text-[#FF6B00]" : "text-gray-400"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}