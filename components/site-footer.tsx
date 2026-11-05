import Link from "next/link";
import { Activity, ArrowUpRight } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex flex-col gap-1.5">
          <span className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Activity size={17} className="text-primary" aria-hidden="true"/>
            LUPA Saúde
          </span>
          <p className="max-w-xl text-xs leading-5 text-muted-foreground">
            © 2026 · MVP de investigação científica. Não oferece diagnóstico, prescrição ou estimativa individual de risco.
          </p>
        </div>
        <Link href="/metodologia"
          className="inline-flex min-h-11 items-center gap-1.5 self-start rounded-lg text-xs font-semibold text-primary underline-offset-4 hover:underline">
          Metodologia e limites <ArrowUpRight aria-hidden="true" size={15}/>
        </Link>
      </div>
    </footer>
  );
}
