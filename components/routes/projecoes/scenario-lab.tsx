"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { motionAllowed } from "@/components/atlas/motion";
import {
  SCENARIO_PRESETS, scenarioInputSchema, runScenario, scenarioCsv,
  type ScenarioInput, type ScenarioPresetId, type ScenarioResult,
} from "@/features/scenarios/engine";
import { TweenNumber } from "./tween-number";

const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;
const compact = new Intl.NumberFormat("pt-BR");
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const pct = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%";

type FieldKey = Exclude<keyof ScenarioInput, "referenceYear">;
const fields = [
  { key: "populationBase", label: "Pessoas no grupo de referência", min: 1000, max: 100000000, step: 1000, unit: "pessoas", slider: false,
    help: "Hipótese editável. Não equivale à população brasileira elegível." },
  { key: "annualPopulationGrowthPct", label: "Variação anual do grupo (%)", min: -5, max: 5, step: 0.1, unit: "%", slider: true,
    help: "Premissa demográfica do grupo hipotético, não projeção oficial do IBGE." },
  { key: "initialActivePct", label: "Em tratamento em 2026 (%)", min: 0, max: 30, step: 0.5, unit: "%", slider: true,
    help: "Premissa de partida, não cobertura real conhecida." },
  { key: "annualStartPct", label: "Início anual entre quem não está ativo (%)", min: 0, max: 30, step: 0.5, unit: "%", slider: true,
    help: "Percentual hipotético de início no restante do grupo." },
  { key: "annualRetentionPct", label: "Continuidade anual (%)", min: 0, max: 100, step: 1, unit: "%", slider: true,
    help: "Percentual dos ativos anteriores que continuariam no ano seguinte." },
  { key: "annualAccessIncreasePp", label: "Aumento anual da taxa de início (p.p.)", min: 0, max: 5, step: 0.1, unit: "p.p.", slider: true,
    help: "Alteração da taxa de início em pontos percentuais por ano." },
  { key: "costPerActivePersonBRL", label: "Custo anual hipotético por pessoa (R$)", min: 0, max: 150000, step: 100, unit: "R$", slider: false,
    help: "Opcional: 0 desativa custos. Não é preço de medicamento nem orçamento do SUS." },
] as const satisfies ReadonlyArray<{ key: FieldKey; label: string; min: number; max: number; step: number; unit: string; slider: boolean; help: string }>;

const fieldGroups = [
  { label: "Grupo de referência", n: "I", keys: ["populationBase", "annualPopulationGrowthPct"] },
  { label: "Entrada e continuidade do tratamento", n: "II", keys: ["initialActivePct", "annualStartPct", "annualRetentionPct", "annualAccessIncreasePp"] },
  { label: "Custo opcional", n: "III", keys: ["costPerActivePersonBRL"] },
] as const;
const fieldInstruction = (f: (typeof fields)[number]) => `Use ${f.key === "populationBase" ? "um número inteiro" : "um valor"} entre ${compact.format(f.min)} e ${compact.format(f.max)}.`;

type ActivePreset = ScenarioPresetId | "personalizado";
const presetEntries = Object.entries(SCENARIO_PRESETS) as [ScenarioPresetId, (typeof SCENARIO_PRESETS)[ScenarioPresetId]][];
const presetCurves = Object.fromEntries(presetEntries.map(([k, v]) => [k, runScenario(v.input).rows.map(r => r.activeSharePct)])) as Record<ScenarioPresetId, number[]>;

