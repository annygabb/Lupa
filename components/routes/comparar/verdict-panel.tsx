"use client";

/**
 * Painel de compatibilidade: veredito, três carimbos de permissão e os pontos de atenção
 * vindos de features/comparison. Os carimbos "batem" no papel a cada novo par de estudos.
 */
import { useEffect, useRef, type CSSProperties } from "react";
import { gsap } from "gsap";
import { motionAllowed } from "@/components/atlas/motion";
import type { StudyComparisonAssessment } from "@/features/comparison/compatibility";
import { friendlyCompatibilityWarnings, getCompatibilityVerdict } from "@/features/comparison/compatibility-copy";

export function VerdictPanel({ assessment, pairKey }: { assessment: StudyComparisonAssessment; pairKey: string }) {
  const root = useRef<HTMLElement>(null);
  const first = useRef(true);
  const verdict = getCompatibilityVerdict(assessment);
  const warnings = friendlyCompatibilityWarnings(assessment);
  const sideBySide = assessment.canShowSideBySide;

  const stamps = [
    { label: "Leitura lado a lado", value: sideBySide ? "Disponível" : "Indisponível", ok: sideBySide,
      note: sideBySide ? "Métodos e resultados de cada estudo, um ao lado do outro." : "Os dois campos apontam para a mesma publicação." },
    { label: "Cálculo combinado", value: "Bloqueado", ok: false, note: "Nenhuma diferença, soma ou média entre publicações." },
    { label: "Projeções", value: "Bloqueadas", ok: false, note: "Nenhum indicador está liberado para projeção populacional." },
  ];

  useEffect(() => {
    const el = root.current;
    if (!el || !motionAllowed()) return;
    const stampEls = el.querySelectorAll(".cp-stamp");
    const rows = el.querySelectorAll(".cp-warn");
    const initial = first.current;
    first.current = false;
    const tl = gsap.timeline({
      scrollTrigger: initial ? { trigger: el, start: "top 80%", once: true } : undefined,
    });
    tl.from(stampEls, { scale: 1.7, opacity: 0, duration: 0.5, ease: "back.out(2.2)", stagger: 0.14 })
      .from(rows, { x: -24, opacity: 0, duration: 0.55, ease: "power3.out", stagger: 0.07 }, "-=0.2");
    return () => { tl.scrollTrigger?.kill(); tl.kill(); gsap.set([...stampEls, ...rows], { clearProps: "opacity,transform" }); };
  }, [pairKey]);

  return (
    <section ref={root} className={"cp-verdict" + (sideBySide ? "" : " is-blocked")} aria-labelledby="cp-verdict-title">
      <div className="cp-verdict__head">
        <div aria-live="polite">
          <p className="cp-verdict__kicker at-mono">Análise de compatibilidade</p>
          <h3 id="cp-verdict-title" className="cp-verdict__title">{verdict.title}</h3>
          <p className="cp-verdict__sub">{verdict.subtitle}</p>
        </div>
        <p className="cp-verdict__status at-mono"><span aria-hidden="true"/>{verdict.statusLabel}</p>
      </div>

      <ul className="cp-stamps" aria-label="Permissões da comparação">
        {stamps.map((s, i) => (
          <li key={s.label} className={"cp-stamp " + (s.ok ? "is-ok" : "is-locked")} style={{ "--tilt": `${[-2.5, 1.8, -1.2][i]}deg` } as CSSProperties}>
            <span className="cp-stamp__label at-mono">{s.label}</span>
            <strong className="cp-stamp__value">{s.value}</strong>
            <span className="cp-stamp__note">{s.note}</span>
          </li>
        ))}
      </ul>

      <div className="cp-warns">
        <div className="cp-warns__head">
          <h4>Pontos de atenção</h4>
          <span className="at-mono">{warnings.length} {warnings.length === 1 ? "observação" : "observações"}</span>
        </div>
        {warnings.length ? (
          <ol className="cp-warns__list">
            {warnings.map((w, i) => (
              <li key={w.code} className={"cp-warn" + (i === 0 ? " is-featured" : "")}>
                <span className="cp-warn__n at-mono" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  {i === 0 && <p className="cp-warn__flag at-mono">Principal ponto de atenção</p>}
                  <p className="cp-warn__title">{w.title}</p>
                  <p className="cp-warn__sum">{w.summary}</p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="cp-warns__empty">Nenhum conflito temático adicional foi identificado. Isso não habilita cálculos combinados.</p>
        )}
      </div>

      <details className="cp-why">
        <summary><span>Ver justificativas científicas completas</span><span className="cp-why__icon" aria-hidden="true">+</span></summary>
        <dl className="cp-why__grid">
          {assessment.warnings.map(w => (
            <div key={w.code}><dt>{w.label}</dt><dd>{w.explanation}</dd></div>
          ))}
        </dl>
      </details>

      <p className="cp-verdict__how">
        <strong>Como usar esta análise:</strong>{" "}
        {sideBySide
          ? "Use a comparação para entender os métodos e limites de cada pesquisa — não para calcular risco clínico."
          : "Escolha outra referência antes de continuar a análise descritiva."}
      </p>
    </section>
  );
}
