"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity, ArrowUpRight, BarChart3, BookOpenCheck, Calculator, Download,
  FileJson2, Info, LockKeyhole, RotateCcw, Settings2, ShieldCheck, UsersRound,
} from "lucide-react";
import {
  SCENARIO_PRESETS, scenarioInputSchema, runScenario, scenarioCsv,
  type ScenarioInput, type ScenarioPresetId, type ScenarioResult,
} from "@/features/scenarios/engine";

const compact=new Intl.NumberFormat("pt-BR");
const money=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0});
const pct=(n:number)=>n.toLocaleString("pt-BR",{minimumFractionDigits:1,maximumFractionDigits:1})+"%";
const fields=[
  {key:"populationBase",label:"Pessoas no grupo de referência",min:1000,max:100000000,step:1000,
    help:"Hipótese editável. Não equivale à população brasileira elegível."},
  {key:"annualPopulationGrowthPct",label:"Variação anual do grupo (%)",min:-5,max:5,step:0.1,
    help:"Premissa demográfica do grupo hipotético, não projeção oficial do IBGE."},
  {key:"initialActivePct",label:"Em tratamento em 2026 (%)",min:0,max:30,step:0.5,
    help:"Premissa de partida, não cobertura real conhecida."},
  {key:"annualStartPct",label:"Início anual entre quem não está ativo (%)",min:0,max:30,step:0.5,
    help:"Percentual hipotético de início no restante do grupo."},
  {key:"annualRetentionPct",label:"Continuidade anual (%)",min:0,max:100,step:1,
    help:"Percentual dos ativos anteriores que continuariam no ano seguinte."},
  {key:"annualAccessIncreasePp",label:"Aumento anual da taxa de início (p.p.)",min:0,max:5,step:0.1,
    help:"Alteração da taxa de início em pontos percentuais por ano."},
  {key:"costPerActivePersonBRL",label:"Custo anual hipotético por pessoa (R$)",min:0,max:150000,step:100,
    help:"Opcional: 0 desativa custos. Não é preço de medicamento nem orçamento do SUS."},
] as const satisfies ReadonlyArray<{
  key:Exclude<keyof ScenarioInput,"referenceYear">;label:string;min:number;max:number;step:number;help:string
}>;

type ActivePreset=ScenarioPresetId|"personalizado";
function downloadFile(filename:string,text:string,mime:string){
  const objectUrl=URL.createObjectURL(new Blob([text],{type:mime}));
  const anchor=document.createElement("a");
  anchor.href=objectUrl;anchor.download=filename;anchor.click();
  window.setTimeout(()=>URL.revokeObjectURL(objectUrl),1000);
}

function ScenarioChart({result}:{result:ScenarioResult}) {
  const rows=result.rows;
  const max=Math.max(1,...rows.map(r=>r.active));
  const left=72,right=742,top=24,bottom=257;
  const x=(index:number)=>left+(right-left)*index/(rows.length-1);
  const y=(count:number)=>bottom-(bottom-top)*count/max;
  const points=rows.map((r,i)=>({x:x(i),y:y(r.active),r}));
  const line=points.map((p,i)=>(i===0?"M":"L")+p.x.toFixed(1)+" "+p.y.toFixed(1)).join(" ");
  const area=line+" L"+right+" "+bottom+" L"+left+" "+bottom+" Z";
  return (
    <figure className="lupa-dashboard-card min-w-0 p-4 sm:p-6">
      <figcaption className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="lupa-premium-kicker">Série anual calculada</p>
          <h3 className="mt-1 text-lg font-extrabold text-[#203653]">Pessoas ativas no cenário</h3>
          <p className="mt-1 text-xs leading-5 text-[#63788e]">2026–2036 · curva ilustrativa, não previsão epidemiológica</p>
        </div>
        <span className="rounded-full bg-[#edf2ff] px-3 py-2 text-xs font-bold text-[#315ec5]">
          Grupo definido pelo usuário
        </span>
      </figcaption>
      <svg viewBox="0 0 780 316" className="mt-5 w-full" role="img"
        aria-label={"Linha hipotética de pessoas ativas: 2026 "+compact.format(rows[0].active)+", 2031 "+compact.format(result.last2031.active)+", 2036 "+compact.format(result.last2036.active)}>
        <defs>
          <linearGradient id="lupa-scenario-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#315ff4" stopOpacity=".23"/>
            <stop offset="100%" stopColor="#315ff4" stopOpacity=".015"/>
          </linearGradient>
        </defs>
        {[0,.25,.5,.75,1].map((f,i)=>{
          const gy=y(max*f);
          return <g key={i}>
            <line x1={left} x2={right} y1={gy} y2={gy} stroke="#dfe6f0" strokeDasharray="4 7"/>
            <text x={left-12} y={gy+5} textAnchor="end" fontSize="12" fill="#687d95">{compact.format(Math.round(max*f))}</text>
          </g>;
        })}
        <path d={area} fill="url(#lupa-scenario-area)"/>
        <path d={line} fill="none" stroke="#315ff4" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        {points.filter((_,i)=>i===0||i===5||i===10).map(p=>(
          <g key={p.r.year}>
            <circle cx={p.x} cy={p.y} r="7" fill="white" stroke="#315ff4" strokeWidth="3"/>
            <text x={p.x} y={Math.max(14,p.y-14)} fill="#34529d" textAnchor="middle" fontSize="12" fontWeight="750">
              {compact.format(p.r.active)}
            </text>
          </g>
        ))}
        {rows.map((r,i)=>(i%2===0||i===rows.length-1)?
          <text key={r.year} x={x(i)} y="286" fill="#667b93" fontSize="13" fontWeight="650" textAnchor="middle">{r.year}</text>:null)}
      </svg>
      <p className="text-xs leading-6 text-[#65788e]">Os pontos são produzidos exclusivamente pelas taxas informadas. Não indicam redução de obesidade, internação, mortalidade ou efeitos do medicamento.</p>
    </figure>
  );
}

