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
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${display.variable} ${sans.variable} font-sans antialiased text-ink`}
      >
        {/* Light is default. Dark only when the user explicitly chose it. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem('foodtoura.theme')==='dark')document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');}catch(e){}})();`,
          }}
        />
        <div className="relative min-h-dvh overflow-x-hidden bg-cream">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 dark:hidden"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 8% -8%, rgba(201,133,107,0.14), transparent 55%), radial-gradient(ellipse 55% 40% at 92% 0%, rgba(135,155,124,0.16), transparent 50%), #FAF7F0",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 hidden dark:block"
            style={{
              background:
                "radial-gradient(ellipse 70% 40% at 20% 0%, rgba(135,155,124,0.14), transparent 50%), #1C2420",
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
