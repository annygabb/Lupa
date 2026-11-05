import type { Metadata } from "next";
import { ScenarioDashboard } from "@/components/scenarios/scenario-dashboard";

export const metadata: Metadata = {
  title: "Cenários para 2031 e 2036",
  description: "Simulador de cenários hipotéticos de acesso e continuidade do tratamento, com premissas editáveis, fórmulas reproduzíveis e exportação de resultados.",
};
export default function ProjecoesPage(){return <ScenarioDashboard/>;}
