"use client";

import { useState } from "react";
import {
  SENSITIVITY_HORIZONS, type SensitivityField, type SensitivityOutput, type SensitivityResult,
} from "@/features/scenarios/sensitivity";

const compact = new Intl.NumberFormat("pt-BR");
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const signed = (n: number, fmt: (v: number) => string) => (n > 0 ? "+" : n < 0 ? "−" : "±") + fmt(Math.abs(n));
const pct1 = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%";

/** Premissas oferecidas na interface e os passos testados ao redor do valor atual. */
export const sensitivityOptions = [
  { field: "annualRetentionPct", label: "Continuidade anual", unit: "%", offsets: [-20, -10, 10, 20] },
  { field: "annualStartPct", label: "Início anual", unit: "%", offsets: [-2, -1, 1, 2] },
  { field: "annualAccessIncreasePp", label: "Aumento anual do início", unit: " p.p.", offsets: [-.2, -.1, .1, .2] },
  { field: "initialActivePct", label: "Em tratamento em 2026", unit: "%", offsets: [-1, -.5, .5, 1] },
] as const satisfies ReadonlyArray<{ field: SensitivityField; label: string; unit: string; offsets: readonly number[] }>;

const metrics: readonly { key: SensitivityOutput; label: string }[] = [
  { key: "active", label: "Pessoas ativas" },
  { key: "started", label: "Iniciaram no ano" },
  { key: "continued", label: "Continuaram" },
  { key: "exited", label: "Saíram" },
  { key: "annualIllustrativeCostBRL", label: "Custo hipotético anual" },
];

/** Bloco "Análise de sensibilidade": uma premissa por vez, demais constantes. */
export function SensitivityPanel({ field, onField, result }: {
  field: SensitivityField | null; onField: (f: SensitivityField | null) => void; result: SensitivityResult | null;
}) {
  const [metric, setMetric] = useState<SensitivityOutput>("active");
  const option = sensitivityOptions.find(o => o.field === field);
  const metricLabel = metrics.find(m => m.key === metric)!.label;
  const isCost = metric === "annualIllustrativeCostBRL";
  const fmt = (v: number) => isCost ? money.format(v) : compact.format(v);
  const fmtField = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + (option?.unit ?? "");
  const max = Math.max(1, ...(result?.points ?? []).flatMap(p => SENSITIVITY_HORIZONS.map(y => p.horizons[y][metric].value ?? 0)));

  return (
    <section className="px-sens" aria-labelledby="scenario-sensitivity-title">
      <p className="px-ledger-card__k">Uma premissa por vez</p>
      <h3 id="scenario-sensitivity-title">Análise de sensibilidade</h3>
      <p className="px-sens__lead">
        <strong>Varia uma premissa por vez; as demais ficam constantes.</strong> Cada linha recalcula o mesmo modelo hipotético (lupa-flow-v2) com um único valor alterado. É o comportamento do <strong>modelo</strong>, não um efeito clínico, uma previsão ou um intervalo de confiança.
      </p>
      <div className="px-sens__controls">
        <div className="px-sens__chips" role="group" aria-label="Premissa para variar">
          {sensitivityOptions.map(o => (
            <button key={o.field} type="button" data-early-click className="at-chip" aria-pressed={field === o.field}
              onClick={() => onField(field === o.field ? null : o.field)}>{o.label}</button>
          ))}
        </div>
        {result && (
          <label className="px-select" htmlFor="sensitivity-metric">
            <span>Saída do modelo</span>
            <select id="sensitivity-metric" className="at-select" value={metric} onChange={e => setMetric(e.target.value as SensitivityOutput)}>
              {metrics.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
          </label>
        )}
      </div>

      {!result || !option ? (
        <p className="px-sens__empty">Escolha uma premissa para ver como o resultado de 2031, 2036 e 2041 muda quando só ela varia.</p>
      ) : (
        <>
          <div className="px-table-wrap" tabIndex={0} role="region" aria-label="Tabela da análise de sensibilidade; use as setas para rolar horizontalmente">
            <table className="at-table px-sens__table">
              <caption className="sr-only">
                {`${metricLabel} em 2031, 2036 e 2041 para valores de ${option.label.toLowerCase()}; as demais premissas ficam constantes. Diferenças em relação ao valor atual (${fmtField(result.baselineValue)}). Resultado do modelo hipotético, não efeito clínico.`}
              </caption>
              <thead>
                <tr>
                  <th scope="col">{option.label}</th>
                  {SENSITIVITY_HORIZONS.map(y => <th scope="col" key={y}>{y}</th>)}
                </tr>
              </thead>
              <tbody>
                {result.points.map(p => (
                  <tr key={p.value} className={p.isBaseline ? "is-base" : ""}>
                    <th scope="row">{fmtField(p.value)}{p.isBaseline && <span className="px-sens__base"> · atual</span>}</th>
                    {SENSITIVITY_HORIZONS.map(y => {
                      const m = p.horizons[y][metric];
                      if (m.value === null) return <td key={y} className="is-missing">Custo não informado</td>;
                      return (
                        <td key={y}>
                          <span className="px-sens__v">{fmt(m.value)}</span>
                          <span className="px-sens__bar" aria-hidden="true"><i style={{ width: `${Math.max(0, Math.min(100, 100 * m.value / max))}%` }}/></span>
                          <span className="px-sens__d">
                            {p.isBaseline ? "valor-base"
                              : m.deltaAbs === null ? "sem comparação"
                              : `${signed(m.deltaAbs, fmt)}${m.deltaPct === null ? "" : ` (${signed(m.deltaPct, pct1)})`}`}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="px-swipe">Deslize a tabela para visualizar todos os horizontes.</p>
          <p className="px-sens__foot">
            Valores testados: atual {fmtField(result.baselineValue)} e passos ao redor dele, dentro dos limites do simulador. Diferenças contra a linha “atual”. {isCost && result.points.every(p => p.horizons[2031][metric].value === null) ? "O custo só aparece quando um custo anual hipotético por pessoa é informado. " : ""}A análise entra nas exportações CSV e JSON.
          </p>
        </>
      )}
    </section>
  );
}
