/**
 * "O que esses dados não demonstram": três pranchas ilustradas sobre o fundo azul
 * e o convite para consultar a fonte. Componente de servidor.
 */
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Reveal } from "@/components/atlas/ui";

const plates = [
  {
    n: "i", img: "musculo", alt: "Cianotipia de feixes de fibras musculares em estilo de gravura anatômica",
    title: "Massa magra não é força muscular",
    body: "Medidas por DXA não diagnosticam sozinhas sarcopenia ou perda funcional.",
  },
  {
    n: "ii", img: "uti", alt: "Cianotipia de um leito hospitalar com monitor cardíaco",
    title: "UTI não é efeito da medicação",
    body: "Pesquisas independentes não provam que a tirzepatida altere a recuperação em UTI.",
  },
  {
    n: "iii", img: "globo", alt: "Cianotipia de um globo terrestre antigo com folhas ao redor da base",
    title: "Estudo não é projeção nacional",
    body: "Resultados de grupos selecionados não são taxas aplicáveis automaticamente ao Brasil.",
  },
];

export function LimitsPlates() {
  return (
    <>
      <Reveal as="ol" className="cp-limits">
        {plates.map((p, i) => (
          <li key={p.n} className="cp-limits__item" style={{ "--tilt": `${[-1.2, 0.8, -0.6][i]}deg` } as CSSProperties}>
            <div className="cp-limits__img">
              <Image src={`/assets/images/cianotipia/${p.img}.webp`} alt={p.alt} fill sizes="(max-width: 900px) 90vw, 30vw"/>
              <span className="cp-limits__x" aria-hidden="true">×</span>
            </div>
            <p className="cp-limits__n at-mono" aria-hidden="true">Limite {p.n}</p>
            <h3>{p.title}</h3>
            <p>{p.body}</p>
          </li>
        ))}
      </Reveal>
      <div className="cp-source-cta">
        <div>
          <p className="cp-source-cta__title">A fonte importa tanto quanto o dado.</p>
          <p>Consulte os artigos, a população e as limitações antes de interpretar qualquer número.</p>
        </div>
        <Link className="at-btn at-btn--light" href="/evidencias">Abrir biblioteca <span aria-hidden="true">→</span></Link>
      </div>
    </>
  );
}
