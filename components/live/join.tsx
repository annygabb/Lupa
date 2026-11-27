"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LiveServiceNotice, useLiveServiceStatus } from "@/components/live/service-status";

export function LiveJoin() {
  const [code, setCode] = useState("");
  const router = useRouter();
  const serviceStatus = useLiveServiceStatus();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.toUpperCase().replace(/[^A-F0-9]/g, "").slice(0, 12);
    if (/^[A-F0-9]{12}$/.test(cleanCode)) {
      router.push(`/live/${cleanCode}`);
    }
  };

  const joinDemo = () => {
    router.push("/live/CAFE2026BEEF");
  };

  const isValidCode = /^[A-F0-9]{12}$/.test(code);

  return (
    <div className="space-y-6">
      <LiveServiceNotice status={serviceStatus} context="join" />
      <form onSubmit={handleJoin} className="space-y-4">
        <label className="lx-field">
          Código da Sessão (12 caracteres)
          <input
            autoComplete="off"
            inputMode="text"
            maxLength={12}
            placeholder="Ex.: CAFE2026BEEF"
            value={code}
            onChange={(e) =>
              setCode(e.target.value.toUpperCase().replace(/[^A-F0-9]/g, "").slice(0, 12))
            }
            aria-describedby="live-code-help"
            className="text-center font-mono tracking-widest text-lg font-bold"
          />
        </label>

        <p id="live-code-help" className="text-xs text-[#0e2a4a]">
          {code.length === 0 ? "Use apenas letras A–F e números (ex.: CAFE2026BEEF)." : `${code.length} de 12 caracteres.`}
        </p>
        <button type="submit" className="lx-button w-full" disabled={!isValidCode}>
          Entrar na Sessão →
        </button>
      </form>

      <div className="p-4 bg-[#eef4fa] rounded-xl border border-[#3d78b0] text-center space-y-2">
        <p className="text-xs text-[#0e2a4a] font-medium">
          Quer testar o Telão + Celular lado a lado agora (sem login)?
        </p>
        <Link
          href="/live/demo"
          className="inline-block text-xs px-3 py-2 bg-[#153a63] text-white rounded-lg hover:bg-[#071a33] font-mono font-bold transition"
        >
          Abrir Sandbox Interativo (Telão + Celular) →
        </Link>
      </div>

      {/* Demo local: nunca anunciar um evento efêmero como sessão de produção. */}
      {process.env.NODE_ENV !== "production" && <div className="p-4 bg-[#eef4fa] rounded-xl border border-[#d5e4f1] text-center space-y-2">
        <p className="text-xs text-[#0e2a4a] font-medium">
          Deseja testar a votação em rota separada agora mesmo?
        </p>
        <button
          type="button"
          onClick={joinDemo}
          className="text-xs px-3 py-1.5 bg-[#153a63] text-white rounded-lg hover:bg-[#071a33] font-mono font-bold transition"
        >
          Entrar na Sessão de Teste (CAFE2026BEEF) ↗
        </button>
      </div>}

      <div className="pt-4 border-t border-[#d5e4f1] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
        <span>Você é facilitador ou organizador?</span>
        <Link href="/live/organizador" className="text-[#1e5486] font-bold hover:underline">
          Acessar Painel do Organizador →
        </Link>
      </div>
    </div>
  );
}
