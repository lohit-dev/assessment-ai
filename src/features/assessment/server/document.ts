import type { Part } from "@google/genai";
import { buildImagePartsFromDataUrls, buildPdfPart } from "@/lib/ai/client";
import { pdfToBase64, pdfToImages } from "@/lib/pdf/server";
import type { PageImage } from "@/types";

export const SUPPORTED_DOCUMENT_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

interface AiDocument {
  pages: PageImage[];
  parts: Part[];
}

export async function createAiDocument(file: File): Promise<AiDocument> {
  const buffer = await file.arrayBuffer();

  if (file.type === "application/pdf") {
    return {
      pages: await pdfToImages(buffer),
      parts: [buildPdfPart(pdfToBase64(buffer))],
    };
  }

  const dataUrl = `data:${file.type};base64,${Buffer.from(buffer).toString("base64")}`;

  return {
    pages: [{ page: 1, url: dataUrl, width: 0, height: 0 }],
    parts: buildImagePartsFromDataUrls([dataUrl]),
  };
}
