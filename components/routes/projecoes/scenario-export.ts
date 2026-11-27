import { scenarioCsv, type ScenarioResult } from "@/features/scenarios/engine";
import {
  SENSITIVITY_HORIZONS, SENSITIVITY_OUTPUTS, type SensitivityResult,
} from "@/features/scenarios/sensitivity";

/**
 * Pacote de exportação do laboratório (CSV/JSON). Puro e determinístico, exceto pelo
 * carimbo `exportedAt`, que é recebido como argumento para poder ser testado.
 */
export const EXPORT_NOTICE =
  "Ilustração hipotética do modelo lupa-flow-v2: premissas definidas pelo usuário ou por preset ilustrativo. Não é previsão, incidência, eficácia clínica, cobertura brasileira estimada nem orçamento público. Custo ausente significa custo não informado, não zero.";

export function buildScenarioExport(result: ScenarioResult, sensitivity: SensitivityResult | null, exportedAt: Date) {
  return {
    modelVersion: result.modelVersion,
    kind: result.kind,
    exportedAt: exportedAt.toISOString(),
    methodologicalNotice: EXPORT_NOTICE,
    assumptions: { ...result.input },
    results: {
      horizons: { 2031: result.last2031, 2036: result.last2036, 2041: result.last2041 },
      rows: result.rows,
      costInformed: result.input.costPerActivePersonBRL > 0,
    },
    warnings: result.warnings,
    sources: result.sources,
    sensitivity,
  };
}
export type ScenarioExport = ReturnType<typeof buildScenarioExport>;

export function scenarioExportJson(result: ScenarioResult, sensitivity: SensitivityResult | null, exportedAt: Date) {
  return JSON.stringify(buildScenarioExport(result, sensitivity, exportedAt), null, 2);
}

const ascii = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");
const cell = (v: number | null) => v === null ? "" : String(v).replace(".", ",");

/** CSV do motor (inalterado) precedido de metadados e seguido da sensibilidade, se calculada. */
export function scenarioExportCsv(result: ScenarioResult, sensitivity: SensitivityResult | null, exportedAt: Date) {
  const base = scenarioCsv(result).replace(/^﻿/, "");
  const meta = [
    "# kind=" + result.kind,
    "# exportado_em=" + exportedAt.toISOString(),
    "# aviso=" + ascii(EXPORT_NOTICE),
    ...Object.entries(result.input).map(([k, v]) => `# premissa ${k}=${v}`),
    "# custo_hipotetico_brl vazio = custo nao informado (nao e zero)",
  ];
  const out = ["﻿" + meta.join("\r\n") + "\r\n" + base];
  if (sensitivity) {
    const lines = [
      "",
      "# ANALISE DE SENSIBILIDADE " + sensitivity.method,
      "# " + ascii(sensitivity.notice),
      "# premissa_variada=" + sensitivity.field + "; valor_base=" + sensitivity.baselineValue,
      "premissa;valor;horizonte;saida;valor_saida;delta_abs;delta_pct",
      ...sensitivity.points.flatMap(p => SENSITIVITY_HORIZONS.flatMap(y => SENSITIVITY_OUTPUTS.map(o => {
        const m = p.horizons[y][o];
        return [sensitivity.field, cell(p.value), y, o, cell(m.value), cell(m.deltaAbs), cell(m.deltaPct)].join(";");
      }))),
    ];
    out.push(lines.join("\r\n") + "\r\n");
  }
  return out.join("");
}
