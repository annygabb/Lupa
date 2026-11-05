import { z } from "zod";
import { normalizeSearchText } from "./normalization";
import {
  unifiedEvidenceCatalog, evidenceTopics,
  type DrugFilter, type EditorialPriority,
  type EvidenceDesign, type EvidenceTopic, type UnifiedEvidenceRecord,
} from "./unified-catalog";

const drugEnum=z.enum(["tirzepatide","semaglutide","liraglutide","glp1_class","not_applicable"]);
const designEnum=z.enum([
  "clinical_trial","post_hoc","meta_analysis","systematic_review","observational",
  "narrative_review","pooled_analysis","pharmacovigilance","regulatory","consensus","other",
]);
const priorityEnum=z.enum(["P0","P1","P2"]);
export const evidenceSearchSchema=z.strictObject({
  query:z.string().max(160).optional().default(""),
  topics:z.array(z.enum(evidenceTopics)).max(evidenceTopics.length).optional().default([]),
  drugs:z.array(drugEnum).max(5).optional().default([]),
  designs:z.array(designEnum).max(11).optional().default([]),
  priorities:z.array(priorityEnum).max(3).optional().default([]),
  sourceKinds:z.array(z.enum(["publication","regulatory"])).max(2).optional().default([]),
  fromYear:z.number().int().min(1900).max(2100).optional(),
  toYear:z.number().int().min(1900).max(2100).optional(),
  sort:z.enum(["priority","newest","oldest","title"]).optional().default("priority"),
  limit:z.number().int().min(1).max(100).optional().default(50),
  offset:z.number().int().nonnegative().max(10000).optional().default(0),
}).superRefine((v,ctx)=>{
  if(v.fromYear!==undefined&&v.toYear!==undefined&&v.fromYear>v.toYear)
    ctx.addIssue({code:"custom",path:["fromYear"],message:"Ano inicial maior que ano final"});
});
export type EvidenceSearchOptions = z.input<typeof evidenceSearchSchema>;
export interface EvidenceSearchResult {
  total: number;
  items: readonly UnifiedEvidenceRecord[];
  page: {offset:number;limit:number;hasMore:boolean};
}
const termAliases: Record<string,string> = {
  mounjaro:"tirzepatide", zepbound:"tirzepatide", ozempic:"semaglutide",
  wegovy:"semaglutide", saxenda:"liraglutide",
};
const topicLabels: Record<EvidenceTopic,string> = {
  mental:"saude mental ansiedade depressao emocional psicologico psiquiatrico",
  quality_of_life:"qualidade de vida bem estar",
  muscle:"musculo musculatura composicao corporal massa magra forca",
  sarcopenia:"sarcopenia sarcopenico",
  icu:"uti terapia intensiva pacientes criticos",
  safety:"seguranca efeitos adversos",
  gastrointestinal:"gastrointestinal digestivo estomago",
  pancreas:"pancreas pancreatite",
  biliary:"vesicula biliar",
  kidney:"rim renal",
  liver:"figado hepatica mash",
  eyes:"olhos visao nervo optico naion",
  brazil:"brasil brasileiro brasilia",
  regulation:"anvisa fda conitec sus regulacao",
  appetite:"apetite saciedade comer alimentar",
  weight:"peso emagrecimento obesidade",
  treatment:"tratamento interrupcao continuidade",
  misuse:"uso inadequado falsificacao reconstituicao",
};
function searchableText(item: UnifiedEvidenceRecord) {
  const parts=[
    item.id,...item.sourceIds,item.title,item.pmid??"",
    item.resultsSummary,item.limitations,item.populationSummary,
    ...item.topics.map(tag=>topicLabels[tag]),
    ...item.drugs, item.studyFamily??"",
  ];
  return normalizeSearchText(parts.join(" "));
}
function rank(priority:EditorialPriority|null){return priority==="P0"?0:priority==="P1"?1:priority==="P2"?2:3;}
function sortRows(items:UnifiedEvidenceRecord[],sort:"priority"|"newest"|"oldest"|"title"){
  return items.sort((a,b)=>{
    if(sort==="title")return a.title.localeCompare(b.title,"pt-BR")||a.id.localeCompare(b.id);
    if(sort==="newest"||sort==="oldest"){
      const years=(a.year??0)-(b.year??0);
      return (sort==="newest"?-years:years)||a.id.localeCompare(b.id);
    }
    return rank(a.priority)-rank(b.priority) || (b.year??0)-(a.year??0)||a.id.localeCompare(b.id);
  });
}
export function searchUnifiedEvidence(options:EvidenceSearchOptions={}):EvidenceSearchResult{
  const f=evidenceSearchSchema.parse(options);
  const tokens=normalizeSearchText(f.query).split(" ").filter(Boolean).map(t=>termAliases[t]??t);
  const matching=unifiedEvidenceCatalog.filter(item=>{
    if(f.topics.length&&!f.topics.some(tag=>item.topics.includes(tag as EvidenceTopic)))return false;
    if(f.drugs.length&&!f.drugs.some(drug=>item.drugs.includes(drug as DrugFilter)))return false;
    if(f.designs.length&&!f.designs.includes(item.design as EvidenceDesign))return false;
    if(f.priorities.length&&(!item.priority||!f.priorities.includes(item.priority)))return false;
    if(f.sourceKinds.length&&!f.sourceKinds.includes(item.sourceKind))return false;
    if(f.fromYear!==undefined&&(item.year===null||item.year<f.fromYear))return false;
    if(f.toYear!==undefined&&(item.year===null||item.year>f.toYear))return false;
    if(tokens.length){
      const text=searchableText(item);
      if(!tokens.every(token=>text.includes(token)))return false;
    }
    return true;
  });
  const sorted=sortRows([...matching],f.sort);
  return {
    total:matching.length,
    items:sorted.slice(f.offset,f.offset+f.limit),
    page:{offset:f.offset,limit:f.limit,hasMore:f.offset+f.limit<matching.length},
  };
}
