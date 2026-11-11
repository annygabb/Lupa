"use client";
import {useMemo,useState} from "react";
import Link from "next/link";
import {SCENARIO_PRESETS,runScenario,type ScenarioInput} from "@/features/scenarios/engine";
const int=new Intl.NumberFormat("pt-BR",{maximumFractionDigits:0});
const money=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0});
function ScenarioControls({label,input,onChange}:{label:string,input:ScenarioInput,onChange:(i:ScenarioInput)=>void}){
 const numeric=(key:keyof ScenarioInput,value:number)=>onChange({...input,[key]:value});
 return <section className="lx-panel" aria-label={label}><h2>{label}</h2>
  <label className="lx-field">Pessoas no grupo fictício<input type="number" min={1000} max={100000000} step={1000} value={input.populationBase} onChange={e=>numeric("populationBase",Number(e.target.value))}/></label>
  <label className="lx-field">Início anual hipotético (%): {input.annualStartPct}<input type="range" min={0} max={30} step={0.5} value={input.annualStartPct} onChange={e=>numeric("annualStartPct",Number(e.target.value))}/></label>
  <label className="lx-field">Continuidade anual (%): {input.annualRetentionPct}<input type="range" min={0} max={100} step={1} value={input.annualRetentionPct} onChange={e=>numeric("annualRetentionPct",Number(e.target.value))}/></label>
  <label className="lx-field">Aumento do início por ano (p.p.): {input.annualAccessIncreasePp}<input type="range" min={0} max={5} step={0.1} value={input.annualAccessIncreasePp} onChange={e=>numeric("annualAccessIncreasePp",Number(e.target.value))}/></label>
  <label className="lx-field">Custo anual hipotético por pessoa (R$)<input type="number" min={0} max={150000} step={100} value={input.costPerActivePersonBRL} onChange={e=>numeric("costPerActivePersonBRL",Number(e.target.value))}/></label>
 </section>;
}
export function ImpactExperience(){
 const [a,setA]=useState<ScenarioInput>({...SCENARIO_PRESETS.conservador.input});
 const [b,setB]=useState<ScenarioInput>({...SCENARIO_PRESETS.expansao.input});
 const [year,setYear]=useState(2036);
 const ra=useMemo(()=>{try{return runScenario(a)}catch{return null}},[a]);
 const rb=useMemo(()=>{try{return runScenario(b)}catch{return null}},[b]);
 const rowA=ra?.rows.find(r=>r.year===year), rowB=rb?.rows.find(r=>r.year===year);
 const max=Math.max(1,...(ra?.rows.map(r=>r.active)??[]),...(rb?.rows.map(r=>r.active)??[]));
 const c=(x:number|null|undefined)=>x==null?"Não informado":money.format(x);
 return <div className="lx"><div className="lx-main"><header className="lx-head">
  <p className="lx-kicker">Laboratório · lupa-flow-v2</p><h1>Duas hipóteses. Dois futuros possíveis no modelo.</h1>
  <p className="lx-lead">Altere as taxas e compare o efeito matemático sobre um grupo fictício. Não estimamos cobertura SUS, efeitos clínicos, mortalidade ou necessidades reais de tratamento.</p>
 </header><div className="lx-impact-controls">
  <ScenarioControls label="Cenário A · acesso restrito" input={a} onChange={setA}/><ScenarioControls label="Cenário B · acesso ampliado" input={b} onChange={setB}/>
 </div>
 {(!ra||!rb)?<div role="alert" className="lx-warning">Revise as entradas numéricas. População de 1.000 a 100 milhões; taxas e custos dentro dos limites do motor.</div>:
 <section className="lx-panel" aria-labelledby="impact-results" style={{marginTop:20}}>
  <h2 id="impact-results">Comparação explicável</h2>
  <label className="lx-field" style={{maxWidth:280}}>Horizonte <select value={year} onChange={e=>setYear(Number(e.target.value))}><option value={2031}>2031</option><option value={2036}>2036</option><option value={2041}>2041</option></select></label>
  <div className="lx-kpis"><div className="lx-stat"><strong>{int.format(rowA?.active??0)}</strong><span>Em tratamento: A</span></div><div className="lx-stat"><strong>{int.format(rowB?.active??0)}</strong><span>Em tratamento: B</span></div><div className="lx-stat"><strong>{int.format((rowB?.active??0)-(rowA?.active??0))}</strong><span>Diferença B − A</span></div></div>
  <div role="img" aria-label={"Em "+year+", cenário A: "+int.format(rowA?.active??0)+" pessoas; cenário B: "+int.format(rowB?.active??0)+" pessoas."}>
   <p>A · {int.format(rowA?.active??0)}</p><div className="lx-bar"><span style={{width:((rowA?.active??0)/max*100)+"%"}}/></div>
   <p>B · {int.format(rowB?.active??0)}</p><div className="lx-bar"><span style={{width:((rowB?.active??0)/max*100)+"%",background:"#69b5d8"}}/></div>
  </div>
  <div className="lx-table-wrap"><table className="lx-table"><caption>Comparação de saídas do mesmo modelo determinístico</caption><thead><tr><th>Métrica em {year}</th><th>Cenário A</th><th>Cenário B</th></tr></thead><tbody>
   <tr><th>Iniciaram naquele ano</th><td>{int.format(rowA?.started??0)}</td><td>{int.format(rowB?.started??0)}</td></tr>
   <tr><th>Continuaram</th><td>{int.format(rowA?.continued??0)}</td><td>{int.format(rowB?.continued??0)}</td></tr>
   <tr><th>Saíram</th><td>{int.format(rowA?.exited??0)}</td><td>{int.format(rowB?.exited??0)}</td></tr>
   <tr><th>Custo anual ilustrativo</th><td>{c(rowA?.annualIllustrativeCostBRL)}</td><td>{c(rowB?.annualIllustrativeCostBRL)}</td></tr>
  </tbody></table></div>
  <div className="lx-warning"><strong>Interpretação limitada:</strong> diferença de custo não representa economia terapêutica nem impacto orçamentário oficial. Cada cenário possui premissas independentes e pode ter uma população-base diferente. Os números descrevem o modelo, não o Brasil.</div>
  <div className="lx-inline" style={{marginTop:18}}><Link className="lx-button" href="/projecoes#laboratorio">Ver laboratório detalhado</Link><button className="lx-button lx-button--line" type="button" onClick={()=>{setA({...SCENARIO_PRESETS.conservador.input});setB({...SCENARIO_PRESETS.expansao.input});}}>Restaurar cenários</button></div>
 </section>}</div></div>;
}
