"use client";
import Image from "next/image";
import Link from "next/link";
import {useMemo,useState} from "react";
import {calculateComposition} from "@/features/experience/composition";
const fmt=(v:number)=>v.toLocaleString("pt-BR",{minimumFractionDigits:1,maximumFractionDigits:1});
export function BodyEvidenceExperience() {
 const [age,setAge]=useState(35),[height,setHeight]=useState(165),[weight,setWeight]=useState(85);
 const [loss,setLoss]=useState(10),[lean,setLean]=useState(25);
 const [medicine,setMedicine]=useState("tirzepatida");
 const safeLoss=Math.min(loss,Math.max(0,weight-1));
 const result=useMemo(()=>calculateComposition({initialWeightKg:weight,weightLossKg:safeLoss,leanShareOfLossPct:lean}),[weight,safeLoss,lean]);
 const fromStudy=medicine==="tirzepatida" && lean===25;
 return <div className="lx"><div className="lx-main">
  <header className="lx-head"><p className="lx-kicker">Prancha interativa · Corpo e evidência</p><h1>O peso conta uma história. Não conta a história inteira.</h1>
   <p className="lx-lead">Experimente uma divisão <strong>hipotética</strong> do peso perdido entre massa gorda e massa magra. A imagem não representa seu corpo nem prevê força, sarcopenia, internação ou mortalidade.</p>
  </header>
  <div className="lx-cols">
   <section className="lx-panel" aria-labelledby="sim-config"><h2 id="sim-config">Configure um exemplo</h2>
    <label className="lx-field">Idade (contexto ilustrativo)<input type="number" min={18} max={100} value={age} onChange={e=>setAge(Math.min(100,Math.max(18,Number(e.target.value)||18)))}/></label>
    <label className="lx-field">Altura em cm (contexto ilustrativo)<input type="number" min={120} max={220} value={height} onChange={e=>setHeight(Math.min(220,Math.max(120,Number(e.target.value)||120)))}/></label>
    <label className="lx-field">Peso inicial (kg)<input type="number" min={30} max={400} value={weight} onChange={e=>setWeight(Math.min(400,Math.max(30,Number(e.target.value)||30)))}/></label>
    <label className="lx-field">Medicamento (apenas contexto científico)<select value={medicine} onChange={e=>setMedicine(e.target.value)}>
      <option value="tirzepatida">Tirzepatida — referência SURMOUNT-1</option><option value="semaglutida">Semaglutida — sem parâmetro individual validado</option><option value="outro">Outro / não informado</option>
    </select></label>
    <label className="lx-field">Perda de peso total hipotética: {fmt(safeLoss)} kg
      <input type="range" min={0} max={Math.min(50,weight-1)} step={0.5} value={safeLoss} onChange={e=>setLoss(Number(e.target.value))}/>
    </label>
    <label className="lx-field">Fração ilustrativa da perda correspondente à massa magra: {lean}%
      <input type="range" min={0} max={50} step={5} value={lean} onChange={e=>setLean(Number(e.target.value))}/>
    </label>
    <p className="lx-muted">Idade e altura são exibidas para contextualizar a entrada, <strong>não</strong> entram na fórmula. Não estimamos composição corporal individual a partir desses campos.</p>
    <div className="lx-inline"><button className="lx-button" type="button" onClick={()=>{setAge(35);setHeight(165);setWeight(85);setLoss(10);setLean(25);setMedicine("tirzepatida");}}>Restaurar exemplo</button></div>
   </section>
   <div>
    <section className="lx-panel" aria-labelledby="sim-result"><h2 id="sim-result">O que o exemplo mostra</h2>
     <div className="lx-cols" style={{gridTemplateColumns:"minmax(160px,.55fr) minmax(200px,1fr)"}}>
      <Image className="lx-figure" src="/assets/images/cianotipia/corpo-composicao.webp" width={410} height={410} alt="Ilustração artística de anatomia, não um modelo do corpo do usuário"/>
      <div>
       <p className="lx-muted">De {fmt(weight)} kg para {fmt(result.weightAfterKg)} kg, se a perda total for {fmt(safeLoss)} kg.</p>
       <div className="lx-kpis" style={{gridTemplateColumns:"1fr 1fr"}}>
        <div className="lx-stat"><strong>{fmt(result.fatLossKg)} kg</strong><span>Massa gorda na ilustração</span></div>
        <div className="lx-stat"><strong>{fmt(result.leanLossKg)} kg</strong><span>Massa magra na ilustração</span></div>
       </div>
       <div className="lx-bar" role="img" aria-label={"Fração da perda hipotética: "+(100-lean)+" por cento gorda e "+lean+" por cento magra"}>
         <span style={{width:(100-lean)+"%"}}/><span style={{width:lean+"%"}}/>
       </div><p className="lx-muted">Azul escuro: {100-lean}% da perda · azul claro: {lean}% da perda</p>
      </div>
     </div>
     <div className="lx-science"><strong>25% do peso perdido ≠ 25% de toda a massa magra ou dos músculos.</strong><p>O subestudo DXA SURMOUNT-1 observou aproximadamente 75% da perda em massa gorda e 25% em massa magra na amostra estudada. DXA não mede diretamente força ou função muscular.</p>
      {fromStudy ? <p><strong>Referência ativa:</strong> partição aproximada observada no subestudo com tirzepatida. Não é previsão para você.</p>:<p><strong>Modo ilustrativo:</strong> a fração selecionada não é uma estimativa validada para {medicine} nem para sua idade, altura ou peso.</p>}
      <Link href="/evidencias/E04">Abrir estudo E04 e limitações →</Link>
     </div>
    </section>
    <section className="lx-panel" style={{marginTop:20}} aria-labelledby="sim-icu"><h2 id="sim-icu">E se essa pessoa precisasse de UTI?</h2>
      <p>Pesquisas identificam associações entre baixa massa muscular em pacientes críticos e piores desfechos. Porém <strong>os estudos não ligam a fração ilustrada acima ao risco individual de UTI</strong> nem demonstram que um medicamento causou esse desfecho.</p>
      <ol style={{paddingLeft:23,lineHeight:1.8}}><li>O subestudo E04 mediu composição corporal em pessoas com obesidade.</li><li>Outros estudos, como E12, avaliaram massa muscular e prognóstico em populações de UTI distintas.</li><li>Não há fórmula validada para converter esses achados em risco pessoal de internação, morte ou recuperação.</li></ol>
      <div className="lx-warning"><strong>Ligação causal não demonstrada.</strong> Por segurança científica, o LUPA não exibe “chance de sobreviver”, dias de internação previstos ou risco de morte calculados a partir de peso, altura, idade ou medicamento.</div>
      <div className="lx-inline" style={{marginTop:18}}><Link className="lx-button" href="/comparar?a=E04&b=E12">Confrontar os estudos E04 × E12</Link><Link className="lx-button lx-button--line" href="/musculos-uti">Investigar músculos e UTI</Link></div>
    </section>
   </div>
  </div>
 </div></div>;
}
