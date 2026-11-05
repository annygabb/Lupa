import type { Metadata } from "next";
import { ModulePreview } from "@/components/module-preview";
export const metadata: Metadata={title:"Comparar"};
export default function Comparar(){return <ModulePreview eyebrow="Leitura crítica" title="Comparar estudos" description="Comparações que deixam visível quando duas populações, períodos ou medidas não são equivalentes." objectives={["Selecionar estudos ou braços revisados.","Apresentar denominador, unidade e tempo de seguimento.","Sinalizar comparações metodologicamente incompatíveis."]}/>;}
