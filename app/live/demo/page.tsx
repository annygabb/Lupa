import type { Metadata } from "next";
import "@/app/experiencias.css";
import { LiveDemoSandbox } from "@/components/live/demo-sandbox";

export const metadata: Metadata = {
  title: "Demo Interativa Telão + Celular · LUPA Live | LUPA Saúde",
  description: "Simulação do ciclo do LUPA Live (pré-teste, revelação e pós-teste) com votos fictícios, sem login e sem banco de dados.",
};

export default function LiveDemoPage() {
  return <LiveDemoSandbox />;
}
