import QRCode from "qrcode";

export interface QrOptions {
  size?: number;
  margin?: number;
  darkColor?: string;
  lightColor?: string;
}

/**
 * Retorna a URL canônica de acesso do participante ao evento Live.
 */
export function getCanonicalLiveUrl(code: string, origin?: string): string {
  const base =
    process.env.LUPA_APP_BASE_URL ||
    origin ||
    (typeof window !== "undefined" ? window.location.origin : "https://lupaa.vercel.app");
  return `${base.replace(/\/+$/, "")}/live/${code.toUpperCase()}`;
}

/**
 * Gera string SVG de QR Code de alto contraste (cianotipia / padrão claro).
 */
export async function generateQrSvg(
  text: string,
  options: QrOptions = {}
): Promise<string> {
  const {
    margin = 2,
    darkColor = "#071a33", // Prussian 950
    lightColor = "#ffffff",
  } = options;

  return QRCode.toString(text, {
    type: "svg",
    margin,
    color: {
      dark: darkColor,
      light: lightColor,
    },
    errorCorrectionLevel: "M",
  });
}

/**
 * Gera Data URI PNG do QR Code para exibição direta em <img> ou download.
 */
export async function generateQrDataUri(
  text: string,
  options: QrOptions = {}
): Promise<string> {
  const {
    size = 400,
    margin = 2,
    darkColor = "#071a33",
    lightColor = "#ffffff",
  } = options;

  return QRCode.toDataURL(text, {
    width: size,
    margin,
    color: {
      dark: darkColor,
      light: lightColor,
    },
    errorCorrectionLevel: "M",
  });
}
