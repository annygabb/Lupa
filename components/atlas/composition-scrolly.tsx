"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
import { Cutout, SplitTitle } from "./motion";

/** Dados do subestudo DXA do SURMOUNT-1 (E04 · M01–M03), conferidos na fonte. */
const steps = [
  {
    k: "72 semanas",
    title: "O peso caiu 21,3%.",
    text: "No subestudo DXA do SURMOUNT-1, o grupo da tirzepatida (n=124) perdeu em média 21,3% do peso. No placebo (n=36), 5,3%.",
  },
  {
    k: "Composição",
    title: "De cada 100 partes perdidas, ~75 eram gordura.",
    text: "A massa gorda caiu 33,9% e a massa magra, 10,9%, cada uma em relação ao próprio valor inicial. Na partição do peso perdido, cerca de 75% foi gordura e 25% massa magra, nos dois grupos.",
  },
  {
    k: "Leitura correta",
    title: "25% do peso perdido, não 25% dos músculos.",
    text: "Massa magra inclui água, órgãos e outros tecidos além do músculo. O número descreve a composição do que saiu, não quanto músculo a pessoa perdeu.",
  },
  {
    k: "Onde para",
    title: "DXA mede massa. Não mede força.",
    text: "O estudo não avaliou força, função muscular nem sarcopenia. Para falar disso, são precisos outros testes, que este subestudo não fez.",
  },
];

const CELLS = Array.from({ length: 100 }, (_, i) => i);

export function CompositionScrolly() {
  const [active, setActive] = useState(0);
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".at-scrolly__step").forEach((step, i) => {
        ScrollTrigger.create({
          trigger: step, start: "top 78%", end: "bottom 78%",
          onToggle: self => { if (self.isActive) setActive(i); },
        });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="at-scrolly" data-chapter="O que foi perdido?" aria-labelledby="scrolly-title" data-step={active}>
      <Cutout name="eucalipto" depth={0.7} rotate={10} width={150} className="at-scrolly__cut"/>
      <header className="at-sec-head">
        <p className="at-kicker">Capítulo II · Composição corporal · E04</p>
        <SplitTitle id="scrolly-title" lines={["O peso caiu.", "O que foi perdido?"]}/>
      </header>

      <div className="at-scrolly__grid">
        <div className="at-scrolly__visual">
          <div className="at-scrolly__sticky">
            <div className="at-waffle" role="img"
              aria-label="Grade de 100 quadrados: cerca de 75 representam gordura e 25 massa magra do peso perdido, no subestudo DXA do SURMOUNT-1.">
              {CELLS.map(i => (
                <span key={i} className={"at-waffle__cell" + (i >= 75 ? " is-lean" : " is-fat")} style={{ ["--i" as string]: i }}/>
              ))}
            </div>
            <div className="at-waffle__legend at-mono" aria-hidden="true">
              <span><i className="is-fat"/>~75 gordura</span>
              <span><i className="is-lean"/>~25 massa magra</span>
              <span>de cada 100 partes do peso perdido</span>
            </div>
            <figure className="at-scrolly__figure">
              <Image src="/assets/images/cianotipia/corpo-composicao.webp" alt="Cianotipia de um estudo anatômico translúcido de uma figura humana, com camadas de gordura e músculo" fill sizes="(max-width: 900px) 80vw, 34vw"/>
            </figure>
            <span className="at-stamp" aria-hidden="true">Força · não medida</span>
          </div>
        </div>

        <ol className="at-scrolly__steps">
          {steps.map((s, i) => (
            <li key={s.k} className={"at-scrolly__step" + (i === active ? " is-active" : "")}>
              <p className="at-mono">{String(i + 1).padStart(2, "0")} · {s.k}</p>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
          <li className="at-scrolly__source">
            <p className="at-mono">Fonte · SURMOUNT-1, subestudo DXA (n=160) · 72 semanas · financiamento Eli Lilly</p>
            <Link className="at-link" href="/evidencias/E04">Abrir a ficha E04 →</Link>
          </li>
        </ol>
      </div>
    </section>
  );
}
