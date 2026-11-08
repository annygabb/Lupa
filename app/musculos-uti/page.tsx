import type { Metadata } from "next";
import { MuscleResearch } from "@/components/muscle/muscle-research";
import { PagePlate } from "@/components/atlas/page-plate";

export const metadata: Metadata = {
  title: "Músculos, Sarcopenia e UTI",
  description: "Investigação contextualizada de composição corporal, força muscular e associações observacionais em UTI, sem inferência causal indevida.",
};
export default function MusculosUtiPage(){return <><PagePlate href="/musculos-uti"/><MuscleResearch/></>;}
