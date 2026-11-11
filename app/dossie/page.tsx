import type {Metadata} from "next";
import {DossierExperience} from "@/components/experience/dossier";
import "../experiencias.css";
export const metadata:Metadata={title:"Dossiê LUPA — síntese verificável",description:"Monte uma síntese educativa rastreável com fontes e limites e exporte Markdown."};
export default function Page(){return <DossierExperience/>;}
