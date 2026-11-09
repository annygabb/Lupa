"use client";

/**
 * Cadeia tratamento → composição → força → UTI. Só o primeiro elo foi medido no mesmo estudo;
 * os outros aparecem interrompidos. Animação ligada à rolagem (nós sobem, fios se desenham,
 * as rupturas "estalam"); com movimento reduzido tudo fica estático e legível.
 */
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motionAllowed } from "@/components/atlas/motion";
import { chainLinks, chainNodes } from "./data";

gsap.registerPlugin(ScrollTrigger);

export function CausalChain() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || !motionAllowed()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" }, scrollTrigger: { trigger: el, start: "top 78%", once: true } });
      const desktop = window.matchMedia("(min-width: 1101px)").matches;
      const nodes = gsap.utils.toArray<HTMLElement>(".mu-chain__node");
      const segs = gsap.utils.toArray<HTMLElement>(desktop ? ".mu-chain__seg" : ".mu-chain__link");
      const dots = gsap.utils.toArray<HTMLElement>(".mu-chain__dot");
      nodes.forEach((node, i) => {
        tl.from(node, { y: 70, opacity: 0, rotate: i % 2 ? 2.5 : -2.5, duration: 0.6 }, i * 0.45);
        if (desktop && dots[i]) tl.from(dots[i], { scale: 0, duration: 0.3, ease: "back.out(2)" }, i * 0.45);
        const seg = segs[i];
        if (!seg) return;
        tl.from(seg.querySelector(desktop ? ".mu-chain__line" : ".mu-chain__wire"), { scale: 0, duration: 0.5, ease: "power2.inOut" }, i * 0.45 + 0.3);
        const brk = seg.querySelector(".mu-chain__break");
        if (brk) tl.from(brk, { scale: 0, rotate: -60, opacity: 0, duration: 0.3, ease: "back.out(2.4)" }, i * 0.45 + 0.7);
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="mu-chain-wrap">
      <div className="mu-chain__rail" aria-hidden="true">
        {chainNodes.map((node, i) => <span key={node.n} className="mu-chain__dot at-mono" style={{ gridColumn: `${i * 2 + 1} / span 2` }}>{node.n}</span>)}
        {chainLinks.map((link, i) => (
          <span key={link.label} className={`mu-chain__seg mu-chain__seg--${link.kind}`} style={{ gridColumn: `${i * 2 + 2} / span 2` }}>
            <span className="mu-chain__line"/>
            {link.kind === "broken" && <span className="mu-chain__break">×</span>}
            <span className="mu-chain__seg-label at-mono">{link.label}</span>
          </span>
        ))}
      </div>
      <ol className="mu-chain">
        {chainNodes.map((node, i) => {
          const link = chainLinks[i];
          return (
            <li key={node.n} className="mu-chain__item">
              <article className={"mu-chain__node" + (node.tag === "Lacuna" ? " is-gap" : "")}>
                <div className="mu-chain__img">
                  <Image src={node.img} alt="" fill sizes="(max-width: 700px) 30vw, (max-width: 1100px) 40vw, 22vw"/>
                  <span className="mu-chain__n at-mono" aria-hidden="true">{node.n}</span>
                </div>
                <div className="mu-chain__copy">
                  <p className="mu-chain__tag at-mono">{node.tag}</p>
                  <h3>{node.title}</h3>
                  <p>{node.body}</p>
                  {node.ref && <Link className="mu-chain__ref at-mono" href={node.ref.href}>{node.ref.label} →</Link>}
                </div>
              </article>
              {link && <p className="sr-only">Ligação de {node.title} para {chainNodes[i + 1].title}: {link.label}.</p>}
              {link && (
                <div className={`mu-chain__link mu-chain__link--${link.kind}`} aria-hidden="true">
                  <span className="mu-chain__wire"/>
                  {link.kind === "broken" && <span className="mu-chain__break">×</span>}
                  <span className="mu-chain__label at-mono">{link.label}</span>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
