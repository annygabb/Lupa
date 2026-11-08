import { expect, test } from "@playwright/test";

// Static audits inspect the fully readable reduced-motion state; motion has its own tests.
test.use({ reducedMotion: "reduce" });

/**
 * Capturas de referência para a próxima etapa de polimento visual.
 * Não são aprovações de design nem snapshot tests por comparação pixel a pixel.
 * O GitHub Actions publica as imagens dentro do relatório do Playwright.
 */
const routes=[
  {path:"/",label:"inicio"},
  {path:"/evidencias",label:"explorador"},
  {path:"/comparar",label:"comparador"},
  {path:"/musculos-uti",label:"musculos-uti"},
  {path:"/projecoes",label:"projecoes"},
  {path:"/metodologia",label:"metodologia"},
  {path:"/saude-mental",label:"saude-mental"},
] as const;

test.describe("Registros visuais para revisão de UX/UI",()=>{
  for(const route of routes){
    test("captura viewport de "+route.label,async({page},testInfo)=>{
      const response=await page.goto(route.path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading",{level:1})).toBeVisible();
      const screenshot=await page.screenshot({
        animations:"disabled",caret:"hide",fullPage:false,
      });
      await testInfo.attach(testInfo.project.name+"-"+route.label+".png",{
        body:screenshot,contentType:"image/png",
      });
    });
  }
  test("captura seção gráfica do comparador",async({page},testInfo)=>{
    await page.goto("/comparar");
    const section=page.locator("#indicadores");
    await section.scrollIntoViewIfNeeded();
    await expect(page.getByRole("heading",{name:"Evidência em perspectiva"})).toBeVisible();
    const screenshot=await section.screenshot({animations:"disabled"});
    await testInfo.attach(testInfo.project.name+"-indicadores.png",{
      body:screenshot,contentType:"image/png",
    });
  });
});
