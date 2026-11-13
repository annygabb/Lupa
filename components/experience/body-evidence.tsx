"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  buildBodyProjection, buildHospitalLoadExample,
  type LossMode, type MedicineContext, type SexStyle,
} from "@/features/experience/dynamic-scenario";

type EditablePoint = { id: string; month: string; loss: string };
const formatKg = (value: number) => value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 });
const formatMoney = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const formatInteger = (value: number) => value.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

function BodySilhouette({ weight, height, style }: { weight: number; height: number; style: SexStyle }) {
  const w = clamp(1 + (weight - 65) / 320, .82, 1.34);
  const h = clamp(height / 165, .86, 1.16);
  const shoulder = style === "masculino" ? 82 : style === "feminino" ? 70 : 75;
  const hip = style === "feminino" ? 75 : style === "masculino" ? 63 : 69;
  const shape = "M " + (130 - shoulder / 2) + " 101 Q 130 92 " + (130 + shoulder / 2) + " 101 " +
    "L " + (130 + shoulder / 2 + 14) + " 178 Q " + (130 + hip / 2) + " 216 " +
    (130 + hip / 2) + " 225 L 153 327 L 134 327 L 130 247 L 126 327 L 107 327 L " +
    (130 - hip / 2) + " 225 Q " + (130 - hip / 2) + " 216 " +
    (130 - shoulder / 2 - 14) + " 178 Z";
  return (
    <div className="lx-avatar" >
      <svg viewBox="0 0 260 350" role="img" aria-label="Ilustração abstrata de um corpo, ajustada por escala de altura e contorno esquemático">
        <defs>
          <linearGradient id="lupa-body-shape" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#9dbedc"/>
            <stop offset="1" stopColor="#1e5486"/>
          </linearGradient>
        </defs>
        <path d="M130 16 V336 M21 327 H239" fill="none" stroke="#cad9e8" strokeWidth="1" strokeDasharray="4 6"/>
        <g transform={"translate(130 180) scale(" + w.toFixed(3) + " " + h.toFixed(3) + ") translate(-130 -180)"}>
          <circle cx="130" cy="66" r="26" fill="url(#lupa-body-shape)" stroke="#153a63" strokeWidth="1.5"/>
          <path d={shape} fill="url(#lupa-body-shape)" stroke="#153a63" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M130 109 V216 M90 218 H170" stroke="#d5e4f1" strokeOpacity=".7" strokeWidth="2" strokeDasharray="4 5"/>
        </g>
      </svg>
      <p className="lx-muted">Forma e escala <strong>ilustrativas</strong>. Peso, altura e estilo visual não revelam massa muscular, gordura corporal ou aparência real.</p>
    </div>
  );
}

