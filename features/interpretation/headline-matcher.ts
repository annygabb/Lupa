import { interpretClaim, type Interpretation } from "./interpret-claim";

/**
 * Classificador determinístico para manchetes e dúvidas em texto livre.
 * Não usa IA generativa: mapeia padrões textuais apenas para o acervo curado do LUPA.
 * Se a frase estiver fora do escopo curado, devolve explicitamente `matched: false`.
 */

interface ClaimRule {
  claimId: string;
  strongTerms: readonly string[];
  supportingTerms: readonly string[];
}

const CLAIM_RULES: readonly ClaimRule[] = [
  {
    claimId: "uti-mortalidade-nao-e-efeito-do-medicamento",
    strongTerms: ["uti", "terapia intensiva", "mortalidade", "cirurgia", "internacao"],
    supportingTerms: ["morrer", "morte", "risco", "hospital", "critico", "ventilacao", "mounjaro", "tirzepatida"],
  },
  {
    claimId: "massa-magra-nao-equivale-a-musculos",
    strongTerms: ["massa magra", "sarcopenia", "dxa", "25% dos musculos", "25% do musculo"],
    supportingTerms: ["musculo", "musculos", "musculatura", "25%", "perda", "forca", "composicao", "mounjaro", "tirzepatida"],
  },
  {
    claimId: "interromper-tratamento-reganho",
    strongTerms: ["reganho", "efeito sanfona", "parar o tratamento", "ao parar", "surmount-4"],
    supportingTerms: ["parar", "interromper", "volta", "voltar", "engordar", "suspender", "placebo", "recupera"],
  },
  {
    claimId: "phq9-nao-prova-seguranca-universal",
    strongTerms: ["phq-9", "phq9", "saude mental", "depressao", "suicidio"],
    supportingTerms: ["mental", "ansiedade", "psiquiatrico", "humor", "tristeza", "seguro", "todo mundo"],
  },
  {
    claimId: "automedicacao-amostra-nao-e-pais",
    strongTerms: ["automedicacao", "sem receita", "23,8%", "23.8%"],
    supportingTerms: ["receita", "prescricao", "brasileiros", "brasil", "farmacia", "online", "ozempic", "semaglutida"],
  },
  {
    claimId: "cenario-2036-nao-e-previsao-sus",
    strongTerms: ["conitec", "2036", "2041", "previsao sus", "gasto publico"],
    supportingTerms: ["sus", "governo", "publico", "custo", "gasto", "previsao", "orcamento", "incorporacao"],
  },
];

const SENSATIONAL_MARKERS: readonly { pattern: string; label: string }[] = [
  { pattern: "causa", label: "Linguagem de causalidade direta ('causa')" },
  { pattern: "prova", label: "Afirmação absoluta ('prova')" },
  { pattern: "derrete", label: "Termo sensacionalista ('derrete')" },
  { pattern: "garante", label: "Promessa categórica ('garante')" },
  { pattern: "definitivo", label: "Promessa categórica ('definitivo')" },
  { pattern: "sempre", label: "Generalização absoluta ('sempre')" },
  { pattern: "todo mundo", label: "Generalização populacional ('todo mundo')" },
  { pattern: "mata", label: "Alarme de mortalidade sem contexto ('mata')" },
  { pattern: "milagre", label: "Termo promocional ('milagre')" },
];

export function normalizeText(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export interface HeadlineMatchResult {
  matched: boolean;
  status: "matched" | "out_of_scope";
  query: string;
  claimId: string | null;
  score: number;
  matchedTerms: string[];
  sensationalSignals: string[];
  interpretation: Interpretation | null;
  outOfScopeReason?: string;
}

export function matchHeadlineToClaim(rawText: string): HeadlineMatchResult {
  const normalized = normalizeText(rawText);
  const sensationalSignals = SENSATIONAL_MARKERS
    .filter((m) => normalized.includes(m.pattern))
    .map((m) => m.label);

  let best: { claimId: string; score: number; terms: string[] } | null = null;

  for (const rule of CLAIM_RULES) {
    let score = 0;
    const terms: string[] = [];

    for (const term of rule.strongTerms) {
      if (normalized.includes(term)) {
        score += 3;
        terms.push(term);
      }
    }
    for (const term of rule.supportingTerms) {
      if (normalized.includes(term)) {
        score += 1;
        terms.push(term);
      }
    }

    if (!best || score > best.score) {
      best = { claimId: rule.claimId, score, terms };
    }
  }

  if (!best || best.score < 2) {
    return {
      matched: false,
      status: "out_of_scope",
      query: rawText.trim(),
      claimId: null,
      score: best?.score ?? 0,
      matchedTerms: best?.terms ?? [],
      sensationalSignals,
      interpretation: null,
      outOfScopeReason:
        "Esta frase não corresponde diretamente a uma evidência curada no acervo atual do LUPA. Como o motor não usa IA generativa para improvisar conclusões, escolha um dos temas verificados ou explore o catálogo.",
    };
  }

  const interpretation = interpretClaim(best.claimId);
  return {
    matched: Boolean(interpretation),
    status: interpretation ? "matched" : "out_of_scope",
    query: rawText.trim(),
    claimId: best.claimId,
    score: best.score,
    matchedTerms: best.terms,
    sensationalSignals,
    interpretation,
  };
}
