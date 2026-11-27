import { test, expect } from "@playwright/test";

test("filtros têm alvos confortáveis e premissas são agrupadas por contexto", async ({ page }) => {
  await page.goto("/evidencias");
  const controls = [
    page.getByRole("button", { name: "Todos os temas", exact: true }),
    page.getByRole("button", { name: "Músculos", exact: true }),
    page.getByLabel("Ordenar:"),
  ];
  for (const control of controls) {
    const box = await control.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
  await page.goto("/projecoes");
  await expect(page.getByRole("group", { name: "Grupo de referência", exact: true })).toBeVisible();
  await expect(page.getByRole("group", { name: "Entrada e continuidade do tratamento", exact: true })).toBeVisible();
  await expect(page.getByRole("group", { name: "Custo opcional", exact: true })).toBeVisible();
});
