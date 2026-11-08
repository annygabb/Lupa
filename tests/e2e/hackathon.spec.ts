import { test, expect } from "@playwright/test";

test("abertura explica tema e público e troca dados científicos",async({page})=>{
 await page.goto("/");
 await expect(page.getByRole("heading",{level:1})).toContainText("Canetas para emagrecer");
 await expect(page.getByText(/Para profissionais de saúde, estudantes/)).toBeVisible();
 await page.getByRole("button",{name:"Massa magra",exact:true}).click();
 await expect(page.getByRole("heading",{name:"O emagrecimento também incluiu perda de massa magra"})).toBeVisible();
 await page.getByRole("button",{name:"Saúde mental",exact:true}).click();
 await expect(page.getByRole("heading",{name:/Piora de categoria/})).toBeVisible();
 await expect(page.getByText(/Não é incidência de depressão causada/)).toBeVisible();
});

test("horizontes e temas não fabricam previsões nacionais",async({page})=>{
 await page.goto("/projecoes");
 const panel=page.getByRole("region",{name:"O futuro do tratamento precisa de mais que uma curva."});
 for(const year of [2026,2031,2036,2041]){
  const button=page.getByRole("group",{name:"Horizonte da comparação"}).getByRole("button",{name:new RegExp(String(year))});
  await button.click();
  await expect(button).toHaveAttribute("aria-pressed","true");
  await expect(panel.getByText("Sem estimativa validada",{exact:true})).toHaveCount(2);
 }
 await page.getByLabel("O que você quer investigar?").selectOption("icu");
 await expect(page.getByRole("heading",{name:/Perda muscular observada/})).toBeVisible();
 await expect(page.getByText(/O estudo não avaliou GLP-1 ou tirzepatida/)).toBeVisible();
 await page.getByLabel("O que você quer investigar?").selectOption("use");
 await expect(page.getByRole("heading",{name:"Dados observados, com definições diferentes"})).toBeVisible();
 await expect(page.getByText("preprint ainda sem revisão por pares",{exact:true})).toBeVisible();
});

test("saúde mental tem fonte e não cria taxa de depressão brasileira",async({page})=>{
 await page.goto("/saude-mental");
 await expect(page.getByRole("heading",{level:1})).toContainText("Emagrecer não resume");
 await expect(page.getByRole("link",{name:/PMID 41537305/})).toHaveAttribute("href","https://pubmed.ncbi.nlm.nih.gov/41537305/");
 await expect(page.getByRole("heading",{name:"Não é uma taxa nacional"})).toBeVisible();
});

test("navegação fica à esquerda no desktop e abre no celular",async({page})=>{
 await page.goto("/");
 const menu=page.getByRole("button",{name:"Abrir menu"});
 if(await menu.isVisible()){
  await expect(page.getByRole("navigation")).not.toBeVisible();
  await menu.click();
  await page.getByRole("navigation").getByRole("link",{name:"Saúde mental",exact:true}).click();
  await expect(page).toHaveURL(/saude-mental$/);
  await expect(page.getByRole("button",{name:"Abrir menu"})).toHaveAttribute("aria-expanded","false");
 }else{
  const box=await page.locator(".lupa-navigation").boundingBox();
  expect(box?.x).toBe(0); expect(box?.width).toBe(128);
  await page.getByRole("navigation").getByRole("link",{name:"Brasil × EUA",exact:true}).click();
  await expect(page).toHaveURL(/projecoes$/);
 }
});
