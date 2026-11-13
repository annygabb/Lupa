import type {Metadata} from "next";
import Link from "next/link";
import {LiveJoin} from "@/components/live/join";
import "../experiencias.css";
export const metadata:Metadata={title:"LUPA Live — participe de uma investigação",description:"Responda a uma pergunta científica em uma sessão de educação coletiva."};
export default function Page(){return <div className="lx"><div className="lx-main">
<header className="lx-head"><p className="lx-kicker">LUPA Live · público e auditório</p><h1>A ciência acontece quando todo mundo participa.</h1><p className="lx-lead">Entre com o código informado pelo organizador. Você pode participar sem criar uma conta nem fornecer dados de saúde.</p></header>
<div className="lx-cols"><section className="lx-panel"><h2>Entrar em uma sessão</h2><LiveJoin/></section>
<aside className="lx-panel lx-ink"><h2>Como funciona</h2><ol style={{lineHeight:2,paddingLeft:22}}><li>O organizador projeta um código ou QR Code.</li><li>Você escolhe uma interpretação da evidência.</li><li>O telão mostra apenas votos agregados.</li><li>A fonte e os limites são apresentados para discussão.</li></ol><p>Uma resposta não equivale a avaliação clínica ou pontuação educacional validada.</p><Link className="lx-button" style={{background:"#fff",color:"#0e2a4a"}} href="/live/organizador">Painel do organizador →</Link></aside></div>
</div></div>;}
