"use client";

import { useState } from "react";

/** Frases que circulam por aí. Cada uma aparece de novo, com a leitura do estudo, na seção da lupa. */
const headlines = [
  { h: "“23,8% dos brasileiros usam sem receita?”", v: "amostra online, não o país" },
  { h: "“Perder massa magra piora a UTI?”", v: "não demonstrado" },
  { h: "“Mounjaro causa sarcopenia?”", v: "DXA não mede força" },
  { h: "“12% dos americanos usam para emagrecer?”", v: "uso atual ou passado, qualquer indicação" },
  { h: "“O SUS já distribui as canetas?”", v: "pedido de avaliação ≠ incorporação" },
  { h: "“5,1% contra 4,9% prova que aumenta a mortalidade?”", v: "diferença não demonstrada" },
];

export function HeadlineMarquee() {
  const [paused, setPaused] = useState(false);
  const row = (hidden: boolean) => (
    <ul className="at-marquee__group" aria-hidden={hidden || undefined}>
      {headlines.map(item => <li key={item.h}><span>{item.h}</span><b className="at-mono">{item.v}</b><i aria-hidden="true">✳</i></li>)}
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
