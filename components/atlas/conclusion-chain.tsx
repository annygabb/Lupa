"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
import { Cutout, SplitTitle, motionAllowed } from "./motion";

const nodes = [
  { n: "A", title: "Tratamento", img: "canetas-1", alt: "Cianotipia de duas canetas injetoras entre samambaias", body: "Tirzepatida por 72 semanas, em adultos com obesidade ou sobrepeso.", ref: null },
  { n: "B", title: "Composição corporal", img: "corpo-composicao", alt: "Cianotipia de uma figura humana translúcida com camadas de tecido", body: "Medido: massa magra −10,9% por DXA no grupo tratado.", ref: { href: "/evidencias/E04", label: "E04 · SURMOUNT-1" } },
  { n: "C", title: "Força e função", img: "musculo", alt: "Cianotipia de fibras musculares", body: "Não medido neste estudo. Massa magra não é sinônimo de força nem de sarcopenia.", ref: { href: "/evidencias/E10", label: "E10 · definição de sarcopenia" } },
  { n: "D", title: "Recuperação na UTI", img: "uti", alt: "Cianotipia de um leito hospitalar com monitor cardíaco", body: "Outra população: baixa massa muscular na admissão associada à mortalidade (OR 2,33; IC95% 1,90–2,87). O medicamento não foi estudado.", ref: { href: "/evidencias/E12", label: "E12 · metanálise UTI" } },
];

const links = [
  { kind: "solid", label: "medido no mesmo estudo" },
  { kind: "broken", label: "ligação não demonstrada" },
  { kind: "broken", label: "populações diferentes · sem nexo causal" },
];

export function ConclusionChain() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || !motionAllowed()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" }, scrollTrigger: { trigger: ".at-chain__track", start: "top 78%", once: true } });
      gsap.utils.toArray<HTMLElement>(".at-chain__node").forEach((node, i) => {
        tl.from(node, { y: 60, opacity: 0, rotate: i % 2 ? 2 : -2, duration: 0.8 }, i * 0.45);
        const link = el.querySelectorAll<HTMLElement>(".at-chain__link")[i];
        if (link) tl.from(link.querySelector(".at-chain__wire"), { scaleX: 0, scaleY: 0, duration: 0.5, ease: "power2.inOut" }, i * 0.45 + 0.35);
        if (link?.dataset.kind === "broken") tl.from(link.querySelector(".at-chain__break"), { scale: 0, rotate: -40, opacity: 0, duration: 0.3, ease: "back.out(2)" }, i * 0.45 + 0.75);
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="at-chain" data-chapter="Onde a conclusão para" aria-labelledby="chain-title">
      <Cutout name="folhas-soltas" depth={0.5} rotate={-8} width={200} className="at-chain__cut"/>
      <header className="at-sec-head">
        <p className="at-kicker">Capítulo IV · A assinatura do LUPA</p>
        <SplitTitle id="chain-title" lines={["Onde a conclusão", "para."]}/>
        <p>Uma manchete liga tudo numa linha só: caneta → perda de músculo → pior recuperação na UTI. A evidência mostra outra coisa: só o primeiro elo foi medido no mesmo estudo.</p>
      </header>

      <ol className="at-chain__track">
        {nodes.map((node, i) => (
          <li key={node.n} className="at-chain__item">
            <article className="at-chain__node">
              <div className="at-chain__img">
                <Image src={`/assets/images/cianotipia/${node.img}.webp`} alt={node.alt} fill sizes="(max-width: 900px) 70vw, 22vw"/>
                <span className="at-chain__n at-mono" aria-hidden="true">{node.n}</span>
              </div>
              <h3>{node.title}</h3>
              <p>{node.body}</p>
              {node.ref && <Link className="at-link at-mono" href={node.ref.href}>{node.ref.label} →</Link>}
            </article>
            {links[i] && (
              <div className={`at-chain__link at-chain__link--${links[i].kind}`} data-kind={links[i].kind}>
                <span className="at-chain__wire" aria-hidden="true"/>
                {links[i].kind === "broken" && <span className="at-chain__break" aria-hidden="true">×</span>}
                <span className="at-chain__label at-mono">{links[i].label}</span>
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
