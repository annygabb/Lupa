// Smoke HTTP da aplicação compilada, executado contra "next start" na CI.
// Não é teste de navegador; é verificação das rotas de usuário e das páginas SSR/SSG.
const base=process.argv[2]??"http://127.0.0.1:3010";
const checks=[
  {path:"/",contains:["Evidência antes da conclusão","Músculos e UTI","Cenários para 2031"]},
  {path:"/evidencias",contains:["Explore os estudos","Em curadoria"]},
  {path:"/evidencias/E04",contains:["SURMOUNT-1","Limitações"]},
  {path:"/comparar",contains:["Enxergue além dos números","Cálculo combinado"]},
  {path:"/musculos-uti",contains:["Além do peso","Que pergunta você quer responder?","A lacuna causal"]},
  {path:"/projecoes",contains:["Projete hipóteses","Horizonte","2031","Exportar CSV"]},
  {path:"/metodologia",contains:["Como analisamos uma evidência","cenários","Fontes auditáveis"]},
];

async function waitForServer() {
  for(let attempt=0;attempt<40;attempt++){
    try {
      const response=await fetch(base,{signal:AbortSignal.timeout(1000)});
      if(response.ok)return;
    } catch { /* Next.js ainda iniciando */ }
    await new Promise(resolve=>setTimeout(resolve,500));
  }
  throw Error("Servidor não respondeu em "+base);
}

await waitForServer();
let failures=0;
for(const check of checks){
  const response=await fetch(base+check.path,{signal:AbortSignal.timeout(10_000)});
  const html=await response.text();
  const missing=check.contains.filter(word=>!html.includes(word));
  const ok=response.status===200&&missing.length===0;
  process.stdout.write((ok?"PASS":"FAIL")+" "+check.path+" HTTP "+response.status+(missing.length?" sem: "+missing.join(", "):"")+"\n");
  if(!ok)failures++;
}
const health=await fetch(base+"/api/health",{signal:AbortSignal.timeout(5000)});
const json=await health.json();
const healthOk=health.status===200&&json.status==="ok";
process.stdout.write((healthOk?"PASS":"FAIL")+" /api/health "+health.status+"\n");
if(!healthOk)failures++;
if(failures) process.exitCode=1;
