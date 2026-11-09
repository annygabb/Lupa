import Image from "next/image";
import { plateFor } from "./plates";

/** Capa ilustrada de cada rota interna: número da prancha, tema e ilustração em cianotipia. */
export function PagePlate({ href }: { href: string }) {
  const plate = plateFor(href);
  if (!plate) return null;
  return (
    <div className="at-plate">
      <div className="at-plate__copy">
        <p className="at-kicker">Prancha {plate.n} · {plate.label}</p>
        <p className="at-plate__word" aria-hidden="true">{plate.label}</p>
        <p className="at-plate__caption">{plate.caption}</p>
      </div>
      <figure className="at-plate__fig">
        <Image src={plate.image} alt={plate.alt} fill priority sizes="(max-width: 900px) 70vw, 30vw"/>
        <figcaption className="at-mono">Fig. {plate.n} — cianotipia</figcaption>
      </figure>
    </div>
  );
}
