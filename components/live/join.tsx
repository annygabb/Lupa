"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
export function LiveJoin(){
 const [code,setCode]=useState("");
 const router=useRouter();
 return <form onSubmit={e=>{e.preventDefault();if(/^[A-F0-9]{12}$/.test(code))router.push("/live/"+code);}}>
  <label className="lx-field">Código da sessão (12 caracteres)<input autoComplete="off" inputMode="text" maxLength={12} placeholder="Ex.: 2A3B4C5D6E7F" value={code} onChange={e=>setCode(e.target.value.toUpperCase().replace(/[^A-F0-9]/g,"").slice(0,12))}/></label>
  <button type="submit" className="lx-button" disabled={!/^[A-F0-9]{12}$/.test(code)}>Entrar na sessão →</button>
 </form>;
}
