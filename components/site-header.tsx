"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ScanSearch, Home, BookOpen, GitCompareArrows, ChartColumn, Activity, Brain, SlidersHorizontal, Menu, X } from "lucide-react";
const links=[
 {href:"/",label:"Início",icon:Home},
 {href:"/evidencias",label:"Evidências",icon:BookOpen},
 {href:"/comparar",label:"Comparar",icon:GitCompareArrows},
 {href:"/musculos-uti",label:"Músculos e UTI",icon:Activity},
 {href:"/saude-mental",label:"Saúde mental",icon:Brain},
 {href:"/projecoes",label:"Brasil × EUA",icon:ChartColumn},
 {href:"/metodologia",label:"Metodologia",icon:SlidersHorizontal},
];
export function SiteHeader(){
 const pathname=usePathname(); const [open,setOpen]=useState(false);
 return <header className="lupa-navigation">
  <div className="navigation-top"><Link href="/" className="navigation-brand" aria-label="LUPA Saúde — página inicial" onClick={()=>setOpen(false)}><ScanSearch size={28} strokeWidth={1.5} aria-hidden="true"/><span>LUPA<span className="brand-health"> Saúde</span></span></Link><button className="mobile-menu" type="button" aria-expanded={open} aria-controls="main-navigation" aria-label={open?"Fechar menu":"Abrir menu"} onClick={()=>setOpen(!open)}>{open?<X size={22}/>:<Menu size={22}/>}</button></div>
  <nav id="main-navigation" className={open?"is-open":""} aria-label="Navegação principal"><ul>{links.map(({href,label,icon:Icon})=>{const active=href==="/"?pathname==="/":pathname.startsWith(href);return <li key={href}><Link href={href} aria-current={active?"page":undefined} onClick={()=>setOpen(false)}><Icon size={22} strokeWidth={1.5} aria-hidden="true"/><span>{label}</span></Link></li>;})}</ul></nav>
  <p className="navigation-note">Ciência com<br/>contexto</p>
 </header>;
}
