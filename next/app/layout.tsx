import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "jambarrstore",
  description: "Votre marketplace de confiance",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-[#FAF7F2] text-[#1A1A1A] min-h-screen">{children}</body>
    </html>
  );
}
