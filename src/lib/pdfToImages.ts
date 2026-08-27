import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import type { PageImage } from "@/types";

// pdfjs requires a worker path — empty string causes "no workerSrc" errors.
try {
  const workerUrl = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.mjs",
    import.meta.url
  ).href;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (pdfjs as any).GlobalWorkerOptions.workerSrc = workerUrl;
} catch {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (pdfjs as any).GlobalWorkerOptions.workerSrc =
    "pdfjs-dist/legacy/build/pdf.worker.mjs";
}

/**
 * Returns one PageImage per page. Each entry carries the whole PDF as a
 * base64 data-URL (the browser's native PDF viewer handles display).
 * pdfjs is used only to read page count and dimensions — no rendering.
 */
export async function pdfToImages(
  buffer: ArrayBuffer,
  _scale = 2
): Promise<PageImage[]> {
  // slice(0) copies the buffer so pdfjs doesn't detach the original
  const data = new Uint8Array(buffer.slice(0));

  const pdf = await pdfjs.getDocument({
    data,
    useWorkerFetch: false,
    useSystemFonts: true,
  }).promise;

  const firstPage = await pdf.getPage(1);
  const vp = firstPage.getViewport({ scale: 1 });
  firstPage.cleanup();

  const base64 = Buffer.from(buffer).toString("base64");
  const dataUrl = `data:application/pdf;base64,${base64}`;

  return Array.from({ length: pdf.numPages }, (_, i) => ({
    page: i + 1,
    url: dataUrl,
    width: Math.round(vp.width),
    height: Math.round(vp.height),
  }));
}

export function pdfToBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString("base64");
}

export function dataUrlToBase64(dataUrl: string): string {
  const comma = dataUrl.indexOf(",");
  return comma === -1 ? dataUrl : dataUrl.slice(comma + 1);
}

export function dataUrlMimeType(dataUrl: string): string {
  const match = dataUrl.match(/^data:([^;]+);/);
  return match ? match[1] : "image/jpeg";
}
