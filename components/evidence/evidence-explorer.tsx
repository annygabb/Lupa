"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, BookOpenCheck, FilterX, Info, Search, SlidersHorizontal,
} from "lucide-react";
import { EvidenceCard } from "@/components/evidence/evidence-card";
import { searchUnifiedEvidence } from "@/features/evidence/search";
import {
  evidenceTopics, getCatalogAudit,
  type DrugFilter, type EditorialPriority, type EvidenceDesign,
  type EvidenceTopic, type UnifiedEvidenceRecord,
} from "@/features/evidence/unified-catalog";
import { designNames, drugNames, topicNames } from "@/lib/evidence-presentation";

const audit = getCatalogAudit();
const PAGE_SIZE = 9;
const highlighted: Array<{label:string;topic:EvidenceTopic}> = [
  {label:"Saúde mental",topic:"mental"},
  {label:"Músculos",topic:"muscle"},
  {label:"Sarcopenia",topic:"sarcopenia"},
  {label:"UTI",topic:"icu"},
  {label:"Segurança",topic:"safety"},
  {label:"Brasil",topic:"brazil"},
];

const allDrugs: DrugFilter[] = [
  "tirzepatide","semaglutide","liraglutide","glp1_class","not_applicable",
];
const allDesigns: EvidenceDesign[] = [
  "clinical_trial","post_hoc","meta_analysis","systematic_review",
  "observational","narrative_review","pooled_analysis","pharmacovigilance",
  "regulatory","consensus","other",
];
const allPriorities: EditorialPriority[] = ["P0","P1","P2"];
const years: number[] = Array.from(
  {length: 2026 - 2000 + 1}, (_, index) => 2026 - index,
);
const fieldClass = "min-h-11 w-full rounded-xl border border-border bg-white px-3 text-sm text-foreground shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-[#087f8325]";

