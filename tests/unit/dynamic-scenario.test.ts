import {describe, expect, it} from "vitest";
import {buildBodyProjection, buildHospitalLoadExample} from "@/features/experience/dynamic-scenario";
const base={initialWeightKg:80,heightCm:164,ageYears:22,lossMode:"percent" as const,
  timepoints:[{id:"p1",month:5,loss:5}],leanLowPct:20,leanHighPct:25};
describe("simulador paramétrico e limites científicos",()=>{
  it("80 kg com perda ilustrativa de 5% → 76 kg e 0,8 a 1 kg de massa magra NA PERDA",()=>{
    const r=buildBodyProjection(base);
    expect(r.rows[0].weightAfterKg).toBe(76);
    expect(r.rows[0].leanLossLowKg).toBeCloseTo(.8);
    expect(r.rows[0].leanLossHighKg).toBeCloseTo(1);
  });
  it("peso totalmente editável recalcula perda no modo percentual",()=>{
    const r=buildBodyProjection({...base,initialWeightKg:100});
    expect(r.rows[0].weightAfterKg).toBe(95);
    expect(r.rows[0].leanLossLowKg).toBeCloseTo(1);
    expect(r.rows[0].leanLossHighKg).toBeCloseTo(1.25);
  });
  it("altura modifica somente contexto/IMC, não a perda de peso",()=>{
    const a=buildBodyProjection(base), b=buildBodyProjection({...base,heightCm:180});
    expect(a.rows).toEqual(b.rows);
    expect(a.bmi).not.toBe(b.bmi);
  });
  it("idade não muda cálculo ou risco de UTI",()=>{
    const a=buildBodyProjection(base), b=buildBodyProjection({...base,ageYears:70});
    expect(a.rows).toEqual(b.rows);
  });
  it("aceita mês editável e ordena períodos",()=>{
    const v=buildBodyProjection({...base,timepoints:[{id:"a",month:5,loss:5},{id:"b",month:1,loss:1}]});
    expect(v.rows.map(x=>x.month)).toEqual([1,5]);
  });
  it("protege contra dados faltantes ou absurdos",()=>{
    for(const value of [NaN,0,29,401])expect(()=>buildBodyProjection({...base,initialWeightKg:value})).toThrow();
    expect(()=>buildBodyProjection({...base,leanLowPct:26,leanHighPct:25})).toThrow();
    expect(()=>buildBodyProjection({...base,timepoints:[{id:"x",month:1,loss:120}]})).toThrow();
    expect(()=>buildBodyProjection({...base,timepoints:[{id:"x",month:1,loss:1},{id:"y",month:1,loss:3}]})).toThrow();
  });
  it("impacto hospitalar é uma conta populacional independente, sem risco clínico pessoal",()=>{
    const x=buildHospitalLoadExample(20,3000);
    expect(x.extraBedDaysIllustrative).toBeCloseTo(26.2);
    expect(x.exampleCostBRL).toBeCloseTo(78600);
    expect(x.label).toBe("cenario_nao_previsao");
  });
});
