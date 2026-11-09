import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ChapterHero, Cutout, LimitNote, Section, StatRow } from "@/components/atlas/ui";
import { ChapterBar } from "@/components/atlas/chapter-bar";
import { CompareBench } from "@/components/routes/comparar/compare-bench";
import { CompareBenchFromUrl } from "@/components/routes/comparar/compare-bench-url";
import { MetricExplorer } from "@/components/routes/comparar/metric-explorer";
import { LimitsPlates } from "@/components/routes/comparar/limits-plates";
import { catalogSize, projectionApprovedCount, reviewedMetricCount } from "@/components/routes/comparar/data";
import "./comparar.css";

export const metadata: Metadata = {
  title: "Comparador Científico",
  description: "Compare estudos de saúde com rastreabilidade, gráficos internos às pesquisas e bloqueio de inferências incompatíveis.",
};

export default function CompararPage() {
  return (
    <div className="cp-page">
      <ChapterBar/>
      <ChapterHero
        n="02"
        kicker="Prancha 02 · Comparador científico"
        title={["Compare estudos.", "Enxergue além", "dos números."]}
        lead={<p>Compare pesquisas sobre medicamentos para emagrecimento, massa magra e UTI. Veja se elas estudam a mesma população e medem o mesmo resultado antes de relacionar as conclusões.</p>}
        image="/assets/images/cianotipia/comparar.webp"
        alt="Cianotipia de uma balança antiga de dois pratos, com uma samambaia em um prato e uma planta de folhas redondas no outro, em equilíbrio"
        cutouts={[
          { name: "samambaia-alta", className: "cp-cut cp-cut--hero-fern", depth: 0.6, width: 170, rotate: -10 },
          { name: "semente-alada", className: "cp-cut cp-cut--hero-seed", depth: 1.1, width: 90, rotate: 18 },
        ]}
      >
        <a className="at-btn at-btn--solid" href="#comparacao">Iniciar comparação <span aria-hidden="true">↓</span></a>
        <a className="at-btn at-btn--line" href="#indicadores">Explorar indicadores</a>
      </ChapterHero>

      <section className="cp-ledger" aria-labelledby="cp-ledger-title">
        <div className="cp-ledger__inner">
          <div className="cp-ledger__copy">
            <h2 id="cp-ledger-title" className="cp-ledger__title">Rigor científico: cada dado no contexto original.</h2>
            <p>Resultados rastreáveis. Sem diagnósticos ou projeções não validadas.</p>
            <p className="cp-ledger__curation at-mono">Todas as fichas estão em curadoria, sem revisão clínica independente.</p>
          </div>
          <StatRow items={[
            { value: catalogSize, label: "Referências catalogadas" },
            { value: reviewedMetricCount, label: "Indicadores conferidos" },
            { value: projectionApprovedCount, label: "Projeções autorizadas" },
          ]}/>
          <nav className="cp-ledger__nav" aria-label="Nesta prancha">
            <a href="#comparacao"><span className="at-mono" aria-hidden="true">01</span>Comparação</a>
            <a href="#indicadores"><span className="at-mono" aria-hidden="true">02</span>Indicadores</a>
            <a href="#limites"><span className="at-mono" aria-hidden="true">03</span>Limites</a>
            <Link href="/evidencias"><span className="at-mono" aria-hidden="true">↗</span>Explorador de evidências</Link>
          </nav>
        </div>
      </section>

      <Section id="comparacao" chapter="Estudos lado a lado" tone="paper" className="cp-compare"
        kicker="01 · Comparação contextual"
        title={["Estudos", "lado a lado."]}
        intro={<>
          <p>Comece selecionando duas referências. O LUPA explica o que pode e o que não pode ser comparado.</p>
          <p className="cp-local at-mono"><span aria-hidden="true"/>Biblioteca local · {catalogSize} referências</p>
        </>}
      >
        <Cutout name="eucalipto" className="cp-cut cp-cut--compare" depth={0.5} width={200} rotate={8}/>
        {/* useSearchParams exige Suspense; sem JS (ou antes da hidratação) fica o par padrão E04/E12,
            com ids próprios para não duplicar #compare-left/#compare-right durante a troca. */}
        <Suspense fallback={<CompareBench idSuffix="-inicial"/>}>
          <CompareBenchFromUrl/>
        </Suspense>
        <div className="cp-compare__limit">
          <LimitNote>
            <p>A ferramenta não calcula diferença de tratamento entre estudos, risco acumulado, incidência ou metanálise. Lado a lado não significa causa e efeito.</p>
            <p>Um alias é a mesma publicação, não outro estudo. Fichas da mesma família de estudos podem compartilhar participantes: não some amostras nem efeitos.</p>
          </LimitNote>
        </div>
      </Section>

      <Section id="indicadores" chapter="Evidência em perspectiva" tone="white" className="cp-indicators"
        kicker="02 · Resultados observados"
        title={["Evidência", "em perspectiva."]}
        intro={<p>Explore cinco indicadores extraídos de fontes primárias. Cada gráfico representa somente os grupos internos do próprio estudo e é <strong>independente dos estudos A e B</strong> acima.</p>}
      >
        <Cutout name="comprimidos" className="cp-cut cp-cut--pills" depth={0.7} width={150} rotate={-12}/>
        <MetricExplorer/>
      </Section>

      <Section id="limites" chapter="O que os dados não demonstram" tone="ink" className="cp-limits-sec"
        kicker="03 · Interpretação responsável"
        title={["O que esses dados", "não demonstram."]}
      >
        <Cutout name="samambaia-curta" white className="cp-cut cp-cut--ink" depth={0.5} width={190} rotate={14}/>
        <LimitsPlates/>
      </Section>
    </div>
  );
}
