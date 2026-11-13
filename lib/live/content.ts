import { getClaim } from "@/features/interpretation/claims";

/**
 * Respostas pré-curadas de alto rigor metodológico.
 * Nunca geradas dinamicamente por LLM durante a sessão ao vivo.
 */
const questions = {
  "massa-magra-nao-equivale-a-musculos": [
    "Sim, é exatamente a mesma coisa.",
    "Não. Massa magra não é sinônimo de músculo funcional.",
    "Sim, isso sempre comprova sarcopenia.",
  ],
  "uti-mortalidade-nao-e-efeito-do-medicamento": [
    "Sim, os estudos provam causa e efeito.",
    "Não. Os estudos mediram populações e resultados diferentes.",
    "Sim, o odds ratio é a chance absoluta de uma pessoa morrer.",
  ],
  "cenario-2036-nao-e-previsao-sus": [
    "Sim, é uma previsão oficial.",
    "Não. É uma simulação fictícia com premissas editáveis.",
    "Sim, reflete cobertura universal de medicamentos pelo SUS.",
  ],
} as const;

export type LiveClaimId = keyof typeof questions;

export interface LiveQuestionDetail {
  claimId: string;
  title: string;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation?: string;
  evidenceId?: string;
  evidenceUrl?: string;
  limitation?: string;
  postQuestion?: {
    question: string;
    choices: string[];
    correctIndex: number;
    explanation: string;
  };
}

/**
 * Banco completo de 9 Objetivos de Aprendizagem (OBJ-01 a OBJ-09)
 * com formulações equivalentes para pré e pós-teste sem memorização de gabarito.
 */
