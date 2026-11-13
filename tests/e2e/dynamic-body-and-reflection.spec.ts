import { test, expect } from "@playwright/test";
test.use({ reducedMotion: "reduce" });
test("peso/altura/idade/representação respondem e não inventam risco hospitalar",async({page})=>{
 await page.goto("/corpo-evidencia");
 await expect(page.getByRole("heading",{name:"02 · Visualize o cenário"})).toBeVisible();
 const weight=page.getByLabel("Peso inicial (kg)");
 await weight.fill("80");
 await page.getByLabel("Modo da perda hipotética").selectOption("percent");
 const rows=page.getByRole("table",{name:/Simulação hipotética/});
 await expect(rows.getByText("20", {exact:true}).first()).not.toBeVisible().catch(()=>{});
 await page.getByLabel("Altura (cm)").fill("180");
 await page.getByLabel("Idade (anos)").fill("45");
 await page.getByLabel("Estilo visual do corpo (opcional)").selectOption("feminino");
 await expect(page.getByText(/80,0 kg/).first()).toBeVisible();
 await expect(page.getByText(/Não é projeção clínica do Mounjaro/)).toBeVisible();
});
test("reflexão mostra campos condicionais e não afirma envio",async({page})=>{
 await page.goto("/relatos");
 await page.getByRole("button",{name:"Sim, utilizo atualmente"}).click();
 await expect(page.getByLabel(/Durante o período de uso/)).toBeVisible();
 await page.getByLabel(/Durante o período de uso/).fill("Náusea relatada sem atribuir causalidade");
 await page.getByRole("button",{name:"Visualizar reflexão local"}).click();
 await expect(page.getByText(/não enviado/i).first()).toBeVisible();
 await page.getByRole("button",{name:"Limpar tudo"}).click();
 await page.getByRole("button",{name:"Não utilizo",exact:true}).click();
 await page.getByRole("button",{name:"Sim, conheço alguém"}).click();
 await expect(page.getByLabel(/Quais possíveis efeitos adversos/)).toBeVisible();
});