export function BodyEvidenceExperience() {
  const [weight, setWeight] = useState("65");
  const [height, setHeight] = useState("164");
  const [age, setAge] = useState("22");
  const [sexStyle, setSexStyle] = useState<SexStyle>("neutro");
  const [medicine, setMedicine] = useState<MedicineContext>("tirzepatida");
  const [lossMode, setLossMode] = useState<LossMode>("kg");
  const [points, setPoints] = useState<EditablePoint[]>([
    { id: "m1", month: "1", loss: "1" },
    { id: "m3", month: "3", loss: "3" },
    { id: "m5", month: "5", loss: "5" },
  ]);
  const [leanLow, setLeanLow] = useState("20");
  const [leanHigh, setLeanHigh] = useState("25");
  const [selectedPeriodId, setSelectedPeriodId] = useState("m1");
  const [showBmi, setShowBmi] = useState(false);
  const [showBody, setShowBody] = useState(true);
  const [cases, setCases] = useState("20");
  const [bedCost, setBedCost] = useState("3000");

  const body = useMemo(() => {
    try {
      if ([weight, height, age, leanLow, leanHigh].some((x) => x.trim() === "") ||
        points.some((p) => !p.month.trim() || !p.loss.trim())) return null;
      return buildBodyProjection({
        initialWeightKg: Number(weight), heightCm: Number(height), ageYears: Number(age),
        lossMode, leanLowPct: Number(leanLow), leanHighPct: Number(leanHigh),
        timepoints: points.map((p) => ({ id: p.id, month: Number(p.month), loss: Number(p.loss) })),
      });
    } catch { return null; }
  }, [weight, height, age, leanLow, leanHigh, points, lossMode]);

  const hospital = useMemo(() => {
    try {
      if (cases.trim() === "" || bedCost.trim() === "") return null;
      return buildHospitalLoadExample(Number(cases), Number(bedCost));
    } catch { return null; }
  }, [cases, bedCost]);

  const changeLossMode = (next: LossMode) => {
    const w = Number(weight);
    if (Number.isFinite(w) && w > 0) {
      setPoints((prev) => prev.map((p) => {
        const x = Number(p.loss);
        return { ...p, loss: p.loss.trim() && Number.isFinite(x)
          ? String(Number((next === "percent" ? (x / w * 100) : (x / 100 * w)).toFixed(2))) : "" };
      }));
    }
    setLossMode(next);
  };

  const updatePoint = (id: string, key: "month" | "loss", value: string) =>
    setPoints((prev) => prev.map((p) => p.id === id ? { ...p, [key]: value } : p));

  const reset = () => {
    setWeight("65"); setHeight("164"); setAge("22"); setSexStyle("neutro");
    setMedicine("tirzepatida"); setLossMode("kg"); setLeanLow("20"); setLeanHigh("25");
    setPoints([{id:"m1",month:"1",loss:"1"},{id:"m3",month:"3",loss:"3"},{id:"m5",month:"5",loss:"5"}]);
    setSelectedPeriodId("m1");
  };

  const rows = body?.rows ?? [];
  const maxMonth = Math.max(5, ...rows.map((r) => r.month));
  const maxY = Math.max(1, Number(weight) + 1);
  const minY = Math.min(Number(weight) - 1, ...rows.map((r) => r.weightAfterKg - 1));
  const yPos = (v: number) => 169 - (v - minY) / Math.max(1, maxY - minY) * 130;
  const chartPoints = body
    ? [{month: 0, weightAfterKg: body.input.initialWeightKg}, ...rows].map((r) =>
      (42 + r.month / maxMonth * 390).toFixed(1) + "," + yPos(r.weightAfterKg).toFixed(1)).join(" ")
    : "";
  const mainWeight = body?.input.initialWeightKg ?? 65;
  const mainHeight = body?.input.heightCm ?? 164;
  const selectedPeriod = rows.find((r) => r.id === selectedPeriodId) ?? rows[0];

  return <div className="lx">
    <div className="lx-main">
      <header className="lx-head">
        <p className="lx-kicker">Atlas interativo · Corpo, evidências e impacto hospitalar</p>
        <h1>Seu cenário muda. O rigor científico permanece.</h1>
        <p className="lx-lead">Altere peso, altura, idade, representação corporal e período. Os números são uma <strong>simulação que você controla</strong> — não uma estimativa de emagrecimento pessoal, perda muscular, necessidade de cirurgia ou risco de UTI.</p>
      </header>

      <div className="lx-cols">
        <section className="lx-panel" aria-labelledby="body-parameters">
          <h2 id="body-parameters">01 · Seu exemplo, do seu jeito</h2>
          <p className="lx-muted">Os campos começam com um <strong>exemplo editável</strong>. Nada é detectado ou salvo sobre você. A ferramenta funciona localmente no navegador.</p>
          <label className="lx-field">Peso inicial (kg)
            <input type="number" min="30" max="400" step=".1" value={weight} onChange={(e)=>setWeight(e.target.value)}/>
            <input aria-label="Ajustar peso pelo controle deslizante" type="range" min="30" max="400" step="1" value={clamp(Number(weight)||65,30,400)} onChange={(e)=>setWeight(e.target.value)}/>
          </label>
          <label className="lx-field">Altura (cm)
            <input type="number" min="120" max="230" step="1" value={height} onChange={(e)=>setHeight(e.target.value)}/>
            <input aria-label="Ajustar altura pelo controle deslizante" type="range" min="120" max="230" step="1" value={clamp(Number(height)||164,120,230)} onChange={(e)=>setHeight(e.target.value)}/>
          </label>
          <label className="lx-field">Idade (anos)
            <input type="number" min="18" max="110" step="1" value={age} onChange={(e)=>setAge(e.target.value)}/>
            <input aria-label="Ajustar idade pelo controle deslizante" type="range" min="18" max="110" step="1" value={clamp(Number(age)||22,18,110)} onChange={(e)=>setAge(e.target.value)}/>
          </label>
          <label className="lx-field">Estilo visual do corpo (opcional)
            <select value={sexStyle} onChange={(e)=>setSexStyle(e.target.value as SexStyle)}>
              <option value="neutro">Neutro</option><option value="feminino">Feminino</option>
              <option value="masculino">Masculino</option><option value="nao-informar">Prefiro não informar</option>
            </select>
          </label>
          <label className="lx-field">Medicamento de referência (contextual)
            <select value={medicine} onChange={(e)=>setMedicine(e.target.value as MedicineContext)}>
              <option value="tirzepatida">Tirzepatida (Mounjaro) — referência SURMOUNT-1</option>
              <option value="semaglutida">Semaglutida</option><option value="outro">Outro</option>
              <option value="nenhum">Não utilizo</option><option value="nao-informar">Prefiro não informar</option>
            </select>
          </label>
          <label className="lx-field">Modo da perda hipotética
            <select value={lossMode} onChange={(e)=>changeLossMode(e.target.value as LossMode)}>
              <option value="kg">Quilos acumulados</option>
              <option value="percent">Porcentagem do peso inicial</option>
            </select>
          </label>
          <div className="lx-timeline-controls">
            <h3 className="lx-minor-heading">Períodos e perdas — totalmente editáveis</h3>
            {points.map((point) => <div className="lx-period" key={point.id}>
              <label className="lx-field">Mês
                <input type="number" min="1" max="60" step="1" value={point.month}
                  onChange={(e)=>updatePoint(point.id,"month",e.target.value)}/>
              </label>
              <label className="lx-field">Perda acumulada ({lossMode==="kg"?"kg":"%"})
                <input type="number" min="0" step=".1" value={point.loss}
                  onChange={(e)=>updatePoint(point.id,"loss",e.target.value)}/>
              </label>
              <button type="button" className="lx-button lx-button--line" disabled={points.length===1}
                onClick={()=>setPoints((prev)=>prev.filter((p)=>p.id!==point.id))}>Remover mês</button>
            </div>)}
            <button type="button" className="lx-button lx-button--line"
              disabled={points.length >= 12}
              onClick={()=>setPoints((prev)=>[...prev,{id:"extra-"+String(Date.now()),month:String(Math.min(60,Math.max(1,...prev.map(p=>Number(p.month)||0))+1)),loss:"0"}])}>
              + Adicionar período
            </button>
          </div>
          <div className="lx-period">
            <label className="lx-field">Massa magra: mínimo % da perda
              <input type="number" min="0" max="100" step="1" value={leanLow} onChange={(e)=>setLeanLow(e.target.value)}/>
            </label>
            <label className="lx-field">Máximo % da perda
              <input type="number" min="0" max="100" step="1" value={leanHigh} onChange={(e)=>setLeanHigh(e.target.value)}/>
            </label>
          </div>
          <p className="lx-muted">20–25% é uma faixa de <strong>sensibilidade ilustrativa</strong>. O resultado do SURMOUNT-1 foi aproximadamente 25% do peso perdido em massa magra na semana 72, em população específica. Não há fórmula de 1, 3 ou 5 meses validada aqui.</p>
          <div className="lx-inline"><button className="lx-button" type="button" onClick={reset}>Carregar exemplo editável</button></div>
        </section>

        <div className="lx-result-stack">
          <section className="lx-panel" aria-labelledby="body-result">
            <h2 id="body-result">02 · Visualize o cenário</h2>
            {!body ? <p className="lx-warning" role="alert">Revise peso (30–400 kg), altura (120–230 cm), idade (18–110), meses distintos e perdas menores que o peso inicial.</p>
              : <>
                <div className="lx-inline lx-visibility">
                  <label><input type="checkbox" checked={showBody} onChange={(e)=>setShowBody(e.target.checked)}/> Mostrar corpo ilustrativo</label>
                  <label><input type="checkbox" checked={showBmi} onChange={(e)=>setShowBmi(e.target.checked)}/> Ver IMC aritmético</label>
                </div>
                <label className="lx-field">Ver representação do corpo em qual momento?
                  <select value={selectedPeriod?.id ?? ""} onChange={(e)=>setSelectedPeriodId(e.target.value)}>
                    {rows.map((r)=><option key={r.id} value={r.id}>Mês {r.month} — {formatKg(r.weightAfterKg)} kg hipotéticos</option>)}
                  </select>
                </label>
                <div className="lx-body-display">
                  {showBody ? <BodySilhouette weight={selectedPeriod?.weightAfterKg ?? mainWeight} height={mainHeight} style={sexStyle}/> : <p className="lx-muted">Visual desativado. Os dados completos continuam disponíveis na tabela.</p>}
                  <div className="lx-scenario-readout">
                    <p><strong>{formatKg(mainWeight)} kg</strong> · {formatInteger(mainHeight)} cm · {age} anos · representação {sexStyle==="nao-informar"?"não informada":sexStyle}</p>
                    {showBmi && <p>IMC aritmético: <strong>{formatKg(body.bmi)}</strong>. IMC não mede massa muscular e não é indicação de tratamento.</p>}
                    <div className="lx-kpis">
                      <div className="lx-stat"><strong>{rows.length}</strong><span>Marcos do cenário</span></div>
                      <div className="lx-stat"><strong>{formatKg(rows[rows.length - 1]?.weightAfterKg ?? mainWeight)} kg</strong><span>Peso matemático no último marco</span></div>
                    </div>
                    <p className="lx-muted">A silhueta muda de escala, contorno esquemático, estilo e mês selecionado, mas <strong>não representa seu biotipo real</strong> nem mede reservas musculares.</p>
                  </div>
                </div>
                <div className="lx-chart-wrap">
                  <h3 className="lx-minor-heading">Linha do peso hipotético</h3>
                  <svg viewBox="0 0 480 207" role="img"
                    aria-label={"Peso inicial " + formatKg(mainWeight) + " kg. " + rows.map(r=>"Mês "+r.month+": "+formatKg(r.weightAfterKg)+" kg").join("; ")}>
                    {[40,84,128,169].map((y)=><line key={y} x1="42" x2="438" y1={y} y2={y} stroke="#d5e4f1" strokeDasharray="4 4"/>)}
                    <polyline points={chartPoints} fill="none" stroke="#1e5486" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round"/>
                    {rows.map((r)=><circle key={r.id} cx={42+r.month/maxMonth*390} cy={yPos(r.weightAfterKg)} r="5" fill="#071a33"/>)}
                    <text x="8" y="20" fontSize="12" fill="#153a63">kg</text>
                    <text x="42" y="193" fontSize="12" fill="#153a63">Início</text>
                    <text x="385" y="193" fontSize="12" fill="#153a63">Meses</text>
                  </svg>
                </div>
                <div className="lx-table-wrap" tabIndex={0} role="region" aria-label="Tabela dos pesos e da composição hipotética por mês">
                  <table className="lx-table">
                    <caption>Simulação hipotética: massa magra significa uma parcela do peso perdido, não toda a musculatura</caption>
                    <thead><tr><th scope="col">Mês</th><th scope="col">Peso</th><th scope="col">Perda total</th>
                      <th scope="col">Massa magra na perda</th><th scope="col">Massa gorda na perda</th></tr></thead>
                    <tbody>{rows.map((r)=><tr key={r.id}>
                      <th scope="row">{r.month}</th><td>{formatKg(r.weightAfterKg)} kg</td>
                      <td>{formatKg(r.lostKg)} kg</td>
                      <td>{formatKg(r.leanLossLowKg)}–{formatKg(r.leanLossHighKg)} kg</td>
                      <td>{formatKg(r.fatLossLowKg)}–{formatKg(r.fatLossHighKg)} kg</td>
                    </tr>)}</tbody>
                  </table>
                </div>
                <div className="lx-science">
                  <strong>25% do peso perdido ≠ 25% de toda a massa magra ou dos músculos.</strong>
                  <p>O subestudo SURMOUNT-1 (160 participantes com DXA basal e na semana 72) observou aproximadamente 75% da perda classificada como massa gorda e 25% como massa magra. <strong>Massa magra ≠ músculo funcional.</strong> Não existe nesta tela estimativa individual de força, sarcopenia ou recuperação clínica.</p>
                  <p>{medicine==="tirzepatida"
                    ?"Referência selecionada: tirzepatida. Os percentuais do estudo não são previsões para a pessoa que informa o peso."
                    :"Referência selecionada: "+medicine+". A faixa utilizada é uma hipótese editável, não um coeficiente clínico validado para essa escolha."}</p>
                  <Link href="/evidencias/E04">Ver ficha E04 e limites</Link>{" · "}
                  <a href="https://pubmed.ncbi.nlm.nih.gov/39996356/" target="_blank" rel="noopener noreferrer">PubMed · SURMOUNT-1</a>
                </div>
              </>}
          </section>

          <section className="lx-panel" aria-labelledby="hospital-impact">
            <p className="lx-kicker">Estudos diferentes · Comparação responsável</p>
            <h2 id="hospital-impact">03 · Por que reserva muscular importa na UTI e em cirurgias?</h2>
            <p>Há associações entre sarcopenia <strong>pré-existente</strong> e desfechos hospitalares. Essas evidências vêm de outras populações, não de pessoas agrupadas segundo perdas com Mounjaro. <strong>Não calculamos a probabilidade de internação, complicação ou mortalidade a partir do seu corpo.</strong></p>
            <div className="lx-evidence-grid">
              <div className="lx-stat"><strong>+1,31 dia</strong><span>Diferença média associada à sarcopenia pré-existente em UTI em meta-análise de pacientes ventilados; heterogeneidade elevada</span></div>
              <div className="lx-stat"><strong>+2,73 dias</strong><span>Diferença média associada à permanência hospitalar nessa mesma população ventilada</span></div>
              <div className="lx-stat"><strong>US$ 14.322</strong><span>Diferença ajustada de custo associada à sarcopenia em uma coorte de 1.169 cirurgias abdominais dos EUA, não custo brasileiro ou causado por GLP-1</span></div>
            </div>
            <p className="lx-muted">Fontes: <a target="_blank" rel="noopener noreferrer" href="https://pubmed.ncbi.nlm.nih.gov/35578299/">ventilação/UTI — PMID 35578299</a>{" · "}
              <a target="_blank" rel="noopener noreferrer" href="https://pubmed.ncbi.nlm.nih.gov/27302103/">cirurgias/custos — PMID 27302103</a>.
            </p>
            <h3 className="lx-minor-heading">Exercício separado: capacidade de leitos</h3>
            <p className="lx-muted">Suponha, apenas como aritmética populacional, um conjunto de internações semelhantes às dos estudos e um custo por leito-dia escolhido. <strong>A quantidade abaixo NÃO é estimada pelo uso de medicamentos ou pelas informações de peso, altura, idade ou sexo.</strong></p>
            <div className="lx-period">
              <label className="lx-field">Quantidade hipotética de internações
                <input type="number" min="0" max="100000" step="1" value={cases} onChange={(e)=>setCases(e.target.value)}/>
              </label>
              <label className="lx-field">Custo hipotético por leito-dia (R$)
                <input type="number" min="0" max="1000000" step="100" value={bedCost} onChange={(e)=>setBedCost(e.target.value)}/>
              </label>
            </div>
            {hospital ? <div className="lx-kpis">
              <div className="lx-stat"><strong>{formatKg(hospital.extraBedDaysIllustrative)}</strong><span>Leitos-dia extras na conta ilustrativa</span></div>
              <div className="lx-stat"><strong>{formatMoney(hospital.exampleCostBRL)}</strong><span>Custo resultante das premissas hipotéticas</span></div>
            </div> : <p className="lx-warning" role="alert">Revise as premissas de leitos e custo hipotético.</p>}
            <div className="lx-warning"><strong>Não é projeção clínica do Mounjaro.</strong> Multiplicar a perda de massa magra por OR, custos ou dias de UTI produziria um resultado cientificamente inválido. Associação em pacientes com sarcopenia não prova causalidade pelo medicamento, e uma fração de massa magra perdida não é diagnóstico de sarcopenia.</div>
            <div className="lx-inline"><Link className="lx-button lx-button--line" href="/musculos-uti">Entender músculos e UTI</Link><Link className="lx-button lx-button--line" href="/comparar?a=E04&b=E12">Confrontar E04 × E12</Link></div>
          </section>
        </div>
      </div>
    </div>
  </div>;
}
