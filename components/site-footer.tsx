import Link from "next/link";
export function SiteFooter() {
  return <footer className="border-t border-border bg-white">
    <div className="mx-auto flex max-w-6xl flex-col justify-between gap-3 px-4 py-7 text-xs text-muted-foreground sm:flex-row sm:px-6">
      <span>© 2026 LUPA Saúde · MVP de pesquisa, não ferramenta de diagnóstico.</span>
      <Link href="/metodologia" className="font-medium text-primary underline-offset-4 hover:underline">Limitações e metodologia</Link>
    </div>
  </footer>;
}
