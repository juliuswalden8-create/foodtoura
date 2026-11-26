import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
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
  title: {
    default: "FoodToura — Good food makes anywhere feel like home",
    template: "%s · FoodToura",
  },
  description:
    "Discover restaurants that fit your taste, people and place — warm recommendations with honest allergy caveats for travelers.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "FoodToura",
    description: "Good food makes anywhere feel like home.",
    images: [{ url: "/og.svg", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FoodToura",
    description: "Good food makes anywhere feel like home.",
    images: ["/og.svg"],
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#FAF7F0",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className="light"
      style={{ colorScheme: "light" }}
    >
      <body
        className={`${display.variable} ${sans.variable} bg-[#FAF7F0] font-sans text-[#303A32] antialiased`}
      >
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
                "radial-gradient(ellipse 80% 50% at 8% -8%, rgba(201,133,107,0.12), transparent 55%), radial-gradient(ellipse 55% 40% at 92% 0%, rgba(167,182,154,0.18), transparent 50%), #FAF7F0",
            }}
          />
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[#344E41] focus:px-4 focus:py-2 focus:text-white"
          >
            Skip to content
          </a>
          <SiteHeader />
          <main id="main" className="pb-nav lg:pb-0">
            {children}
          </main>
          <SiteFooter />
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
