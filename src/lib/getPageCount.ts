// src/lib/getPageCount.ts
// Client-only: lightweight page-count read, no rendering.

export async function getPageCount(file: File): Promise<number> {
  if (file.type !== "application/pdf") return 1;

  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const workerUrl = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.mjs",
    import.meta.url
  ).href;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
  }).promise;

  const count = pdf.numPages;
  return count;
}
