"use client";

import { useState } from "react";
import { clinicalPlots, horizons } from "@/features/insights/evidence";
import { runScenario } from "@/features/scenarios/engine";
import { TraceChart } from "./trace-chart";
import { PointPanel } from "./point-panel";
import { EvidencePlate } from "./evidence-plate";
import { observed, topics, type Country, type TraceSeries } from "./data";

type Mode = "observed" | "scenario";

/**
 * Observatório Brasil × EUA (substitui CountryOutlook). Mesma lógica e mesmos textos:
 * dados observados com denominador, evidência internacional na população original
 * e um explorador de cenários para um grupo fictício de 1.000 pessoas.
 */
export function GapObservatory() {
  const [mode, setMode] = useState<Mode>("observed");
  const [country, setCountry] = useState<Country>("BR");
  const [topic, setTopic] = useState<(typeof topics)[number]["id"]>("use");
  const [point, setPoint] = useState(0);
  const [scenarioPoint, setScenarioPoint] = useState<[number, number]>([1, 1]);
  const [start, setStart] = useState(5);
  const [retention, setRetention] = useState(80);
  const [year, setYear] = useState<(typeof horizons)[number]>(2031);

  const current = observed[country];
  const obsPoint = current.series[0].points[point] ?? current.series[0].points[0];

  const scenarios = [{ label: "Acesso constante", growth: 0 }, { label: "Acesso em expansão", growth: .5 }].map(s => ({
    ...s,
    result: runScenario({ referenceYear: 2026, populationBase: 1000, annualPopulationGrowthPct: 0, initialActivePct: 10, annualStartPct: start, annualRetentionPct: retention, annualAccessIncreasePp: s.growth, costPerActivePersonBRL: 0 }),
  }));
  const curves: TraceSeries[] = scenarios.map(s => ({
    label: s.label, dashed: true,
    points: horizons.map((y, i) => ({ label: String(y), value: s.result.rows.find(r => r.year === y)!.active, x: i / 3 })),
  }));
  const chosen = scenarios[scenarioPoint[0]];
  const chosenYear = horizons[scenarioPoint[1]];
  const row = chosen.result.rows.find(r => r.year === chosenYear)!;
  const plotId = topic === "icu" ? "icu-glp1" : topic;
  const plot = clinicalPlots.find(p => p.id === plotId);

  return (
    <div className={"px-obs is-" + mode}>
      <div className="px-obs__bar">
        <div className="px-switch" role="group" aria-label="Tipo de visualização">
          <span className="px-switch__thumb" aria-hidden="true"/>
          <button type="button" data-early-click aria-pressed={mode === "observed"} onClick={() => setMode("observed")}>Dados observados</button>
          <button type="button" data-early-click aria-pressed={mode === "scenario"} onClick={() => setMode("scenario")}>Explorar cenários</button>
        </div>
        {mode === "observed" && (
          <div className="px-obs__controls">
            <label className="px-select" htmlFor="outlook-topic">
              <span>O que você quer investigar?</span>
              <select id="outlook-topic" className="at-select" value={topic} onChange={e => setTopic(e.target.value as typeof topic)}>
                {topics.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </label>
            {topic === "use" && (
              <div className="px-countries" role="group" aria-label="País do levantamento">
                <button type="button" data-early-click className="at-chip" aria-pressed={country === "BR"} onClick={() => { setCountry("BR"); setPoint(0); }}>Brasil</button>
                <button type="button" data-early-click className="at-chip" aria-pressed={country === "US"} onClick={() => { setCountry("US"); setPoint(1); }}>Estados Unidos</button>
              </div>
            )}
          </div>
        )}
      </div>

      {mode === "observed" ? (
        topic === "use" ? (
          <>
            <p className="px-obs__note"><strong>Dois contextos, perguntas diferentes.</strong> Brasil: automedicação entre usuários entrevistados. EUA: uso atual ou passado entre adultos do painel nacional. Os percentuais não são prevalências equivalentes.</p>
            <div className="px-obs__grid">
              <div className="px-obs__chart">
                <p className="px-obs__kicker">{current.kicker}</p>
                <h3 className="px-obs__title">{current.heading}</h3>
                <TraceChart key={country} caption={current.caption} series={current.series} max={current.max} xLabels={current.xLabels}
                  selected={`0-${point}`} onSelect={(_, p) => setPoint(p)}
                  gap={{ from: .58, title: "2026 → 2041", note: ["Lacuna: sem série", "nacional calibrada"] }}
                  summary={`${current.series[0].label}: ${current.series[0].points.map(p => `${p.label} ${p.value.toLocaleString("pt-BR")}%`).join("; ")}. De 2026 a 2041 não há valor nacional sustentado; a área hachurada é uma lacuna, não zero.`}/>
              </div>
              <PointPanel data={{ ...current.reading, value: `${obsPoint.value.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}%`, period: country === "US" ? obsPoint.label : current.reading.period }}/>
            </div>
            <details className="px-details px-details--study">
              <summary>Há dados brasileiros de uso atual e anterior?</summary>
              <p>Sim, em uma amostra clínica selecionada: 480 pacientes com prescrição atual, 99 anterior e 316 sem prescrição prévia entre 895 pacientes em atendimento. A seleção por cotas de tratamento impede transformar essas proporções em prevalência nacional. Inclui medicamentos para obesidade além de GLP-1; coleta em 2022.</p>
              <a className="at-link" href="https://pubmed.ncbi.nlm.nih.gov/41165452/" target="_blank" rel="noopener noreferrer">Consultar o estudo brasileiro · PMID 41165452</a>
            </details>
          </>
        ) : (
          <div className="px-obs__clinical">
            <p className="px-obs__kicker">Evidência internacional · população original do estudo</p>
            <p className="px-obs__note">O efeito foi medido nesses participantes. Não o duplicamos como se tivesse sido observado separadamente no Brasil e nos EUA.</p>
            {plot && <EvidencePlate key={plot.id} plot={plot} linkMuscles={topic === "icu"}/>}
          </div>
        )
      ) : (
        <section className="px-explore" aria-labelledby="scenario-explorer-title">
          <div className="px-explore__intro">
            <span className="px-badge">Simulação condicional · grupo fictício</span>
            <h3 id="scenario-explorer-title" className="px-obs__title">Se o acesso crescer, quantas pessoas estarão em acompanhamento?</h3>
            <p>Dois cenários para as mesmas 1.000 pessoas. As premissas abaixo são ilustrativas e editáveis; não representam Brasil, EUA ou uma promessa de oferta pelo SUS.</p>
          </div>
          <div className="px-explore__inputs">
            <RangeDial id="scenario-start" label="Início anual assumido" value={start} min={0} max={15} step={1} onChange={setStart}/>
            <RangeDial id="scenario-retention" label="Continuidade anual assumida" value={retention} min={0} max={100} step={5} onChange={setRetention}/>
          </div>
          <div className="px-obs__grid">
            <div className="px-obs__chart">
              <TraceChart caption="Pessoas em tratamento no grupo fictício de 1.000" series={curves} unit="" max={1000}
                xLabels={horizons.map((y, i) => ({ label: String(y), x: i / 3 }))}
                selected={scenarioPoint.join("-")} onSelect={(s, p) => { setScenarioPoint([s, p]); setYear(horizons[p]); }}
                summary={curves.map(c => `${c.label} (hipótese): ${c.points.map(p => `${p.label} ${p.value}`).join(", ")}`).join(". ")}/>
            </div>
            <PointPanel data={{
              value: row.active.toLocaleString("pt-BR"),
              label: `Pessoas em acompanhamento · ${chosen.label.toLowerCase()}`,
              kind: "Resultado calculado · hipótese",
              meaning: `Em ${chosenYear}, ${row.activeSharePct.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% do grupo fictício estaria em tratamento sob estas premissas. Não é uma estimativa de benefício ou dano clínico.`,
              population: "Coorte fictícia fixa de 1.000 pessoas, sem país atribuído.",
              period: String(chosenYear),
              limitation: "Não estima mortes, UTI, depressão ou perda muscular. Não é previsão nacional. Os valores iniciais e as taxas não vêm dos estudos.",
              assumptions: `Base 2026: 100 em tratamento (10%). Início anual: ${start}% das vagas após continuidade; crescimento de ${chosen.growth} ponto percentual/ano na taxa de início. Continuidade: ${retention}%/ano. População fixa; arredondamento por ano. Modelo lupa-flow-v2.`,
            }}/>
          </div>
          <div className="px-horizons" role="group" aria-label="Horizonte da comparação">
            {horizons.map((y, i) => (
              <button type="button" key={y} data-early-click className="px-horizons__btn" aria-pressed={year === y}
                onClick={() => { setYear(y); setScenarioPoint([scenarioPoint[0], i]); }}>{y}</button>
            ))}
          </div>
          <details className="px-details">
            <summary>Como o cálculo funciona?</summary>
            <p>Em cada ano, ativos do ano anterior × continuidade = pessoas que continuam. Das vagas restantes, uma fração inicia tratamento. Ativos = continuaram + iniciaram. A expansão acrescenta 0,5 ponto percentual por ano à taxa de início; o cenário constante a mantém. Saídas podem voltar em outro ano. Todos os pressupostos são hipotéticos.</p>
            <a className="at-link" href="#laboratorio">Abrir laboratório completo e exportar os cálculos <span aria-hidden="true">→</span></a>
          </details>
        </section>
      )}
    </div>
  );
}

/** Controle deslizante com mostrador: o valor atual fica no rótulo (e no nome acessível). */
export function RangeDial({ id, label, value, min, max, step, onChange, suffix = "%" }: {
  id: string; label: string; value: number; min: number; max: number; step: number; onChange: (n: number) => void; suffix?: string;
}) {
  const p = Math.max(0, Math.min(1, (value - min) / (max - min || 1)));
  return (
    <div className="px-range" style={{ ["--p" as string]: p }}>
      <svg className="px-range__dial" viewBox="0 0 64 40" aria-hidden="true">
        <path d="M6 36 A26 26 0 0 1 58 36" fill="none" stroke="var(--at-prussia-150)" strokeWidth="5" strokeLinecap="round"/>
        <path d="M6 36 A26 26 0 0 1 58 36" fill="none" stroke="var(--at-prussia-900)" strokeWidth="5" strokeLinecap="round" pathLength="100" strokeDasharray={`${p * 100} 100`}/>
        <line x1="32" y1="36" x2={32 - 22 * Math.cos(Math.PI * p)} y2={36 - 22 * Math.sin(Math.PI * p)} stroke="var(--at-prussia-700)" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="32" cy="36" r="3.5" fill="var(--at-prussia-900)"/>
      </svg>
      <label htmlFor={id} className="px-range__label">{label} <strong>{value}{suffix}</strong></label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))}/>
      <span className="px-range__scale" aria-hidden="true"><span>{min}{suffix}</span><span>{max}{suffix}</span></span>
    </div>
  );
}
