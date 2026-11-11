"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import type {LiveSnapshot} from "@/lib/live/db";
const labels={pre:"Primeira pergunta",reveal:"Evidência em discussão",post:"Segunda rodada",closed:"Sessão encerrada"};
export function LiveParticipant({code}:{code:string}){
 const [data,setData]=useState<LiveSnapshot|null>(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 const [submitted,setSubmitted]=useState<"pre"|"post"|null>(null);
 const [chosen,setChosen]=useState<{phase:"pre"|"post";option:number}|null>(null);
 useEffect(()=>{
  let active=true;
  const load=async()=>{
   try{
    const response=await fetch("/api/live/"+code,{cache:"no-store"});
    if(!response.ok)throw new Error(response.status===503?"Este ambiente ainda não possui banco LUPA Live.":"Sessão não encontrada ou indisponível.");
    const value=await response.json() as LiveSnapshot;
    if(active){setData(value);setError("");}
   }catch(e){if(active)setError(e instanceof Error?e.message:"Falha ao carregar sessão.");}
   finally{if(active)setLoading(false);}
  };
  void load(); const timer=setInterval(()=>void load(),5000);
  return()=>{active=false;clearInterval(timer);};
 },[code]);
 const vote=async()=>{
  if(!data||chosen===null||chosen.phase!==data.phase||!["pre","post"].includes(data.phase)||busy)return;
  setBusy(true);setError("");
  try{
   const response=await fetch("/api/live/"+code+"/vote",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phase:data.phase,optionIndex:chosen.option})});
   const result=await response.json() as {accepted?:boolean;reason?:string;error?:string};
   if(!response.ok){
    if(result.reason==="ALREADY_VOTED")throw new Error("Esta sessão já registrou um voto seu nesta rodada.");
    if(response.status===409)throw new Error("A rodada terminou ou já existe um voto nesta sessão.");
    throw new Error(response.status===429?"Muitas tentativas. Aguarde e tente novamente.":"Não foi possível registrar a resposta.");
   }
   if(result.accepted)setSubmitted(data.phase as "pre"|"post");
  }catch(e){setError(e instanceof Error?e.message:"Erro inesperado.");}
  finally{setBusy(false);}
 };
 const phase=data?.phase??"pre";
 const voted=phase===submitted;
 return <div className="lx"><div className="lx-main"><header className="lx-head"><p className="lx-kicker">LUPA Live · código {code}</p><h1>{data?.title??"Investigação coletiva"}</h1><p className="lx-lead">{loading?"Conectando à sessão…":data?labels[phase]:"Digite um código de evento válido."}</p></header>
 <div className="lx-cols"><section className="lx-panel">
  {error&&<div role="alert" className="lx-warning">{error}</div>}
  {!data?<><p>{loading?"Carregando...":"Não há sessão disponível neste endereço."}</p><Link href="/live">Voltar à entrada</Link></>:<>
   <p className="lx-kicker">Fase: {labels[phase]}</p><h2>{data.question}</h2>
   {(phase==="pre"||phase==="post")?<><div className="lx-list" role="group" aria-label="Alternativas da votação">
    {data.choices.map((choice,i)=><button key={i} type="button" className="lx-choice" aria-pressed={chosen?.phase===phase&&chosen.option===i} disabled={voted||busy} onClick={()=>setChosen({phase:data.phase as "pre"|"post",option:i})}>{String.fromCharCode(65+i)}. {choice}</button>)}
   </div><p style={{marginTop:18}}><button className="lx-button" type="button" onClick={vote} disabled={voted||busy||chosen===null||chosen.phase!==phase}>{busy?"Registrando…":voted?"Resposta registrada":"Enviar resposta"}</button></p>
   {voted&&<p role="status" className="lx-science">Seu voto foi registrado para esta rodada. Os resultados são agregados.</p>}</>:
   <div className="lx-science"><p>{phase==="reveal"?"O organizador está apresentando a evidência. Aguarde a segunda rodada.":"A sessão foi encerrada. Obrigada pela participação."}</p></div>}
   <p className="lx-muted">Não pedimos seu nome, idade ou dados de saúde. Uma sessão anônima temporária impede votação duplicada por rodada no mesmo navegador; não identifica pessoas.</p>
  </>}
 </section><aside className="lx-panel lx-ink"><h2>Privacidade primeiro</h2><p>O servidor armazena apenas votos por sessão pseudônima, nunca respostas ligadas a perfis de pacientes.</p><p>Resultados de uma plateia não comprovam aprendizado clínico nem validade científica.</p><Link className="lx-button" href="/evidencias" style={{background:"#fff",color:"#0e2a4a"}}>Explorar as fontes</Link></aside>
 </div></div></div>;
}
