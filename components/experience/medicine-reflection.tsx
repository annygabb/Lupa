"use client";
import { useState } from "react";
import Link from "next/link";

type Usage = "uso" | "usei" | "nao" | "nao-informar" | "";
type Known = "sim" | "nao" | "nao-informar" | "";
const usageOptions: {value: Usage, label:string}[] = [
  {value:"uso",label:"Sim, utilizo atualmente"},
  {value:"usei",label:"Já utilizei"},
  {value:"nao",label:"Não utilizo"},
  {value:"nao-informar",label:"Prefiro não responder"},
];
const knownOptions: {value: Known, label:string}[] = [
  {value:"sim",label:"Sim, conheço alguém"},
  {value:"nao",label:"Não conheço"},
  {value:"nao-informar",label:"Prefiro não responder"},
];
export function MedicineReflection() {
 const [usage,setUsage]=useState<Usage>("");
 const [medicine,setMedicine]=useState("");
 const [known,setKnown]=useState<Known>("");
 const [reported,setReported]=useState("");
 const [heard,setHeard]=useState("");
 const [open,setOpen]=useState(false);
 const clear=()=>{setUsage("");setMedicine("");setKnown("");setReported("");setHeard("");setOpen(false);};
 const changeUsage=(next:Usage)=>{setUsage(next);setReported("");setHeard("");setKnown("");setMedicine("");setOpen(false);};
 return <div className="lx"><div className="lx-main">
   <header className="lx-head">
    <p className="lx-kicker">Escuta responsável · reflexão voluntária</p>
    <h1>O que as pessoas percebem — e o que a ciência consegue comprovar?</h1>
    <p className="lx-lead">Este questionário permite registrar uma <strong>reflexão pessoal e opcional</strong> sobre medicamentos para emagrecimento, sem relacionar automaticamente sintomas ao medicamento.</p>
   </header>
   <div className="lx-cols">
    <section className="lx-panel" aria-labelledby="reflection-form">
      <h2 id="reflection-form">Questionário opcional</h2>
      <p className="lx-muted">Você pode pular qualquer pergunta. Não compartilhe nomes, dados de terceiros, diagnósticos, contato ou informações que permitam identificar uma pessoa.</p>
      <h3 className="lx-minor-heading" id="reflection-usage">Você utiliza atualmente algum medicamento para emagrecimento?</h3>
      <div className="lx-reflect-choice" role="group" aria-labelledby="reflection-usage">
        {usageOptions.map(o=><button key={o.value} type="button" aria-pressed={usage===o.value}
           onClick={()=>changeUsage(o.value)}>{o.label}</button>)}
      </div>
      {(usage==="uso"||usage==="usei")&&<>
        <label className="lx-field">Qual medicamento? (opcional)
          <select value={medicine} onChange={(e)=>{setMedicine(e.target.value);setOpen(false);}}>
            <option value="">Prefiro não informar</option>
            <option value="tirzepatida">Tirzepatida</option><option value="semaglutida">Semaglutida</option>
            <option value="outro">Outro / não sei informar</option>
          </select>
        </label>
        <label className="lx-field">Durante o período de uso, você percebeu algum sintoma ou possível efeito adverso? Descreva, se quiser.
          <textarea maxLength={350} value={reported} onChange={(e)=>{setReported(e.target.value);setOpen(false);}}
            placeholder="Ex.: percebi náusea e diminuição do apetite. Não escreva dados que identifiquem você."/>
        </label>
        <p className="lx-muted">Sintomas relatados não comprovam que o medicamento os causou. Questões persistentes ou preocupantes devem ser avaliadas com profissional de saúde.</p>
      </>}
      {usage==="nao"&&<>
        <h3 className="lx-minor-heading" id="reflection-knows">Você conhece alguém que utiliza ou utilizou esse tipo de medicamento?</h3>
        <div className="lx-reflect-choice" role="group" aria-labelledby="reflection-knows">
          {knownOptions.map(o=><button key={o.value} type="button" aria-pressed={known===o.value}
             onClick={()=>{setKnown(o.value);setHeard("");setOpen(false);}}>{o.label}</button>)}
        </div>
        {known==="sim"&&<label className="lx-field">Quais possíveis efeitos adversos você já ouviu mencionar? (opcional)
          <textarea maxLength={350} value={heard} onChange={(e)=>{setHeard(e.target.value);setOpen(false);}}
             placeholder="Escreva apenas percepções gerais, sem identificar a pessoa."/>
        </label>}
        <p className="lx-muted">Relatos de conhecidos são informação indireta, não documentação de um evento adverso confirmado.</p>
      </>}
      <div className="lx-reflect-privacy">
        <strong>Privacidade: demonstração somente local.</strong>
        <p>O texto e as escolhas ficam apenas na memória temporária desta página, não são enviados, salvos no servidor ou contados em estatísticas. Fechar/recarregar apaga a reflexão. Coleta real requer consentimento específico, controle de acesso, LGPD e revisão de segurança.</p>
      </div>
      <div className="lx-inline">
        <button type="button" className="lx-button" disabled={!usage}
          onClick={()=>setOpen(true)}>Visualizar reflexão local</button>
        <button type="button" className="lx-button lx-button--line" onClick={clear}>Limpar tudo</button>
      </div>
      {open&&<div className="lx-science" role="status">
        <strong>Resumo temporário — não enviado</strong>
        <p>{usage==="uso"?"Uso atual informado":usage==="usei"?"Uso anterior informado":usage==="nao"?"Sem uso atual informado":"Sem informação de uso"}.</p>
        {(usage==="uso"||usage==="usei")&&<>
          <p>Medicamento: {medicine||"não informado"}.</p>
          <p>Percepções: {reported.trim()||"não relatadas"}.</p>
        </>}
        {usage==="nao"&&<><p>Conhece alguém: {known||"não informado"}.</p>
          {known==="sim"&&<p>Efeitos conhecidos indiretamente: {heard.trim()||"não relatados"}.</p>}
        </>}
        <p>Esse resumo não é diagnóstico nem atribuição de causalidade. Não foi armazenado.</p>
      </div>}
    </section>
    <aside className="lx-panel" aria-labelledby="reflection-sources">
      <h2 id="reflection-sources">Como interpretar um relato?</h2>
      <p>Uma experiência pessoal pode gerar perguntas para pesquisa, mas, isoladamente, não demonstra frequência, risco ou causa. É necessário verificar população, tratamento, dose, evolução temporal, eventos concorrentes e qualidade do estudo.</p>
      <div className="lx-science">
        <p><strong>Observado na literatura:</strong> estudos de tirzepatida e composição corporal analisam resultados médios de grupos, não a experiência de quem responde a este questionário.</p>
        <p><strong>Pergunta científica:</strong> o sintoma é conhecido, documentado e plausível no contexto estudado?</p>
        <p><strong>Hipótese:</strong> relatos podem orientar pesquisas futuras; não devem ser chamados de efeito adverso confirmado sem avaliação.</p>
      </div>
      <p className="lx-muted">Este MVP não coleta respostas para pesquisa, não alimenta um banco público e não oferece aconselhamento médico individual.</p>
      <div className="lx-inline">
        <Link href="/corpo-evidencia" className="lx-button">Explorar composição corporal</Link>
        <Link href="/evidencias" className="lx-button lx-button--line">Investigar estudos</Link>
      </div>
    </aside>
   </div>
 </div></div>;
}
