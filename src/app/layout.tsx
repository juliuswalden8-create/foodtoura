import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { BottomNav } from "@/components/BottomNav";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FoodToura — Your taste. Your journey.",
  description:
    "Intelligent restaurant discovery for travelers. Personalized matching, allergy-aware guidance, and trip-ready search.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${display.variable} ${sans.variable} font-sans antialiased`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('foodtoura.theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
        <div className="relative min-h-dvh overflow-x-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 dark:hidden"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 10% -10%, rgba(232,121,80,0.12), transparent 55%), radial-gradient(ellipse 60% 40% at 90% 0%, rgba(57,123,96,0.12), transparent 50%), #FAF8F3",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 hidden dark:block"
            style={{
              background:
                "radial-gradient(ellipse 70% 40% at 20% 0%, rgba(57,123,96,0.18), transparent 50%), #121614",
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
