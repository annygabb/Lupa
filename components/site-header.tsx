"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BookOpenCheck } from "lucide-react";

const links = [
  {href:"/evidencias",label:"Evidências"},
  {href:"/comparar",label:"Comparar"},
  {href:"/projecoes",label:"Projeções"},
  {href:"/musculos-uti",label:"Músculos & UTI"},
  {href:"/metodologia",label:"Metodologia"},
] as const;

export function SiteHeader() {
  const pathname=usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-18 max-w-7xl flex-wrap items-center justify-between gap-x-5 gap-y-2 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="group inline-flex min-h-11 items-center gap-3 rounded-xl"
          aria-label="LUPA Saúde — página inicial">
          <span className="flex size-10 items-center justify-center rounded-[13px] bg-[#0f766e] text-white shadow-[0_7px_15px_rgba(15,118,110,.15)] group-hover:bg-[#0c625c]">
            <Activity aria-hidden="true" size={21} strokeWidth={2.3}/>
          </span>
          <span className="text-[15px] font-extrabold tracking-[-0.035em] text-foreground">
            LUPA <span className="font-medium text-[#6b7888]">Saúde</span>
          </span>
        </Link>

        <nav className="order-3 -mx-4 w-[calc(100%+2rem)] overflow-x-auto px-4 sm:order-none sm:mx-0 sm:w-auto sm:p-0"
          aria-label="Navegação principal">
          <ul className="flex min-w-max items-center gap-1 pb-1 sm:pb-0">
            {links.map(link=>{
              const active=pathname===link.href || pathname.startsWith(link.href+"/");
              return (
                <li key={link.href}>
                  <Link href={link.href} aria-current={active?"page":undefined}
                    className={"inline-flex min-h-10 items-center rounded-[12px] px-3.5 py-2 text-[13px] font-semibold transition-colors "+
                      (active
                        ?"bg-[#eaf5f3] text-[#0f766e]"
                        :"text-[#506476] hover:bg-[#f3f6fa] hover:text-foreground")}>
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <span className="hidden items-center gap-2 rounded-full border border-[#dce7e5] bg-[#f5faf9] px-3 py-2 text-[11px] font-semibold text-[#3c6966] xl:inline-flex">
          <BookOpenCheck aria-hidden="true" size={15}/>
          Pesquisa científica
        </span>
      </div>
    </header>
  );
}
