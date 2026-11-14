import type { Metadata } from "next";
import { InstitutionalRecovery } from "@/components/live/institutional-recovery";
import "../experiencias.css";
export const metadata:Metadata={title:"Recuperar acesso institucional | LUPA Saúde",robots:{index:false,follow:false}};
export default function Page(){return <InstitutionalRecovery/>;}
