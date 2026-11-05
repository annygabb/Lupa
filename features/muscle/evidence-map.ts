import { z } from "zod";

/** Camadas de interpretação: a validação é deliberadamente não transitiva. */
export const researchClaimSchema=z.strictObject({
  id:z.string().regex(/^C\d{2}$/),
  headline:z.string().min(8),
  category:z.enum(["composicao","funcionalidade","uti","lacuna"]),
  strength:z.enum(["observed","consensus","association","unsupported"]),
  readableLabel:z.string().min(5),
  summary:z.string().min(20),
  measured:z.string().min(10),
  notInferred:z.string().min(15),
  evidenceIds:z.array(z.enum(["E04","E10","E12"])).min(1),
  url:z.string().url(),
});
export type ResearchClaim=z.infer<typeof researchClaimSchema>;

export const muscleClaims: readonly ResearchClaim[]=Object.freeze(z.array(researchClaimSchema).length(4).parse([
  {
    id:"C01",headline:"Composição corporal durante tratamento",
    category:"composicao",strength:"observed",readableLabel:"Resultado observado em subestudo",
    summary:"No subestudo DXA do SURMOUNT-1 (n=160), houve mudanças relativas de peso, massa gorda e massa magra ao longo de 72 semanas.",
    measured:"DXA de massa gorda e massa magra, com dois grupos analisados.",
    notInferred:"Massa magra não mede diretamente força, função muscular, sarcopenia ou evolução em UTI.",
    evidenceIds:["E04"],url:"https://pubmed.ncbi.nlm.nih.gov/39996356/",
  },
  {
    id:"C02",headline:"Como se confirma sarcopenia",
    category:"funcionalidade",strength:"consensus",readableLabel:"Critério clínico de consenso",
    summary:"O consenso EWGSOP2 dá prioridade à baixa força muscular, utiliza quantidade/qualidade para confirmação e desempenho físico para avaliar gravidade.",
    measured:"Força, quantidade/qualidade muscular e desempenho físico são dimensões diferentes.",
    notInferred:"Não é apropriado diagnosticar sarcopenia com um único percentual de massa magra de DXA.",
    evidenceIds:["E10"],url:"https://pubmed.ncbi.nlm.nih.gov/30312372/",
  },
  {
    id:"C03",headline:"Baixa musculatura e prognóstico em UTI",
    category:"uti",strength:"association",readableLabel:"Associação observacional",
    summary:"Metanálise de 35 estudos (9.366 pacientes críticos) associou baixa massa muscular medida por TC na admissão à mortalidade de curto e longo prazo.",
    measured:"Associação entre massa muscular por TC e mortalidade em populações heterogêneas de UTI.",
    notInferred:"Odds ratio não é probabilidade absoluta e esta metanálise não examinou uso prévio de tirzepatida.",
    evidenceIds:["E12"],url:"https://pubmed.ncbi.nlm.nih.gov/40462133/",
  },
  {
    id:"C04",headline:"A ponte causal ainda não foi demonstrada",
    category:"lacuna",strength:"unsupported",readableLabel:"Hipótese, não estimativa validada",
    summary:"Os estudos sobre composição corporal em tratamento e os estudos sobre prognóstico em UTI não testam uma mesma população com a cadeia causal completa.",
    measured:"Comparação de questões de pesquisa, métodos e populações de documentos distintos.",
    notInferred:"Não se pode multiplicar 25% de massa magra na perda de peso por OR de UTI para produzir mortalidade, risco individual ou projeção.",
    evidenceIds:["E04","E12"],url:"https://pubmed.ncbi.nlm.nih.gov/40462133/",
  },
]));
if(new Set(muscleClaims.map(c=>c.id)).size!==muscleClaims.length)
  throw new Error("Claims duplicadas");

export const researchQuestions=[
  {key:"massa",title:"O medicamento reduz massa magra?",claimId:"C01"},
  {key:"forca",title:"Massa magra é igual a músculo funcional?",claimId:"C02"},
  {key:"uti",title:"Baixa musculatura se associa a desfechos em UTI?",claimId:"C03"},
  {key:"causa",title:"Posso estimar mortalidade em UTI atribuída à tirzepatida?",claimId:"C04"},
] as const;

export function getResearchClaim(id:string):ResearchClaim|undefined{
  return muscleClaims.find(c=>c.id===id);
}

/** Evita tratar duas observações separadas como prova de uma terceira relação causal. */
export function evaluateMuscleIcuCausalChain():{
  supported:boolean;message:string;missing:readonly string[];
}{
  return {
    supported:false,
    message:"A ligação causal entre mudança de composição por tirzepatida e desfechos em UTI não foi estabelecida nas publicações catalogadas.",
    missing:[
      "Medida longitudinal de força e função muscular após o tratamento",
      "População e fatores de confusão comparáveis aos estudos de pacientes críticos",
      "Seguimento que ligue exposição medicamentosa e desfechos de UTI",
      "Método apropriado de inferência causal e risco absoluto de base",
    ],
  };
}