function downloadFile(filename: string, text: string, mime: string) {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Laboratório de cenários como instrumento: console de premissas + leitura por horizonte. */
export function ScenarioLab() {
  const [input, setInput] = useState<ScenarioInput>({ ...SCENARIO_PRESETS.intermediario.input });
  const [preset, setPreset] = useState<ActivePreset>("intermediario");
  const [showRules, setShowRules] = useState(true);
  const [feedback, setFeedback] = useState("");

  const parsed = useMemo(() => scenarioInputSchema.safeParse(input), [input]);
  const result = useMemo(() => parsed.success ? runScenario(parsed.data) : null, [parsed]);
  const setField = (key: FieldKey, value: number) => { setInput(p => ({ ...p, [key]: value })); setPreset("personalizado"); setFeedback(""); };
  const choose = (id: ScenarioPresetId) => { setInput({ ...SCENARIO_PRESETS[id].input }); setPreset(id); setFeedback(""); };
  const exportScenario = (type: "csv" | "json") => {
    if (!result) return;
    if (type === "csv") downloadFile("lupa-cenario-2026-2041.csv", scenarioCsv(result), "text/csv;charset=utf-8");
    else downloadFile("lupa-cenario-2026-2041.json", JSON.stringify(result, null, 2), "application/json;charset=utf-8");
    setFeedback(`Arquivo ${type.toUpperCase()} preparado. Confira os downloads do navegador.`);
  };
  const sources = (result ?? runScenario(SCENARIO_PRESETS.intermediario.input)).sources;

  return (
    <div className="px-lab">
      <p className="px-lab__notice" role="note">
        <span className="px-lab__notice-mark" aria-hidden="true">≈</span>
        <span><strong>Você está explorando hipóteses, não uma previsão sobre o Brasil.</strong> Grupo fictício, taxas definidas por você, modelo lupa-flow-v2.</span>
      </p>

      <div className="px-lab__grid">
        <section className="px-console" aria-labelledby="scenario-options">
          <div className="px-console__head">
            <h3 id="scenario-options">Premissas do cenário</h3>
            <button type="button" data-early-click className="px-console__reset" onClick={() => choose("intermediario")}>
              <span aria-hidden="true">↺</span> Redefinir
            </button>
          </div>
          <p className="px-console__lead">Escolha um ponto de partida ilustrativo ou edite os valores. Nada é enviado a servidores.</p>

          <div className="px-presets" role="group" aria-label="Cenários pré-configurados">
            {presetEntries.map(([key, value]) => (
              <button key={key} type="button" data-early-click className="px-preset" aria-pressed={preset === key} onClick={() => choose(key)}>
                <Spark values={presetCurves[key]}/>
                <span className="px-preset__label">{value.label}</span>
                <span className="px-preset__note">{value.note}</span>
              </button>
            ))}
          </div>

          <div className="px-console__groups">
            {fieldGroups.map(group => (
              <fieldset key={group.label} className="px-fieldset">
                <legend><span aria-hidden="true">{group.n}</span>{group.label}</legend>
                {fields.filter(f => (group.keys as readonly string[]).includes(f.key)).map(f => {
                  const invalid = !parsed.success && parsed.error.issues.some(i => i.path[0] === f.key);
                  const id = "scenario-" + f.key;
                  const v = input[f.key];
                  const p = Math.max(0, Math.min(1, (v - f.min) / (f.max - f.min)));
                  return (
                    <div key={f.key} className={"px-field" + (invalid ? " is-invalid" : "")} style={{ ["--p" as string]: Number.isFinite(p) ? p : 0 }}>
                      <label htmlFor={id} className="px-field__label">{f.label}</label>
                      <div className="px-field__row">
                        <input id={id} type="number" inputMode="decimal" className="px-field__input" min={f.min} max={f.max} step={f.step}
                          value={v} onChange={e => setField(f.key, Number(e.target.value))}
                          aria-invalid={invalid || undefined} aria-describedby={id + "-help" + (invalid ? " " + id + "-error" : "")}/>
                        <span className="px-field__unit" aria-hidden="true">{f.unit}</span>
                      </div>
                      {f.slider && (
                        <input type="range" className="px-field__slider" min={f.min} max={f.max} step={f.step} value={Math.max(f.min, Math.min(f.max, v || 0))}
                          aria-label={`${f.label}: ajuste deslizante`} onChange={e => setField(f.key, Number(e.target.value))}/>
                      )}
                      <p id={id + "-help"} className="px-field__help">{f.help}</p>
                      {invalid && <p id={id + "-error"} className="px-field__error">{fieldInstruction(f)}</p>}
                    </div>
                  );
                })}
              </fieldset>
            ))}
          </div>

          <button type="button" className="px-console__rules-btn" aria-expanded={showRules} aria-controls="scenario-rules" onClick={() => setShowRules(s => !s)}>
            {showRules ? "Ocultar" : "Mostrar"} regras do cálculo
          </button>
          {showRules && (
            <div id="scenario-rules" className="px-console__rules">
              <p><strong>Quem continua:</strong> ativos anteriores × taxa de continuidade.</p>
              <p><strong>Quem inicia:</strong> pessoas do grupo que não estão ativas × taxa anual de início.</p>
              <p><strong>Ativos:</strong> pessoas que continuam + pessoas que iniciam no ano.</p>
              <p><strong>Saídas:</strong> ativos anteriores − continuaram. Inícios acumulados são eventos, não pessoas únicas.</p>
            </div>
          )}
        </section>

        <div className="px-readout">
          {!result ? (
            <section className="px-readout__error" role="alert">
              <h3>Corrija os parâmetros</h3>
              <p>As premissas precisam respeitar os limites descritos nos campos. Nenhum resultado será calculado enquanto houver valores inválidos.</p>
              {!parsed.success && (
                <ul>{parsed.error.issues.map((issue, i) => {
                  const f = fields.find(x => x.key === issue.path[0]);
                  return <li key={i}>{f ? `${f.label}: ${fieldInstruction(f)}` : "Revise os valores informados."}</li>;
                })}</ul>
              )}
            </section>
          ) : (
            <>
              <section aria-label="Horizontes de simulação" className="px-dials">
                {[result.last2031, result.last2036, result.last2041].map((row, i) => (
                  <div key={row.year} className={"px-dial" + (i === 0 ? " is-first" : "")}>
                    <p className="px-dial__year">Horizonte {row.year}</p>
                    <p className="px-dial__value"><TweenNumber value={row.active}/></p>
                    <p className="px-dial__unit">pessoas ativas simuladas</p>
                    <Waffle share={row.activeSharePct}/>
                    <p className="px-dial__meta">{pct(row.activeSharePct)} do grupo hipotético · {compact.format(row.started)} novas entradas no ano</p>
                  </div>
                ))}
              </section>
              <LabChart result={result}/>
              {result.last2036.annualIllustrativeCostBRL !== null && (
                <section className="px-cost" aria-label="Custo meramente hipotético em 2036">
                  <p className="px-cost__k">Custo meramente hipotético em 2036</p>
                  <p className="px-cost__v">{money.format(result.last2036.annualIllustrativeCostBRL)}</p>
                  <p className="px-cost__n">Ativos estimados × custo anual informado pelo usuário. Não representa orçamento público.</p>
                </section>
              )}
              <section className="px-ledger-card" aria-labelledby="scenario-table-title">
                <div className="px-ledger-card__head">
                  <div>
                    <p className="px-ledger-card__k">Reprodução e auditoria</p>
                    <h3 id="scenario-table-title">Tabela anual</h3>
                  </div>
                  <div className="px-ledger-card__actions">
                    <button type="button" className="at-btn at-btn--line px-btn" onClick={() => exportScenario("csv")}><span aria-hidden="true">↓</span> Exportar CSV</button>
                    <button type="button" className="at-btn at-btn--line px-btn" onClick={() => exportScenario("json")}><span aria-hidden="true">{"{ }"}</span> Exportar JSON</button>
                  </div>
                </div>
                <p className="px-feedback" role="status" aria-live="polite">{feedback}</p>
                <div className="px-table-wrap" tabIndex={0} role="region" aria-label="Tabela anual da simulação; use as setas para rolar horizontalmente">
                  <table className="at-table px-annual">
                    <caption className="sr-only">Simulação anual editável de 2026 a 2041</caption>
                    <thead><tr>{["Ano", "Grupo ref.", "Continuaram", "Iniciaram", "Saíram", "Ativos", "% ativos"].map(l => <th scope="col" key={l}>{l}</th>)}</tr></thead>
                    <tbody>
                      {result.rows.map(row => (
                        <tr key={row.year} className={[2031, 2036, 2041].includes(row.year) ? "is-horizon" : ""}>
                          <th scope="row">{row.year}</th>
                          {[row.referencePopulation, row.continued, row.started, row.exited, row.active].map((n, i) => <td key={i}>{compact.format(n)}</td>)}
                          <td>{pct(row.activeSharePct)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="px-swipe">Deslize a tabela para visualizar todas as colunas.</p>
              </section>
              <section className="px-warnings" aria-labelledby="scenario-warnings">
                <h3 id="scenario-warnings">O que os resultados não significam</h3>
                <ul>{result.warnings.map(t => <li key={t}>{t}</li>)}</ul>
              </section>
            </>
          )}
        </div>
      </div>

      <section className="px-sources" aria-labelledby="scenario-sources">
        <h3 id="scenario-sources">Fontes PubMed e limites do modelo</h3>
        <p>Estes estudos ajudam a discutir uso, acesso e interrupção. <strong>Não fornecem automaticamente as taxas de entrada ou continuidade do simulador.</strong></p>
        <ul className="px-sources__list">
          {sources.map(s => (
            <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.name}<span className="px-sources__go">Consultar documento <span aria-hidden="true">↗</span></span></a></li>
          ))}
        </ul>
        <p className="px-sources__foot">Este modelo não transforma ensaios clínicos em estatísticas nacionais. Consulte também a <Link className="at-link" href="/metodologia">metodologia completa</Link>.</p>
      </section>
    </div>
  );
}

function Spark({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const d = values.map((v, i) => `${i ? "L" : "M"}${(i / (values.length - 1) * 96 + 2).toFixed(1)},${(30 - v / max * 26).toFixed(1)}`).join(" ");
  return <svg className="px-preset__spark" viewBox="0 0 100 32" aria-hidden="true"><path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" strokeLinecap="round"/></svg>;
}

function Waffle({ share }: { share: number }) {
  const filled = Math.round(Math.max(0, Math.min(100, share)));
  return (
    <span className="px-waffle" aria-hidden="true">
      {Array.from({ length: 100 }, (_, i) => <i key={i} className={i < filled ? "is-on" : ""}/>)}
    </span>
  );
}

function LabChart({ result }: { result: ScenarioResult }) {
  const id = useId().replace(/:/g, "");
  const wrap = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [w, setW] = useState(760);
  useIso(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const rows = result.rows;
  const narrow = w < 560;
  const h = narrow ? 240 : 300;
  const m = { l: narrow ? 52 : 70, r: 18, t: 30, b: 40 };
  const max = Math.max(1, ...rows.map(r => r.active));
  const X = (i: number) => m.l + (w - m.l - m.r) * i / (rows.length - 1);
  const Y = (n: number) => h - m.b - (h - m.t - m.b) * n / max;
  const line = rows.map((r, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Y(r.active).toFixed(1)}`).join(" ");
  const area = `${line} L${X(rows.length - 1)},${h - m.b} L${X(0)},${h - m.b} Z`;
  const key = rows.map(r => r.active).join(",");

  useEffect(() => {
    const root = svg.current;
    if (!root || !motionAllowed()) return;
    const mask = root.querySelector<SVGPathElement>(".px-labchart__mask");
    const areaEl = root.querySelector(".px-labchart__area");
    if (!mask) return;
    const len = mask.getTotalLength() || 1;
    const tl = gsap.timeline();
    tl.fromTo(mask, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1, ease: "power2.inOut" });
    if (areaEl) tl.fromTo(areaEl, { opacity: 0 }, { opacity: 1, duration: .6 }, .3);
    return () => { tl.kill(); gsap.set([mask, areaEl].filter(Boolean), { clearProps: "all" }); };
  }, [key]);

  return (
    <figure className="px-labchart">
      <figcaption>
        <span className="px-labchart__k">Série anual calculada</span>
        <span className="px-labchart__t">Pessoas ativas no cenário</span>
        <span className="px-labchart__n">2026–2041 · curva ilustrativa, não previsão epidemiológica · grupo definido pelo usuário</span>
      </figcaption>
      <div ref={wrap} className="px-labchart__canvas">
        <svg ref={svg} width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img"
          aria-label={`Linha hipotética de pessoas ativas: 2026 ${compact.format(rows[0].active)}, 2031 ${compact.format(result.last2031.active)}, 2036 ${compact.format(result.last2036.active)}, 2041 ${compact.format(result.last2041.active)}`}>
          <defs>
            <linearGradient id={`${id}-g`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#1e5486" stopOpacity=".22"/>
              <stop offset="100%" stopColor="#1e5486" stopOpacity="0"/>
            </linearGradient>
            <mask id={`${id}-m`} maskUnits="userSpaceOnUse" x="0" y="0" width={w} height={h}>
              <path className="px-labchart__mask" d={line} fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
            </mask>
          </defs>
          {[0, .25, .5, .75, 1].map(f => (
            <g key={f}>
              <line x1={m.l} x2={w - m.r} y1={Y(max * f)} y2={Y(max * f)} stroke="rgba(14,42,74,.14)" strokeDasharray={f ? "2 6" : undefined}/>
              <text x={m.l - 10} y={Y(max * f) + 4} textAnchor="end" className="px-trace__tick">{compact.format(Math.round(max * f))}</text>
            </g>
          ))}
          <path className="px-labchart__area" d={area} fill={`url(#${id}-g)`}/>
          <path d={line} fill="none" stroke="#0e2a4a" strokeWidth="3" strokeDasharray="9 7" strokeLinecap="round" strokeLinejoin="round" mask={`url(#${id}-m)`}/>
          {rows.map((r, i) => (i % 5 === 0) ? (
            <g key={r.year}>
              <line x1={X(i)} x2={X(i)} y1={Y(r.active)} y2={h - m.b} stroke="#1e5486" strokeOpacity=".35" strokeDasharray="2 4"/>
              <circle cx={X(i)} cy={Y(r.active)} r="6" fill="#fff" stroke="#0e2a4a" strokeWidth="3"/>
              <text x={i === 0 ? X(i) + 12 : X(i)} y={Math.max(16, Y(r.active) - 14)} textAnchor={i === 0 ? "start" : i === rows.length - 1 ? "end" : "middle"} className="px-labchart__val">{compact.format(r.active)}</text>
            </g>
          ) : null)}
          {rows.map((r, i) => (i % 5 === 0) ? (
            <text key={"x" + r.year} x={X(i)} y={h - 14} textAnchor="middle" className="px-trace__tick">{r.year}</text>
          ) : null)}
        </svg>
      </div>
      <p className="px-labchart__foot">Os pontos são produzidos exclusivamente pelas taxas informadas. Não indicam redução de obesidade, internação, mortalidade ou efeitos do medicamento.</p>
    </figure>
  );
}
