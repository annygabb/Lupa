import type {Metadata} from "next";
import {ImpactExperience} from "@/components/experience/impact";
import "../experiencias.css";
export const metadata:Metadata={title:"Laboratório de Impacto — compare hipóteses",description:"Compare duas versões do motor de cenários do LUPA até 2041, com premissas visíveis."};
export default function Page(){return <ImpactExperience/>;}
