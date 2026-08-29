import type { PageImage } from "@/types";

export const PDF_DATA_URL_PREFIX = "data:application/pdf";

/**
 * Read a PDF buffer and return one PageImage per page.
 * Each entry carries the whole PDF as a base-64 data-URL so the AI can
 * receive the document as a single inline part — no per-page rendering.
 */
export async function pdfToImages(buffer: ArrayBuffer): Promise<PageImage[]> {
  const dataUrl = `${PDF_DATA_URL_PREFIX};base64,${Buffer.from(buffer).toString("base64")}`;
  const pageCount = countPdfPages(buffer);

  return Array.from({ length: pageCount }, (_, i) => ({
    page: i + 1,
    url: dataUrl,
    width: 0,
    height: 0,
  }));
}

function countPdfPages(buffer: ArrayBuffer): number {
  const source = Buffer.from(buffer).toString("latin1");
  const matches = source.match(/\/Type\s*\/Page(?:\s|\/|>>)/g);
  return Math.max(1, matches?.length ?? 1);
}

export function pdfToBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString("base64");
}

export function dataUrlToBase64(dataUrl: string): string {
  const i = dataUrl.indexOf(",");
  return i === -1 ? dataUrl : dataUrl.slice(i + 1);
}

export function dataUrlMimeType(dataUrl: string): string {
  return dataUrl.match(/^data:([^;]+);/)?.[1] ?? "image/jpeg";
}
