import type { Metadata } from "next";
import { LivePresentation } from "@/components/live/presentation";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Modo Telão · LUPA Live ${code}`,
    description: "Visualização em telão para projeção de evento LUPA Live com QR Code gigante e resultados em tempo real.",
  };
}

export default async function LivePresentationPage({ params }: Props) {
  const { code } = await params;
  return <LivePresentation code={code.toUpperCase()} />;
}
