import type { Metadata } from "next";
import { MethodologyPage } from "@/components/methodology/methodology-page";
import { PagePlate } from "@/components/atlas/page-plate";

export const metadata: Metadata = {
  title: "Metodologia e transparência científica",
  description: "Protocolo de curadoria, evidências, limites clínicos, cálculos do simulador, contexto SUS e referências primárias do LUPA Saúde.",
};
export default function MetodologiaRoute(){return <><PagePlate href="/metodologia"/><MethodologyPage/></>;}