export function EvidenceExplorer() {
  const [query,setQuery] = useState("");
  const [topic,setTopic] = useState<EvidenceTopic | "">("");
  const [drug,setDrug] = useState<DrugFilter | "">("");
  const [design,setDesign] = useState<EvidenceDesign | "">("");
  const [source,setSource] = useState<"" | UnifiedEvidenceRecord["sourceKind"]>("");
  const [priority,setPriority] = useState<EditorialPriority | "">("");
  const [year,setYear] = useState("");
  const [sort,setSort] = useState<"priority" | "newest" | "oldest" | "title">("priority");
  const [page,setPage] = useState(0);

  const result = useMemo(() => searchUnifiedEvidence({
    query,
    topics: topic ? [topic] : [],
    drugs: drug ? [drug] : [],
    designs: design ? [design] : [],
    sourceKinds: source ? [source] : [],
    priorities: priority ? [priority] : [],
    fromYear: year ? Number(year) : undefined,
    toYear: year ? Number(year) : undefined,
    sort, limit:PAGE_SIZE, offset:page * PAGE_SIZE,
  }),[query,topic,drug,design,source,priority,year,sort,page]);

  const currentPage = page + 1;
  const totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));
  const selectedCount = [query.trim(),topic,drug,design,source,priority,year].filter(Boolean).length;
  const pageStart = result.total === 0 ? 0 : page * PAGE_SIZE + 1;
  const pageEnd = Math.min(result.total,(page + 1) * PAGE_SIZE);

  const reset = () => {
    setQuery("");setTopic("");setDrug("");setDesign("");setSource("");
    setPriority("");setYear("");setSort("priority");setPage(0);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
      <section className="pb-8 pt-12 sm:pb-10 sm:pt-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          LUPA Saúde / Biblioteca de evidências
        </p>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-[720px]">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Ciência para investigar. <span className="text-primary">Dados para compreender.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Encontre pesquisas sobre medicamentos para emagrecimento, saúde mental, músculos,
              sarcopenia e UTI. Veja as fontes, os resultados descritos e os limites de cada documento.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-border bg-white p-3 text-xs text-[#536b75]">
            <BookOpenCheck aria-hidden="true" size={19} className="text-primary"/>
            <span>Pesquisa com fontes rastreáveis</span>
          </div>
        </div>
      </section>

      <section aria-label="Situação do catálogo" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-white p-4 sm:p-5">
          <p className="text-2xl font-semibold tabular-nums text-foreground">{audit.canonicalRecords}</p>
          <p className="mt-1 text-xs text-muted-foreground">Registros catalogados</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-4 sm:p-5">
          <p className="text-2xl font-semibold tabular-nums text-foreground">{audit.originalRecords+audit.supplementalSources}</p>
          <p className="mt-1 text-xs text-muted-foreground">Referências de origem</p>
        </div>
        <div className="col-span-2 rounded-2xl border border-border bg-white p-4 sm:col-span-1 sm:p-5">
          <p className="text-2xl font-semibold tabular-nums text-foreground">{audit.readyForProjection}</p>
          <p className="mt-1 text-xs text-muted-foreground">Resultados liberados para projeção</p>
        </div>
      </section>

      <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#d3e3e4] bg-[#edf6f6] px-4 py-3" role="note">
        <Info size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-primary"/>
        <p className="text-xs leading-6 text-[#385661]">
          <strong>Catálogo em curadoria.</strong> Os resumos são transcrições dos materiais de pesquisa
          reunidos pela equipe; seus números ainda exigem validação no artigo original.
          Esta página não fornece diagnóstico, prescrição nem previsão de risco individual.
        </p>
      </div>

      <section className="mt-10" aria-labelledby="filters-heading">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="filters-heading" className="text-xl font-semibold tracking-tight">Explore os estudos</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Combine termos, temas e filtros para encontrar uma referência.
            </p>
          </div>
          {selectedCount>0 && (
            <button type="button" onClick={reset}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-primary underline-offset-4 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2">
              <FilterX size={16} aria-hidden="true"/> Limpar filtros ({selectedCount})
            </button>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-white p-4 sm:p-5">
          <label htmlFor="evidence-search" className="mb-2 block text-xs font-semibold text-foreground">
            Pesquisar por artigo, desfecho, medicamento ou PMID
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#69828a]" size={19} aria-hidden="true"/>
            <input id="evidence-search" type="search" value={query} maxLength={160}
              placeholder="Ex.: tirzepatida, sarcopenia, PHQ-9, PubMed…"
              className="min-h-12 w-full rounded-xl border border-border bg-[#fcfdfd] py-2 pl-11 pr-4 text-sm outline-none placeholder:text-[#73878d] focus:border-primary focus:ring-2 focus:ring-[#087f8325]"
              onChange={event=>{setQuery(event.target.value);setPage(0);}}
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-2" aria-label="Temas em destaque">
            <button type="button" onClick={()=>{setTopic("");setPage(0);}}
              aria-pressed={topic===""}
              className={"min-h-9 rounded-full border px-3 text-xs font-medium transition-colors " +
                (topic==="" ? "border-primary bg-primary text-white" : "border-border bg-white text-muted-foreground hover:border-[#91c6c6]")}>
              Todos os temas
            </button>
            {highlighted.map(item=>(
              <button key={item.topic} type="button" aria-pressed={topic===item.topic}
                onClick={()=>{setTopic(current=>current===item.topic?"":item.topic);setPage(0);}}
                className={"min-h-9 rounded-full border px-3 text-xs font-medium transition-colors " +
                  (topic===item.topic ? "border-primary bg-primary text-white" : "border-border bg-white text-muted-foreground hover:border-[#91c6c6]")}>
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="topic-select" className="mb-2 block text-xs font-semibold">Tema</label>
              <select id="topic-select" value={topic} className={fieldClass}
                onChange={event=>{setTopic(event.target.value as EvidenceTopic|"");setPage(0);}}>
                <option value="">Todos os temas</option>
                {evidenceTopics.map(value=><option key={value} value={value}>{topicNames[value]}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="drug-select" className="mb-2 block text-xs font-semibold">Medicamento / contexto</label>
              <select id="drug-select" value={drug} className={fieldClass}
                onChange={event=>{setDrug(event.target.value as DrugFilter|"");setPage(0);}}>
                <option value="">Todos os medicamentos</option>
                {allDrugs.map(value=><option key={value} value={value}>{drugNames[value]}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="design-select" className="mb-2 block text-xs font-semibold">Tipo de documento</label>
              <select id="design-select" value={design} className={fieldClass}
                onChange={event=>{setDesign(event.target.value as EvidenceDesign|"");setPage(0);}}>
                <option value="">Todos os tipos</option>
                {allDesigns.map(value=><option key={value} value={value}>{designNames[value]}</option>)}
              </select>
            </div>
          </div>

          <details className="group mt-4 border-t border-border pt-3">
            <summary className="flex min-h-9 cursor-pointer list-none items-center gap-2 text-xs font-semibold text-primary marker:hidden">
              <SlidersHorizontal size={16} aria-hidden="true" /> Mais filtros
              <span className="text-muted-foreground"> (ano, origem, prioridade editorial)</span>
            </summary>
            <div className="grid gap-3 pb-2 pt-3 sm:grid-cols-3">
              <div>
                <label htmlFor="source-select" className="mb-2 block text-xs font-semibold">Natureza da fonte</label>
                <select id="source-select" value={source} className={fieldClass}
                  onChange={event=>{setSource(event.target.value as UnifiedEvidenceRecord["sourceKind"]|"");setPage(0);}}>
                  <option value="">Todas as fontes</option>
                  <option value="publication">Publicação científica</option>
                  <option value="regulatory">Fonte oficial / regulatória</option>
                </select>
              </div>
              <div>
                <label htmlFor="priority-select" className="mb-2 block text-xs font-semibold">Prioridade editorial</label>
                <select id="priority-select" value={priority} className={fieldClass}
                  onChange={event=>{setPriority(event.target.value as EditorialPriority|"");setPage(0);}}>
                  <option value="">Todas as prioridades</option>
                  {allPriorities.map(value=><option key={value} value={value}>{value}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="year-select" className="mb-2 block text-xs font-semibold">Ano da publicação</label>
                <select id="year-select" value={year} className={fieldClass}
                  onChange={event=>{setYear(event.target.value);setPage(0);}}>
                  <option value="">Todos os anos</option>
                  {years.map(value=><option key={value} value={String(value)}>{value}</option>)}
                </select>
              </div>
            </div>
          </details>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="results-title">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="results-title" className="text-xl font-semibold tracking-tight">
              Resultados <span className="font-normal text-muted-foreground">({result.total})</span>
            </h2>
            <p className="mt-1 text-xs text-muted-foreground" role="status" aria-live="polite">
              {result.total===0?"Nenhum registro corresponde aos filtros.": "Exibindo "+pageStart+"–"+pageEnd+" de "+result.total+" registros"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-xs text-muted-foreground">Ordenar:</label>
            <select id="sort-select" value={sort}
              className="min-h-10 rounded-lg border border-border bg-white px-3 text-xs font-medium outline-none focus:border-primary"
              onChange={event=>{setSort(event.target.value as typeof sort);setPage(0);}}>
              <option value="priority">Prioridade editorial</option>
              <option value="newest">Mais recentes</option>
              <option value="oldest">Mais antigos</option>
              <option value="title">Título A–Z</option>
            </select>
          </div>
        </div>

        {result.total===0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-14 text-center">
            <Search aria-hidden="true" size={28} className="mx-auto text-[#7a959c]"/>
            <h3 className="mt-4 text-lg font-semibold">Nenhuma correspondência encontrada</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Ajuste os termos ou remova filtros. A ausência de resultados não significa ausência de evidência científica.
            </p>
            <button type="button" onClick={reset}
              className="mt-5 min-h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-white hover:bg-[#066d70]">
              Mostrar todas as referências
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {result.items.map(item=><EvidenceCard key={item.id} record={item}/>)}
          </div>
        )}

        {totalPages>1 && (
          <nav aria-label="Paginação do catálogo" className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button type="button" disabled={page===0} onClick={()=>setPage(current=>Math.max(0,current-1))}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40">
              <ArrowLeft size={16} aria-hidden="true"/> Anterior
            </button>
            <span className="text-xs font-medium text-muted-foreground" aria-live="polite">
              Página {currentPage} de {totalPages}
            </span>
            <button type="button" disabled={page>=totalPages-1}
              onClick={()=>setPage(current=>Math.min(totalPages-1,current+1))}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40">
              Próxima <ArrowRight size={16} aria-hidden="true"/>
            </button>
          </nav>
        )}
        <p className="mt-8 text-center text-xs leading-6 text-muted-foreground">
          Prioridade P0/P1/P2 indica ordem editorial de curadoria, não qualidade definitiva de evidência.
        </p>
      </section>
    </div>
  );
}
