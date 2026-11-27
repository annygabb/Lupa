// Gera o relatório do teste piloto de compreensão (protocolo docs/validation/protocolo-teste-compreensao.md)
// a partir de um CSV com respostas REAIS. Não inventa nada: sem linhas, não há relatório.
//
// Uso: node scripts/pilot-report.mjs respostas.csv > docs/validation/relatorio-teste-compreensao.md
// Colunas (ver docs/validation/modelo-respostas-piloto.csv):
//   participante  código anônimo (ex.: P01) — NUNCA nome, e-mail ou dado de saúde
//   formacao      faixa/curso agregado (ex.: "graduação enfermagem")
//   tarefa        massa-magra | comparacao-uti | cenario-sus
//   etapa         pre | pos
//   correta       1 ou 0
//   erro_grave    1 se concluiu causalidade, aprovação clínica ou previsão SUS; senão 0
//   segundos      tempo na tarefa (vazio se não medido)
//   clareza       1–5 (preencher só na etapa pos; vazio nas demais)
import { readFileSync } from "node:fs";

export const TASKS = ["massa-magra", "comparacao-uti", "cenario-sus"];

export function parseCsv(text) {
  const [header, ...lines] = text.replace(/^﻿/, "").trim().split(/\r?\n/);
  const cols = header.split(",").map(c => c.trim());
  const required = ["participante", "formacao", "tarefa", "etapa", "correta", "erro_grave", "segundos", "clareza"];
  for (const c of required) if (!cols.includes(c)) throw new Error("Coluna ausente: " + c);
  return lines.filter(l => l.trim()).map((line, i) => {
    const values = line.split(",").map(v => v.trim());
    const row = Object.fromEntries(cols.map((c, j) => [c, values[j] ?? ""]));
    if (!/^[A-Za-z0-9_-]{1,20}$/.test(row.participante)) throw new Error(`Linha ${i + 2}: código de participante inválido (use códigos anônimos).`);
    if (/@/.test(line)) throw new Error(`Linha ${i + 2}: parece conter e-mail; remova dados pessoais.`);
    if (!TASKS.includes(row.tarefa)) throw new Error(`Linha ${i + 2}: tarefa desconhecida "${row.tarefa}".`);
    if (!["pre", "pos"].includes(row.etapa)) throw new Error(`Linha ${i + 2}: etapa deve ser pre ou pos.`);
    if (!["0", "1"].includes(row.correta) || !["0", "1"].includes(row.erro_grave)) throw new Error(`Linha ${i + 2}: correta/erro_grave devem ser 0 ou 1.`);
    if (row.clareza && !/^[1-5]$/.test(row.clareza)) throw new Error(`Linha ${i + 2}: clareza deve ser 1–5.`);
    return {
      participante: row.participante, formacao: row.formacao, tarefa: row.tarefa, etapa: row.etapa,
      correta: row.correta === "1", erroGrave: row.erro_grave === "1",
      segundos: row.segundos === "" ? null : Number(row.segundos),
      clareza: row.clareza === "" ? null : Number(row.clareza),
    };
  });
}

const pct = (num, den) => den ? (100 * num / den).toFixed(1).replace(".", ",") + "%" : "—";
const median = values => {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

export function buildReport(rows, { date = new Date().toISOString().slice(0, 10) } = {}) {
  if (!rows.length) throw new Error("Nenhuma resposta: não há relatório sem dados reais.");
  const participants = new Set(rows.map(r => r.participante));
  const lines = [
    "# Relatório do teste piloto de compreensão",
    "",
    `- Gerado em: ${date} por \`scripts/pilot-report.mjs\` a partir de respostas registradas.`,
    `- **n real de participantes: ${participants.size}** (amostra de conveniência; sem teste de significância).`,
    `- Formação (agregada): ${[...new Set(rows.map(r => r.formacao).filter(Boolean))].join("; ") || "não informada"}.`,
    "",
    "## Precisão por tarefa",
    "",
    "| Tarefa | Pré: corretas/válidas | Pós: corretas/válidas | Mudança (p.p.) | Erros graves pré → pós | Mediana de tempo pós (s) |",
    "|---|---|---|---|---|---|",
  ];
  for (const task of TASKS) {
    const pre = rows.filter(r => r.tarefa === task && r.etapa === "pre");
    const pos = rows.filter(r => r.tarefa === task && r.etapa === "pos");
    const preOk = pre.filter(r => r.correta).length, posOk = pos.filter(r => r.correta).length;
    const delta = pre.length && pos.length ? ((100 * posOk / pos.length) - (100 * preOk / pre.length)).toFixed(1).replace(".", ",") : "—";
    const med = median(pos.map(r => r.segundos).filter(v => v !== null));
    lines.push(`| ${task} | ${preOk}/${pre.length} (${pct(preOk, pre.length)}) | ${posOk}/${pos.length} (${pct(posOk, pos.length)}) | ${delta} | ${pre.filter(r => r.erroGrave).length} → ${pos.filter(r => r.erroGrave).length} | ${med ?? "—"} |`);
  }
  const clarity = rows.map(r => r.clareza).filter(v => v !== null);
  lines.push("", "## Clareza percebida (1–5)", "");
  lines.push(clarity.length
    ? [1, 2, 3, 4, 5].map(n => `- ${n}: ${clarity.filter(v => v === n).length}`).join("\n")
    : "- Não coletada.");
  lines.push("", "## Limitações obrigatórias", "",
    "- Amostra pequena e de conveniência; os resultados não se generalizam.",
    "- Mudança pré → pós só é interpretável se as perguntas forem paralelas e comparáveis.",
    "- Mede compreensão de limites de evidência, **não** benefício clínico.",
    "- Preencher manualmente: condições do teste, dificuldades observadas e correções derivadas.");
  return lines.join("\n") + "\n";
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const file = process.argv[2];
  if (!file) { console.error("Uso: node scripts/pilot-report.mjs respostas.csv"); process.exit(1); }
  try {
    process.stdout.write(buildReport(parseCsv(readFileSync(file, "utf8"))));
  } catch (error) {
    console.error(String(error instanceof Error ? error.message : error));
    process.exit(1);
  }
}
