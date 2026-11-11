"use client";
import Link from "next/link";
import {useState} from "react";
import {interpretClaim} from "@/features/interpretation/interpret-claim";
const quiz=[
 {claimId:"massa-magra-nao-equivale-a-musculos",question:"Cerca de 25% do peso perdido foi massa magra. Isso equivale a perder 25% dos músculos?",choices:["Sim, é a mesma coisa.","Não. Massa magra inclui outros tecidos; não mede força ou função.","Sempre significa sarcopenia."],correct:1},
 {claimId:"uti-mortalidade-nao-e-efeito-do-medicamento",question:"Estudos de massa muscular e UTI provam que tirzepatida causa mortalidade?",choices:["Sim, porque uma associação prova causa.","Não. Os estudos avaliaram populações e desfechos diferentes.","Sim, qualquer OR é um risco absoluto."],correct:1},
 {claimId:"cenario-2036-nao-e-previsao-sus",question:"O número de pessoas em tratamento calculado pelo laboratório de 2036 é uma previsão oficial para o SUS?",choices:["Sim, as premissas refletem dados oficiais.","Não, é um cenário fictício com hipóteses editáveis.","Sim, qualquer curva crescente é uma previsão."],correct:1},
] as const;
export function ChallengeExperience() {
 const [phase,setPhase]=useState<"pre"|"learn"|"post"|"done">("pre");
 const [answers,setAnswers]=useState<number[]>([]);
 const [postAnswers,setPostAnswers]=useState<number[]>([]);
 const [index,setIndex]=useState(0);
 const current=quiz[index];
 const score=(a:number[])=>a.filter((v,i)=>v===quiz[i].correct).length;
 const selection=phase==="pre"?answers:postAnswers;
 const selected=selection[index];
 const evidence=interpretClaim(current.claimId);
 const pick=(n:number)=>{
   if(phase==="pre")setAnswers(v=>{const a=[...v];a[index]=n;return a;});
   if(phase==="post")setPostAnswers(v=>{const a=[...v];a[index]=n;return a;});
 };
 const next=()=>{
  if(phase==="learn"){ if(index+1<quiz.length)setIndex(index+1);else{setIndex(0);setPhase("post");} return; }
  if(index+1<quiz.length){setIndex(index+1);if(phase==="pre")setPhase("pre");}
  else if(phase==="pre"){setIndex(0);setPhase("learn");}
  else setPhase("done");
 };
 const restart=()=>{setPhase("pre");setIndex(0);setAnswers([]);setPostAnswers([]);};
 return <div className="lx"><div className="lx-main"><header className="lx-head">
  <p className="lx-kicker">Laboratório de compreensão · sem cadastro</p><h1>Você sabe interpretar uma evidência?</h1>
  <p className="lx-lead">Responda três perguntas antes e depois de consultar explicações científicas. Os resultados ficam somente nesta página; não são enviados a servidores nem representam validação clínica.</p>
 </header>
 {phase==="done"?<section className="lx-panel" aria-labelledby="quiz-result"><h2 id="quiz-result">Seu resultado nesta sessão</h2>
  <div className="lx-kpis"><div className="lx-stat"><strong>{score(answers)} / 3</strong><span>Antes de aprender</span></div>
  <div className="lx-stat"><strong>{score(postAnswers)} / 3</strong><span>Depois de aprender</span></div>
  <div className="lx-stat"><strong>{score(postAnswers)-score(answers)>0?"+":""}{score(postAnswers)-score(answers)}</strong><span>Diferença em respostas corretas</span></div></div>
  <div className="lx-warning">Este é um exercício individual sem coleta e sem validação de resultados. Perguntas repetidas podem melhorar pontuações por familiaridade, não necessariamente por aprendizado duradouro.</div>
  <div className="lx-inline" style={{marginTop:20}}><button className="lx-button" onClick={restart}>Refazer o desafio</button><Link className="lx-button lx-button--line" href="/evidencias">Explorar estudos</Link></div>
 </section>:<div className="lx-cols">
  <section className="lx-panel" aria-labelledby="quiz-question">
   <p className="lx-kicker">{phase==="pre"?"01 · O que você sabe?":phase==="learn"?"02 · Investigue a evidência":"03 · Nova rodada"} · pergunta {index+1} de {quiz.length}</p>
   <div className="lx-progress" aria-hidden="true"><div style={{width:((index+1)/quiz.length*100)+"%"}}/></div>
   <h2 id="quiz-question">{current.question}</h2>
   {phase==="learn"?<><p><strong>Interpretação permitida:</strong> {evidence?.allowedConclusion}</p><p><strong>Por quê?</strong> {evidence?.explanation}</p>
     <div className="lx-warning"><strong>Não é permitido concluir:</strong> {evidence?.prohibitedExtrapolations[0]}</div>
     <p className="lx-muted">Situação da curadoria: {evidence?.reviewStatusLabel}</p>
     {evidence?.evidence.map(e=><p key={e.id}><Link href={e.passportHref}>Consultar fonte {e.id}: {e.title} →</Link></p>)}
    </>:<div className="lx-list" role="group" aria-label="Alternativas">{current.choices.map((choice,i)=><button key={choice} type="button" aria-pressed={selected===i} className="lx-choice" onClick={()=>pick(i)}>{String.fromCharCode(65+i)}. {choice}</button>)}</div>}
   <div className="lx-inline" style={{marginTop:22}}><button type="button" className="lx-button" disabled={phase!=="learn"&&selected===undefined} onClick={next}>{phase==="learn"?"Próxima explicação":index===quiz.length-1?"Concluir etapa":"Próxima pergunta"} →</button></div>
  </section>
  <aside className="lx-panel lx-ink"><h2>O desafio não é acertar por sorte.</h2><p>O objetivo é aprender a distinguir resultado observado, hipótese e extrapolação não sustentada.</p><p className="lx-muted">As perguntas do LUPA não oferecem conselho médico e não pedem informações sensíveis.</p></aside>
 </div>}</div></div>;
}
