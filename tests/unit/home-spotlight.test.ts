import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe,expect,it } from "vitest";
import { SourceSpotlight } from "../../components/home/source-spotlight";
import Home from "../../app/page";
import { getReviewedMetric } from "../../features/comparison/reviewed-metrics";

describe("Home editorial, dados científicos verificáveis e hierarquia de entrada",()=>{
 it("um único estudo real orienta o destaque, com a limitação explícita",()=>{
  const html=renderToStaticMarkup(createElement(SourceSpotlight));
  const m=getReviewedMetric("M03")!;
  expect(html).toContain("SURMOUNT-1");
  expect(html).toContain(formatScientific(m.arms[0].value));
  expect(html).toContain(formatScientific(m.arms[1].value));
  expect(html).toContain("Massa magra não é força muscular");
  expect(html).toContain("sem revisão clínica independente");
  expect(html).toContain("/evidencias/E04");
  expect(html).not.toContain("Não há relação causal demonstrada do medicamento com UTI"); // não inventa desfecho
 });
 it("página inicial comunica curadoria e substitui decoração repetitiva",()=>{
  const html=renderToStaticMarkup(createElement(Home));
  expect(html).toContain("Canetas para emagrecer");
  expect(html).toContain("profissionais de saúde");
  expect(html).toContain("Por que o LUPA existe");
  expect(html).toContain("50 referências únicas em curadoria");
  expect(html).toContain("benefícios, riscos e o que ainda não sabemos");
  expect(html).toContain("não 25% dos músculos");
  expect(html).not.toContain("RESEARCH STUDIO");
 });
});
function formatScientific(value:number){
 return (value>0?"+":"")+value.toLocaleString("pt-BR",{minimumFractionDigits:1,maximumFractionDigits:1})+"%";
}
