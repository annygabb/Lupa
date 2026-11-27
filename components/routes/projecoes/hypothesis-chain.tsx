import Image from "next/image";
import { DrawPath } from "@/components/atlas/motion";
import { LimitNote } from "@/components/atlas/ui";
import { hypothesisOutcomes, hypothesisSteps } from "./data";

/** "E se a reserva muscular influenciar a recuperação?" — três elos, só o primeiro medido. */
export function HypothesisChain() {
  return (
    <div className="px-chain">
      <DrawPath className="px-chain__wire" viewBox="0 0 1200 60" dashed strokeWidth={2.5}
        d="M20 30 C 180 -6, 300 66, 420 30 S 660 -6, 800 30 S 1040 66, 1180 30"/>
      <ol className="px-chain__steps">
        {hypothesisSteps.map((s, i) => (
          <li key={s.title} className={`px-chain__step is-${s.kind}`}>
            <div className="px-chain__img">
              <Image src={`/assets/images/cianotipia/${s.img}.webp`} alt={s.alt} fill sizes="(max-width: 900px) 80vw, 26vw"/>
              <span className="px-chain__n" aria-hidden="true">{String.fromCharCode(65 + i)}</span>
              {s.kind !== "measured" && <span className="px-chain__x" aria-hidden="true">×</span>}
            </div>
            <p className="px-chain__tag">{s.tag}</p>
            <h3>{s.title}</h3>
            <p className="px-chain__note">{s.note}</p>
          </li>
        ))}
      </ol>
      <details className="px-details px-details--ink">
        <summary>Quais resultados essa hipótese precisaria considerar?</summary>
        <div className="px-chain__outcomes">
          {hypothesisOutcomes.map(o => <div key={o.title}><h4>{o.title}</h4><p>{o.body}</p></div>)}
        </div>
        <p>São alternativas a investigar, sem probabilidade atribuída. Exigem seguimento, medidas de força, composição corporal e controle da gravidade e de outros fatores. O estudo de UTI com GLP-1 não demonstrou diferença significativa de mortalidade hospitalar (PMID 41286572).</p>
      </details>
      <LimitNote>
        <p>Só o elo A foi medido no mesmo estudo. A ligação entre perda de massa magra pelo medicamento e recuperação em UTI ainda não foi demonstrada; não somamos percentuais de estudos distintos.</p>
      </LimitNote>
    </div>
  );
}
