import Link from "next/link";
import { plates } from "@/components/atlas/plates";

export function SiteFooter() {
  return (
    <footer className="at-footer">
      <div className="at-footer__inner">
        <div className="at-footer__lead">
          <p className="at-footer__word" aria-hidden="true">LUPA</p>
          <p className="at-footer__claim">Evidência antes da conclusão.</p>
        </div>
        <nav className="at-footer__nav" aria-label="Pranchas do atlas">
          <ul>
            {plates.map(p => (
              <li key={p.href}><Link href={p.href}><span>{p.n}</span>{p.label}</Link></li>
            ))}
          </ul>
        </nav>
        <div className="at-footer__meta">
          <p>Ferramenta de pesquisa. Não oferece diagnóstico, prescrição nem estimativa de risco individual.</p>
          <p>Acervo: 50 referências em curadoria. Registros e gráficos sem revisão clínica independente.</p>
          <p className="at-mono">© 2026 · LUPA Saúde · Hack Brasil · Ilustrações em cianotipia geradas localmente</p>
        </div>
      </div>
    </footer>
  );
}
