import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";

/** Títulos com peso e presença (sem serifas finas). */
export const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

/** Metadados de prancha: IDs, N, datas, fontes. */
export const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});
