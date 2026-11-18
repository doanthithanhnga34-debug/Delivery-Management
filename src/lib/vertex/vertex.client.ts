import { GoogleGenAI } from "@google/genai";
// import "server-only";
let client: GoogleGenAI | null = null;
type GeminiProvider = "developer" | "vertex";

function getGeminiProvider(): GeminiProvider {
  const provider = process.env.GEMINI_PROVIDER;

  if (provider === "developer" || provider === "vertex") {
    return provider;
  }

  throw new Error("GEMINI_PROVIDER must be 'developer' or 'vertex'");
}
export function getVertexClient(): GoogleGenAI {
  if (client) return client;

  const provider = getGeminiProvider();

  if (provider === "developer") {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY");
    }

    client = new GoogleGenAI({
      vertexai: false,
      apiKey,
      httpOptions: {
        apiVersion: "v1beta",
      },
    });

    console.log("[GEMINI] Provider: Google AI Studio");

    return client;
  }

  const project = process.env.GOOGLE_CLOUD_PROJECT;

  if (!project) {
    throw new Error("Missing GOOGLE_CLOUD_PROJECT");
  }

  client = new GoogleGenAI({
    vertexai: true,
    project,
    location: process.env.GOOGLE_CLOUD_LOCATION || "global",
    apiVersion: "v1",
  });

  console.log("[GEMINI] Provider: Vertex AI");

  return client;
}

export function getGeminiModel(): string {
  return process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
}
