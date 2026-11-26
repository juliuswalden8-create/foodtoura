import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { BottomNav } from "@/components/BottomNav";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const sans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FoodToura — Your taste. Your journey.",
  description:
    "Your personal food guide for travel — warm recommendations, allergy-aware help, and dinner that feels like home.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className="light" style={{ colorScheme: "light" }}>
      <body
        className={`${display.variable} ${sans.variable} bg-[#FAF7F0] font-sans text-[#303A32] antialiased`}
      >
        {/* Force light theme — clear any stale dark preference from older builds */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{document.documentElement.classList.remove('dark');document.documentElement.classList.add('light');document.documentElement.style.colorScheme='light';localStorage.setItem('foodtoura.theme','light');}catch(e){}})();`,
          }}
        />
        <div className="relative min-h-dvh overflow-x-hidden bg-[#FAF7F0]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 8% -8%, rgba(201,133,107,0.14), transparent 55%), radial-gradient(ellipse 55% 40% at 92% 0%, rgba(135,155,124,0.16), transparent 50%), #FAF7F0",
            }}
          />
          <SiteHeader />
          <main className="pb-nav">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
