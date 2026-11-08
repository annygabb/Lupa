import { expect, test } from "@playwright/test";

const mainRoutes = [
  {path:"/", title:/Canetas para emagrecer/i},
  {path:"/evidencias", title:/Estudos sobre medicamentos para emagrecer/i},
  {path:"/comparar", title:/Compare estudos/i},
  {path:"/musculos-uti", title:/Além do peso/i},
  {path:"/projecoes", title:/O futuro do tratamento/i},
  {path:"/metodologia", title:/Cada conclusão precisa/i},
] as const;

test.describe("LUPA — navegação e estabilidade",()=>{
  for(const route of mainRoutes) {
    test("abre "+route.path+" sem erro e sem corte horizontal da página", async({page})=>{
      const pageErrors:string[]=[];
      page.on("pageerror",error=>pageErrors.push(error.message));
      const response=await page.goto(route.path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading",{level:1})).toContainText(route.title);
      await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth),{
        message:"Página deve caber na largura disponível; tabelas podem rolar dentro do próprio componente",
      }).toBeLessThanOrEqual(2);
      expect(pageErrors).toEqual([]);
    });
  }

  test("menu abre a metodologia e marca a rota atual",async({page})=>{
    await page.goto("/");
    const menu=page.getByRole("navigation",{name:"Navegação principal"});
    const menuButton=page.getByRole("button",{name:"Abrir menu"});
    if(await menuButton.isVisible()) await menuButton.click();
    const link=menu.getByRole("link",{name:"Metodologia"});
    await link.click();
    await expect(page).toHaveURL(/\/metodologia$/);
    await expect(page.locator('#main-navigation a[href="/metodologia"]')).toHaveAttribute("aria-current","page");
    await expect(page.getByRole("heading",{name:/Como analisamos uma evidência/})).toBeVisible();
  });
});

test.describe("LUPA — fluxos reais",()=>{
  test("explorador busca, zera resultados, limpa filtros e pagina",async({page})=>{
    await page.goto("/evidencias");
    const search=page.getByRole("searchbox",{name:/Pesquisar por artigo/});
    await search.fill("inexistente_lupa_sem_resultados_2026");
    await expect(page.getByRole("heading",{name:"Nenhuma correspondência encontrada"})).toBeVisible();
    await page.getByRole("button",{name:"Mostrar todas as referências"}).click();
    await expect(page.getByRole("heading",{name:/Resultados/})).toContainText("50");
    await page.getByRole("button",{name:"Músculos",exact:true}).click();
    await expect(page.getByRole("button",{name:"Músculos",exact:true})).toHaveAttribute("aria-pressed","true");
    await page.getByRole("button",{name:"Todos os temas"}).click();
    await page.getByRole("button",{name:/Próxima/}).click();
    await expect(page.getByText("Página 2 de 6")).toBeVisible();
  });

  test("comparador inverte estudos, bloqueia aliases e altera indicador",async({page})=>{
    await page.goto("/comparar");
    const left=page.locator("#compare-left");
    const right=page.locator("#compare-right");
    await expect(left).toHaveValue("E04");
    await expect(right).toHaveValue("E12");
    await page.getByRole("button",{name:"Trocar posições dos estudos"}).click();
    await expect(left).toHaveValue("E12");
    await expect(right).toHaveValue("E04");
    await right.selectOption("E12");
    await expect(page.getByRole("heading",{name:"Selecione dois estudos diferentes"})).toBeVisible();
    await expect(page.getByText("Cálculo combinado").first()).toBeVisible();
    await right.selectOption("E04");
    await expect(page.getByText("Ligação causal não demonstrada").first()).toBeVisible();

    const mobileSelect=page.locator("#reviewed-metric");
    if(await mobileSelect.isVisible()) {
      await mobileSelect.selectOption("M04");
    } else {
      await page.getByRole("button",{name:"Continuidade",exact:true}).click();
    }
    await expect(page.getByRole("heading",{name:/Peso após continuar ou interromper a tirzepatida/})).toBeVisible();
    await expect(page.getByText("+14,0%",{exact:false}).first()).toBeVisible();
    const source=page.getByRole("link",{name:/Abrir fonte original/}).last();
    await expect(source).toHaveAttribute("target","_blank");
    await expect(source).toHaveAttribute("rel",/noopener/);
  });

  test("perguntas de músculos e UTI atualizam interpretação sem causalidade",async({page})=>{
    await page.goto("/musculos-uti");
    await page.getByRole("button",{name:/Massa magra é igual a músculo funcional/i}).click();
    await expect(page.getByRole("heading",{name:"Como se confirma sarcopenia"})).toBeVisible();
    await page.getByRole("button",{name:/O medicamento reduz massa magra/i}).click();
    await expect(page.getByRole("heading",{name:"Composição corporal durante tratamento"})).toBeVisible();
    await page.getByRole("button",{name:/Posso estimar mortalidade em UTI/i}).click();
    await expect(page.getByText(/A ligação causal entre mudança de composição por tirzepatida/).first()).toBeVisible();
    await expect(page.getByRole("link",{name:"Abrir Comparador"})).toHaveAttribute("href","/comparar");
  });

  test("simulador altera cenários, bloqueia valores inválidos e restaura",async({page})=>{
    await page.goto("/projecoes");
    const horizon=page.locator('section[aria-label="Horizontes de simulação"]');
    const initial=await horizon.innerText();
    await page.getByRole("button",{name:/Acesso restrito/}).click();
    await expect(page.getByRole("button",{name:/Acesso restrito/})).toHaveAttribute("aria-pressed","true");
    const afterPreset=await horizon.innerText();
    expect(afterPreset).not.toBe(initial);
    await page.locator("#scenario-populationBase").fill("800000");
    await expect.poll(()=>horizon.innerText()).not.toBe(afterPreset);
    await page.locator("#scenario-annualRetentionPct").fill("120");
    await expect(page.getByRole("heading",{name:"Corrija os parâmetros"})).toBeVisible();
    await expect(horizon).toHaveCount(0);
    await page.getByRole("button",{name:/Redefinir/}).click();
    await expect(horizon).toBeVisible();
    await expect(page.getByRole("button",{name:"Exportar CSV"})).toBeVisible();
  });

  test("simulador exporta CSV e JSON com premissas rastreáveis",async({page})=>{
    await page.goto("/projecoes");
    const [csv]=await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button",{name:"Exportar CSV"}).click(),
    ]);
    expect(csv.suggestedFilename()).toBe("lupa-cenario-2026-2041.csv");
    const [json]=await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button",{name:"Exportar JSON"}).click(),
    ]);
    expect(json.suggestedFilename()).toBe("lupa-cenario-2026-2041.json");
  });
});
