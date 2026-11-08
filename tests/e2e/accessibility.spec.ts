import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const auditedRoutes=["/","/evidencias","/comparar","/musculos-uti","/projecoes","/metodologia","/saude-mental"];

test.describe("WCAG automatizado — regras A e AA verificáveis",()=>{
  for(const route of auditedRoutes){
    test("axe na rota "+route,async({page})=>{
      await page.goto(route);
      await expect(page.getByRole("heading",{level:1})).toBeVisible();
      const results=await new AxeBuilder({page})
        .withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa"])
        .analyze();
      const contrast=results.violations.find(v=>v.id==="color-contrast");
      if(contrast){
        const pairs=[...new Set(contrast.nodes.flatMap(node=>
          (node.failureSummary??"").match(/foreground color: #[0-9a-f]{6}, background color: #[0-9a-f]{6}/gi)??[]
        ))];
        console.log("AUDITORIA_CONTRASTE "+route+" "+JSON.stringify(pairs));
      }
      expect(results.violations.map(v=>({
        id:v.id,impact:v.impact,help:v.help,
        nodes:v.nodes.slice(0,3).map(n=>({target:n.target,summary:n.failureSummary})),
      }))).toEqual([]);
    });
  }
});
