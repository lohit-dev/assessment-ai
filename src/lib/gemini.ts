import { GoogleGenAI, type Part, type Content } from "@google/genai";
import type { PageImage } from "@/types";
import { dataUrlToBase64, dataUrlMimeType } from "./pdfToImages";

const VISION_MODEL = "gemini-3.1-flash-lite";

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }
  return new GoogleGenAI({ apiKey });
}

export async function geminiJSON(
  systemInstruction: string,
  userTextPrompt: string,
  parts: Part[]
): Promise<unknown> {
  const client = getClient();

  const contents: Content[] = [
    {
      role: "user",
      parts: [{ text: userTextPrompt }, ...parts],
    },
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
    // don't know how to fix this
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced) {
      return JSON.parse(fenced[1].trim());
    }
    throw new Error(`Gemini returned non-JSON response: ${raw.slice(0, 200)}`);
  }
}

export function buildPdfPart(base64: string): Part {
  return {
    inlineData: {
      mimeType: "application/pdf",
      data: base64,
    },
  };
}

/**
 * For PDF-backed PageImages, sends the whole document as a single part.
 * For image-backed PageImages, sends one part per page.
 */
export function buildImageParts(pages: PageImage[]): Part[] {
  if (pages.length === 0) return [];

  if (pages[0].url.startsWith("data:application/pdf")) {
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

export function buildImagePartsFromDataUrls(dataUrls: string[]): Part[] {
  if (dataUrls.length === 0) return [];
  return [...new Set(dataUrls)].map((url) => ({
    inlineData: {
      mimeType: dataUrlMimeType(url),
      data: dataUrlToBase64(url),
    },
  }));
}
