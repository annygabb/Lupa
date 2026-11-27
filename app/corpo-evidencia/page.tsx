import type { Metadata } from "next";
import { BodyEvidenceExperience } from "@/components/experience/body-evidence";
import "../experiencias.css";
export const metadata:Metadata={title:"Corpo & Evidência — composição do peso",description:"Experimente uma ilustração da composição da perda de peso e entenda os limites das evidências sobre UTI."};
export default function Page(){return <BodyEvidenceExperience/>;}
