"use client";
import Link from "next/link";
import {useState} from "react";
import {evidenceLensClaims} from "@/features/interpretation/claims";
import {interpretClaim} from "@/features/interpretation/interpret-claim";
function download(content:string) {
 const blob=new Blob([content],{type:"text/markdown;charset=utf-8"});
 const url=URL.createObjectURL(blob); const a=document.createElement("a");a.href=url;a.download="dossie-lupa-educacional.md";a.click();URL.revokeObjectURL(url);
}
export function DossierExperience(){
 const [id,setId]=useState(evidenceLensClaims[0].id);
 const [feedback,setFeedback]=useState("");
 const current=interpretClaim(id);
 const exportMd=()=>{
  if(!current)return;
  const lines=[
   "# Dossiê LUPA — investigação educacional",
   "",
   "> Ferramenta informativa. Sem diagnóstico, previsão individual ou revisão clínica independente. Não substitui avaliação profissional.",
   "",
   "## Pergunta",
   current.question,
   "",
   "## Interpretação e conclusão permitida",
   current.allowedConclusion,
   "",
   "## Explicação",
   current.explanation,
   "",
   "## O que NÃO se pode concluir",
   ...current.prohibitedExtrapolations.map(v=>"- "+v),
   "",
   "## Fontes e fichas de evidência",
   ...current.evidence.map(e=>"- "+e.id+" — "+e.title+": "+e.url+" (ficha: https://lupaa.vercel.app"+e.passportHref+")"),
   "",
   "## Rastreabilidade",
   "- Motor: deterministic-curated",
   "- Revisão: "+current.reviewStatusLabel,
   "- Exportação: "+new Date().toISOString(),
   "- Nenhum dado de saúde foi coletado neste documento."
  ];
  download(lines.join("\n"));setFeedback("Dossiê preparado. Verifique os downloads do navegador.");
 };
 return <div className="lx"><div className="lx-main"><header className="lx-head">
  <p className="lx-kicker">Documento rastreável · exportação local</p><h1>Da pergunta à fonte. Sem atalhos científicos.</h1>
  <p className="lx-lead">Escolha uma investigação previamente curada. Gere um relatório educacional com conclusão permitida, extrapolações proibidas e links de origem.</p>
 </header><div className="lx-cols">
  <section className="lx-panel"><h2>Selecione a investigação</h2>
   <label className="lx-field">Pergunta em análise<select value={id} onChange={e=>{setId(e.target.value);setFeedback("");}}>{evidenceLensClaims.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label>
   <button type="button" className="lx-button" onClick={exportMd}>Exportar dossiê Markdown</button>
   {feedback&&<p role="status" className="lx-science">{feedback}</p>}
   <p className="lx-muted">A exportação ocorre no navegador; não solicitamos nome, peso, idade ou histórico de saúde.</p>
  </section>
  <section className="lx-panel" aria-label="Prévia do relatório"><h2>{current?.question}</h2>
   <h3>Conclusão permitida</h3><p>{current?.allowedConclusion}</p><h3>O que não se pode concluir</h3><ul>{current?.prohibitedExtrapolations.map(x=><li key={x}>{x}</li>)}</ul>
   <p className="lx-kicker">Fontes</p>
   {current?.evidence.map(e=><p key={e.id}><Link href={e.passportHref}>{e.id} · {e.title} →</Link></p>)}
   <div className="lx-warning">Status: {current?.reviewStatusLabel}. O dossiê documenta uma interpretação curada, não substitui uma revisão científica independente.</div>
  </section>
 </div></div></div>;
}
