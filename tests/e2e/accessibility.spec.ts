import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const auditedRoutes=["/","/evidencias","/comparar","/musculos-uti","/projecoes","/metodologia"];

test.describe("WCAG automatizado — violações críticas e graves",()=>{
  for(const route of auditedRoutes){
    test("axe na rota "+route,async({page})=>{
      await page.goto(route);
      await expect(page.getByRole("heading",{level:1})).toBeVisible();
      const results=await new AxeBuilder({page})
        .withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa"])
        .analyze();
      const severe=results.violations.filter(v=>v.impact==="critical"||v.impact==="serious");
      expect(severe.map(v=>({
        id:v.id,impact:v.impact,help:v.help,
        nodes:v.nodes.slice(0,3).map(n=>({target:n.target,summary:n.failureSummary})),
      }))).toEqual([]);
    });
  }
});
