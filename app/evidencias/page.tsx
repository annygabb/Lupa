import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { ChapterHero, LimitNote, Section, StatRow, Reveal, Cutout } from "@/components/atlas/ui";
import { Magnetic } from "@/components/atlas/motion";
import { getCatalogAudit, getUnifiedEvidence } from "@/features/evidence/unified-catalog";
import { HerbariumExplorer } from "@/components/routes/evidencias/herbarium-explorer";
import { SpecimenCard } from "@/components/routes/evidencias/specimen-card";
import "./evidencias.css";

export const metadata: Metadata = {
  title: "Explorador Científico",
  description: "Busque artigos, estudos e fontes oficiais sobre medicamentos para emagrecimento, saúde muscular e recuperação crítica, com limites de evidência explícitos.",
};

const anatomy = [
  { n: "01", title: "Identificador", body: "Rastreia o registro até o documento de origem. Quando dois documentos são a mesma publicação, os identificadores apontam para a mesma ficha." },
  { n: "02", title: "Desenho e ano", body: "Diz que tipo de documento é. Um ensaio clínico, uma análise secundária e uma revisão respondem a perguntas diferentes." },
  { n: "03", title: "População", body: "Quem participou. O resultado descreve essa população, não automaticamente todas as pessoas que usam o medicamento." },
  { n: "04", title: "Limitação", body: "Onde a conclusão para. Vale ler antes do resultado." },
  { n: "05", title: "Fonte original", body: "Abre o artigo ou o documento oficial para conferir números e contexto." },
];

export default function EvidenciasPage() {
  const audit = getCatalogAudit();
  const sample = getUnifiedEvidence("E04");

  return (
    <div className="ev-page">
      <div className="ev-hero">
        <ChapterHero
          n="01"
          kicker="LUPA Saúde / Biblioteca de evidências"
          title={["Estudos sobre", "medicamentos para emagrecer.", "Com contexto para interpretar."]}
          lead={<p>Encontre pesquisas sobre medicamentos para emagrecimento, saúde mental, músculos, sarcopenia e UTI. Veja as fontes, os resultados descritos e os limites de cada documento.</p>}
          image="/assets/images/cianotipia/estudos-1.webp"
          alt="Cianotipia de um livro, folhas de pesquisa com um gráfico e uma lupa"
          cutouts={[
            { name: "samambaia-alta", className: "ev-cut ev-cut--fern", depth: 0.55, width: 230, rotate: -10 },
            { name: "ginkgo", className: "ev-cut ev-cut--ginkgo", depth: 0.9, width: 120, rotate: 14 },
            { name: "folhas-soltas", className: "ev-cut ev-cut--leaves", depth: 0.35, width: 170, rotate: 6 },
          ]}
        >
          <Magnetic>
            <a href="#herbario" className="at-btn at-btn--solid">Abrir o herbário <ArrowDown size={18} aria-hidden="true"/></a>
          </Magnetic>
          <Link href="/metodologia" className="at-btn at-btn--line">Como as fontes são conferidas</Link>
        </ChapterHero>
      </div>

      <section className="ev-ledger" aria-labelledby="ev-ledger-title">
        <div className="ev-ledger__inner">
          <div className="ev-ledger__head">
            <h2 id="ev-ledger-title" className="ev-ledger__title at-mono">Situação do catálogo</h2>
            <p className="ev-ledger__badge at-mono">Pesquisa com fontes rastreáveis</p>
          </div>
          <StatRow items={[
            { value: audit.canonicalRecords, label: "Registros catalogados" },
            { value: audit.originalRecords + audit.supplementalSources, label: "Referências de origem" },
            { value: audit.readyForProjection, label: "Resultados liberados para projeção" },
          ]}/>
          <div className="ev-notice" role="note">
            <span className="ev-notice__stamp at-mono" aria-hidden="true">Em curadoria</span>
            <p>
              <strong>Em curadoria · sem revisão clínica independente.</strong> Os resumos são transcrições dos materiais
              de pesquisa reunidos pela equipe; seus números ainda exigem validação no artigo original.
              Esta página não fornece diagnóstico, prescrição nem previsão de risco individual.
            </p>
          </div>
        </div>
      </section>

      <Section
        id="herbario"
        className="ev-herb-sec"
        chapter="Herbário"
        kicker="Prancha 01 · O herbário"
        title={["Explore", "os estudos."]}
        intro={<p>Combine termos, temas e filtros para encontrar uma referência. Cada ficha prensa um documento com o que ele mediu, em quem, e onde a conclusão para.</p>}
      >
        <Cutout name="eucalipto" className="ev-cut ev-cut--euca" depth={0.6} width={200} rotate={-8}/>
        <Cutout name="semente-alada" className="ev-cut ev-cut--seed" depth={1} width={110} rotate={18}/>
        <HerbariumExplorer/>
      </Section>

      <Section
        id="como-ler"
        tone="ink"
        className="ev-anatomy-sec"
        chapter="Como ler"
        kicker="Antes de abrir uma ficha"
        title={["Como ler", "uma etiqueta."]}
        intro={<p>Toda ficha do herbário segue a mesma ordem. Aqui, a de um registro real do catálogo.</p>}
      >
        <Cutout name="samambaia-curta" white className="ev-cut ev-cut--ink" depth={0.5} width={210} rotate={-12}/>
        <div className="ev-anatomy">
          {sample && (
            <div className="ev-anatomy__sample">
              <SpecimenCard record={sample}/>
              <span className="ev-pin ev-pin--1 at-mono" aria-hidden="true">01</span>
              <span className="ev-pin ev-pin--2 at-mono" aria-hidden="true">02</span>
              <span className="ev-pin ev-pin--3 at-mono" aria-hidden="true">03</span>
              <span className="ev-pin ev-pin--4 at-mono" aria-hidden="true">04</span>
              <span className="ev-pin ev-pin--5 at-mono" aria-hidden="true">05</span>
            </div>
          )}
          <div>
            <Reveal as="ol" className="ev-anatomy__list">
              {anatomy.map(a => (
                <li key={a.n}>
                  <span className="at-mono" aria-hidden="true">{a.n}</span>
                  <div><h3>{a.title}</h3><p>{a.body}</p></div>
                </li>
              ))}
            </Reveal>
            <LimitNote>
              <p>Uma ficha descreve um documento. Não é risco individual, aconselhamento médico nem indicação terapêutica.</p>
            </LimitNote>
            <Link href="/metodologia" className="ev-anatomy__more">
              Conheça a metodologia e as limitações <ArrowUpRight size={16} aria-hidden="true"/>
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
