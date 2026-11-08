"use client";

import { useState } from "react";

/** Frases que circulam por aí. Cada uma aparece de novo, com a leitura do estudo, na seção da lupa. */
const headlines = [
  "“23,8% dos brasileiros usam sem receita?”",
  "“Perder massa magra piora a UTI?”",
  "“Mounjaro causa sarcopenia?”",
  "“12% dos americanos usam para emagrecer?”",
  "“O SUS já distribui as canetas?”",
  "“5,1% contra 4,9% prova que aumenta a mortalidade?”",
];

export function HeadlineMarquee() {
  const [paused, setPaused] = useState(false);
  const row = (hidden: boolean) => (
    <ul className="at-marquee__group" aria-hidden={hidden || undefined}>
      {headlines.map(h => <li key={h}><span>{h}</span><i aria-hidden="true">✳</i></li>)}
    </ul>
  );
  return (
    <section className={"at-marquee" + (paused ? " is-paused" : "")} aria-label="Manchetes que circulam">
      <div className="at-marquee__track">{row(false)}{row(true)}{row(true)}</div>
      <button type="button" className="at-marquee__pause" onClick={() => setPaused(v => !v)} aria-pressed={paused}>
        {paused ? "Retomar" : "Pausar"}
      </button>
    </section>
  );
}
