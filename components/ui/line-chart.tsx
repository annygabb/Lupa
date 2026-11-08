"use client";
import { useId } from "react";
export type ChartPoint={label:string;value:number;x:number;note?:string;low?:number;high?:number};
export type ChartSeries={label:string;points:readonly ChartPoint[];dashed?:boolean};
/** Adapted to the supplied line-chart reference: no smoothed or fabricated observations. */
export function LineChart({series,max=100,unit="%",label,selected,onSelect,xLabels}:{series:readonly ChartSeries[];max?:number;unit?:string;label:string;selected?:string;onSelect:(series:number,point:number)=>void;xLabels:readonly string[]}){
 const id=useId(); const x=(v:number)=>52+v*620; const y=(v:number)=>248-v/max*212;
 return <figure className="interactive-line-chart"><figcaption id={id}>{label}</figcaption><p className="mobile-line-scale">Escala vertical: 0 a {max.toLocaleString("pt-BR")}{unit}</p><div className="line-chart-canvas"><svg viewBox="0 0 720 300" aria-labelledby={id} role="group">
 {[0,.25,.5,.75,1].map(f=><g key={f}><line x1="52" x2="672" y1={y(f*max)} y2={y(f*max)} stroke="var(--line)" strokeDasharray="3 5"/><text x="40" y={y(f*max)+5} textAnchor="end" fill="var(--secondary)" fontSize="13">{Math.round(f*max)}{unit}</text></g>)}
 {xLabels.map((l,i)=><text key={l} x={x(xLabels.length===1?.5:i/(xLabels.length-1))} y="282" textAnchor="middle" fill="var(--secondary)" fontSize="13">{l}</text>)}
 {series.map((s,si)=><g key={s.label} className={`line-series line-series-${si}`}>
 {s.points.length>1&&<path d={s.points.map((p,i)=>`${i?"L":"M"}${x(p.x)},${y(p.value)}`).join(" ")} fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={s.dashed?"7 7":undefined} onClick={()=>onSelect(si,s.points.length-1)}/>}
 {s.points.map((p,pi)=><g key={p.label}>
 {p.low!==undefined&&p.high!==undefined&&<g stroke="currentColor" strokeWidth="2"><line x1={x(p.x)} x2={x(p.x)} y1={y(p.low)} y2={y(p.high)}/><line x1={x(p.x)-8} x2={x(p.x)+8} y1={y(p.low)} y2={y(p.low)}/><line x1={x(p.x)-8} x2={x(p.x)+8} y1={y(p.high)} y2={y(p.high)}/></g>}
 <g role="button" tabIndex={0} aria-label={`${s.label} · ${p.label} : ${p.value.toLocaleString("pt-BR")}${unit}. Ver detalhes`} aria-pressed={selected===`${si}-${pi}`} onClick={()=>onSelect(si,pi)} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();onSelect(si,pi)}}} className="chart-point"><circle cx={x(p.x)} cy={y(p.value)} r="22" fill="transparent"/><circle cx={x(p.x)} cy={y(p.value)} r={selected===`${si}-${pi}`?8:5} fill="var(--paper)" stroke="currentColor" strokeWidth="3"/></g></g>)}
 </g>)}
 </svg></div><div className="mobile-line-labels">{xLabels.map(l=><span key={l}>{l}</span>)}</div><div className="chart-legend">{series.map((s,i)=><span key={s.label} className={`line-series-${i}`}><i className={s.dashed?"is-dashed":""}/>{s.label}{s.dashed?" · hipótese":""}</span>)}</div><p className="chart-hint">Toque em um ponto para entender o número. Também disponível pelos botões abaixo.</p><div className="chart-point-buttons">{series.flatMap((s,si)=>s.points.map((p,pi)=><button key={`${si}-${pi}`} type="button" aria-pressed={selected===`${si}-${pi}`} onClick={()=>onSelect(si,pi)}>{s.label} · {p.label}<strong>{p.value.toLocaleString("pt-BR",{maximumFractionDigits:1})}{unit}</strong></button>))}</div></figure>
}