export const SCIENTIFIC_OBJECTIVES: Record<string, LiveQuestionDetail> = {
  "massa-magra-nao-equivale-a-musculos": {
    claimId: "massa-magra-nao-equivale-a-musculos",
    title: "OBJ-01 · Composição corporal e massa magra vs músculo",
    question:
      "Um estudo relata que ~25% do peso perdido correspondeu à massa magra. Qual é a interpretação cientificamente correta?",
    choices: [
      "Perderam 25% de todos os músculos do corpo.",
      "Não. Massa magra não é sinônimo de músculo funcional (reflete a partição do peso perdido).",
      "Sim, isso sempre comprova sarcopenia generalizada.",
    ],
    correctIndex: 1,
    evidenceId: "E04",
    evidenceUrl: "https://pubmed.ncbi.nlm.nih.gov/39996356/",
    explanation:
      "No subestudo SURMOUNT-1 (DXA), aproximadamente 75% da perda foi de massa gorda e 25% de massa magra. A densitometria avalia tecidos moles não ósseos; ela não mede força, mobilidade nem função neuromuscular.",
    limitation:
      "DXA é estimativa de compartimentos teciduais em coorte específica. Não individualizar como previsão de sarcopenia.",
    postQuestion: {
      question:
        "Uma pessoa perde 8 kg hipotéticos e uma partição ilustrativa de 25% da perda é classificada como massa magra. Quanto se classifica como massa magra nessa ilustração?",
      choices: [
        "8 kg inteiros perdidos em tecido muscular.",
        "2,0 kg do peso perdido classificados como massa magra (não reflete perda de 25% de seus músculos).",
        "25% de toda a massa muscular esquelética do indivíduo.",
      ],
      correctIndex: 1,
      explanation:
        "A fração de 25% aplica-se sobre os 8 kg perdidos (0,25 × 8 = 2 kg), e não sobre o estoque basal de músculos da pessoa.",
    },
  },

  "uti-mortalidade-nao-e-efeito-do-medicamento": {
    claimId: "uti-mortalidade-nao-e-efeito-do-medicamento",
    title: "OBJ-02 · Associação vs Causalidade em Terapia Intensiva",
    question:
      "Estudos associam baixa massa muscular na admissão de UTI a maior mortalidade. Isso prova que canetas de emagrecimento causam mortes em UTI?",
    choices: [
      "Sim, comprova relação causal direta entre o fármaco e óbito em UTI.",
      "Não. Os estudos mediram populações e desfechos totalmente diferentes sem ponte causal.",
      "Sim, o odds ratio publicado representa o risco absoluto de qualquer paciente.",
    ],
    correctIndex: 1,
    evidenceId: "E12",
    evidenceUrl: "https://pubmed.ncbi.nlm.nih.gov/40462133/",
    explanation:
      "A revisão E12 investigou 35 estudos em pacientes graves já internados em UTI. Não avaliou pacientes em uso de GLP-1 ambulatorial. Multiplicar dados de SURMOUNT por OR de UTI é erro metodológico grave.",
    limitation:
      "Populações heterogêneas de UTI (sepse, trauma, pós-operatório). Não há estudo clínico estabelecendo ponte causal.",
    postQuestion: {
      question:
        "É metodologicamente válido multiplicar um percentual do SURMOUNT-1 por um Odds Ratio de coorte de UTI e divulgar como risco individual de morte?",
      choices: [
        "Sim, qualquer correlação matemática pode ser extrapolada clinicamente.",
        "Não; são populações, tempos e desfechos clínicos incompatíveis e sem elo causal.",
        "Sim, desde que a altura e peso do paciente sejam informados.",
      ],
      correctIndex: 1,
      explanation:
        "Extrapolar OR de pacientes críticos agudos para indivíduos saudáveis em perda de peso ambulatorial viola a bioestatística.",
    },
  },

  "cenario-2036-nao-e-previsao-sus": {
    claimId: "cenario-2036-nao-e-previsao-sus",
    title: "OBJ-07 · Projeções hipotéticas versus incorporação SUS",
    question:
      "A curva do laboratório LUPA para 2036 é uma previsão oficial de incorporação e cobertura pelo SUS?",
    choices: [
      "Sim, representa o plano oficial do Ministério da Saúde para a próxima década.",
      "Não. É uma simulação fictícia com premissas editáveis para explorar sensibilidade.",
      "Sim, reflete fornecimento universal garantido de análogos de GLP-1 pelo SUS.",
    ],
    correctIndex: 1,
    evidenceId: "M05",
    evidenceUrl: "https://lupaa.vercel.app/projecoes",
    explanation:
      "O motor de cenários do LUPA utiliza um modelo dinâmico ilustrativo (lupa-flow-v2) com parâmetros ajustáveis (início, desistência, custo). Não constitui parecer de CONITEC nem orçamento da seguridade social.",
    limitation:
      "Modelos de difusão dependem estritamente de premissas estipuladas pelo usuário e não predizem decisões orçamentárias públicas.",
    postQuestion: {
      question:
        "Se o usuário alterar a taxa hipotética de início de 1% para 2% ao ano no simulador, o que o resultado significa?",
      choices: [
        "Que o Brasil terá obrigatoriamente o dobro de usuários em 2036.",
        "Uma exploração de sensibilidade do modelo sob novas premissas hipotéticas.",
        "Uma garantia contratual de demanda para fornecedores farmacêuticos.",
      ],
      correctIndex: 1,
      explanation:
        "Simulações de cenários servem para análise de sensibilidade e trade-offs, nunca como compromisso ou previsão determinística.",
    },
  },

  "or-rr-vs-risco-absoluto": {
    claimId: "or-rr-vs-risco-absoluto",
    title: "OBJ-03 · Risco Relativo vs Risco Absoluto",
    question:
      "Um estudo relata Odds Ratio (OR) de 2,33 para um determinado desfecho adverso. O que isso significa?",
    choices: [
      "Significa que 233% das pessoas tratadas sofrerão o desfecho obrigatoriamente.",
      "Não. Odds ratio é uma razão de chances relativa, não a probabilidade absoluta de uma pessoa.",
      "Representa que o risco individual de qualquer indivíduo passa a ser superior a 90%.",
    ],
    correctIndex: 1,
    evidenceId: "E12",
    evidenceUrl: "https://pubmed.ncbi.nlm.nih.gov/40462133/",
    explanation:
      "Um OR relativo sem o risco basal da população não permite calcular a probabilidade individual. Se o risco basal for 0,1%, um OR de 2 dobra uma probabilidade minúscula para ~0,2%.",
    postQuestion: {
      question:
        "É cientificamente correto noticiar 'duas vezes mais chance de morte' sem informar qual é a taxa basal observada na população?",
      choices: [
        "Sim, percentuais relativos sempre bastam para decisões médicas.",
        "Não; sem o risco absoluto de base, a informação induz a conclusões alarmistas ou distorcidas.",
        "Sim, desde que a revista tenha alto fator de impacto.",
      ],
      correctIndex: 1,
      explanation:
        "A comunicação responsável de riscos exige explicitar o risco absoluto e a frequência real do evento.",
    },
  },

  "descontinuidade-surmount-4": {
    claimId: "descontinuidade-surmount-4",
    title: "OBJ-04 · Interrupção do tratamento e reganho",
    question:
      "No ensaio clínico SURMOUNT-4, o que aconteceu com os participantes que foram randomizados para placebo após 36 semanas?",
    choices: [
      "Mantiveram 100% do peso perdido sem qualquer intervenção adicional.",
      "Não. O grupo que mudou para placebo recuperou parte substancial do peso após a interrupção.",
      "Tiveram ganho imediato de gordura visceral 3 vezes superior ao peso inicial.",
    ],
    correctIndex: 1,
    evidenceId: "E16",
    evidenceUrl: "https://pubmed.ncbi.nlm.nih.gov/38078870/",
    explanation:
      "A obesidade é condição crônica; no SURMOUNT-4, a suspensão do tratamento levou a reganho progressivo de peso (~14% na fase de retirada), demonstrando a necessidade de acompanhamento contínuo.",
    postQuestion: {
      question:
        "Os resultados de reganho de peso observados no SURMOUNT-4 significam que qualquer pessoa que parar o medicamento recuperará exatamente a mesma quantidade de quilos?",
      choices: [
        "Sim, o valor percentual é universal e matematicamente exato para todo indivíduo.",
        "Não; reflete médias de uma coorte específica com protocolo definido de retirada.",
        "Sim, todas as canetas produzem rigorosamente a mesma taxa de reganho.",
      ],
      correctIndex: 1,
      explanation:
        "Médias de ensaios clínicos com critérios rígidos de inclusão não são réguas determinísticas para casos individuais.",
    },
  },

  "phq9-saude-mental": {
    claimId: "phq9-saude-mental",
    title: "OBJ-05 · Escala PHQ-9 e Segurança Psicológica",
    question:
      "Uma análise pós-hoc de ensaios clínicos utilizando a escala PHQ-9 comprova segurança psicológica universal?",
    choices: [
      "Sim, elimina qualquer risco psiquiátrico em qualquer paciente da vida real.",
      "Não. A validade restringe-se à população selecionada e aos desfechos avaliados pela escala.",
      "Sim, questionários pós-hoc possuem o mesmo nível de evidência que ensaios prospectivos focados.",
    ],
    correctIndex: 1,
    evidenceId: "E21",
    evidenceUrl: "https://pubmed.ncbi.nlm.nih.gov/41537305/",
    explanation:
      "Ensaio com exclusão prévia de indivíduos com depressão grave ativa não pode ser generalizado para toda a população clínica ambulatorial sem ressalvas.",
    postQuestion: {
      question:
        "A variação na pontuação de uma escala de rastreio como o PHQ-9 pode ser rotulada automaticamente como incidência definitiva de transtorno psiquiátrico?",
      choices: [
        "Sim, o instrumento tem poder diagnóstico definitivo.",
        "Não; escalas de autorrelato indicam sintomas no período, exigindo avaliação diagnóstica estruturada.",
        "Sim, qualquer alteração pontual comprova patologia permanente.",
      ],
      correctIndex: 1,
      explanation:
        "Rastreio sintomático não substitui avaliação clínica aprofundada.",
    },
  },
};

export function liveQuestion(id: string): LiveQuestionDetail | null {
  if (Object.prototype.hasOwnProperty.call(SCIENTIFIC_OBJECTIVES, id)) {
    return SCIENTIFIC_OBJECTIVES[id];
  }
  if (!Object.prototype.hasOwnProperty.call(questions, id)) return null;
  const claim = getClaim(id);
  if (!claim) return null;
  return {
    claimId: id,
    title: claim.title,
    question: claim.question,
    choices: [...questions[id as LiveClaimId]],
    correctIndex: 1,
  };
}

export const liveOptions = Object.keys(SCIENTIFIC_OBJECTIVES).map((id) => ({
  id,
  title: SCIENTIFIC_OBJECTIVES[id]?.title ?? getClaim(id)?.title ?? id,
}));
