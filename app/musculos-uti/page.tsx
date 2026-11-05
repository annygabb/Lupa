import type { Metadata } from "next";
import { ModulePreview } from "@/components/module-preview";
export const metadata: Metadata={title:"Músculos e UTI"};
export default function MusculosUti(){return <ModulePreview eyebrow="Composição e funcionalidade" title="Músculos e recuperação crítica" description="Investigar a composição corporal no emagrecimento e as pesquisas sobre reserva muscular e prognóstico em cuidados intensivos — sem afirmar causalidade não comprovada." objectives={["Separar massa magra, massa muscular, força e funcionalidade.","Organizar evidências de UTI por população e desfecho.","Mostrar a lacuna entre estudos de tratamentos e recuperação crítica."]}/>;}
