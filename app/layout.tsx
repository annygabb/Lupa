import type { Metadata } from "next";
import "./globals.css";
import "./lupa-premium.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: { default: "LUPA Saúde | Evidência que orienta", template: "%s | LUPA Saúde" },
  description: "Pesquisa científica, saúde muscular e cenários populacionais: evidências, limites e hipóteses claramente identificados.",
  robots: { index: false, follow: false },
};

export default function RootLayout({children}:Readonly<{children:React.ReactNode}>) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body className="min-h-screen antialiased">
        <a href="#conteudo"
          className="sr-only fixed left-4 top-4 z-50 rounded-lg bg-white px-4 py-3 font-semibold text-primary focus:not-sr-only">
          Ir para o conteúdo principal
        </a>
        <div className="flex min-h-screen flex-col">
          <SiteHeader/>
          <main id="conteudo" className="flex-1">{children}</main>
          <SiteFooter/>
        </div>
      </body>
    </html>
  );
}
