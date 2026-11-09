"use client";

/**
 * Ações do Passaporte da Evidência: exportar JSON/Markdown (Blob, sem dependências),
 * comparar com outro estudo e abrir a fonte original. A data de exportação é a do clique;
 * o conteúdo é revalidado pelo esquema Zod antes de cada download.
 */
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Download } from "lucide-react";
import { buildCompareHref } from "@/features/comparison/params";
import {
  passportFileName, passportToJSON, passportToMarkdown, type EvidencePassport,
} from "@/features/evidence/passport";

function downloadFile(filename: string, text: string, mime: string) {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.rel = "noopener";
  document.body.appendChild(a); a.click(); a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function PassportActions({ passport }: { passport: EvidencePassport }) {
  const [feedback, setFeedback] = useState("");

  const exportAs = (kind: "json" | "md") => {
    const label = kind === "json" ? "JSON" : "Markdown";
    try {
      const fresh: EvidencePassport = { ...passport, exportedAt: new Date().toISOString() };
      const name = passportFileName(fresh, kind);
      if (kind === "json") downloadFile(name, passportToJSON(fresh), "application/json;charset=utf-8");
      else downloadFile(name, passportToMarkdown(fresh), "text/markdown;charset=utf-8");
      setFeedback(`Passaporte ${label} exportado como ${name}. Confira os downloads do navegador.`);
    } catch {
      setFeedback(`Não foi possível gerar o passaporte ${label}. Nenhum arquivo foi criado.`);
    }
  };

  return (
    <div className="ev-pass__actions">
      <div className="ev-pass__btns">
        <button type="button" className="at-btn at-btn--solid" onClick={() => exportAs("json")}>
          <Download size={17} aria-hidden="true"/> Exportar JSON
        </button>
        <button type="button" className="at-btn at-btn--line" onClick={() => exportAs("md")}>
          <Download size={17} aria-hidden="true"/> Exportar Markdown
        </button>
        <Link href={buildCompareHref(passport.lupaId)} className="at-btn at-btn--line">
          Comparar com outro estudo
        </Link>
        <a href={passport.primaryUrl} target="_blank" rel="noopener noreferrer" className="at-btn at-btn--line">
          Abrir fonte original<span className="sr-only"> (abre em nova aba)</span> <ArrowUpRight size={17} aria-hidden="true"/>
        </a>
      </div>
      <p className="ev-pass__feedback" role="status" aria-live="polite">{feedback}</p>
    </div>
  );
}
