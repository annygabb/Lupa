"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { evidenceQuestions } from "@/features/insights/questions";

/**
 * "Passe a lupa na manchete": a manchete fica na camada de cima; a leitura do estudo,
 * na camada de baixo. A lupa abre um círculo que segue o cursor; o botão abre tudo.
 * As duas camadas estão no DOM e são lidas por leitores de tela.
 */
export function LensHeadlines() {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const radius = useRef({ r: 0 });
  const pos = useRef({ x: 50, y: 50 });
  const q = evidenceQuestions[index];

  const paint = () => {
    const el = stage.current;
    if (!el) return;
    el.style.setProperty("--lx", `${pos.current.x}%`);
    el.style.setProperty("--ly", `${pos.current.y}%`);
    el.style.setProperty("--lr", `${radius.current.r}px`);
    el.dataset.peek = radius.current.r > 2 ? "1" : "0";
  };

  const animateRadius = (r: number, duration = 0.5) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.to(radius.current, { r, duration: reduce ? 0 : duration, ease: "power3.out", onUpdate: paint });
  };

  const choose = (i: number) => {
    setIndex(i);
    setRevealed(false);
    gsap.killTweensOf(radius.current);
    radius.current.r = 0;
    paint();
  };

  const toggleReveal = () => {
    const next = !revealed;
    setRevealed(next);
    if (next) animateRadius(Math.hypot(stage.current?.offsetWidth ?? 1200, stage.current?.offsetHeight ?? 600), 0.9);
    else animateRadius(0, 0.4);
  };

  const onMove = (e: React.PointerEvent) => {
    if (revealed || e.pointerType === "touch") return;
    const r = stage.current!.getBoundingClientRect();
    pos.current = { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 };
    paint();
  };
  const onEnter = (e: React.PointerEvent) => { if (!revealed && e.pointerType !== "touch") animateRadius(130, 0.45); };
  const onLeave = () => { if (!revealed) animateRadius(0, 0.3); };

  return (
    <section id="lupa" className="at-lens-sec" data-chapter="Passe a lupa na manchete" aria-labelledby="lupa-title">
      <header className="at-sec-head at-sec-head--light">
        <p className="at-kicker">Prancha 00.1 · Manchete × estudo</p>
        <h2 id="lupa-title">Passe a lupa<br/>na manchete.</h2>
        <p>Escolha uma frase que circula por aí. Passe o cursor para espiar o que o estudo mediu, ou abra a leitura completa.</p>
      </header>

      <div className="at-lens-sec__body">
        <ol className="at-lens-sec__list" aria-label="Manchetes">
          {evidenceQuestions.map((item, i) => (
            <li key={item.question}>
              <button type="button" aria-pressed={i === index} onClick={() => choose(i)}>
                <span className="at-mono">{String(i + 1).padStart(2, "0")}</span>{item.question}
              </button>
            </li>
          ))}
        </ol>

        <div className="at-lens-sec__panel">
          <div ref={stage} className={"at-lens-stage" + (revealed ? " is-revealed" : "")}
            onPointerMove={onMove} onPointerEnter={onEnter} onPointerLeave={onLeave}>
            <div className="at-lens-stage__headline">
              <p className="at-mono">Manchete {String(index + 1).padStart(2, "0")}</p>
              <p className="at-lens-stage__q">{q.question}</p>
            </div>
            <div className="at-lens-stage__study" role="region" aria-label="O que o estudo permite dizer">
              <p className="at-mono">O que o estudo mediu</p>
              <p className="at-lens-stage__a">{q.answer}</p>
              <div className="at-lens-stage__cols">
                <div><h3>Por quê</h3><p>{q.why}</p></div>
                <div><h3>O que dá para concluir</h3><p>{q.allows}</p></div>
              </div>
              {q.pmid && (
                <a className="at-lens-stage__src" href={`https://pubmed.ncbi.nlm.nih.gov/${q.pmid}/`} target="_blank" rel="noopener noreferrer" tabIndex={revealed ? 0 : -1}>
                  Fonte · PubMed {q.pmid} ↗
                </a>
              )}
            </div>
            <span className="at-lens-stage__ring" aria-hidden="true"/>
          </div>
          <div className="at-lens-sec__actions">
            <button type="button" className="at-btn at-btn--solid" aria-pressed={revealed} onClick={toggleReveal}>
              {revealed ? "Voltar à manchete" : "Abrir a leitura do estudo"}
            </button>
            <span className="at-mono at-lens-sec__hint">Leitura descritiva da fonte · sem revisão clínica independente</span>
          </div>
        </div>
      </div>
    </section>
  );
}
