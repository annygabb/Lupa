/**
 * Primitivas visuais do atlas LUPA (servidor). Use estas peças em todas as rotas:
 * ChapterHero (capa com h1), Section (bloco com cabeçalho), Specimen (etiqueta de herbário),
 * LimitNote ("onde a conclusão para"), Figure (prancha ilustrada), StatRow (números grandes).
 * Estilos em app/atlas.css (prefixo at-).
 */
import Image from "next/image";
import Link from "next/link";
import { ViewTransition, type ReactNode } from "react";
import { Cutout, Reveal, SplitTitle, Parallax, CountUp } from "./motion";
import { CyanotypePlate } from "./cyanotype-plate";

export function ChapterHero({ n, kicker, title, lead, image, alt, children, cutouts = [] }: {
  n: string; kicker: string; title: ReactNode[]; lead?: ReactNode; image: string; alt: string;
  children?: ReactNode; cutouts?: { name: string; className: string; depth?: number; width?: number; rotate?: number }[];
}) {
  return (
    <header className="at-chapter-hero">
      <div className="at-chapter-hero__meta at-mono" aria-hidden="true">
        <span>Prancha {n}</span><span>Atlas de evidências · LUPA</span>
      </div>
      <div className="at-chapter-hero__copy">
        <p className="at-kicker">{kicker}</p>
        <SplitTitle as="h1" lines={title} immediate className="at-chapter-hero__title"/>
        {lead && <div className="at-chapter-hero__lead">{lead}</div>}
        {children && <div className="at-chapter-hero__actions">{children}</div>}
      </div>
      <Parallax depth={0.25} rotate={1.5} className="at-chapter-hero__fig">
        <ViewTransition name={`plate-${n}`}>
          <figure>
            <CyanotypePlate src={image} alt={alt} priority sizes="(max-width: 900px) 80vw, 38vw"/>
            <figcaption className="at-mono">Fig. {n} — cianotipia</figcaption>
          </figure>
        </ViewTransition>
      </Parallax>
      {cutouts.map(c => <Cutout key={c.name + c.className} name={c.name} depth={c.depth ?? 0.5} width={c.width ?? 180} rotate={c.rotate ?? 8} className={c.className}/>)}
    </header>
  );
}

export function Section({ id, kicker, title, intro, tone = "paper", children, className, chapter }: {
  id?: string; kicker?: string; title?: ReactNode[]; intro?: ReactNode; tone?: "paper" | "ink" | "white";
  children?: ReactNode; className?: string; chapter?: string;
}) {
  const headingId = id ? id + "-title" : undefined;
  return (
    <section id={id} data-chapter={chapter} aria-labelledby={title ? headingId : undefined}
      className={`at-section at-section--${tone} ${className ?? ""}`}>
      <div className="at-section__inner">
        {(kicker || title || intro) && (
          <div className="at-section__head">
            {kicker && <p className="at-kicker">{kicker}</p>}
            {title && <SplitTitle id={headingId} lines={title} className="at-section__title"/>}
            {intro && <Reveal className="at-section__intro">{intro}</Reveal>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

/** Etiqueta de herbário para um dado com origem. */
export function Specimen({ id, href, label, value, note, tone = "paper" }: {
  id: string; href?: string; label: string; value: ReactNode; note?: ReactNode; tone?: "paper" | "ink";
}) {
  const body = (
    <>
      <span className="at-specimen__id at-mono">{id}</span>
      <span className="at-specimen__label at-mono">{label}</span>
      <strong className="at-specimen__value">{value}</strong>
      {note && <span className="at-specimen__note at-mono">{note}</span>}
    </>
  );
  return href
    ? <Link href={href} className={`at-specimen at-specimen--${tone}`}>{body}</Link>
    : <div className={`at-specimen at-specimen--${tone}`}>{body}</div>;
}

/** "Onde a conclusão para": o limite de interpretação, sempre visível. */
export function LimitNote({ title = "Onde a conclusão para", children }: { title?: string; children: ReactNode }) {
  return (
    <aside className="at-limit">
      <span className="at-limit__mark" aria-hidden="true"><i/><b>×</b><i/></span>
      <div><p className="at-limit__title at-mono">{title}</p><div className="at-limit__body">{children}</div></div>
    </aside>
  );
}

export function Figure({ src, alt, caption, ratio = "1 / 1", tilt = 0, className }: {
  src: string; alt: string; caption?: ReactNode; ratio?: string; tilt?: number; className?: string;
}) {
  return (
    <figure className={"at-figure " + (className ?? "")} style={{ rotate: `${tilt}deg` }}>
      <div className="at-figure__img" style={{ aspectRatio: ratio }}>
        <Image src={src} alt={alt} fill sizes="(max-width: 900px) 90vw, 40vw"/>
      </div>
      {caption && <figcaption className="at-mono">{caption}</figcaption>}
    </figure>
  );
}

export function StatRow({ items, tone = "paper" }: {
  items: { value: number; decimals?: number; suffix?: string; label: string }[]; tone?: "paper" | "ink";
}) {
  return (
    <dl className={`at-stats at-stats--${tone}`}>
      {items.map(it => (
        <div key={it.label}><dt>{it.label}</dt><dd><CountUp value={it.value} decimals={it.decimals} suffix={it.suffix}/></dd></div>
      ))}
    </dl>
  );
}

export { Reveal, SplitTitle, Parallax, Cutout };
