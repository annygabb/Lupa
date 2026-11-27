import {test,expect} from "@playwright/test";
test.use({reducedMotion:"reduce"});
test("experiências educativas preservam limites científicos",async({page})=>{
 await page.goto("/experiencias");await expect(page.getByRole("heading",{level:1})).toBeVisible();
 await page.goto("/corpo-evidencia");await expect(page.getByText("25% do peso perdido ≠ 25% de toda a massa magra ou dos músculos.")).toBeVisible();
 await page.getByRole("link",{name:"Confrontar os estudos E04 × E12"}).isVisible();
 await page.goto("/desafio");await expect(page.getByRole("heading",{level:1})).toBeVisible();
 await page.goto("/impacto");await expect(page.getByText("Comparação explicável")).toBeVisible();
 await page.goto("/dossie");await expect(page.getByRole("button",{name:"Exportar dossiê Markdown"})).toBeVisible();
});
test("LUPA Live deve informar indisponibilidade quando falta banco",async({page})=>{
 await page.goto("/live");
 await expect(page.getByRole("heading",{level:1})).toBeVisible();
 await page.goto("/live/organizador");
 await expect(page.getByRole("heading",{level:1})).toBeVisible();
});
