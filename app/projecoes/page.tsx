import type { Metadata } from "next";
import { ProjecoesPage } from "@/components/routes/projecoes/projecoes-page";
import "./projecoes.css";

export const metadata: Metadata = {
  title: "Brasil × EUA: evidências e cenários até 2041",
  description: "Compare evidências de uso, saúde mental e massa magra. Horizontes 2026/2031/2036/2041 com lacunas explícitas e laboratório de cenários hipotéticos.",
};

export default function ProjecoesRoute() {
  return <ProjecoesPage/>;
}
