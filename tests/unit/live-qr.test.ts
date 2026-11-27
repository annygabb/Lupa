import { describe, expect, it } from "vitest";
import { generateQrSvg, generateQrDataUri, getCanonicalLiveUrl } from "@/lib/live/qr";

describe("LUPA Live: Geração de QR Code", () => {
  it("constrói URL canônica válida para qualquer código", () => {
    const url = getCanonicalLiveUrl("CAFE2026BEEF", "https://lupaa.vercel.app");
    expect(url).toBe("https://lupaa.vercel.app/live/CAFE2026BEEF");
  });

  it("gera SVG scannável de alto contraste com paleta Prussian blue", async () => {
    const svg = await generateQrSvg("https://lupaa.vercel.app/live/CAFE2026BEEF");
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
    expect(svg).toContain("#071a33");
  });

  it("gera Data URI PNG para exibição e downloads", async () => {
    const dataUri = await generateQrDataUri("https://lupaa.vercel.app/live/CAFE2026BEEF");
    expect(dataUri).toMatch(/^data:image\/png;base64,/);
  });
});
