"use client";

/**
 * Investigação guiada em scrollytelling: em telas largas (e com movimento permitido) o palco
 * fica fixo enquanto a rolagem percorre as quatro perguntas; um clique numa pergunta seleciona
 * a resposta e leva a rolagem ao trecho correspondente. Em telas estreitas, com movimento
 * reduzido ou sem JS, é um explorador comum (botões + resposta), sem palco fixo.
 */
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LimitNote } from "@/components/atlas/ui";
import { motionAllowed } from "@/components/atlas/motion";
import {
  evaluateMuscleIcuCausalChain, getResearchClaim, researchQuestions, type ResearchClaim,
} from "@/features/muscle/evidence-map";
import { inquiryFigures } from "./data";

gsap.registerPlugin(ScrollTrigger);

const QUERY = "(min-width: 1024px) and (min-height: 680px)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(QUERY);
  const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  rm.addEventListener("change", cb);
  window.addEventListener("lupa:motion", cb);
  return () => { mq.removeEventListener("change", cb); rm.removeEventListener("change", cb); window.removeEventListener("lupa:motion", cb); };
};
const getStage = () => window.matchMedia(QUERY).matches && motionAllowed();
const getServerStage = () => false;

const strengthName: Record<ResearchClaim["strength"], string> = {
  observed: "observado", consensus: "consenso", association: "associação", unsupported: "não sustentado",
};

const items = researchQuestions.map(q => ({ ...q, claim: getResearchClaim(q.claimId)!, fig: inquiryFigures[q.key] }));
const N = items.length;

export function GuidedInquiry() {
  const [idx, setIdx] = useState(0);
  const staged = useSyncExternalStore(subscribe, getStage, getServerStage);
  const track = useRef<HTMLDivElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const lock = useRef(false);
  const unlockTimer = useRef<number | undefined>(undefined);
  const causal = evaluateMuscleIcuCausalChain();
  const current = items[idx];

  useEffect(() => {
    const el = track.current;
    if (!staged || !el) return;
    const st = ScrollTrigger.create({
      trigger: el, start: "top top", end: "bottom bottom",
      onUpdate: self => {
        el.style.setProperty("--mu-progress", self.progress.toFixed(4));
        if (lock.current) return;
        setIdx(Math.min(N - 1, Math.floor(self.progress * N)));
      },
    });
    trigger.current = st;
    return () => { st.kill(); trigger.current = null; el.style.removeProperty("--mu-progress"); };
  }, [staged]);

  useEffect(() => () => window.clearTimeout(unlockTimer.current), []);

  const select = useCallback((i: number) => {
    setIdx(i);
    const st = trigger.current;
    if (!staged || !st) return;
    const y = st.start + (st.end - st.start) * ((i + 0.5) / N);
    lock.current = true;
    window.clearTimeout(unlockTimer.current);
    const unlock = () => { lock.current = false; };
    unlockTimer.current = window.setTimeout(unlock, 1500);
    const lenis = window.__lupaLenis;
    if (lenis) lenis.scrollTo(y, { duration: 0.9, force: true, onComplete: unlock });
    else window.scrollTo({ top: y });
  }, [staged]);

  return (
    <div ref={track} className="mu-inquiry__track" data-mode={staged ? "stage" : "flow"}>
      <div className="mu-inquiry__stage">
        <div className="mu-inquiry__questions">
          <p className="mu-inquiry__count at-mono" aria-hidden="true">
            <span>{String(idx + 1).padStart(2, "0")}</span> / {String(N).padStart(2, "0")}
          </p>
          <div className="mu-inquiry__list" role="group" aria-label="Perguntas de pesquisa">
            <span className="mu-inquiry__rail" aria-hidden="true"><i/></span>
            {items.map((q, i) => (
              <button key={q.key} type="button" className="mu-q" aria-pressed={i === idx} onClick={() => select(i)}>
                <span className="mu-q__n at-mono" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <span className="mu-q__t">{q.title}</span>
              </button>
            ))}
          </div>
          {staged && <p className="mu-inquiry__hint at-mono">Role para avançar ou escolha uma pergunta.</p>}
        </div>

        <div className="mu-inquiry__prints" aria-hidden="true">
          {items.map((q, i) => (
            <figure key={q.key} className={"mu-print" + (i === idx ? " is-active" : i < idx ? " is-past" : " is-next")}
              style={{ ["--r" as string]: `${(i % 2 ? 1 : -1) * (2 + i)}deg`, aspectRatio: q.fig.ratio }}>
              <Image src={q.fig.src} alt="" fill sizes="(max-width: 1023px) 92vw, 24vw"/>
              <figcaption className="at-mono">{q.fig.caption}</figcaption>
            </figure>
          ))}
        </div>

        <article className="mu-answer" aria-live="polite" data-strength={current.claim.strength}>
          <p className="mu-answer__tag at-mono">
            <span className="mu-answer__dot" aria-hidden="true"/>
            {current.claim.readableLabel}<span className="sr-only"> ({strengthName[current.claim.strength]})</span>
          </p>
          <h3 key={current.claim.id} className="mu-answer__title">{current.claim.headline}</h3>
          <p className="mu-answer__summary">{current.claim.summary}</p>
          {current.key === "causa" && <p className="mu-answer__causal">{causal.message}</p>}
          <div className="mu-answer__measured">
            <p className="at-mono">O que é medido</p>
            <p>{current.claim.measured}</p>
          </div>
          <LimitNote title="O que não se pode inferir"><p>{current.claim.notInferred}</p></LimitNote>
          <div className="mu-answer__foot">
            <span className="at-mono">Fontes catalogadas: {current.claim.evidenceIds.join(", ")}</span>
            <a className="at-btn at-btn--line mu-answer__link" href={current.claim.url} target="_blank" rel="noopener noreferrer">
              Abrir publicação <span aria-hidden="true">↗</span>
            </a>
          </div>
        </article>
      </div>
    </div>
  );
}
