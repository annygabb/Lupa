import { evidenceCatalog } from "./catalog";
import { supplementalEvidenceCatalog, type SupplementalRecord } from "./supplemental";
import { extractPubmedId, normalizeEvidenceUrl } from "./normalization";

export const evidenceTopics = [
  "mental", "quality_of_life", "muscle", "sarcopenia", "icu", "safety",
  "gastrointestinal", "pancreas", "biliary", "kidney", "liver", "eyes",
  "brazil", "regulation", "appetite", "weight", "treatment", "misuse",
] as const;
export type EvidenceTopic = (typeof evidenceTopics)[number];
export type DrugFilter = "tirzepatide" | "semaglutide" | "liraglutide" | "glp1_class" | "not_applicable";
export type EvidenceDesign =
  | "clinical_trial" | "post_hoc" | "meta_analysis" | "systematic_review"
  | "observational" | "narrative_review" | "pooled_analysis" | "pharmacovigilance"
  | "regulatory" | "consensus" | "other";
export type EditorialPriority = "P0" | "P1" | "P2";

const legacyTopics: Record<string, EvidenceTopic[]> = {
  E01:["weight"], E04:["muscle"], E05:["muscle"], E10:["sarcopenia"],
  E11:["sarcopenia","brazil"], E12:["icu","sarcopenia"],
  E13:["icu","muscle"], E14:["icu"], E16:["treatment","weight"],
  E21:["mental"], E22:["brazil","safety"], E23:["safety"],
  E25:["mental","regulation"], E26:["safety","regulation"],
};
const supplementalTopics: Record<string, EvidenceTopic[]> = {
  P01:["mental","quality_of_life"], P02:["mental"], P03:["mental"],
  P04:["quality_of_life"], P05:["quality_of_life"], P06:["appetite"],
  P07:["mental"], P08:["mental"], P09:["mental"], P10:["mental"], P11:["mental"],
  P12:["weight","gastrointestinal"], P13:["gastrointestinal","safety"],
  P14:["gastrointestinal","safety"], P15:["biliary","safety"], P16:["pancreas","safety"],
  P17:["kidney"], P18:["liver"], P19:["liver"], P20:["muscle"],
  P21:["treatment","weight"], P22:["treatment","weight"],
  P23:["quality_of_life","treatment"], P24:["brazil","safety","regulation"],
  P25:["brazil","mental"], P26:["brazil","mental"], P27:["brazil","mental"],
  P28:["brazil","mental"], P29:["eyes","safety"], P30:["eyes","safety"],
  R01:["mental","regulation"], R02:["pancreas","safety","regulation"],
  R03:["misuse","safety"], R04:["misuse","safety"], R05:["misuse","safety"],
  R06:["brazil","regulation"], R07:["brazil","regulation"],
  R08:["brazil","weight"], R09:["misuse","safety"],
  R10:["brazil","weight"], R11:["brazil","regulation"],
};
const legacyDrug: Record<string, DrugFilter[]> = {
  E01:["tirzepatide"],E04:["tirzepatide"],E05:["tirzepatide"],
  E10:["not_applicable"],E11:["not_applicable"],E12:["not_applicable"],
  E13:["not_applicable"],E14:["not_applicable"],E16:["tirzepatide"],
  E21:["tirzepatide"],E22:["glp1_class"],E23:["tirzepatide"],
  E25:["glp1_class"],E26:["tirzepatide"],
};
const supplementalDrug: Record<string, DrugFilter[]> = {
  P01:["glp1_class"], P02:["semaglutide"],P03:["tirzepatide"],P04:["tirzepatide"],
  P05:["semaglutide"],P06:["semaglutide"],P07:["glp1_class"],
  P08:["glp1_class"],P09:["glp1_class"],P10:["glp1_class"],P11:["glp1_class"],
  P12:["tirzepatide"],P13:["glp1_class"],P14:["glp1_class"],P15:["glp1_class"],
  P16:["semaglutide"],P17:["semaglutide"],P18:["tirzepatide"],
  P19:["semaglutide"],P20:["tirzepatide"],P21:["semaglutide"],
  P22:["tirzepatide"],P23:["tirzepatide"],P24:["glp1_class"],
  P25:["not_applicable"],P26:["not_applicable"],P27:["not_applicable"],P28:["not_applicable"],
  P29:["glp1_class"],P30:["glp1_class"],
  R01:["glp1_class"],R02:["glp1_class"],R03:["semaglutide"],
  R04:["tirzepatide"],R05:["glp1_class"],R06:["semaglutide"],
  R07:["semaglutide","liraglutide"],R08:["not_applicable"],
  R09:["tirzepatide"],R10:["not_applicable"],R11:["glp1_class"],
};

