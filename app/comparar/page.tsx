import type { Metadata } from "next";
import { StudyComparator } from "@/components/comparison/study-comparator";

export const metadata: Metadata = {
  title: "Comparador Científico",
  description: "Compare estudos de saúde com rastreabilidade, gráficos internos às pesquisas e bloqueio de inferências incompatíveis.",
};

export default function CompararPage() {
  return <StudyComparator />;
}
