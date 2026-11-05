"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, ArrowUpRight, ShieldCheck } from "lucide-react";

const links=[
  {href:"/evidencias",label:"Evidências"},
  {href:"/comparar",label:"Comparar"},
  {href:"/projecoes",label:"Projeções"},
  {href:"/musculos-uti",label:"Músculos & UTI"},
  {href:"/metodologia",label:"Metodologia"},
] as const;

export function SiteHeader() {
  const pathname=usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-[#e6ecf5] bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-19 max-w-[1490px] flex-wrap items-center justify-between gap-x-5 gap-y-2 px-4 py-3 sm:px-6 lg:px-9">
        <Link href="/" aria-label="LUPA Saúde — página inicial"
          className="lupa-focusable group inline-flex min-h-11 items-center gap-2.5 rounded-xl">
          <span className="flex size-11 items-center justify-center rounded-[15px] bg-gradient-to-br from-[#0a9990] to-[#0e6276] text-white shadow-[0_6px_18px_rgba(13,131,127,.22)]">
            <Activity size={22} strokeWidth={2.4} aria-hidden="true"/>
          </span>
          <span className="text-[16px] font-extrabold tracking-[-.055em] text-[#1b2d4b]">
            LUPA <span className="font-medium tracking-[-.04em] text-[#70839a]">Saúde</span>
          </span>
        </Link>

        <nav className="order-3 -mx-4 w-[calc(100%+2rem)] overflow-x-auto px-4 sm:order-none sm:mx-0 sm:w-auto sm:p-0" aria-label="Navegação principal">
          <ul className="flex min-w-max items-center gap-1 rounded-[17px] bg-[#f3f6fb] p-1">
            {links.map(link=>{
              const active=pathname===link.href || pathname.startsWith(link.href+"/");
              return (
                <li key={link.href}>
                  <Link href={link.href} aria-current={active?"page":undefined}
                    className={"lupa-focusable inline-flex min-h-10 items-center rounded-[13px] px-4 py-2.5 text-[13px] font-bold transition-colors "+
                      (active
                        ?"bg-[#315ff4] text-white shadow-[0_5px_12px_rgba(49,95,244,.18)]"
                        :"text-[#566e89] hover:bg-white hover:text-[#24446e]")}>
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <span className="hidden items-center gap-2 rounded-full border border-[#dce7f4] bg-[#f9fbff] px-3.5 py-2 text-[12px] font-bold text-[#546c8d] xl:inline-flex">
          <ShieldCheck size={15} className="text-[#0e978c]" aria-hidden="true"/>
          Ciência com contexto
          <ArrowUpRight size={14} className="text-[#8ba1c0]" aria-hidden="true"/>
        </span>
      </div>
    </header>
  );
}
