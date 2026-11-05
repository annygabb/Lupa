import type { Metadata } from "next";
import { ModulePreview } from "@/components/module-preview";
export const metadata: Metadata={title:"Metodologia"};
export default function Metodologia(){return <ModulePreview eyebrow="Transparência científica" title="Como o LUPA chega às conclusões" description="Uma trilha auditável entre fonte, população, medida observada, hipótese utilizada e resultado de cenário." objectives={["Diferenciar dado observado, associação e cenário hipotético.","Recusar cálculos sem denominador ou compatibilidade populacional.","Versionar fontes, parâmetros e regras de interpretação."]}/>;}
