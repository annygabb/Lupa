import type { Metadata, Viewport } from "next";
import "lenis/dist/lenis.css";
import "./globals.css";
import "./clinical-chart.css";
import "./atlas.css";
import "./atlas-system.css";
import { display, body, mono } from "./fonts";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/atlas/smooth-scroll";

export const metadata: Metadata = {
  metadataBase: new URL("https://lupaa.vercel.app"),
  title: { default: "LUPA Saúde | Canetas para emagrecer: o que muda além do peso?", template: "%s | LUPA Saúde" },
  description: "Um atlas ilustrado das evidências sobre semaglutida e tirzepatida: benefícios, riscos, massa magra, saúde mental, UTI & causalidade e sessões interativas LUPA Live via QR Code.",
  keywords: ["LUPA Saúde", "Semaglutida", "Tirzepatida", "Massa Magra", "Atlas Clínico", "Lupa Live", "Cianotipia"],
  authors: [{ name: "LUPA Saúde Team" }],
  openGraph: {
    title: "LUPA Saúde | Canetas para emagrecer: o que muda além do peso?",
    description: "Atlas ilustrado de evidências científicas sobre semaglutida e tirzepatida. Análise de massa magra, UTI, saúde mental e participação coletiva ao vivo.",
    url: "https://lupaa.vercel.app",
    siteName: "LUPA Saúde",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LUPA Saúde — Atlas Científico & Lupa Live 2026",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LUPA Saúde | Canetas para emagrecer: o que muda além do peso?",
    description: "Atlas ilustrado de evidências sobre semaglutida e tirzepatida: benefícios, riscos, massa magra e sessões LUPA Live via QR Code.",
    images: ["/og-image.png"],
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#0e2a4a" };

export default function RootLayout({children}:Readonly<{children:React.ReactNode}>) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="min-h-screen antialiased">
        <a href="#conteudo" className="at-skip">Ir para o conteúdo principal</a>
        <SmoothScroll/>
        <div className="at-grain" aria-hidden="true"/>
        <div className="flex min-h-screen flex-col">
          <SiteHeader/>
          <main id="conteudo" className="lupa-main flex-1">{children}</main>
          <SiteFooter/>
        </div>
      </body>
    </html>
  );
}
