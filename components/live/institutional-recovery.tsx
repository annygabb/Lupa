"use client";
import { useEffect,useState } from "react";
import Link from "next/link";
export function InstitutionalRecovery(){
 const [token,setToken]=useState("");
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [message,setMessage]=useState("");
 const [busy,setBusy]=useState(false);
 useEffect(()=>{
  const hash=new URLSearchParams(window.location.hash.replace(/^#/,""));
  if(hash.get("type")==="recovery" && hash.get("access_token")){
   setToken(hash.get("access_token")||"");
   history.replaceState(null,"",window.location.pathname);
  }
 },[]);
 const submit=async(e:React.FormEvent)=>{
  e.preventDefault();setBusy(true);setMessage("");
  try{
   const reset=Boolean(token);
   const res=await fetch(reset?"/api/auth/password":"/api/auth/recover",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify(reset?{accessToken:token,password}:{email}),
   });
   const data=await res.json() as {message?:string;error?:string};
   if(!res.ok)throw Error(data.error||"Serviço indisponível");
   setMessage(reset?"Senha redefinida. Entre novamente com sua conta.":data.message||"Instruções solicitadas.");
   if(reset){setToken("");setPassword("");}
  }catch(err){setMessage(err instanceof Error?err.message:"Erro de recuperação");}
  finally{setBusy(false);}
 };
 return <div className="lx"><div className="lx-main" style={{maxWidth:700}}>
   <header className="lx-head"><p className="lx-kicker">Acesso institucional</p>
     <h1>Recuperar meu acesso.</h1></header>
   <form className="lx-panel" onSubmit={submit}>
    {token?<label className="lx-field">Nova senha (mínimo 12 caracteres)
      <input type="password" autoComplete="new-password" required minLength={12}
       value={password} onChange={e=>setPassword(e.target.value)}/>
    </label>:<label className="lx-field">E-mail de acesso
      <input type="email" autoComplete="email" required value={email}
       onChange={e=>setEmail(e.target.value)}/>
    </label>}
    <button type="submit" className="lx-button" disabled={busy}>
      {busy?"Processando…":token?"Alterar senha":"Enviar instruções"}
    </button>
    {message&&<p role="status" className="lx-science">{message}</p>}
    <p style={{marginTop:15}}><Link href="/login">Voltar ao login</Link></p>
   </form>
 </div></div>;
}
