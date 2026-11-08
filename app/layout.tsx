import type { Metadata, Viewport } from "next";
import "lenis/dist/lenis.css";
import "./globals.css";
import "./lupa-premium.css";
import "./editorial.css";
import "./atlas.css";
import { display, body, mono } from "./fonts";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/atlas/smooth-scroll";

export const metadata: Metadata = {
  title: { default: "LUPA Saúde | Canetas para emagrecer: o que muda além do peso?", template: "%s | LUPA Saúde" },
  description: "Um atlas ilustrado das evidências sobre semaglutida e tirzepatida: benefícios, riscos, massa magra, saúde mental e o que os estudos ainda não mostram.",
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