const supplementalDesign: Record<string, EvidenceDesign> = {
  P01:"meta_analysis",P02:"post_hoc",P03:"post_hoc",P04:"post_hoc",
  P05:"post_hoc",P06:"clinical_trial",P07:"narrative_review",
  P08:"systematic_review",P09:"observational",P10:"meta_analysis",
  P11:"observational",P12:"clinical_trial",P13:"observational",
  P14:"observational",P15:"meta_analysis",P16:"meta_analysis",
  P17:"clinical_trial",P18:"clinical_trial",P19:"clinical_trial",
  P20:"post_hoc",P21:"post_hoc",P22:"clinical_trial",P23:"post_hoc",
  P24:"observational",P25:"observational",P26:"observational",
  P27:"observational",P28:"observational",P29:"meta_analysis",
  P30:"pooled_analysis",
};
const relatedFamily: Record<string,string> = {
  P04:"SURMOUNT-1", P23:"SURMOUNT-4",
  P25:"BR_OBESITY_PERCEPTIONS_SURVEY", P26:"BR_OBESITY_PERCEPTIONS_SURVEY",
  P01:"META_ANALYSIS_OVERLAP_UNDETERMINED",
};

export interface EvidenceReferenceLink { sourceId: string; url: string }
export interface UnifiedEvidenceRecord {
  id: string; sourceIds: readonly string[];
  title: string; year: number | null; pmid: string | null;
  url: string; references: readonly EvidenceReferenceLink[];
  sourceKind: "publication" | "regulatory";
  priority: EditorialPriority | null;
  design: EvidenceDesign;
  topics: readonly EvidenceTopic[];
  drugs: readonly DrugFilter[];
  populationSummary: string;
  resultsSummary: string;
  limitations: string;
  studyFamily: string | null;
  curationStatus: "candidate";
  projectionApproved: false;
}
type MutableEvidence = Omit<UnifiedEvidenceRecord,"sourceIds"|"references"|"topics"|"drugs"> & {
  sourceIds: string[]; references: EvidenceReferenceLink[];
  topics: EvidenceTopic[]; drugs: DrugFilter[];
};
function unique<T>(items: readonly T[]): T[] { return [...new Set(items)]; }
function yearFromTitle(title: string): number | null {
  const match = /(?:19|20)\d{2}/.exec(title);
  return match ? Number(match[0]) : null;
}
function firstPmidFromOld(url: string): string | null { return extractPubmedId(url); }
function oldToRecord(old: (typeof evidenceCatalog)[number]): MutableEvidence {
  return {
    id:old.legacyId,sourceIds:[old.legacyId],title:old.title,year:old.year,
    pmid:firstPmidFromOld(old.sourceUrl),url:old.sourceUrl,
    references:[{sourceId:old.legacyId,url:old.sourceUrl}],
    sourceKind:old.sourceType==="regulatory"?"regulatory":"publication",
    priority:null,design:old.sourceType,
    topics:legacyTopics[old.legacyId] ?? [],drugs:legacyDrug[old.legacyId] ?? [],
    populationSummary:old.populationAndArms,resultsSummary:old.resultsSummary,
    limitations:old.limitations,studyFamily:old.studyFamily,
    curationStatus:"candidate",projectionApproved:false,
  };
}
function newToRecord(item: SupplementalRecord): MutableEvidence {
  return {
    id:item.sourceId,sourceIds:[item.sourceId],title:item.title,
    year:yearFromTitle(item.title),pmid:item.pmid,url:item.sourceUrl,
    references:[{sourceId:item.sourceId,url:item.sourceUrl}],
    sourceKind:item.documentKind,priority:item.editorialPriority,
    design:item.documentKind==="regulatory"?"regulatory":(supplementalDesign[item.sourceId]??"other"),
    topics:supplementalTopics[item.sourceId]??[],drugs:supplementalDrug[item.sourceId]??[],
    populationSummary:item.sourceMetadata,resultsSummary:item.reportedResult,
    limitations:item.limitations,studyFamily:relatedFamily[item.sourceId]??null,
    curationStatus:"candidate",projectionApproved:false,
  };
}
export function buildUnifiedCatalog(): readonly UnifiedEvidenceRecord[] {
  const records: MutableEvidence[] = evidenceCatalog.map(oldToRecord);
  const byId = new Map(records.map(item=>[item.id,item]));
  const pmids = new Map(records.filter(item=>item.pmid).map(item=>[item.pmid!,item.id]));
  const urls = new Map(records.map(item=>[normalizeEvidenceUrl(item.url),item.id]));
  for(const item of supplementalEvidenceCatalog){
    const urlKey=normalizeEvidenceUrl(item.sourceUrl);
    const targetId=item.existingAlias ?? (item.pmid && pmids.get(item.pmid)) ?? urls.get(urlKey);
    if(targetId){
      const original=byId.get(targetId);
      if(!original) throw new Error("Alias órfão: "+item.sourceId+" → "+targetId);
      if(original.sourceKind!==item.documentKind) throw new Error("Tipo divergente no alias "+item.sourceId);
      if(item.pmid && original.pmid && item.pmid!==original.pmid)
        throw new Error("PMIDs contraditórios para "+item.sourceId);
      if(!original.sourceIds.includes(item.sourceId)){
        original.sourceIds.push(item.sourceId);
        original.references.push({sourceId:item.sourceId,url:item.sourceUrl});
      }
      original.pmid ??= item.pmid;
      original.priority ??= item.editorialPriority;
      original.topics=unique([...original.topics,...(supplementalTopics[item.sourceId]??[])]);
      original.drugs=unique([...original.drugs,...(supplementalDrug[item.sourceId]??[])]);
      if(item.pmid) pmids.set(item.pmid,original.id);
      urls.set(urlKey,original.id);
      continue;
    }
    const added=newToRecord(item);
    if(byId.has(added.id)) throw new Error("ID duplicado: "+added.id);
    records.push(added); byId.set(added.id,added);
    if(added.pmid){
      if(pmids.has(added.pmid))throw new Error("PMID duplicado sem alias: "+added.pmid);
      pmids.set(added.pmid,added.id);
    }
    if(urls.has(urlKey))throw new Error("URL duplicada sem alias: "+item.sourceId);
    urls.set(urlKey,added.id);
  }
  return records.map(item=>Object.freeze({
    ...item,
    sourceIds:Object.freeze([...item.sourceIds]),
    references:Object.freeze([...item.references]),
    topics:Object.freeze([...item.topics]),
    drugs:Object.freeze([...item.drugs]),
  }));
}
export const unifiedEvidenceCatalog = Object.freeze(buildUnifiedCatalog());
const byAnyId=new Map(unifiedEvidenceCatalog.flatMap(item=>item.sourceIds.map(id=>[id,item] as const)));
if(byAnyId.size!==55)throw new Error("Quantidade inesperada de aliases na curadoria: "+byAnyId.size);
export function getUnifiedEvidence(id: string): UnifiedEvidenceRecord | undefined {
  return byAnyId.get(id.trim().toUpperCase());
}
export function listExactAliases(): ReadonlyArray<{canonicalId:string;aliasId:string}> {
  return unifiedEvidenceCatalog.flatMap(item=>item.sourceIds.slice(1).map(aliasId=>({
    canonicalId:item.id,aliasId
  })));
}
export function listStudyFamilyOverlap(): ReadonlyMap<string,readonly string[]> {
  const groups=new Map<string,string[]>();
  for(const item of unifiedEvidenceCatalog){
    if(!item.studyFamily)continue;
    groups.set(item.studyFamily,[...(groups.get(item.studyFamily)??[]),item.id]);
  }
  return new Map([...groups].filter(([family,ids])=>
    ids.length>1 && family!=="META_ANALYSIS_OVERLAP_UNDETERMINED"));
}
export function getCatalogAudit() {
  return {
    originalRecords:evidenceCatalog.length,
    supplementalSources:supplementalEvidenceCatalog.length,
    canonicalRecords:unifiedEvidenceCatalog.length,
    exactAliases:listExactAliases(),
    overlappingStudyFamilies:[...listStudyFamilyOverlap()].map(([family,ids])=>({family,ids})),
    readyForProjection:unifiedEvidenceCatalog.filter(x=>x.projectionApproved).length,
    candidates:unifiedEvidenceCatalog.filter(x=>x.curationStatus==="candidate").length,
  };
}
