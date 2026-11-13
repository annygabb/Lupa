import type { Metadata } from "next";
import { MedicineReflection } from "@/components/experience/medicine-reflection";
import "../experiencias.css";
export const metadata: Metadata = {
  title: "Reflexão opcional sobre medicamentos | LUPA Saúde",
  description: "Questionário educativo e voluntário, local e não persistido, sobre percepções de uso de medicamentos para emagrecimento.",
};
export default function Page(){return <MedicineReflection/>;}
