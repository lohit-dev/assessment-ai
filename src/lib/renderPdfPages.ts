// src/lib/renderPdfPages.ts
// Client-only: renders every page of a PDF File to a PNG data URL via canvas,
// for on-screen display in AnswerSheetViewer. Separate from the server-side
// pdfToImages.ts, which sends the whole PDF to Gemini without rendering.

export interface RenderedPage {
  page: number;
  dataUrl: string;
  width: number;
  height: number;
}

export async function renderPdfPages(file: File): Promise<RenderedPage[]> {
  if (file.type !== "application/pdf") {
    // single image file — treat as one page
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const dims = await new Promise<{ width: number; height: number }>(
      (resolve) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.src = dataUrl;
      }
    );
    return [{ page: 1, dataUrl, ...dims }];
  }

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

  const pages: RenderedPage[] = [];
  const scale = 2; // sharp enough to zoom in on handwriting

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");

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
