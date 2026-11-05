import type { Metadata } from "next";
import { ModulePreview } from "@/components/module-preview";
export const metadata: Metadata={title:"Projeções"};
export default function Projecoes(){return <ModulePreview eyebrow="Brasil 2027–2036" title="Projetar cenários" description="Explorar hipóteses de adoção e continuidade de tratamento, sem apresentar cenários como previsões clínicas individuais." objectives={["Entradas editáveis com faixas e fontes.","Motor matemático determinístico e resultados reproduzíveis.","Exportação com premissas e advertências metodológicas."]}/>;}
