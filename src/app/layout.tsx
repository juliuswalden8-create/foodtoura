import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
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
    "Intelligent restaurant discovery for travelers. Discover restaurants that fit you, anywhere in the world.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${display.variable} ${sans.variable} font-sans antialiased`}
      >
        <div className="relative min-h-dvh overflow-x-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 10% -10%, rgba(232,121,80,0.12), transparent 55%), radial-gradient(ellipse 60% 40% at 90% 0%, rgba(23,63,53,0.08), transparent 50%), #FAF8F3",
            }}
          />
          <SiteHeader />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
