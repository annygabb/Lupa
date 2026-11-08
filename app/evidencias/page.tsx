import type { Metadata } from "next";
import { EvidenceExplorer } from "@/components/evidence/evidence-explorer";
import { PagePlate } from "@/components/atlas/page-plate";

export const metadata: Metadata = {
  title: "Explorador Científico",
  description: "Busque artigos, estudos e fontes oficiais sobre medicamentos para emagrecimento, saúde muscular e recuperação crítica, com limites de evidência explícitos.",
};

export default function EvidenciasPage() {
  return <><PagePlate href="/evidencias"/><div className="lupa-studio"><EvidenceExplorer/></div></>;
}
