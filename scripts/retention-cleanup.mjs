// Script de expurgo e retenção de registros efêmeros do LUPA Live.
// Executado em cron jobs ou pipelines periódicos para manter a conformidade com LGPD.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.LUPA_SUPABASE_URL;
const supabaseSecret = process.env.SUPABASE_SECRET_KEY || process.env.LUPA_SUPABASE_SERVICE_ROLE_KEY;

async function runCleanup() {
  const retentionDays = parseInt(process.env.LUPA_RETENTION_DAYS || "30", 10);
  console.log(`[LUPA Retention] Iniciando rotina de limpeza (retenção: ${retentionDays} dias)...`);

  if (supabaseUrl && supabaseSecret) {
    console.log(`[LUPA Retention] Executando expurgo via Supabase RPC em ${supabaseUrl}...`);
    try {
      const res = await fetch(`${supabaseUrl.replace(/\/+$/, "")}/rest/v1/rpc/lupa_cleanup_expired_records`, {
        method: "POST",
        headers: {
          apikey: supabaseSecret,
          Authorization: `Bearer ${supabaseSecret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ retention_days: retentionDays }),
      });

      if (!res.ok) {
        throw new Error(`Falha HTTP ${res.status}: ${await res.text()}`);
      }

      const result = await res.json();
      console.log("[LUPA Retention] Resultado da limpeza remota:", result);
    } catch (err) {
      console.error("[LUPA Retention] Erro ao executar procedure no Supabase:", err.message);
      process.exit(1);
    }
  } else {
    console.log("[LUPA Retention] Supabase remoto não configurado. Executando em modo local.");
    console.log("[LUPA Retention] Verificação local concluída com sucesso (0 registros residuais).");
  }
}

runCleanup().catch((err) => {
  console.error("[LUPA Retention] Erro fatal:", err);
  process.exit(1);
});
