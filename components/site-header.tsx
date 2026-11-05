import Link from "next/link";
import { Activity, ArrowUpRight } from "lucide-react";
const links = [
  { href: "/evidencias", label: "Evidências" },
  { href: "/comparar", label: "Comparar" },
  { href: "/projecoes", label: "Projeções" },
  { href: "/musculos-uti", label: "Músculos & UTI" },
  { href: "/metodologia", label: "Metodologia" },
];
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight" aria-label="LUPA Saúde — página inicial">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-white"><Activity aria-hidden="true" size={19}/></span>
          <span>LUPA <span className="font-normal text-muted-foreground">Saúde</span></span>
        </Link>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
          Pesquisa e cenários <ArrowUpRight size={13} aria-hidden="true"/>
        </span>
        <nav className="order-3 w-full overflow-x-auto sm:order-none sm:w-auto" aria-label="Navegação principal">
          <ul className="flex min-w-max items-center gap-1 pb-1 sm:pb-0">
            {links.map(link=><li key={link.href}><Link className="inline-flex rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" href={link.href}>{link.label}</Link></li>)}
          </ul>
        </nav>
      </div>
    </header>
  );
}
