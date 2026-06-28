import { GoogleGenAI } from "@google/genai";
import { ENV } from "./env.ts";

let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && ENV.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: ENV.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (err) {
      console.error("Failed to initialize GoogleGenAI client:", err);
    }
  }
  return aiClient;
}

export interface Part {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export async function invokeLLM({
  prompt,
  image,
  video,
  systemInstruction,
  responseSchema,
}: {
  prompt: string;
  image?: { mimeType: string; base64Data: string };
  video?: { mimeType: string; base64Data: string };
  systemInstruction?: string;
  responseSchema?: any;
}): Promise<string> {
  const client = getGeminiClient();

  if (!client) {
    console.warn("⚠️ No GEMINI_API_KEY configured. Returning simulated JSON/text.");
    throw new Error("MOCKED_AI_BYPASS");
  }

  try {
    const parts: any[] = [];

    // If image is supplied, construct multimodal parts
    if (image) {
      let cleanData = image.base64Data;
      let cleanMimeType = image.mimeType;
      const match = cleanData.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
      if (match) {
        cleanMimeType = match[1];
        cleanData = match[2];
      }

      parts.push({
        inlineData: {
          mimeType: cleanMimeType,
          data: cleanData,
        },
      });
    }

    // If video is supplied, construct multimodal parts
    if (video) {
      let cleanData = video.base64Data;
      let cleanMimeType = video.mimeType;
      const match = cleanData.match(/^data:(video\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (match) {
        cleanMimeType = match[1];
        cleanData = match[2];
      } else {
        cleanMimeType = "video/mp4";
      }

      parts.push({
        inlineData: {
          mimeType: cleanMimeType,
          data: cleanData,
        },
      });
    }

    parts.push({ text: prompt });

    const modelsToTry = [
      "gemini-3.1-flash-lite",
      "gemini-flash-latest",
      "gemini-2.5-flash",
      "gemini-3.5-flash"
    ];
    let lastError: any = null;

    for (const model of modelsToTry) {
      let attempts = 0;
      const maxAttempts = 2;
      while (attempts < maxAttempts) {
        try {
          console.log(`Attempting Gemini API call with model: ${model} (attempt ${attempts + 1})...`);
          const response = await client.models.generateContent({
            model,
            contents: { parts },
            config: {
              systemInstruction,
              responseMimeType: responseSchema ? "application/json" : "text/plain",
              responseSchema: responseSchema || undefined,
              temperature: 0.2,
            },
          });
          console.log(`Gemini API call succeeded with model: ${model}`);
          return response.text || "";
        } catch (err: any) {
          lastError = err;
          attempts++;
          const errMsg = String(err.message || err);
          const isTransient = errMsg.includes("503") || errMsg.includes("UNAVAILABLE") || errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED");
          
          console.warn(`Gemini API call failed with model: ${model} on attempt ${attempts}. Error:`, errMsg);
          
          if (isTransient && attempts < maxAttempts) {
            console.log(`Transient error encountered. Retrying in 800ms...`);
            await new Promise((resolve) => setTimeout(resolve, 800));
          } else {
            break;
          }
        }
      }
    }

    // If we exhausted all models, throw the last error
    throw lastError || new Error("All Gemini models failed to generate content.");
  } catch (err) {
    console.error("All fallback models in Gemini API failed:", err);
    throw err;
  }
}
