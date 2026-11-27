// Script de expurgo e retenção de registros efêmeros do LUPA Live.
// Executado em cron jobs ou pipelines periódicos para manter a conformidade com LGPD.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.LUPA_SUPABASE_URL;
const supabaseSecret = process.env.SUPABASE_SECRET_KEY || process.env.LUPA_SUPABASE_SERVICE_ROLE_KEY;

async function runCleanup() {
  const retentionValue = process.env.LUPA_RETENTION_DAYS || "30";
  if (!/^[0-9]{1,3}$/.test(retentionValue)) {
    throw new Error("LUPA_RETENTION_DAYS deve ser um inteiro entre 1 e 365.");
  }
  const retentionDays = Number(retentionValue);
  if (retentionDays < 1 || retentionDays > 365) {
    throw new Error("LUPA_RETENTION_DAYS deve ficar entre 1 e 365.");
  }
  console.log(`[LUPA Retention] Iniciando rotina de limpeza (retenção: ${retentionDays} dias)...`);
  if (process.env.LUPA_RETENTION_DRY_RUN === "true") {
    console.log("[LUPA Retention] Dry-run explícito: nenhuma operação destrutiva remota executada.");
    return;
  }

  if (supabaseUrl && supabaseSecret) {
    console.log(`[LUPA Retention] Executando expurgo via Supabase RPC em ${supabaseUrl}...`);
    try {
      const res = await fetch(`${supabaseUrl.replace(/\/+$/, "")}/rest/v1/rpc/lupa_cleanup_expired_records`, {
        method: "POST",
        headers: {
          apikey: supabaseSecret,
          ...(supabaseSecret.startsWith("sb_secret_") ? {} : { Authorization: `Bearer ${supabaseSecret}` }),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ retention_days: retentionDays }),
      });

      if (!res.ok) {
        throw new Error(`Falha HTTP ${res.status} no expurgo; consulte logs seguros do provedor.`);
      }

      const result = await res.json();
      console.log("[LUPA Retention] Resultado da limpeza remota:", result);
    } catch (err) {
      console.error("[LUPA Retention] Erro ao executar procedure no Supabase:", err.message);
      process.exit(1);
    }
  } else {
    throw new Error("Banco LUPA não configurado: expurgo NÃO realizado. Job interrompido com falha.");
  }
}

runCleanup().catch((err) => {
  console.error("[LUPA Retention] Erro fatal:", err);
  process.exit(1);
});
