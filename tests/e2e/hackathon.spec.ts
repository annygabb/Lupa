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
 await page.locator(".chart-point-buttons").getByRole("button",{name:/Adultos do painel nacional · Mar\/2024/}).click();
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

test("navegação fica no topo e o índice abre, fecha e navega",async({page})=>{
 await page.goto("/");
 const header=await page.locator(".at-header__bar").boundingBox();
 expect(header?.y).toBe(0); expect(header?.height).toBeLessThan(110);
 const toggle=page.getByRole("button",{name:"Índice"});
 await expect(toggle).toHaveAttribute("aria-expanded","false");
 await toggle.click();
 const dialog=page.getByRole("dialog",{name:"Índice de pranchas"});
 await expect(dialog.getByRole("link",{name:/Saúde mental/})).toBeVisible();
 await page.keyboard.press("Escape");
 const closed=page.getByRole("button",{name:"Índice"});
 await expect(closed).toHaveAttribute("aria-expanded","false");
 await expect(closed).toBeFocused();
 await closed.click();
 await dialog.getByRole("link",{name:/Saúde mental/}).click();
 await expect(page).toHaveURL(/saude-mental$/);
 await expect(page.getByRole("button",{name:"Índice"})).toHaveAttribute("aria-expanded","false");
});

test("cenários respondem às premissas e preservam o ano-base",async({page})=>{
 await page.goto("/projecoes");
 await page.getByRole("button",{name:"Explorar cenários",exact:true}).click();
 await page.getByLabel("Início anual assumido").press("Home");
 await page.getByLabel("Continuidade anual assumida").press("Home");
 await page.getByRole("group",{name:"Horizonte da comparação"}).getByRole("button",{name:"2031",exact:true}).click();
 await page.locator(".chart-point-buttons").getByRole("button",{name:"Acesso constante · 2031",exact:false}).click();
 await expect(page.locator(".metric-detail-value [aria-hidden=true]")).toHaveText("0");
 await page.getByRole("group",{name:"Horizonte da comparação"}).getByRole("button",{name:"2026",exact:true}).click();
 await expect(page.locator(".metric-detail-value [aria-hidden=true]")).toHaveText("100");
});
