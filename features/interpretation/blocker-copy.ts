import type { EvidenceBlockCode } from "@/features/evidence/projection-guard";

/**
 * Explicação em linguagem humana de cada bloqueio de `assessProjectionEligibility`.
 * Fonte única: usada pelo Evidence Lens, pela API /api/interpretar e pela Metodologia.
 */
export const blockerCopy: Record<EvidenceBlockCode, { title: string; why: string }> = {
  INVALID_INPUT: { title: "Dados de entrada inválidos", why: "A ficha não tem os campos mínimos para avaliar uma projeção." },
  NOT_APPROVED: { title: "Sem aprovação para projeção", why: "Nenhum registro passou por revisão clínica independente que autorize usar o número em projeções." },
  SOURCE_NOT_SUITABLE: { title: "Tipo de fonte inadequado", why: "Documentos regulatórios, consensos e farmacovigilância não medem incidência numa população definida." },
  MISSING_SOURCE_LOCATOR: { title: "Sem localizador na fonte", why: "Falta indicar a tabela, figura ou trecho do artigo de onde o número saiu." },
  MISSING_FOLLOWUP: { title: "Sem tempo de seguimento", why: "Sem saber por quanto tempo o grupo foi acompanhado, não dá para projetar ao longo dos anos." },
  MISSING_UNIT: { title: "Sem unidade", why: "Um número sem unidade (%, pontos, kg) não pode ser transportado para outro contexto." },
  MISSING_SAMPLE: { title: "Sem tamanho de amostra", why: "Sem o N analisado não é possível avaliar a precisão do resultado." },
  MISSING_DENOMINATOR: { title: "Sem denominador", why: "Uma proporção precisa de numerador e denominador publicados; não inventamos o que falta." },
  INVALID_FRACTION: { title: "Fração impossível", why: "O numerador é maior que o denominador; o registro precisa ser corrigido na fonte." },
  MISSING_PERSON_TIME: { title: "Sem pessoa-tempo", why: "Taxas exigem o tempo total de observação dos participantes." },
  NOT_NUMERIC: { title: "Resultado apenas descritivo", why: "O registro descreve o achado em texto; não há valor numérico para calcular." },
  POPULATION_UNREVIEWED: { title: "População não comparada", why: "Ninguém verificou se a população do estudo se parece com a população da projeção." },
  TIME_UNREVIEWED: { title: "Janela de tempo não comparada", why: "O período do estudo não foi conferido contra o horizonte da projeção." },
  OVERLAP_UNREVIEWED: { title: "Sobreposição não verificada", why: "Estudos da mesma família podem repetir participantes; somá-los inflaria o resultado." },
  ASSOCIATION_NOT_CAUSAL: { title: "Associação, não causa", why: "O estudo mostra que duas coisas aparecem juntas, não que uma provoca a outra." },
  ICU_LINK_UNPROVEN: { title: "Ligação com UTI não demonstrada", why: "Nenhum estudo do acervo ligou diretamente o medicamento ao desfecho em terapia intensiva." },
  OR_WITHOUT_BASELINE_RISK: { title: "OR sem risco basal", why: "Uma razão de chances só vira risco absoluto com o risco basal da população; ele não foi revisado." },
};

export function explainBlockers(codes: readonly EvidenceBlockCode[]) {
  return codes.map(code => ({ code, ...blockerCopy[code] }));
}
