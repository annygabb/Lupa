"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { gsap } from "gsap";
import { evidenceLensClaims } from "@/features/interpretation/claims";
import { interpretClaim } from "@/features/interpretation/interpret-claim";
import { Cutout, SplitTitle, motionAllowed } from "./motion";

/**
 * "Passe a lupa na manchete": a manchete fica na camada de cima; a leitura do estudo,
 * na camada de baixo. A lupa abre um círculo que segue o cursor; o botão abre tudo.
 * As duas camadas estão no DOM e são lidas por leitores de tela.
 * Evidence Lens: cada manchete é uma afirmação curada interpretada pelo motor determinístico
 * (features/interpretation), com fontes, limites, bloqueios e status de revisão.
 */
const noopSubscribe = () => () => {};
const readClaimParam = () => new URLSearchParams(window.location.search).get("afirmacao");

export function LensHeadlines() {
  // ?afirmacao=<id> abre o Lens naquela afirmação (link compartilhável, sem dados pessoais).
  const urlClaimId = useSyncExternalStore(noopSubscribe, readClaimParam, () => null);
  const urlIndex = evidenceLensClaims.findIndex(c => c.id === urlClaimId);
  const [picked, setIndex] = useState<number | null>(null);
  const index = picked ?? (urlIndex >= 0 ? urlIndex : 0);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState("");
  const stage = useRef<HTMLDivElement>(null);
  const radius = useRef({ r: 0 });
  const pos = useRef({ x: 50, y: 50 });
  const claim = evidenceLensClaims[index];
  const r = useMemo(() => interpretClaim(claim.id)!, [claim.id]);
  const tab = revealed ? 0 : -1;

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

  // Demonstração: ao entrar na tela, a lupa aparece sozinha sobre a manchete e some.
  useEffect(() => {
    const el = stage.current;
    if (!el || !motionAllowed()) return;
    const io = new IntersectionObserver(entries => {
      if (!entries.some(e => e.isIntersecting)) return;
      io.disconnect();
      pos.current = { x: 34, y: 62 };
      const tl = gsap.timeline({ onUpdate: paint });
      tl.to(radius.current, { r: 170, duration: 0.8, ease: "power3.out", delay: 0.4 })
        .to(pos.current, { x: 66, y: 48, duration: 1.6, ease: "sine.inOut" })
        .to(radius.current, { r: 0, duration: 0.5, ease: "power2.in" }, "+=0.3");
    }, { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const choose = (i: number) => {
    setIndex(i);
    setRevealed(false);
    setCopied("");
    const url = new URL(window.location.href);
    url.searchParams.set("afirmacao", evidenceLensClaims[i].id);
    url.hash = "lupa";
    window.history.replaceState(null, "", url);
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
  const onEnter = (e: React.PointerEvent) => { if (!revealed && e.pointerType !== "touch") animateRadius(170, 0.45); };
  const onTap = (e: React.PointerEvent) => {
    if (e.pointerType !== "touch" || (e.target as HTMLElement).closest("a")) return;
    toggleReveal();
  };
  const onLeave = () => { if (!revealed) animateRadius(0, 0.3); };
  const share = async () => {
    const link = `${window.location.origin}/?afirmacao=${claim.id}#lupa`;
    try { await navigator.clipboard.writeText(link); setCopied("Link desta investigação copiado."); }
    catch { setCopied(`Copie o link: ${link}`); }
  };

  return (
    <section id="lupa" className="at-lens-sec" data-chapter="Passe a lupa na manchete" aria-labelledby="lupa-title">
      <Cutout name="samambaia-curta" white depth={0.6} rotate={-14} width={260} className="at-lens-sec__cut"/>
      <header className="at-sec-head at-sec-head--light">
        <p className="at-kicker">Capítulo I · Manchete × estudo</p>
        <SplitTitle id="lupa-title" lines={["Passe a lupa", "na manchete."]}/>
        <p>Escolha uma frase que circula por aí. Passe o cursor (ou toque) sobre a manchete para espiar o que o estudo mediu, ou abra a leitura completa.</p>
      </header>

      <div className="at-lens-sec__body">
        <ol className="at-lens-sec__list" aria-label="Manchetes">
          {evidenceLensClaims.map((item, i) => (
            <li key={item.id}>
              <button type="button" aria-pressed={i === index} onClick={() => choose(i)}>
                <span className="at-mono">{String(i + 1).padStart(2, "0")}</span>{item.question}
              </button>
            </li>
          ))}
        </ol>

        <div className="at-lens-sec__panel">
          <div ref={stage} className={"at-lens-stage" + (revealed ? " is-revealed" : "")}
            onPointerMove={onMove} onPointerEnter={onEnter} onPointerLeave={onLeave} onPointerDown={onTap}>
            <div className="at-lens-stage__headline">
              <p className="at-mono">Manchete {String(index + 1).padStart(2, "0")}</p>
              <p className="at-lens-stage__q">{claim.question}</p>
            </div>
            <div className="at-lens-stage__study" role="region" aria-label="O que o estudo permite dizer">
              <p className="at-mono">O que o estudo mediu · {r.classificationLabel}</p>
              <p className="at-lens-stage__a">{r.summary}</p>
              <p className="at-lens-stage__status at-mono">{r.reviewStatusLabel}</p>
              <div className="at-lens-stage__cols">
                <div><h3>Por quê</h3><p>{r.explanation}</p></div>
                <div><h3>O que dá para concluir</h3><p>{r.allowedConclusion}</p></div>
              </div>
              <div className="at-lens-stage__cols">
                <div>
                  <h3>O que não dá para concluir</h3>
                  <ul className="at-lens-stage__list">{r.prohibitedExtrapolations.map(p => <li key={p}>{p}</li>)}</ul>
                </div>
                {r.projection && !r.projection.allowed ? (
                  <div>
                    <h3>Por que o LUPA não projeta isso</h3>
                    <ul className="at-lens-stage__list">{r.projection.blockers.map(b => <li key={b.code}><strong>{b.title}.</strong> {b.why}</li>)}</ul>
                  </div>
                ) : r.comparison ? (
                  <div>
                    <h3>Por que não juntar os estudos</h3>
                    <ul className="at-lens-stage__list">{r.comparison.warnings.filter(w => w.code !== "BOTH_PENDING_CURATOR_REVIEW").slice(0, 3).map(w => <li key={w.code}><strong>{w.label}.</strong> {w.explanation}</li>)}</ul>
                  </div>
                ) : null}
              </div>
              <div className="at-lens-stage__links">
                {r.evidence.map(e => (
                  <Link key={e.id} className="at-lens-stage__src" href={e.passportHref} tabIndex={tab}>Passaporte {e.id} →</Link>
                ))}
                {r.comparison && <Link className="at-lens-stage__src" href={r.comparison.compareHref} tabIndex={tab}>Ver no comparador →</Link>}
                {r.evidence[0] && (
                  <a className="at-lens-stage__src" href={r.evidence[0].url} target="_blank" rel="noopener noreferrer" tabIndex={tab}>
                    Fonte original{r.evidence[0].pmid ? ` · PubMed ${r.evidence[0].pmid}` : ""} ↗
                  </a>
                )}
              </div>
            </div>
            <span className="at-lens-stage__ring" aria-hidden="true"/>
          </div>
          <div className="at-lens-sec__actions">
            <button type="button" className="at-btn at-btn--solid" aria-pressed={revealed} onClick={toggleReveal}>
              {revealed ? "Voltar à manchete" : "Abrir a leitura do estudo"}
            </button>
            <button type="button" className="at-btn at-btn--ghost" onClick={share}>Copiar link desta investigação</button>
            <span className="at-mono at-lens-sec__hint" aria-live="polite">{copied || "Interpretação determinística · sem IA · revisão clínica independente pendente"}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
