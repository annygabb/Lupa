import { ChapterHero, Section } from "@/components/atlas/ui";
import { ChapterBar } from "@/components/atlas/chapter-bar";
import { Magnetic } from "@/components/atlas/motion";
import { GapLedger } from "./gap-ledger";
import { GapObservatory } from "./gap-observatory";
import { HypothesisChain } from "./hypothesis-chain";
import { EvidenceQuestions } from "./evidence-questions";
import { ScenarioLab } from "./scenario-lab";

/** Prancha 05 — Brasil × EUA: o que se sabe, onde faltam dados e um laboratório de hipóteses. */
export function ProjecoesPage() {
  return (
    <div className="px">
      <ChapterBar/>
      <div data-chapter="O que sabemos hoje">
        <ChapterHero
          n="05"
          kicker="Brasil × Estados Unidos · medicamentos para emagrecimento"
          title={["O que sabemos hoje.", "O que podemos explorar amanhã."]}
          lead={<p>Dados com contexto. Hipóteses com premissas. Escolha uma pergunta e descubra o que está por trás de cada número, onde faltam dados e o que só pode ser simulado.</p>}
          image="/assets/images/cianotipia/globo.webp"
          alt="Cianotipia de um globo terrestre antigo com folhas ao redor da base"
          cutouts={[
            { name: "eucalipto", className: "px-cut px-cut--a", depth: .6, width: 190, rotate: -10 },
            { name: "semente-alada", className: "px-cut px-cut--b", depth: 1, width: 110, rotate: 18 },
          ]}>
          <Magnetic><a className="at-btn at-btn--solid" href="#mapa">Ver o mapa de lacunas <span aria-hidden="true">↓</span></a></Magnetic>
          <a className="at-btn at-btn--line" href="#laboratorio">Abrir o laboratório</a>
        </ChapterHero>
      </div>

      <Section id="mapa" tone="white" chapter="Mapa de lacunas" kicker="05.1 · Mapa de lacunas"
        title={["Onde há dado,", "e onde há silêncio."]}
        intro={<p>Quatro horizontes, dois países. Cada célula hachurada é uma ausência de evidência nacional comparável: ela não vale zero e não vira estimativa.</p>}>
        <GapLedger/>
      </Section>

      <Section id="comparacao" tone="paper" chapter="Brasil × EUA" kicker="05.2 · Observatório Brasil × EUA"
        title={["Dois países,", "duas perguntas."]}
        intro={<p>Os números observados vêm de populações e definições diferentes. Selecione um ponto para ver a população, o período e onde a leitura para.</p>}>
        <GapObservatory/>
      </Section>

      <Section id="hipotese" tone="ink" chapter="Hipótese em aberto" kicker="05.3 · Pergunta científica · ainda em aberto"
        title={["E se a reserva", "muscular influenciar", "a recuperação?"]}
        intro={<p>Três elos que uma manchete costuma ligar numa linha só. A evidência mede o primeiro; os outros dois continuam perguntas.</p>}>
        <HypothesisChain/>
      </Section>

      <Section id="perguntas" tone="white" chapter="A pergunta por trás do número" kicker="05.4 · A pergunta por trás do número"
        title={["Entender o dado", "muda a resposta."]}
        intro={<p>Abra uma pergunta para ver o motivo, o que o estudo permite concluir e a fonte.</p>}>
        <EvidenceQuestions/>
      </Section>

      <Section id="laboratorio" tone="paper" chapter="Laboratório de cenários" kicker="05.5 · LUPA Saúde / Cenários 2026–2041"
        title={["Projete hipóteses.", "Não certezas."]}
        intro={<p>Simule trajetórias de início, continuidade e saída de tratamento em um grupo de referência que você define. Compare 2031, 2036 e 2041 e exporte as premissas usadas. Fluxo populacional ilustrativo: sem dados pessoais, sem estimativa de eficácia e sem pressupor incorporação no SUS.</p>}>
        <ScenarioLab/>
      </Section>
    </div>
  );
}
