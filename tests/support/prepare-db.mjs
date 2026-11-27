// Prepara um banco de TESTE descartável: stubs do Supabase + todas as migrações em ordem.
// Recusa qualquer banco cujo nome não contenha "test" ou "e2e" (proteção contra uso acidental).
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";

const url = process.env.LUPA_PG_TEST_URL;
if (!url) { console.error("Defina LUPA_PG_TEST_URL"); process.exit(1); }
const dbName = new URL(url).pathname.slice(1);
if (!/test|e2e/i.test(dbName)) { console.error("Recusado: o nome do banco precisa conter 'test' ou 'e2e'."); process.exit(1); }

const admin = new pg.Client({ connectionString: url.replace(/\/[^/?]+(\?|$)/, "/postgres$1") });
await admin.connect();
await admin.query(`drop database if exists "${dbName}" with (force)`);
await admin.query(`create database "${dbName}"`);
await admin.end();

const client = new pg.Client({ connectionString: url });
await client.connect();
const root = new URL("../..", import.meta.url).pathname;
await client.query(readFileSync(join(root, "tests/support/supabase-stubs.sql"), "utf8"));
const dir = join(root, "supabase/migrations");
const migrations = readdirSync(dir).filter(f => f.endsWith(".sql")).sort();
for (const file of migrations) {
  await client.query(readFileSync(join(dir, file), "utf8"));
  console.log("aplicada", file);
}
// Reaplicação: as migrações devem ser idempotentes (o runbook prevê reexecução segura).
for (const file of migrations) await client.query(readFileSync(join(dir, file), "utf8"));
// A reaplicação da migração antiga de retenção não pode desfazer a proteção mais nova:
await client.query(readFileSync(join(dir, migrations[migrations.length - 1]), "utf8"));
console.log("reaplicação OK");
await client.end();
