import type { Metadata } from "next";
import { MetodologiaPage } from "@/components/routes/metodologia/metodologia-page";
import "./metodologia.css";

export const metadata: Metadata = {
  title: "Metodologia e transparência científica",
  description: "Protocolo de curadoria, evidências, limites clínicos, cálculos do simulador, contexto SUS e referências primárias do LUPA Saúde.",
};

export default function MetodologiaRoute() {
  return <MetodologiaPage/>;
}
