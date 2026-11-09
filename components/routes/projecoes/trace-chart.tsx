"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { motionAllowed } from "@/components/atlas/motion";
import type { TraceSeries } from "./data";

const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;
const nf = (n: number, unit: string) => n.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + unit;

/**
 * Gráfico de linha do atlas: o traço se desenha a cada troca de série; os pontos são
 * selecionáveis com o mouse e, para teclado e toque, pelos botões em `.chart-point-buttons`.
 * `gapFrom` reserva o fim do eixo para a lacuna (horizontes sem série nacional): nunca zero.
 */
export function TraceChart({ series, max, unit = "%", caption, xLabels, selected, onSelect, gap, summary }: {
  series: readonly TraceSeries[]; max: number; unit?: string; caption: string;
  xLabels: readonly { label: string; x: number }[]; selected: string; onSelect: (s: number, p: number) => void;
  gap?: { from: number; title: string; note: readonly string[] }; summary: string;
}) {
  const id = useId().replace(/:/g, "");
  const wrap = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [w, setW] = useState(720);

  useIso(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const narrow = w < 560;
  const h = narrow ? 280 : 360;
  const m = { l: narrow ? 40 : 52, r: 14, t: 28, b: 46 };
  const plotW = w - m.l - m.r;
  const zoneW = gap ? plotW * gap.from : plotW;
  const inset = Math.min(56, zoneW * .14);
  const X = (f: number) => m.l + inset + f * (zoneW - inset * 2);
  const Y = (v: number) => m.t + (1 - v / max) * (h - m.t - m.b);
  const gapLines = gap ? (plotW - zoneW < 210 ? ["Lacuna:", "sem série"] : gap.note) : [];
  const seriesKey = series.map(s => s.label + s.points.map(p => p.value).join(",")).join("|");

  // Desenho do traço: máscara com dash animado (funciona para linha cheia e tracejada).
  useEffect(() => {
    const root = svg.current;
    if (!root || !motionAllowed()) return;
    const masks = Array.from(root.querySelectorAll<SVGPathElement>(".px-trace__mask"));
    const dots = root.querySelectorAll(".px-trace__dot, .px-trace__ci");
    const tl = gsap.timeline();
    masks.forEach((p, i) => {
      const len = p.getTotalLength() || 1;
      tl.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.15, ease: "power2.inOut" }, i * .18);
    });
    if (dots.length) tl.from(dots, { opacity: 0, scale: .3, transformOrigin: "center", duration: .45, stagger: .06, ease: "back.out(2)" }, .35);
    return () => { tl.kill(); gsap.set([...masks, ...Array.from(dots)], { clearProps: "all" }); };
  }, [seriesKey]);

  const ticks = [0, .25, .5, .75, 1];
  return (
    <figure className="px-trace">
      <figcaption className="px-trace__cap" id={`${id}-cap`}>{caption}</figcaption>
      <div ref={wrap} className="px-trace__canvas">
        <svg ref={svg} width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-labelledby={`${id}-cap ${id}-sum`}>
          <desc id={`${id}-sum`}>{summary}</desc>
          <defs>
            <pattern id={`${id}-hatch`} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="9" stroke="#8a5a15" strokeWidth="1.4" strokeOpacity=".35"/>
            </pattern>
            {series.map((s, si) => (
              <mask id={`${id}-m${si}`} key={s.label} maskUnits="userSpaceOnUse" x="0" y="0" width={w} height={h}>
                <path className="px-trace__mask" d={pathFor(s, X, Y)} fill="none" stroke="#fff" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
              </mask>
            ))}
          </defs>
          {ticks.map(f => (
            <g key={f}>
              <line x1={m.l} x2={w - m.r} y1={Y(f * max)} y2={Y(f * max)} stroke="rgba(14,42,74,.14)" strokeDasharray={f ? "2 6" : undefined}/>
              <text x={m.l - 10} y={Y(f * max) + 4} textAnchor="end" className="px-trace__tick">{nf(f * max, unit)}</text>
            </g>
          ))}
          {gap && (
            <g className="px-trace__gap">
              <rect x={m.l + zoneW} y={m.t - 12} width={plotW - zoneW} height={h - m.t - m.b + 12} fill={`url(#${id}-hatch)`}/>
              <line x1={m.l + zoneW} x2={m.l + zoneW} y1={m.t - 12} y2={h - m.b} stroke="#8a5a15" strokeDasharray="4 5"/>
              <rect x={m.l + zoneW + 10} y={m.t + 4} width={Math.min(plotW - zoneW - 20, 190)} height={34 + gapLines.length * 18} rx="3" fill="#fffaf2" stroke="#8a5a15" strokeOpacity=".5"/>
              <text x={m.l + zoneW + 20} y={m.t + 26} className="px-trace__gap-t" style={narrow ? { fontSize: 13 } : undefined}>{gap.title}</text>
              {gapLines.map((line, i) => <text key={line} x={m.l + zoneW + 20} y={m.t + 46 + i * 18} className="px-trace__gap-n">{line}</text>)}
            </g>
          )}
          {xLabels.map(l => <text key={l.label} x={X(l.x)} y={h - 16} textAnchor="middle" className="px-trace__tick">{l.label}</text>)}
          {series.map((s, si) => (
            <g key={s.label} className={`px-trace__s px-trace__s--${si}`}>
              {s.points.length > 1 && (
                <path d={pathFor(s, X, Y)} fill="none" stroke="currentColor" strokeWidth={s.dashed ? 3 : 2} strokeLinecap="round" strokeLinejoin="round"
                  strokeOpacity={s.dashed ? undefined : .55} strokeDasharray={s.dashed ? "8 8" : "1 7"} mask={`url(#${id}-m${si})`}/>
              )}
              {s.points.map((p, pi) => {
                const on = selected === `${si}-${pi}`;
                return (
                  <g key={p.label} className={"px-trace__pt" + (on ? " is-on" : "")} onClick={() => onSelect(si, pi)}>
                    {p.low !== undefined && p.high !== undefined && (
                      <g className="px-trace__ci" stroke="currentColor" strokeWidth="2">
                        <line x1={X(p.x)} x2={X(p.x)} y1={Y(p.low)} y2={Y(p.high)}/>
                        <line x1={X(p.x) - 9} x2={X(p.x) + 9} y1={Y(p.low)} y2={Y(p.low)}/>
                        <line x1={X(p.x) - 9} x2={X(p.x) + 9} y1={Y(p.high)} y2={Y(p.high)}/>
                      </g>
                    )}
                    <circle cx={X(p.x)} cy={Y(p.value)} r="24" fill="transparent"/>
                    {on && <circle cx={X(p.x)} cy={Y(p.value)} r="15" className="px-trace__halo"/>}
                    <circle className="px-trace__dot" cx={X(p.x)} cy={Y(p.value)} r={on ? 8 : 6} fill="#fff" stroke="currentColor" strokeWidth="3"/>
                    {on && <text x={X(p.x) + 16} y={Y(p.value) - 12} textAnchor="start" className="px-trace__val">{nf(p.value, unit)}</text>}
                  </g>
                );
              })}
            </g>
          ))}
        </svg>
      </div>
      <ul className="px-trace__legend">
        {series.map((s, i) => <li key={s.label} className={`px-trace__s--${i}`}><i className={s.dashed ? "is-dashed" : "is-dot"} aria-hidden="true"/>{s.label}{s.dashed ? " · hipótese (modelo)" : " · observado"}</li>)}
        {series.some(s => !s.dashed && s.points.length > 1) && (
          <li className="px-trace__legend-link"><i className="is-dotted" aria-hidden="true"/>Pontilhado entre observações: ligação ilustrativa, sem medições intermediárias</li>
        )}
        {gap && <li className="px-trace__legend-gap"><i aria-hidden="true"/>Dados insuficientes · lacuna: sem valor sustentado, não é zero</li>}
      </ul>
      <p className="px-trace__hint">Toque em um ponto do gráfico ou use os botões abaixo para entender o número.</p>
      <div className="chart-point-buttons px-points">
        {series.flatMap((s, si) => s.points.map((p, pi) => (
          <button key={`${si}-${pi}`} type="button" aria-pressed={selected === `${si}-${pi}`} onClick={() => onSelect(si, pi)}>
            <span>{s.label} · {p.label}</span>{" "}
            <strong>{nf(p.value, unit)}</strong>
          </button>
        )))}
      </div>
    </figure>
  );
}

function pathFor(s: TraceSeries, X: (f: number) => number, Y: (v: number) => number) {
  return s.points.map((p, i) => `${i ? "L" : "M"}${X(p.x).toFixed(1)},${Y(p.value).toFixed(1)}`).join(" ");
}
