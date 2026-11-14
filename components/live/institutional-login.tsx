"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function InstitutionalLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/auth/session", {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw Error(
        response.status === 503 ? "Login indisponível: verifique a configuração do Supabase do LUPA." :
        "Credenciais inválidas ou usuário sem acesso institucional."
      );
      router.replace("/live/organizador");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao acessar a conta.");
    } finally { setBusy(false); }
  };
  return <div className="lx"><div className="lx-main" style={{maxWidth:700}}>
    <header className="lx-head">
      <p className="lx-kicker">Área institucional</p>
      <h1>Seu acesso ao LUPA Live.</h1>
      <p className="lx-lead">Entre com a conta autorizada da sua organização. Participantes acessam pelo QR Code sem login institucional.</p>
    </header>
    <form onSubmit={submit} className="lx-panel">
      <h2>Acesso do organizador</h2>
      <label className="lx-field">E-mail institucional
        <input type="email" autoComplete="username" required value={email} maxLength={254}
          onChange={e=>setEmail(e.target.value)}/>
      </label>
      <label className="lx-field">Senha
        <input type="password" autoComplete="current-password" minLength={8} required value={password}
          onChange={e=>setPassword(e.target.value)}/>
      </label>
      {error && <p role="alert" className="lx-warning">{error}</p>}
      <div className="lx-inline">
        <button className="lx-button" type="submit" disabled={busy}>
          {busy?"Validando conta…":"Entrar no painel"}
        </button>
        <Link href="/live" className="lx-button lx-button--line">Sou participante</Link>
      </div>
      <p className="lx-muted" style={{marginTop:16}}>Contas e permissões são criadas pelo responsável da instituição. Não existe chave administrativa padrão.</p>
    </form>
  </div></div>;
}