export function ScenarioDashboard(){
  const [input,setInput]=useState<ScenarioInput>({...SCENARIO_PRESETS.intermediario.input});
  const [preset,setPreset]=useState<ActivePreset>("intermediario");
  const [showAssumptions,setShowAssumptions]=useState(true);

  const parsed=useMemo(()=>scenarioInputSchema.safeParse(input),[input]);
  const result=useMemo(()=>parsed.success?runScenario(parsed.data):null,[parsed]);
  const setField=(key:Exclude<keyof ScenarioInput,"referenceYear">,value:number)=>{
    setInput(prev=>({...prev,[key]:value}));
    setPreset("personalizado");
  };
  const choosePreset=(id:ScenarioPresetId)=>{
    setInput({...SCENARIO_PRESETS[id].input});setPreset(id);
  };
  const exportScenario=(type:"csv"|"json")=>{
    if(!result)return;
    if(type==="csv") downloadFile("lupa-cenario-2026-2036.csv",scenarioCsv(result),"text/csv;charset=utf-8");
    else downloadFile("lupa-cenario-2026-2036.json",JSON.stringify(result,null,2),"application/json;charset=utf-8");
  };

  return (
    <div className="lupa-studio min-h-screen">
      <div className="mx-auto max-w-[1480px] px-4 pb-20 pt-6 sm:px-6 sm:pt-9 lg:px-9">
        <header className="lupa-dashboard-card overflow-hidden">
          <div className="grid lg:grid-cols-[1.35fr_.65fr]">
            <div className="p-6 sm:p-10">
              <p className="lupa-premium-kicker">LUPA Saúde / Cenários 2026–2036</p>
              <h1 className="lupa-premium-text mt-4 max-w-4xl text-4xl font-extrabold leading-[1.09] sm:text-[52px]">
                Projete hipóteses. <span className="text-[#315ff4]">Não certezas.</span>
              </h1>
              <p className="mt-5 max-w-3xl text-[15px] leading-8 text-[#62768e]">
                Simule trajetórias de início, continuidade e saída de tratamento em um grupo
                de referência que você define. Compare 2031 e 2036 e exporte as premissas usadas.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#eaf6f2] px-3 py-2 text-xs font-bold text-[#11796c]"><ShieldCheck size={15}/> Fórmula reproduzível</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#edf2ff] px-3 py-2 text-xs font-bold text-[#345fbd]"><LockKeyhole size={15}/> Sem efeitos clínicos extrapolados</span>
              </div>
            </div>
            <div className="flex flex-col justify-center gap-3 bg-gradient-to-br from-[#162a55] to-[#2955b6] p-6 text-white sm:p-9">
              <span className="text-xs font-extrabold uppercase tracking-[.15em] text-[#bdd2ff]">Tipo de modelo</span>
              <span className="text-2xl font-extrabold tracking-tight">Fluxo populacional ilustrativo</span>
              <p className="text-sm leading-7 text-[#d9e6ff]">Sem dados pessoais, sem estimativa de eficácia e sem pressupor incorporação no SUS.</p>
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4">
                <Calculator size={24} className="text-[#8fecdf]"/>
                <p className="text-xs leading-6">Cenários parametrizados por você. Nenhum preset representa previsão oficial.</p>
              </div>
            </div>
          </div>
        </header>

        <div className="mt-6 grid items-start gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
          <section className="lupa-dashboard-card p-5 sm:p-6" aria-labelledby="scenario-options">
            <div className="flex items-center justify-between gap-3">
              <h2 id="scenario-options" className="flex items-center gap-2 text-lg font-extrabold text-[#213754]">
                <Settings2 size={20} className="text-[#315ff4]"/> Premissas do cenário
              </h2>
              <button type="button" onClick={()=>choosePreset("intermediario")}
                className="inline-flex min-h-10 items-center gap-1 text-xs font-bold text-[#315bd3] hover:underline">
                <RotateCcw size={15}/> Redefinir
              </button>
            </div>
            <p className="mt-2 text-xs leading-6 text-[#6b7e93]">Escolha um ponto de partida ilustrativo ou edite os valores. Nada é enviado a servidores.</p>

            <div className="mt-5 grid gap-2" role="group" aria-label="Cenários pré-configurados">
              {(Object.entries(SCENARIO_PRESETS) as [ScenarioPresetId,(typeof SCENARIO_PRESETS)[ScenarioPresetId]][]).map(([key,value])=>(
                <button key={key} type="button" onClick={()=>choosePreset(key)} aria-pressed={preset===key}
                  className={"rounded-xl border px-4 py-3 text-left transition-colors "+
                    (preset===key?"border-[#92b4fa] bg-[#eef3ff]":"border-[#e0e7f0] bg-white hover:bg-[#f8fafd]")}>
                  <span className={"block text-sm font-extrabold "+(preset===key?"text-[#315bd3]":"text-[#334963]")}>{value.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-[#657a92]">{value.note}</span>
                </button>
              ))}
            </div>

            <div className="mt-5 space-y-4">
              {fields.map(field=>(
                <div key={field.key}>
                  <label htmlFor={"scenario-"+field.key} className="block text-[13px] font-bold leading-5 text-[#314864]">{field.label}</label>
                  <input id={"scenario-"+field.key} type="number" inputMode="decimal"
                    min={field.min} max={field.max} step={field.step}
                    value={input[field.key]} onChange={e=>setField(field.key,Number(e.target.value))}
                    className="lupa-input mt-1.5"/>
                  <p className="mt-1 text-[11px] leading-5 text-[#72859a]">{field.help}</p>
                </div>
              ))}
            </div>
            <button type="button" onClick={()=>setShowAssumptions(s=>!s)}
              className="mt-5 min-h-11 w-full rounded-xl border border-[#dce5f2] bg-[#f8faff] text-xs font-bold text-[#315eaa]">
              {showAssumptions?"Ocultar":"Mostrar"} regras do cálculo
            </button>
            {showAssumptions&&(
              <div className="mt-3 rounded-xl bg-[#f1f5fa] p-4 text-xs leading-6 text-[#536a82]">
                <p><strong>Quem continua:</strong> ativos anteriores × taxa de continuidade.</p>
                <p className="mt-2"><strong>Quem inicia:</strong> pessoas do grupo que não estão ativas × taxa anual de início.</p>
                <p className="mt-2"><strong>Ativos:</strong> pessoas que continuam + pessoas que iniciam no ano.</p>
                <p className="mt-2"><strong>Saídas:</strong> ativos anteriores − continuaram. Inícios acumulados são eventos, não pessoas únicas.</p>
              </div>
            )}
          </section>

          <div className="min-w-0 space-y-5">
            {!result?(
              <section className="lupa-dashboard-card p-7" role="alert">
                <h2 className="text-lg font-extrabold text-[#964a31]">Corrija os parâmetros</h2>
                <p className="mt-2 text-sm text-[#64758a]">As premissas precisam respeitar os limites descritos nos campos. Nenhum resultado será calculado enquanto houver valores inválidos.</p>
                {!parsed.success&&<ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[#885742]">
                  {parsed.error.issues.map((issue,i)=><li key={i}>{String(issue.path[0])}: {issue.message}</li>)}
                </ul>}
              </section>
            ):(
              <>
                <section aria-label="Horizontes de simulação" className="grid gap-3 sm:grid-cols-2">
                  {[result.last2031,result.last2036].map((row,i)=>(
                    <div key={row.year} className={"relative overflow-hidden rounded-[25px] p-6 "+
                      (i===0?"bg-gradient-to-br from-[#2456dc] to-[#1c3d98] text-white":"border border-[#cce9e1] bg-[#eafaf5] text-[#164b54]")}>
                      <p className={"text-xs font-extrabold uppercase tracking-[.13em] "+(i===0?"text-[#c6d9ff]":"text-[#4e8987]")}>Horizonte {row.year}</p>
                      <p className="lupa-metric-ink mt-3 text-4xl font-extrabold sm:text-[43px]">{compact.format(row.active)}</p>
                      <p className="mt-2 text-sm font-semibold">pessoas ativas simuladas</p>
                      <p className={"mt-3 text-xs leading-6 "+(i===0?"text-[#cfdefa]":"text-[#4d7b7b]")}>
                        {pct(row.activeSharePct)} do grupo hipotético · {compact.format(row.started)} novas entradas no ano
                      </p>
                    </div>
                  ))}
                </section>
                <ScenarioChart result={result}/>
                {result.last2036.annualIllustrativeCostBRL!==null&&(
                  <section className="lupa-dashboard-card flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
                    <div>
                      <p className="lupa-premium-kicker">Custo meramente hipotético em 2036</p>
                      <p className="mt-2 text-2xl font-extrabold text-[#213754]">
                        {money.format(result.last2036.annualIllustrativeCostBRL)}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#637890]">Ativos estimados × custo anual informado pelo usuário. Não representa orçamento público.</p>
                    </div>
                    <Info size={25} className="text-[#315ff4]" aria-hidden="true"/>
                  </section>
                )}
                <section className="lupa-dashboard-card min-w-0 p-5 sm:p-6">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="lupa-premium-kicker">Reprodução e auditoria</p>
                      <h3 className="mt-1 text-xl font-extrabold text-[#213754]">Tabela anual</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={()=>exportScenario("csv")}
                        className="lupa-premium-button lupa-premium-button-outline">
                        <Download size={16}/> Exportar CSV
                      </button>
                      <button type="button" onClick={()=>exportScenario("json")}
                        className="lupa-premium-button lupa-premium-button-outline">
                        <FileJson2 size={16}/> Exportar JSON
                      </button>
                    </div>
                  </div>
                  <div className="mt-5 overflow-x-auto rounded-xl border border-[#e1e8f1]">
                    <table className="w-full min-w-[720px] text-left text-xs">
                      <caption className="sr-only">Simulação anual editável de 2026 a 2036</caption>
                      <thead className="bg-[#f0f4fb] text-[#536984]">
                        <tr>
                          {["Ano","Grupo ref.","Continuaram","Iniciaram","Saíram","Ativos","% ativos"].map(label=>(
                            <th scope="col" className="px-3 py-3 font-bold" key={label}>{label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.rows.map(row=>(
                          <tr key={row.year} className={"border-t border-[#e7edf4] "+([2031,2036].includes(row.year)?"bg-[#f1f7ff] font-bold":"")}>
                            <th scope="row" className="px-3 py-3 font-extrabold text-[#254b82]">{row.year}</th>
                            {[row.referencePopulation,row.continued,row.started,row.exited,row.active].map((number,i)=>(
                              <td key={i} className="px-3 py-3 tabular-nums text-[#4e647c]">{compact.format(number)}</td>
                            ))}
                            <td className="px-3 py-3 tabular-nums">{pct(row.activeSharePct)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-2 text-xs text-[#70849a] sm:hidden">Deslize a tabela para visualizar todas as colunas.</p>
                </section>
                <section className="lupa-dashboard-card p-5 sm:p-6" aria-labelledby="scenario-warnings">
                  <h3 id="scenario-warnings" className="flex items-center gap-2 text-lg font-extrabold text-[#233b58]">
                    <ShieldCheck size={19} className="text-[#0d978a]"/> O que os resultados não significam
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {result.warnings.map(text=>(
                      <li key={text} className="flex gap-2.5 text-[13px] leading-6 text-[#566b83]">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#b88b47]" aria-hidden="true"/>{text}
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            )}
          </div>
        </div>

        <section className="lupa-dashboard-card mt-6 p-5 sm:p-7" aria-labelledby="scenario-sources">
          <h2 id="scenario-sources" className="flex items-center gap-2 text-lg font-extrabold text-[#263d5b]"><BookOpenCheck size={20} className="text-[#315ff4]"/> Fontes de contexto brasileiro</h2>
          <p className="mt-2 text-sm leading-6 text-[#61778e]">Estes documentos orientam a discussão demográfica e regulatória. <strong>Não fornecem automaticamente as taxas de entrada ou continuidade do simulador.</strong></p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {(result?.sources??runScenario(SCENARIO_PRESETS.intermediario.input).sources).map(source=>(
              <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer"
                className="flex min-h-[112px] flex-col justify-between rounded-2xl border border-[#e4eaf3] bg-[#f8fafd] p-4 text-[13px] font-bold leading-5 text-[#294977] hover:bg-[#edf3ff]">
                {source.name}<span className="mt-2 inline-flex items-center gap-1 text-xs text-[#315ed3]">Consultar documento <ArrowUpRight size={14}/></span>
              </a>
            ))}
          </div>
          <p className="mt-5 text-xs leading-6 text-[#667c91]">
            Este modelo não transforma ensaios clínicos em estatísticas nacionais. Consulte também a{" "}
            <Link href="/metodologia" className="font-extrabold text-[#315fd8] hover:underline">metodologia completa</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
