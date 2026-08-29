import { GoogleGenAI, type Part, type Content } from "@google/genai";
import type { PageImage } from "@/types";
import {
  dataUrlToBase64,
  dataUrlMimeType,
  PDF_DATA_URL_PREFIX,
} from "@/lib/pdf/server";

const VISION_MODEL = "gemini-3.5-flash-lite";

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey)
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  return new GoogleGenAI({ apiKey });
}

/** Send a prompt + inline parts to Gemini and parse the response as JSON. */
export async function geminiJSON(
  systemInstruction: string,
  userText: string,
  parts: Part[]
): Promise<unknown> {
  const client = getClient();

  const contents: Content[] = [
    { role: "user", parts: [{ text: userText }, ...parts] },
  ];

  const response = await client.models.generateContent({
    model: VISION_MODEL,
    contents,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.1,
      maxOutputTokens: 8192,
    },
  });

  const raw = response.text ?? "";

  try {
    return JSON.parse(raw);
  } catch {
    // Model occasionally wraps JSON in markdown fences despite instructions
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced) return JSON.parse(fenced[1].trim());
    throw new Error(`Gemini returned non-JSON: ${raw.slice(0, 200)}`);
  }
}

/** Wrap a raw PDF base64 string as an inline part. */
export function buildPdfPart(base64: string): Part {
  return { inlineData: { mimeType: "application/pdf", data: base64 } };
}

/**
 * Build inline parts from PageImage[].
 * If the pages share a PDF data-URL, send the document once as a single part.
 * Otherwise send one image part per page.
 */
export function buildImageParts(pages: PageImage[]): Part[] {
  if (pages.length === 0) return [];

  if (pages[0].url.startsWith(PDF_DATA_URL_PREFIX)) {
    return [
      {
        inlineData: {
          mimeType: "application/pdf",
          data: dataUrlToBase64(pages[0].url),
        },
      },
    ];
  }

  return pages.map((p) => ({
    inlineData: {
      mimeType: dataUrlMimeType(p.url),
      data: dataUrlToBase64(p.url),
    },
  }));
}

/** Build image parts directly from data-URL strings (deduped). */
export function buildImagePartsFromDataUrls(dataUrls: string[]): Part[] {
  return [...new Set(dataUrls)].map((url) => ({
    inlineData: { mimeType: dataUrlMimeType(url), data: dataUrlToBase64(url) },
  }));
}
