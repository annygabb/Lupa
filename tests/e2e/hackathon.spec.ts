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

test("observações e cenários mantêm denominadores e premissas",async({page})=>{
 await page.goto("/projecoes");
 await expect(page.getByRole("heading",{name:"Como os participantes acessaram o tratamento?"})).toBeVisible();
 await expect(page.getByLabel("Entenda o ponto selecionado")).toContainText("23,8%");
 await page.getByRole("button",{name:"Estados Unidos",exact:true}).click();
 await expect(page.getByLabel("Entenda o ponto selecionado")).toContainText("12,0%");
 await page.getByRole("button",{name:/Adultos do painel nacional · Mar\/2024/}).click();
 await expect(page.getByLabel("Entenda o ponto selecionado")).toContainText("8,2%");
 await page.getByLabel("O que você quer investigar?").selectOption("icu");
 await expect(page.getByRole("heading",{name:/Uso prévio de GLP-1 e mortalidade/})).toBeVisible();
 await expect(page.getByText(/OR 1,05/).first()).toBeVisible();
 await page.getByRole("button",{name:"Explorar cenários",exact:true}).click();
 for(const year of [2026,2031,2036,2041]){
  const button=page.getByRole("group",{name:"Horizonte da comparação"}).getByRole("button",{name:String(year),exact:true});
  await button.click();
  await expect(button).toHaveAttribute("aria-pressed","true");
  await expect(page.getByLabel("Entenda o ponto selecionado")).toContainText("hipótese");
 }
 await page.getByText("5,1% versus 4,9% prova que GLP-1 aumenta a mortalidade?",{exact:true}).click();
 await expect(page.getByText(/diferença bruta de 0,2 ponto percentual/)).toBeVisible();
});

test("saúde mental tem fonte e não cria taxa de depressão brasileira",async({page})=>{
 await page.goto("/saude-mental");
 await expect(page.getByRole("heading",{level:1})).toContainText("Emagrecer não resume");
 await expect(page.getByRole("link",{name:/PMID 41537305/})).toHaveAttribute("href","https://pubmed.ncbi.nlm.nih.gov/41537305/");
 await expect(page.getByRole("heading",{name:"Não é uma taxa nacional"})).toBeVisible();
});

test("navegação fica no topo e abre no celular",async({page})=>{
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
  expect(box?.x).toBe(0); expect(box?.y).toBe(0); expect(box?.width).toBeGreaterThan(1100); expect(box?.height).toBeLessThan(110);
  await page.getByRole("navigation").getByRole("link",{name:"Brasil × EUA",exact:true}).click();
  await expect(page).toHaveURL(/projecoes$/);
 }
});
