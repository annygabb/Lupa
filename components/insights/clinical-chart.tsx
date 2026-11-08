"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { clinicalPlots, type ClinicalPlot } from "@/features/insights/evidence";

const number=(n:number)=>n.toLocaleString("pt-BR",{minimumFractionDigits:1,maximumFractionDigits:1});

export function EvidenceBars({plot}:{plot:ClinicalPlot}) {
  const min=Math.min(0,...plot.arms.map(a=>a.value));
  const max=Math.max(0,...plot.arms.map(a=>a.value));
  const low=min<0?Math.floor(min/5)*5:0;
  const high=max>0?Math.ceil(max/5)*5:0;
  const x=(value:number)=>40+(value-low)/(high-low||1)*560;
  return <figure className="evidence-figure">
    <figcaption>{plot.axisLabel}</figcaption>
    <svg viewBox="0 0 660 268" role="img" aria-label={plot.arms.map(a=>`${a.label}: ${number(a.value)} ${plot.unit}`).join("; ")}>
      {[0,1,2,3,4].map(i=>{
        const value=low+(high-low)*i/4;
        return <g key={i}><line x1={x(value)} x2={x(value)} y1="16" y2="224" stroke="#dde4e0" strokeDasharray="3 5"/>
          <text x={x(value)} y="250" textAnchor="middle" fill="#53645c" fontSize="14">{number(value)}%</text></g>;
      })}
      <line x1={x(0)} x2={x(0)} y1="16" y2="224" stroke="#74857c"/>
      {plot.arms.map((arm,i)=>{
        const y=46+i*100;
        return <g key={arm.label}>
          <text x="40" y={y-12} fill="#233c30" fontSize="16">{arm.label}{arm.n?` · n = ${arm.n.toLocaleString("pt-BR")}`:""}</text>
          <rect x={Math.min(x(0),x(arm.value))} y={y} width={Math.abs(x(arm.value)-x(0))} height="36" rx="2" fill={i===0?"#28755a":"#bac8be"}/>
          <text x={arm.value<0?x(arm.value)+8:x(arm.value)-8} y={y+24} textAnchor={arm.value<0?"start":"end"} fill={i===0?"white":"#233c30"} fontSize="17" fontWeight="600">{arm.value>0&&min<0?"+":""}{number(arm.value)}%</text>
        </g>;
      })}
    </svg>
    <div className="mobile-evidence-bars" aria-hidden="true">
      {plot.arms.map((arm,i)=><div key={arm.label} className="mobile-evidence-row"><p>{arm.label}{arm.n?` · n = ${arm.n.toLocaleString("pt-BR")}`:""}<strong>{arm.value>0&&min<0?"+":""}{number(arm.value)}%</strong></p><div className="mobile-evidence-track"><span style={{left:`${(Math.min(0,arm.value)-low)/(high-low||1)*100}%`,width:`${Math.abs(arm.value)/(high-low||1)*100}%`,background:i===0?"#28755a":"#bac8be"}}/></div></div>)}
      <div className="mobile-chart-axis"><span>{number(low)}%</span><span>{number(high)}%</span></div>
    </div>
    <details className="chart-data"><summary>Ver valores em tabela</summary>
      <table><caption>{plot.title}</caption><thead><tr><th scope="col">Grupo</th><th scope="col">Resultado</th><th scope="col">N do braço</th></tr></thead><tbody>
        {plot.arms.map(a=><tr key={a.label}><th scope="row">{a.label}</th><td>{number(a.value)} {plot.unit}</td><td>{a.n??"Não informado no resumo"}</td></tr>)}
      </tbody></table>
    </details>
  </figure>;
}

export function ClinicalChart({initial="cardio",only}:{initial?:string;only?:readonly string[]}) {
  const options=only?clinicalPlots.filter(p=>only.includes(p.id)):clinicalPlots.filter(p=>p.id!=="icu");
  const [selected,setSelected]=useState(initial);
  const plot=options.find(p=>p.id===selected)??options[0];
  return <section className="clinical-chart" aria-label="Resultados medidos nos estudos">
    {options.length>1&&<div className="chart-tabs" role="group" aria-label="Escolher resultado científico">
      {options.map(p=><button type="button" key={p.id} aria-pressed={p.id===plot.id} onClick={()=>setSelected(p.id)}>{p.label}</button>)}
    </div>}
    <div className="chart-reading" aria-live="polite">
      <div className="chart-heading"><p className="eyebrow">{plot.design} · {plot.period}</p><h3>{plot.title}</h3></div>
      <EvidenceBars plot={plot}/>
      <div className="chart-interpretation"><div><h4>O que isso mostra</h4><p>{plot.finding}</p></div><div><h4>Onde a conclusão para</h4><p>{plot.limitation}</p></div></div>
      <details className="source-details"><summary>Quem foi estudado e de onde vem o número</summary><p>{plot.population}</p><p>{plot.locator}. Extração descritiva conferida em 07/11/2026; sem revisão clínica independente.</p></details>
      <a className="text-link" href={`https://pubmed.ncbi.nlm.nih.gov/${plot.pmid}/`} target="_blank" rel="noopener noreferrer">Ler fonte no PubMed · PMID {plot.pmid}<ArrowUpRight size={16} aria-hidden="true"/></a>
    </div>
  </section>;
}
