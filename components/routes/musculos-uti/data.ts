/**
 * Conteúdo editorial da prancha 03 (Músculos e UTI). Os números vêm de
 * features/insights/evidence.ts, features/comparison/reviewed-metrics.ts e do
 * catálogo (E12). Nada aqui é previsão, risco individual ou estimativa combinada.
 */
import { clinicalPlots, type ClinicalPlot } from "@/features/insights/evidence";

const img = (name: string) => `/assets/images/cianotipia/${name}.webp`;

export function plot(id: string): ClinicalPlot {
  const p = clinicalPlots.find(item => item.id === id);
  if (!p) throw new Error("Gráfico clínico não encontrado: " + id);
  return p;
}

/** Formata com sinal tipográfico de menos e vírgula decimal. */
export function pct(value: number, decimals = 1) {
  const abs = Math.abs(value).toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (value < 0 ? "−" : "") + abs + "%";
}

export const axes = [
  { n: "01", label: "Composição por DXA", text: "Quanto do peso perdido foi gordura e quanto foi massa magra." },
  { n: "02", label: "Força e função muscular", text: "O que o músculo consegue fazer, medido por outros testes." },
  { n: "03", label: "Prognóstico em UTI", text: "O que acontece com pacientes críticos, em outra população." },
] as const;

export const summaryStats = [
  { value: 160, label: "Participantes no subestudo DXA", detail: "SURMOUNT-1 · 72 semanas" },
  { value: 35, label: "Estudos na metanálise de UTI", detail: "9.366 pacientes críticos" },
  { value: 0, label: "Efeitos causais medicamento → UTI estabelecidos", detail: "A lacuna permanece aberta" },
] as const;

/** Ilustração que acompanha cada pergunta da investigação guiada. */
export const inquiryFigures = {
  massa: { src: img("corpo-composicao"), ratio: "3 / 4", caption: "Fig. 03.1 — DXA separa gordura e massa magra" },
  forca: { src: img("musculo"), ratio: "4 / 3", caption: "Fig. 03.2 — Força e função são outra medida" },
  uti: { src: img("uti"), ratio: "16 / 11", caption: "Fig. 03.3 — Pacientes críticos, outra população" },
  causa: { src: img("balanca-1"), ratio: "1 / 1", caption: "Fig. 03.4 — Duas evidências não fazem uma ponte" },
} as const;

export const chainNodes = [
  {
    n: "A", tag: "Exposição", title: "Tratamento", img: img("canetas-1"),
    body: "Tirzepatida por 72 semanas no SURMOUNT-1, em adultos com obesidade ou sobrepeso.", ref: null,
  },
  {
    n: "B", tag: "E04", title: "Composição corporal", img: img("corpo-composicao"),
    body: "Composição corporal observada no subestudo DXA: massa magra −10,9% no grupo tratado.",
    ref: { href: "/evidencias/E04", label: "Ficha E04 · SURMOUNT-1" },
  },
  {
    n: "C", tag: "Lacuna", title: "Força, função e causalidade", img: img("musculo"),
    body: "Medições e seguimento necessários para ligar os desfechos. Massa magra não é sinônimo de força nem de sarcopenia.",
    ref: { href: "/evidencias/E10", label: "Ficha E10 · sarcopenia" },
  },
  {
    n: "D", tag: "E12", title: "UTI e mortalidade", img: img("uti"),
    body: "Associação de massa muscular por TC em pacientes críticos. Outra população: o medicamento não foi estudado.",
    ref: { href: "/evidencias/E12", label: "Ficha E12 · metanálise UTI" },
  },
] as const;

export const chainLinks = [
  { kind: "solid", label: "medido no mesmo estudo" },
  { kind: "broken", label: "ligação ainda não demonstrada" },
  { kind: "broken", label: "populações diferentes · sem nexo causal" },
] as const;

/** Metanálise E12 (PMID 40462133), conforme catalog.seed.json. */
export const icuMeta = {
  pmid: "40462133",
  studies: 35,
  patients: 9366,
  shortTerm: { or: "2,33", ci: "1,90–2,87" },
  longTerm: { or: "2,67", ci: "1,45–4,92" },
} as const;
