"use client";

/**
 * Herbário de evidências: busca grande, temas em chips, filtros, alternância de vista
 * (grade de espécimes / lista), entrada em lote e paginação. Lógica de busca em
 * features/evidence/search.ts (a mesma do explorador anterior: 9 fichas por página).
 */
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ArrowLeft, ArrowRight, LayoutGrid, List, Search, SlidersHorizontal, X } from "lucide-react";
import { Reveal, motionAllowed } from "@/components/atlas/motion";
import { searchUnifiedEvidence } from "@/features/evidence/search";
import {
  evidenceTopics,
  type DrugFilter, type EvidenceDesign, type EvidenceTopic, type UnifiedEvidenceRecord,
} from "@/features/evidence/unified-catalog";
import { designNames, drugNames, topicNames } from "@/lib/evidence-presentation";
import {
  PAGE_SIZE, allDesigns, allDrugs, filterSignature, highlightedTopics, sortOptions, years,
  type SortKey,
} from "./data";
import { SpecimenCard, SpecimenRow } from "./specimen-card";

type View = "grid" | "list";
type SourceKind = "" | UnifiedEvidenceRecord["sourceKind"];

function pageWindow(current: number, total: number): Array<number | "gap"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const set = new Set([0, total - 1, current - 1, current, current + 1].filter(i => i >= 0 && i < total));
  const sorted = [...set].sort((a, b) => a - b);
  const out: Array<number | "gap"> = [];
  sorted.forEach((n, i) => { if (i && n - sorted[i - 1] > 1) out.push("gap"); out.push(n); });
  return out;
}

