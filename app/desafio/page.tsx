import type { Metadata } from "next";
import {ChallengeExperience} from "@/components/experience/challenge";
import "../experiencias.css";
export const metadata:Metadata={title:"Desafio LUPA — pratique a interpretação de evidências",description:"Perguntas educativas com fontes e explicações. Sem diagnóstico ou coleta de dados pessoais."};
export default function Page(){return <ChallengeExperience/>;}
