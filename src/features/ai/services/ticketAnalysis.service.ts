import { Type } from "@google/genai";
import {
  TicketAnalysis,
  TicketAnalysisSchema,
} from "../schema/ticketAnalysis.schema";
import { getGeminiModel, getVertexClient } from "@/lib/vertex/vertex.client";
import { buildTicketAnalysisInput, TICKET_ANALYSIS_PROMPT } from "../prompts/ticketAnalysis.prompt";


const responseSchema = {
  type: Type.OBJECT,
  properties: {
    deliveryAddress: {
      type: Type.STRING,
      nullable: true,
    },
    addressConfidence: {
      type: Type.NUMBER,
      nullable: true,
    },
    carrier: {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          nullable: true,
        },
        address: {
          type: Type.STRING,
          nullable: true,
        },
        hasCarrier: {
          type: Type.BOOLEAN,
        },
      },
      required: ["name", "address", "hasCarrier"],
    },
    payment: {
      type: Type.OBJECT,
      nullable: true,
      properties: {
        type: {
          type: Type.STRING,
          enum: ["cash", "bank_transfer", "debt"],
        },
        label: {
          type: Type.STRING,
        },
        amount: {
          type: Type.STRING,
        },
      },
      required: ["type", "label", "amount"],
    },
    invoiceAddress: {
      type: Type.STRING,
      nullable: true,
    },
  },
  required: [
    "deliveryAddress",
    "addressConfidence",
    "carrier",
    "payment",
    "invoiceAddress",
  ],
};

export interface TicketAnalysisResult {
  analysis: TicketAnalysis;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export async function analyzeTicketWithAI(
  content: string,
): Promise<TicketAnalysisResult> {
  const normalizedContent = content.trim();
  if (!normalizedContent) {
    throw new Error("Nội dung phiếu không được để trống.");
  }
  if (normalizedContent.length > 10_000) {
    throw new Error("Nội dung phiếu quá dài.");
  }
  const client = getVertexClient();
  const model = getGeminiModel();
  const response = await client.models.generateContent({
    model,
    contents: buildTicketAnalysisInput(normalizedContent),

    config: {
      systemInstruction: TICKET_ANALYSIS_PROMPT,

      responseMimeType: "application/json",
      responseSchema,

      temperature: 0,
      maxOutputTokens: 2048,
    },
  });
  const rawText = response.text;
  if (!rawText?.trim()) {
    throw new Error("Gemini không trả về nội dung phân tích.");
  }
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error("Gemini trả về JSON không hợp lệ.");
  }
  const validated = TicketAnalysisSchema.parse(parsed);
  const analysis: TicketAnalysis = {
    ...validated,

    addressConfidence: validated.deliveryAddress
      ? validated.addressConfidence
      : null,

    carrier: validated.carrier.hasCarrier
      ? validated.carrier
      : {
          name: null,
          address: null,
          hasCarrier: false,
        },
  };
  return {
    analysis,
    model,
    inputTokens: response.usageMetadata?.promptTokenCount ?? 0,
    outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
    totalTokens: response.usageMetadata?.totalTokenCount ?? 0,
  };
}
