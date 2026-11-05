import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, BookOpenCheck, Calculator,
  CircleAlert, ClipboardCheck, FileCheck2, FlaskConical, Gauge, Layers3,
  LockKeyhole, ShieldCheck, ShieldX,
} from "lucide-react";
import { SCENARIO_PRESETS } from "@/features/scenarios/engine";
import { reviewedMetrics } from "@/features/comparison/reviewed-metrics";
import { getCatalogAudit } from "@/features/evidence/unified-catalog";

const audit=getCatalogAudit();
const steps=[
  {number:"01",title:"Localizar e identificar a fonte",description:"Publicação, PMID, URL, ano, tipo de documento, população e método. Um alias não vira uma pesquisa independente."},
  {number:"02",title:"Distinguir natureza da evidência",description:"Ensaio, metanálise, análise pós-hoc, consenso, farmacovigilância e documento regulatório não medem a mesma coisa."},
  {number:"03",title:"Conferir o indicador no original",description:"Braços, N, medidas, período, unidades, IC quando disponíveis e limitações. Números ausentes não são inventados."},
  {number:"04",title:"Avaliar comparabilidade",description:"Famílias de estudos, participantes compartilhados, tratamentos e desfechos. O Comparador impede agregação entre artigos."},
  {number:"05",title:"Definir o que é apenas hipótese",description:"Vínculos não investigados diretamente permanecem sinalizados; cenário matemático não equivale a previsão epidemiológica."},
];
const glossary=[
  {term:"Massa magra",definition:"Medida corporal que inclui água, tecidos e outras estruturas não gordurosas; não é sinônimo de força muscular."},
  {term:"Sarcopenia",definition:"Condição definida e avaliada por critérios que priorizam força muscular, complementados por quantidade/qualidade e desempenho."},
  {term:"Odds ratio (OR)",definition:"Razão de chances entre grupos. Sem risco absoluto basal, não representa automaticamente percentual de mortalidade."},
  {term:"Incidência",definition:"Novos eventos em uma população sob risco e período definido. Relatos espontâneos não fornecem, por si, denominador válido."},
  {term:"Cenário hipotético",definition:"Resultado de premissas editáveis e fórmula explícita; não prevê que a hipótese ocorrerá."},
  {term:"Revisão clínica independente",definition:"Análise por especialista qualificado que ainda não foi concluída para os indicadores atuais."},
];
const sources=[
  {label:"SURMOUNT-1 / DXA",url:"https://pubmed.ncbi.nlm.nih.gov/39996356/",role:"Composição corporal; subestudo n=160",type:"Pesquisa"},
  {label:"EWGSOP2 — sarcopenia",url:"https://pubmed.ncbi.nlm.nih.gov/30312372/",role:"Força, quantidade/qualidade e função muscular",type:"Consenso"},
  {label:"Metanálise de UTI",url:"https://pubmed.ncbi.nlm.nih.gov/40462133/",role:"Associação com prognóstico em pacientes críticos",type:"Metanálise"},
  {label:"SURMOUNT-4 — continuidade",url:"https://pubmed.ncbi.nlm.nih.gov/38078870/",role:"Continuação e retirada após fase inicial",type:"Ensaio"},
  {label:"SURMOUNT — segurança psiquiátrica",url:"https://pubmed.ncbi.nlm.nih.gov/41537305/",role:"Categorias PHQ-9 em análise pós-hoc",type:"Pós-hoc"},
  {label:"IBGE — projeções populacionais",url:"https://www.ibge.gov.br/estatisticas/sociais/populacao/9109-proje%C3%A7%C3%A3o-da-populacao.html",role:"Contexto demográfico, não taxa de adoção",type:"Oficial"},
  {label:"Vigitel 2006–2024",url:"https://www.gov.br/saude/pt-br/centrais-de-conteudo/publicacoes/svsa/vigitel/",role:"Dados de capitais e DF, não denominador nacional direto",type:"Oficial"},
  {label:"Conitec / decisão de 2025",url:"https://bvsms.saude.gov.br/bvs/saudelegis/sctie/2025/prt0065_16_09_2025.html",role:"Não incorporação em indicação específica à época",type:"Oficial"},
  {label:"Ministério da Saúde / pedido de 2026",url:"https://www.gov.br/saude/pt-br/assuntos/noticias/2026/setembro/ministerio-da-saude-protocola-na-conitec-pedido-de-analise-para-incorporacao-de-canetas-emagrecedoras-no-sus",role:"Pedido de avaliação, não fornecimento universal",type:"Oficial"},
] as const;

