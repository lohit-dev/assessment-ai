// Client-only. Lightweight PDF page-count reader — no canvas rendering.

export async function getPageCount(file: File): Promise<number> {
  if (file.type !== "application/pdf") return 1;

  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.mjs",
    import.meta.url
  ).href;

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
  }).promise;

  return pdf.numPages;
}