export function HerbariumExplorer() {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<EvidenceTopic | "">("");
  const [drug, setDrug] = useState<DrugFilter | "">("");
  const [design, setDesign] = useState<EvidenceDesign | "">("");
  const [source, setSource] = useState<SourceKind>("");
  const [year, setYear] = useState("");
  const [sort, setSort] = useState<SortKey>("priority");
  const [page, setPage] = useState(0);
  const [view, setView] = useState<View>("grid");
  const searchRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const pendingScroll = useRef(false);

  const result = useMemo(() => searchUnifiedEvidence({
    query,
    topics: topic ? [topic] : [],
    drugs: drug ? [drug] : [],
    designs: design ? [design] : [],
    sourceKinds: source ? [source] : [],
    fromYear: year ? Number(year) : undefined,
    toYear: year ? Number(year) : undefined,
    sort, limit: PAGE_SIZE, offset: page * PAGE_SIZE,
  }), [query, topic, drug, design, source, year, sort, page]);

  const totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));
  const selectedCount = [query.trim(), topic, drug, design, source, year].filter(Boolean).length;
  const pageStart = result.total === 0 ? 0 : page * PAGE_SIZE + 1;
  const pageEnd = Math.min(result.total, (page + 1) * PAGE_SIZE);
  const batchKey = filterSignature([topic, drug, design, source, year, sort, page, view]);

  const reset = () => {
    setQuery(""); setTopic(""); setDrug(""); setDesign(""); setSource("");
    setYear(""); setSort("priority"); setPage(0);
  };
  const goTo = (next: number) => { pendingScroll.current = true; setPage(Math.min(totalPages - 1, Math.max(0, next))); };

  // Ao trocar de página, volta ao topo dos resultados (com o Lenis, se estiver ativo).
  useEffect(() => {
    if (!pendingScroll.current) return;
    pendingScroll.current = false;
    const el = resultsRef.current;
    if (!el || el.getBoundingClientRect().top > 0) return;
    const lenis = window.__lupaLenis;
    if (lenis) lenis.scrollTo(el, { offset: -96, immediate: !motionAllowed() });
    else el.scrollIntoView({ block: "start" });
  }, [page]);

  // Atalho "/" para a busca, como em catálogos de biblioteca.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Profundidade no hover: a ficha inclina levemente na direção do ponteiro.
  const tilt = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !motionAllowed()) return;
    const card = (e.target as HTMLElement).closest<HTMLElement>(".ev-spec");
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty("--ev-rx", `${((e.clientY - r.top) / r.height - 0.5) * -6}deg`);
    card.style.setProperty("--ev-ry", `${((e.clientX - r.left) / r.width - 0.5) * 7}deg`);
  };
  const untilt = (e: ReactPointerEvent<HTMLDivElement>) => {
    const card = (e.target as HTMLElement).closest<HTMLElement>(".ev-spec");
    card?.style.removeProperty("--ev-rx");
    card?.style.removeProperty("--ev-ry");
  };

  return (
    <div className="ev-herb">
      <div className="ev-console">
        <label htmlFor="ev-search" className="ev-console__label at-mono">
          Pesquisar por artigo, desfecho, medicamento ou PMID
        </label>
        <div className="ev-search">
          <Search className="ev-search__icon" size={26} aria-hidden="true"/>
          <input
            ref={searchRef} id="ev-search" type="search" value={query} maxLength={160} autoComplete="off"
            placeholder="tirzepatida, sarcopenia, PHQ-9…"
            className="ev-search__input"
            aria-describedby="ev-search-hint"
            onChange={e => { setQuery(e.target.value); setPage(0); }}
          />
          {query && (
            <button type="button" className="ev-search__clear" onClick={() => { setQuery(""); setPage(0); searchRef.current?.focus(); }}>
              <X size={18} aria-hidden="true"/><span className="sr-only">Apagar a busca</span>
            </button>
          )}
          <kbd className="ev-search__kbd at-mono" aria-hidden="true">/</kbd>
        </div>
        <p id="ev-search-hint" className="ev-console__hint">
          Aceita nomes comerciais (Mounjaro, Ozempic, Wegovy, Saxenda), identificadores como E04 ou P02 e números de PubMed.
        </p>

        <div className="ev-chips at-tabs" role="group" aria-label="Temas em destaque">
          <button type="button" className="at-chip" aria-pressed={topic === ""} onClick={() => { setTopic(""); setPage(0); }}>
            Todos os temas
          </button>
          {highlightedTopics.map(item => (
            <button key={item.topic} type="button" className="at-chip" aria-pressed={topic === item.topic}
              onClick={() => { setTopic(cur => cur === item.topic ? "" : item.topic); setPage(0); }}>
              {item.label}
            </button>
          ))}
        </div>

        <div className="ev-filters">
          <label className="at-field" htmlFor="ev-topic">
            <span>Tema</span>
            <select id="ev-topic" className="at-select" value={topic}
              onChange={e => { setTopic(e.target.value as EvidenceTopic | ""); setPage(0); }}>
              <option value="">Todos os temas</option>
              {evidenceTopics.map(v => <option key={v} value={v}>{topicNames[v]}</option>)}
            </select>
          </label>
          <label className="at-field" htmlFor="ev-drug">
            <span>Medicamento / contexto</span>
            <select id="ev-drug" className="at-select" value={drug}
              onChange={e => { setDrug(e.target.value as DrugFilter | ""); setPage(0); }}>
              <option value="">Todos os medicamentos</option>
              {allDrugs.map(v => <option key={v} value={v}>{drugNames[v]}</option>)}
            </select>
          </label>
          <label className="at-field" htmlFor="ev-design">
            <span>Tipo de documento</span>
            <select id="ev-design" className="at-select" value={design}
              onChange={e => { setDesign(e.target.value as EvidenceDesign | ""); setPage(0); }}>
              <option value="">Todos os tipos</option>
              {allDesigns.map(v => <option key={v} value={v}>{designNames[v]}</option>)}
            </select>
          </label>
        </div>

        <details className="ev-more">
          <summary>
            <SlidersHorizontal size={17} aria-hidden="true"/> Mais filtros
            <span className="ev-more__hint">(ano e origem)</span>
          </summary>
          <div className="ev-filters ev-filters--more">
            <label className="at-field" htmlFor="ev-source">
              <span>Natureza da fonte</span>
              <select id="ev-source" className="at-select" value={source}
                onChange={e => { setSource(e.target.value as SourceKind); setPage(0); }}>
                <option value="">Todas as fontes</option>
                <option value="publication">Publicação científica</option>
                <option value="regulatory">Fonte oficial / regulatória</option>
              </select>
            </label>
            <label className="at-field" htmlFor="ev-year">
              <span>Ano da publicação</span>
              <select id="ev-year" className="at-select" value={year}
                onChange={e => { setYear(e.target.value); setPage(0); }}>
                <option value="">Todos os anos</option>
                {years.map(v => <option key={v} value={String(v)}>{v}</option>)}
              </select>
            </label>
          </div>
        </details>
      </div>

      <div className="ev-results" ref={resultsRef} aria-labelledby="ev-results-title" role="region">
        <div className="ev-results__bar">
          <div>
            <h2 id="ev-results-title" className="ev-results__title">
              Resultados <span className="ev-results__count">({result.total})</span>
            </h2>
            <p className="ev-results__status" role="status" aria-live="polite">
              {result.total === 0 ? "Nenhum registro corresponde aos filtros." : `Exibindo ${pageStart}–${pageEnd} de ${result.total} registros`}
            </p>
          </div>
          <div className="ev-results__tools">
            {selectedCount > 0 && (
              <button type="button" className="ev-reset" onClick={reset}>
                <X size={16} aria-hidden="true"/> Limpar filtros ({selectedCount})
              </button>
            )}
            <div className="ev-view" role="group" aria-label="Vista dos resultados">
              <button type="button" aria-pressed={view === "grid"} onClick={() => setView("grid")}>
                <LayoutGrid size={17} aria-hidden="true"/> Grade de espécimes
              </button>
              <button type="button" aria-pressed={view === "list"} onClick={() => setView("list")}>
                <List size={17} aria-hidden="true"/> Lista
              </button>
            </div>
            <div className="ev-sort">
              <label htmlFor="ev-sort" className="at-mono">Ordenar:</label>
              <select id="ev-sort" className="at-select" value={sort}
                onChange={e => { setSort(e.target.value as SortKey); setPage(0); }}>
                {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {result.total === 0 ? (
          <div className="ev-empty">
            <div className="ev-empty__art" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/images/recortes/lupa.webp" alt="" loading="lazy" decoding="async"/>
              <span className="ev-empty__sheet"/>
              <span className="ev-empty__sheet ev-empty__sheet--b"/>
            </div>
            <div>
              <h3 className="ev-empty__title">Nenhuma correspondência encontrada</h3>
              <p>Ajuste os termos ou remova filtros. A ausência de resultados não significa ausência de evidência científica.</p>
              <button type="button" className="at-btn at-btn--solid" onClick={reset}>Mostrar todas as referências</button>
            </div>
          </div>
        ) : (
          <div onPointerMove={tilt} onPointerOut={untilt}>
            <Reveal key={batchKey} as="ol" className={view === "grid" ? "ev-grid" : "ev-list"} y={view === "grid" ? 46 : 22} stagger={0.06}>
              {result.items.map(item => (
                <li key={item.id}>{view === "grid" ? <SpecimenCard record={item}/> : <SpecimenRow record={item}/>}</li>
              ))}
            </Reveal>
          </div>
        )}

        {totalPages > 1 && (
          <nav className="ev-pager" aria-label="Paginação do catálogo">
            <button type="button" className="ev-pager__step" disabled={page === 0} onClick={() => goTo(page - 1)}>
              <ArrowLeft size={18} aria-hidden="true"/> Anterior
            </button>
            <ol className="ev-pager__pages">
              {pageWindow(page, totalPages).map((n, i) => n === "gap"
                ? <li key={"gap" + i} aria-hidden="true" className="ev-pager__gap">…</li>
                : (
                  <li key={n}>
                    <button type="button" className="ev-pager__num at-mono" aria-current={n === page ? "page" : undefined} onClick={() => goTo(n)}>
                      <span className="sr-only">Página </span>{String(n + 1).padStart(2, "0")}
                    </button>
                  </li>
                ))}
            </ol>
            <span className="ev-pager__label at-mono" aria-live="polite">Página {page + 1} de {totalPages}</span>
            <button type="button" className="ev-pager__step" disabled={page >= totalPages - 1} onClick={() => goTo(page + 1)}>
              Próxima <ArrowRight size={18} aria-hidden="true"/>
            </button>
          </nav>
        )}
        <p className="ev-footnote">
          A ordem “Prioridade editorial” segue a fila de curadoria da equipe; não é uma medida da qualidade da evidência.
        </p>
      </div>
    </div>
  );
}
