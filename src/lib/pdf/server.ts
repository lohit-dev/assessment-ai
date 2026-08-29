// Server-only. Never import from client components.
import "ws";

import type { PageImage } from "@/types";

export const PDF_DATA_URL_PREFIX = "data:application/pdf";

/**
 * Read a PDF buffer and return one PageImage per page.
 * Each entry carries the whole PDF as a base-64 data-URL so the AI can
 * receive the document as a single inline part — no per-page rendering.
 */
export async function pdfToImages(buffer: ArrayBuffer): Promise<PageImage[]> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = new Uint8Array(buffer.slice(0));
  const pdf = await pdfjs.getDocument({
    data,
    // Serverless runtimes do not provide a stable worker-file URL.
    disableWorker: true,
    useWorkerFetch: false,
    useSystemFonts: true,
  } as Parameters<typeof pdfjs.getDocument>[0]).promise;

  const firstPage = await pdf.getPage(1);
  const { width, height } = firstPage.getViewport({ scale: 1 });
  firstPage.cleanup();

  const dataUrl = `${PDF_DATA_URL_PREFIX};base64,${Buffer.from(buffer).toString("base64")}`;

  return Array.from({ length: pdf.numPages }, (_, i) => ({
    page: i + 1,
    url: dataUrl,
    width: Math.round(width),
    height: Math.round(height),
  }));
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