export function MethodologyPage(){
  return (
    <div className="lupa-studio min-h-screen">
      <div className="mx-auto max-w-[1480px] px-4 pb-20 pt-6 sm:px-6 sm:pt-9 lg:px-9">
        <header className="lupa-dashboard-card overflow-hidden">
          <div className="grid lg:grid-cols-[minmax(0,1.2fr)_minmax(330px,.8fr)]">
            <div className="p-6 sm:p-10">
              <p className="lupa-premium-kicker">LUPA Saúde / Transparência científica</p>
              <h1 className="lupa-premium-text mt-4 max-w-4xl text-4xl font-extrabold leading-[1.08] sm:text-[56px]">
                Cada conclusão precisa <span className="text-[#315ff4]">de um caminho.</span>
              </h1>
              <p className="mt-5 max-w-3xl text-[15px] leading-8 text-[#60768f]">
                Da publicação original ao gráfico, do método ao limite de interpretação.
                Esta página documenta as fontes, regras, fórmulas e incertezas que sustentam o MVP.
              </p>
              <a href="#protocolo" className="lupa-premium-button lupa-premium-button-primary mt-7">
                Ver protocolo <ArrowRight size={17} aria-hidden="true"/>
              </a>
            </div>
            <div className="flex flex-col justify-center gap-4 bg-gradient-to-br from-[#16294b] to-[#254d9b] p-6 text-white sm:p-9">
              <p className="text-[11px] font-bold uppercase tracking-[.15em] text-[#b8d2ff]">Princípios do LUPA</p>
              {[
                {title:"Rastreabilidade",sub:"Referência original e metadados",icon:BookOpenCheck},
                {title:"Reprodutibilidade",sub:"Parâmetros e fórmulas explícitos",icon:Calculator},
                {title:"Limites",sub:"Hipóteses não viram fatos clínicos",icon:ShieldCheck},
              ].map(item=>{
                const Icon=item.icon;
                return <div key={item.title} className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-[#9ff1e5]"><Icon size={20}/></span>
                  <div><p className="text-sm font-extrabold">{item.title}</p><p className="mt-0.5 text-xs text-[#d0dff8]">{item.sub}</p></div>
                </div>;
              })}
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-3 sm:grid-cols-3" aria-label="Situação real do catálogo">
          {[
            {value:String(audit.canonicalRecords),title:"Registros canônicos",label:"Candidatos à curadoria",icon:Layers3},
            {value:String(reviewedMetrics.length),title:"Indicadores conferidos no original",label:"Sem revisão clínica independente",icon:FileCheck2},
            {value:"0",title:"Indicadores aptos a projeção clínica",label:"Bloqueados por padrão",icon:LockKeyhole},
          ].map(item=>{
            const Icon=item.icon;
            return <div key={item.title} className="lupa-dashboard-card flex items-start gap-4 p-5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#edf2ff] text-[#315ff4]"><Icon size={20}/></span>
              <div><p className="lupa-metric-ink text-3xl font-extrabold text-[#1d3653]">{item.value}</p>
                <p className="mt-1 text-xs font-bold text-[#3c536d]">{item.title}</p>
                <p className="mt-1 text-[11px] leading-5 text-[#70829a]">{item.label}</p>
              </div>
            </div>;
          })}
        </section>

        <section id="protocolo" className="mt-12 scroll-mt-28" aria-labelledby="protocol-title">
          <p className="lupa-premium-kicker">01 / Protocolo</p>
          <h2 id="protocol-title" className="lupa-premium-text mt-2 text-3xl font-extrabold">Como analisamos uma evidência</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {steps.map(step=>(
              <article key={step.number} className="lupa-dashboard-card p-5 sm:p-6">
                <span className="flex size-10 items-center justify-center rounded-xl bg-[#edf2ff] text-sm font-extrabold text-[#315fd1]">{step.number}</span>
                <h3 className="mt-4 text-lg font-extrabold leading-6 text-[#233a57]">{step.title}</h3>
                <p className="mt-2 text-[13px] leading-6 text-[#61758d]">{step.description}</p>
              </article>
            ))}
          </div>
          <div className="mt-5 flex gap-3 rounded-2xl border border-[#dbe7f5] bg-[#eff5ff] p-5">
            <ShieldCheck size={20} className="mt-0.5 shrink-0 text-[#315fd7]" aria-hidden="true"/>
            <p className="text-sm leading-7 text-[#4d6586]">Ter uma fonte e uma URL não significa aprovação para uso clínico. Os 50 registros gerais continuam candidatos à curadoria e os cinco indicadores descritos no Comparador só foram conferidos documentalmente.</p>
          </div>
        </section>

        <section className="mt-12" aria-labelledby="science-safeguards">
          <p className="lupa-premium-kicker">02 / Integridade científica</p>
          <h2 id="science-safeguards" className="lupa-premium-text mt-2 text-3xl font-extrabold">O que o sistema impede</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {[
              {title:"Misturar amostras relacionadas",description:"Publicações da mesma família podem compartilhar participantes; a soma automática é proibida."},
              {title:"Transformar OR em porcentagem absoluta",description:"Uma razão de chances depende do contexto, do período e da probabilidade basal; não vira risco individual por multiplicação."},
              {title:"Tratar massa magra como diagnóstico",description:"DXA de massa magra não substitui avaliação de força, função e critérios de sarcopenia."},
              {title:"Projetar mortalidade em UTI a partir de fármaco",description:"Não há evidência direta que ligue o desfecho muscular do SURMOUNT ao prognóstico de UTI de uma outra população."},
              {title:"Usar farmacovigilância como incidência",description:"Relatos espontâneos não fornecem todos os casos nem população total exposta sob risco."},
              {title:"Chamar pedido de incorporação de cobertura SUS",description:"O protocolo de avaliação em setembro de 2026 não é garantia de oferta nem definição de elegibilidade nacional."},
            ].map(item=>(
              <article key={item.title} className="lupa-dashboard-card flex gap-3 p-5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#fff4e5] text-[#aa762f]"><ShieldX size={20} aria-hidden="true"/></span>
                <div><h3 className="text-sm font-extrabold text-[#3c4e63]">{item.title}</h3>
                  <p className="mt-2 text-[13px] leading-6 text-[#65778a]">{item.description}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12" aria-labelledby="math-title">
          <p className="lupa-premium-kicker">03 / Motor matemático</p>
          <h2 id="math-title" className="lupa-premium-text mt-2 text-3xl font-extrabold">Como funcionam os cenários de 2031 e 2036</h2>
          <p className="mt-2 max-w-4xl text-sm leading-7 text-[#61768d]">
            O simulador <strong>não estima efeitos clínicos</strong>. Ele aplica taxas hipotéticas a um
            grupo de referência editável e contabiliza entradas, continuidade e saídas por ano.
          </p>
          <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
            <article className="lupa-dashboard-card p-5 sm:p-7">
              <div className="flex items-center gap-2"><Calculator size={20} className="text-[#315ff4]"/><h3 className="text-lg font-extrabold text-[#233b58]">Regras determinísticas</h3></div>
              <div className="mt-4 space-y-3">
                {[
                  {title:"Grupo no ano t",formula:"N(t) = arredondar(N₀ × (1 + crescimento)ᵗ)"},
                  {title:"Continuaram",formula:"C(t) = min(N(t), arredondar(ativos(t−1) × retenção))"},
                  {title:"Iniciaram",formula:"I(t) = arredondar((N(t) − C(t)) × taxa_início(t))"},
                  {title:"Ativos",formula:"A(t) = C(t) + I(t)"},
                  {title:"Saídas",formula:"S(t) = ativos(t−1) − C(t)"},
                  {title:"Custo hipotético opcional",formula:"R$(t) = A(t) × custo informado por ativo/ano"},
                ].map(row=>(
                  <div key={row.title} className="rounded-2xl border border-[#e5eaf3] bg-[#f8fafd] p-4">
                    <p className="text-xs font-extrabold text-[#385e9c]">{row.title}</p>
                    <p className="mt-1 break-words font-mono text-[12px] leading-6 text-[#516782]">{row.formula}</p>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-xs leading-6 text-[#6e8093]">
                As taxas são fornecidas em porcentagem, convertidas em fração no cálculo. Saídas não significam evento adverso ou morte; entradas acumuladas são eventos e podem contar reinícios.
              </p>
            </article>
            <article className="lupa-dashboard-card p-5 sm:p-7">
              <div className="flex items-center gap-2"><Gauge size={20} className="text-[#0d958a]"/><h3 className="text-lg font-extrabold text-[#233b58]">Presets ilustrativos</h3></div>
              <p className="mt-2 text-xs leading-6 text-[#6e8199]">Nenhum preset é estimativa brasileira. São exemplos modificáveis.</p>
              <div className="mt-5 space-y-3">
                {Object.values(SCENARIO_PRESETS).map(p=>(
                  <div key={p.label} className="rounded-2xl border border-[#e4eaf3] bg-[#f8fafd] p-4">
                    <p className="text-sm font-extrabold text-[#345472]">{p.label}</p>
                    <p className="mt-1 text-xs leading-5 text-[#6c8094]">{p.note}</p>
                    <p className="mt-2 text-xs font-semibold text-[#315dc4]">
                      Início {p.input.annualStartPct}% · continuidade {p.input.annualRetentionPct}% · incremento {p.input.annualAccessIncreasePp} p.p./ano
                    </p>
                  </div>
                ))}
              </div>
              <Link href="/projecoes" className="lupa-premium-button lupa-premium-button-primary mt-5">
                Abrir simulador <ArrowRight size={17} aria-hidden="true"/>
              </Link>
            </article>
          </div>
        </section>

        <section className="mt-12" aria-labelledby="regulatory-title">
          <p className="lupa-premium-kicker">04 / Contexto brasileiro</p>
          <h2 id="regulatory-title" className="lupa-premium-text mt-2 text-3xl font-extrabold">Brasil e SUS: o que sabemos até esta versão</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <div className="lupa-dashboard-card p-5">
              <p className="text-xs font-extrabold text-[#315fd1]">2025 · decisão específica</p>
              <h3 className="mt-2 text-base font-extrabold text-[#23405c]">Não incorporação em indicação delimitada</h3>
              <p className="mt-2 text-[13px] leading-6 text-[#61768e]">Portaria SECTICS/MS nº 65 de setembro de 2025 sobre semaglutida, para população clínica expressamente descrita no ato. Não equivale à proibição geral da classe.</p>
            </div>
            <div className="lupa-dashboard-card p-5">
              <p className="text-xs font-extrabold text-[#315fd1]">24/09/2026 · pedido de análise</p>
              <h3 className="mt-2 text-base font-extrabold text-[#23405c]">Solicitação à Conitec</h3>
              <p className="mt-2 text-[13px] leading-6 text-[#61768e]">O Ministério da Saúde solicitou avaliação de semaglutida/liraglutida. Um pedido não significa incorporação, financiamento nem distribuição universal.</p>
            </div>
            <div className="lupa-dashboard-card p-5">
              <p className="text-xs font-extrabold text-[#315fd1]">Demografia e vigilância</p>
              <h3 className="mt-2 text-base font-extrabold text-[#23405c]">IBGE ≠ Vigitel ≠ elegibilidade</h3>
              <p className="mt-2 text-[13px] leading-6 text-[#61768e]">IBGE projeta população; Vigitel amostra fatores de risco nas capitais e DF. Nenhuma dessas medidas fornece sozinha o total nacional elegível a uma medicação.</p>
            </div>
          </div>
        </section>

        <section className="mt-12" aria-labelledby="glossary-title">
          <p className="lupa-premium-kicker">05 / Glossário científico</p>
          <h2 id="glossary-title" className="lupa-premium-text mt-2 text-3xl font-extrabold">Termos para interpretar com segurança</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {glossary.map(row=>(
              <article key={row.term} className="lupa-dashboard-card p-5">
                <h3 className="text-sm font-extrabold text-[#3151a3]">{row.term}</h3>
                <p className="mt-2 text-[13px] leading-6 text-[#61768a]">{row.definition}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12" aria-labelledby="sources-title">
          <p className="lupa-premium-kicker">06 / Fontes auditáveis</p>
          <h2 id="sources-title" className="lupa-premium-text mt-2 text-3xl font-extrabold">Publicações e documentos originais</h2>
          <div className="lupa-dashboard-card mt-5 overflow-hidden">
            <div className="grid divide-y divide-[#e7ecf4]">
              {sources.map(source=>(
                <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer"
                  className="flex flex-wrap items-center gap-3 px-5 py-4 transition-colors hover:bg-[#f5f8fe] sm:px-7">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#edf2ff] text-[#315fd2]"><FlaskConical size={18}/></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-extrabold text-[#234461]">{source.label}</p>
                    <p className="mt-1 text-xs leading-5 text-[#647a91]">{source.role}</p>
                  </div>
                  <span className="rounded-full border border-[#dce5f2] px-2.5 py-1 text-[11px] font-bold text-[#71839b]">{source.type}</span>
                  <ArrowUpRight size={17} className="text-[#315bd6]" aria-hidden="true"/>
                </a>
              ))}
            </div>
          </div>
          <div className="mt-5 flex gap-3 rounded-2xl border border-[#e6dcc9] bg-[#fff8ed] p-5">
            <CircleAlert size={21} className="mt-0.5 shrink-0 text-[#a9752c]"/>
            <p className="text-sm leading-7 text-[#765f3f]">A lista reúne referências para auditoria, não aprovação científica integral. Informações regulatórias podem mudar; a versão e a data da fonte devem ser conferidas antes de qualquer uso real.</p>
          </div>
        </section>

        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#dce7f5] bg-[#eff4fc] p-5 sm:p-6">
          <p className="flex items-center gap-2 text-xs font-bold text-[#486588]"><ClipboardCheck size={17}/> LUPA MVP · modelo de fluxos v1 · nenhuma inferência clínica individual</p>
          <Link href="/evidencias" className="lupa-premium-button lupa-premium-button-primary">
            Explorar catálogo <ArrowRight size={16} aria-hidden="true"/>
          </Link>
        </footer>
      </div>
    </div>
  );
}
