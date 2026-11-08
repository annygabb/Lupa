/**
 * Conteúdo da prancha 05 (Brasil × EUA). Os números observados são os mesmos do site
 * anterior (components/insights/country-outlook.tsx), com fonte e denominador.
 * Nada aqui é previsão nacional: horizontes futuros por país são lacunas.
 */
export type TracePoint = { label: string; value: number; x: number; low?: number; high?: number };
export type TraceSeries = { label: string; points: readonly TracePoint[]; dashed?: boolean };

export type PointReading = {
  value: string; label: string; kind: string; meaning: string;
  population: string; period: string; limitation: string;
  pmid?: string; assumptions?: string;
};

export type Country = "BR" | "US";

export const observed: Record<Country, { series: TraceSeries[]; reading: PointReading; max: number; xLabels: { label: string; x: number }[]; heading: string; kicker: string; caption: string }> = {
  BR: {
    kicker: "Brasil · amostra de usuários",
    heading: "Como os participantes acessaram o tratamento?",
    caption: "Automedicação na amostra (%) · ponto e IC95%",
    series: [{ label: "Usuários entrevistados", points: [{ label: "Coleta 2024–2025", value: 23.8, x: .5, low: 21.1, high: 26.8 }] }],
    max: 40,
    xLabels: [{ label: "Nov/2024–Abr/2025", x: .5 }],
    reading: {
      value: "23,8%", label: "Automedicação entre os participantes", kind: "Dado observado · amostra online",
      meaning: "Percentual que relatou automedicação entre 860 adultos com histórico de uso de liraglutida ou semaglutida para emagrecimento. IC95%: 21,1–26,8%.",
      population: "860 adultos brasileiros recrutados pela internet, usuários atuais ou anteriores; 82% mulheres.",
      period: "Coleta: nov/2024–abr/2025",
      limitation: "Não representa 23,8% de todos os brasileiros. Há uma observação agregada; o traço vertical mostra o intervalo de confiança, não uma trajetória no tempo.",
      pmid: "42618598",
    },
  },
  US: {
    kicker: "Estados Unidos · painel nacional",
    heading: "Como mudou o histórico de uso?",
    caption: "Uso atual ou anterior, qualquer indicação (%)",
    series: [{ label: "Adultos do painel nacional", points: [{ label: "Mar/2024", value: 8.2, x: 0 }, { label: "Out/2025", value: 12, x: 1 }] }],
    max: 20,
    xLabels: [{ label: "Mar/2024", x: 0 }, { label: "Out/2025", x: 1 }],
    reading: {
      value: "12,0%", label: "Uso atual ou anterior de GLP-1/GIP", kind: "Preprint · sem revisão por pares",
      meaning: "Uso atual ou passado, para qualquer indicação. O indicador passou de 8,2% em março de 2024 a 12% em outubro de 2025.",
      population: "Painel nacional de adultos dos EUA ≥18 anos. 9.150 responderam a pelo menos uma onda; esse total não é o denominador de cada ponto.",
      period: "Mar/2024–Out/2025",
      limitation: "Não mede exclusivamente uso ativo para emagrecer. Preprint ainda sem revisão por pares. O segmento conecta duas observações; não mede os meses intermediários.",
      pmid: "42922826",
    },
  },
};

export const topics = [
  { id: "use", label: "Uso de medicamentos" },
  { id: "lean", label: "Massa magra" },
  { id: "mental", label: "Saúde mental" },
  { id: "icu", label: "GLP-1 e UTI" },
] as const;

export const hypothesisSteps = [
  { tag: "Observado no ensaio", title: "Tirzepatida e redução de massa magra", note: "DXA · 72 semanas · PMID 39996356", kind: "measured",
    img: "corpo-composicao", alt: "Cianotipia de uma figura humana translúcida com camadas de tecido" },
  { tag: "Ligação a investigar", title: "Força e reserva funcional antes da UTI", note: "A mediação pelo medicamento não foi demonstrada", kind: "gap",
    img: "musculo", alt: "Cianotipia de fibras musculares" },
  { tag: "Desfecho a testar", title: "Recuperação de pacientes críticos", note: "Sem percentual atribuível a essa sequência", kind: "open",
    img: "uti", alt: "Cianotipia de um leito hospitalar com monitor cardíaco" },
] as const;

export const hypothesisOutcomes = [
  { title: "Possível benefício", body: "O estudo precisaria avaliar se benefícios metabólicos se traduzem em melhor recuperação." },
  { title: "Ausência de efeito", body: "A mudança de composição pode não se traduzir em diferença detectável nos desfechos." },
  { title: "Possível prejuízo", body: "Seria preciso testar se menor reserva funcional contribui para pior recuperação em algum subgrupo." },
] as const;

export const pctBR = (n: number, digits = 1) => n.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits }) + "%";
