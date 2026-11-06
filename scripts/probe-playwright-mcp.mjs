// Verifica handshake MCP e ferramentas de navegação do Playwright via JSON-RPC stdio.
// Testa de verdade o servidor e a página, não apenas a versão do pacote.
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { mkdir, writeFile } from "node:fs/promises";

const target=process.argv[2]??"http://127.0.0.1:3101/";
const p=spawn("npx",["--yes","@playwright/mcp@latest","--headless","--isolated"],
  {stdio:["pipe","pipe","pipe"],env:{...process.env,NO_COLOR:"1"}});
let currentId=0;
const requests=new Map();
let errors="";
p.stderr.on("data",chunk=>{errors+=String(chunk).slice(0,1500);});
const lines=createInterface({input:p.stdout,crlfDelay:Infinity});
lines.on("line",line=>{
  let msg;
  try{msg=JSON.parse(line);}catch{return;}
  if(typeof msg.id!=="number")return;
  const current=requests.get(msg.id);
  if(!current)return;
  requests.delete(msg.id);
  clearTimeout(current.timer);
  if(msg.error)current.reject(new Error(JSON.stringify(msg.error)));
  else current.resolve(msg.result);
});
function call(method,params={},timeout=60000){
  const id=++currentId;
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{
      requests.delete(id);
      reject(new Error("Timeout MCP "+method+"; stderr="+errors.slice(-900)));
    },timeout);
    requests.set(id,{resolve,reject,timer});
    p.stdin.write(JSON.stringify({jsonrpc:"2.0",id,method,params})+"\n");
  });
}
try {
  const init=await call("initialize",{
    protocolVersion:"2025-06-18",
    capabilities:{},
    clientInfo:{name:"lupa-design-ci",version:"1.0"},
  },90000);
  p.stdin.write(JSON.stringify({jsonrpc:"2.0",method:"notifications/initialized"})+"\n");
  const available=await call("tools/list",{},60000);
  const names=available.tools?.map(tool=>tool.name)??[];
  for(const required of ["browser_navigate","browser_snapshot"])
    if(!names.includes(required))throw new Error("MCP sem ferramenta "+required+": "+names.join(", "));
  const nav=await call("tools/call",{name:"browser_navigate",arguments:{url:target}},90000);
  if(nav.isError)throw new Error("browser_navigate falhou: "+JSON.stringify(nav).slice(0,1200));
  const snap=await call("tools/call",{name:"browser_snapshot",arguments:{}},60000);
  if(snap.isError)throw new Error("browser_snapshot falhou: "+JSON.stringify(snap).slice(0,1200));
  const full=JSON.stringify(snap);
  if(!full.includes("Evidência antes da conclusão"))
    throw new Error("Snapshot MCP não contém a homepage esperada: "+full.slice(0,650));
  await mkdir("design-browser-out",{recursive:true});
  await writeFile("design-browser-out/playwright-mcp-tools.json",JSON.stringify({
    protocolVersion:init.protocolVersion,
    serverInfo:init.serverInfo,
    tools:names,
    target,
    status:"NAVIGATED_AND_SNAPSHOT_VERIFIED",
  },null,2)+"\n");
  await writeFile("design-browser-out/playwright-mcp-home.json",JSON.stringify(snap,null,2)+"\n");
  process.stdout.write("Playwright MCP conectado: "+names.length+" ferramentas, navegação e snapshot verificados.\n");
} catch(error){
  process.stderr.write("Falha Playwright MCP: "+String(error)+"\n"+errors.slice(-1000)+"\n");
  process.exitCode=1;
} finally {
  for(const v of requests.values())clearTimeout(v.timer);
  p.kill("SIGTERM");
  setTimeout(()=>p.kill("SIGKILL"),1000).unref();
}
