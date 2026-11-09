import Image from "next/image";
import { evidenceQuestions } from "@/features/insights/questions";

/** Perguntas frequentes como fichas que se abrem: resposta curta, porquê, o que se pode afirmar e a fonte. */
export function EvidenceQuestions() {
  return (
    <div className="px-faq">
      <figure className="px-faq__fig">
        <div className="px-faq__img">
          <Image src="/assets/images/cianotipia/lupa-caneta-2.webp" alt="Cianotipia de uma lupa cujo cabo é uma caneta injetora graduada, entre folhas de samambaia e comprimidos" fill sizes="(max-width: 900px) 70vw, 30vw"/>
        </div>
        <figcaption className="px-faq__cap">Fig. 05.3 — Antes da manchete, o denominador.</figcaption>
      </figure>
      <div className="px-faq__list">
        {evidenceQuestions.map((q, i) => (
          <details key={q.question} className="px-faq__item">
            <summary>
              <span className="px-faq__n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <span className="px-faq__q">{q.question}</span>
              <span className="px-faq__plus" aria-hidden="true"/>
            </summary>
            <div className="px-faq__body">
              <p className="px-faq__short">{q.answer}</p>
              <div className="px-faq__cols">
                <div><h3>Por quê?</h3><p>{q.why}</p></div>
                <div><h3>O que podemos afirmar</h3><p>{q.allows}</p></div>
              </div>
              {q.pmid && <a className="at-link" href={`https://pubmed.ncbi.nlm.nih.gov/${q.pmid}/`} target="_blank" rel="noopener noreferrer">Conferir fonte · PMID {q.pmid} <span aria-hidden="true">↗</span></a>}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
