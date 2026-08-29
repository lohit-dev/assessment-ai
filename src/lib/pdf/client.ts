// Client-only. Renders every page of a PDF to a PNG data-URL via <canvas>.
// Used by AnswerSheetViewer for on-screen display.

export interface RenderedPage {
  page: number;
  dataUrl: string;
  width: number;
  height: number;
}

export async function renderPdfPages(file: File): Promise<RenderedPage[]> {
  if (file.type !== "application/pdf") {
    // Single image — treat as one page
    const dataUrl = await readAsDataUrl(file);
    const { width, height } = await imageDimensions(dataUrl);
    return [{ page: 1, dataUrl, width, height }];
  }

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

  const pages: RenderedPage[] = [];
  const SCALE = 2; // 2× for crisp handwriting

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: SCALE });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas 2D context");

    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    pages.push({
      page: i,
      dataUrl: canvas.toDataURL("image/png"),
      width: viewport.width,
      height: viewport.height,
    });
    page.cleanup();
  }

  return pages;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function imageDimensions(
  src: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.src = src;
  });
}
