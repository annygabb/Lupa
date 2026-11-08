"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { plates } from "./plates";

/** Índice de pranchas com prévia que segue o cursor (desktop) e miniatura fixa (toque). */
export function PlatesIndex() {
  const [hover, setHover] = useState<number | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const preview = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const l = list.current, p = preview.current;
    if (!l || !p || window.matchMedia("(hover: none)").matches) return;
    const xTo = gsap.quickTo(p, "x", { duration: 0.5, ease: "power3" });
    const yTo = gsap.quickTo(p, "y", { duration: 0.5, ease: "power3" });
    const move = (e: PointerEvent) => {
      const r = l.getBoundingClientRect();
      xTo(e.clientX - r.left); yTo(e.clientY - r.top);
    };
    l.addEventListener("pointermove", move);
    return () => l.removeEventListener("pointermove", move);
  }, []);

  return (
    <section className="at-index" data-chapter="Por onde começar" aria-labelledby="index-title">
      <header className="at-sec-head">
        <p className="at-kicker">Por onde começar</p>
        <h2 id="index-title">Seis pranchas.<br/>Uma pergunta em cada.</h2>
      </header>

      <div className="at-index__profiles">
        <Link href="/comparar"><span className="at-mono">Profissional de saúde</span>Verificar se dois resultados podem ser comparados <b aria-hidden="true">→</b></Link>
        <Link href="/evidencias"><span className="at-mono">Estudante</span>Ler cada estudo com população, método e limite <b aria-hidden="true">→</b></Link>
        <Link href="/musculos-uti"><span className="at-mono">Quero entender o tratamento</span>Saber o que muda além do peso <b aria-hidden="true">→</b></Link>
      </div>

      <div ref={list} className="at-index__list" onPointerLeave={() => setHover(null)}>
        <ul>
          {plates.map((p, i) => (
            <li key={p.href}>
              <Link href={p.href} className="at-index__row" onPointerEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}>
                <span className="at-index__n at-mono">{p.n}</span>
                <span className="at-index__label">{p.label}</span>
                <span className="at-index__title">{p.title}</span>
                <span className="at-index__thumb" aria-hidden="true"><Image src={p.image} alt="" fill sizes="96px"/></span>
                <span className="at-index__arrow" aria-hidden="true">↗</span>
              </Link>
            </li>
          ))}
        </ul>
        <div ref={preview} className={"at-index__preview" + (hover !== null ? " is-on" : "")} aria-hidden="true">
          {plates.map((p, i) => (
            <div key={p.href} className={"at-index__preview-img" + (hover === i ? " is-active" : "")}>
              <Image src={p.image} alt="" fill sizes="320px"/>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
