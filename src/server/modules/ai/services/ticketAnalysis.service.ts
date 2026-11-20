import { Delivery, Type } from "@google/genai";
import {
  TicketAnalysis,
  TicketAnalysisSchema,
} from "../schema/ticketAnalysis.schema";

import {
  buildTicketAnalysisInput,
  TICKET_ANALYSIS_PROMPT,
} from "../prompts/ticketAnalysis.prompt";
import { nullable, properties } from "zod";
import {
  getGeminiModel,
  getVertexClient,
} from "@/server/integrations/ai/vertex.client";
import { normalizeTicketAnalysis } from "@/utils/normalizeTicketAnalysis";

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
    deliveryLocation: {
      type: Type.OBJECT,
      properties: {
        streetAddress: {
          type: Type.STRING,
          nullable: true,
        },
        wardMentioned: {
          type: Type.STRING,
          nullable: true,
        },
        districtMentioned: {
          type: Type.STRING,
          nullable: true,
        },
        provinceMentioned: {
          type: Type.STRING,
          nullable: true,
        },
        administrativeSystem: {
          type: Type.STRING,
          enum: ["legacy", "current", "unknown", "mixed"],
        },
        suggestedNewWard: {
          type: Type.STRING,
          nullable: true,
        },
        confidence: {
          type: Type.NUMBER,
          nullable: true,
        },
        suggestedNewAddress: {
          type: Type.STRING,
          nullable: true,
          description: "Địa chỉ giao hàng sau sáp nhập do AI đề xuất",
        },

        suggestedNewWardConfidence: {
          type: Type.NUMBER,
          nullable: true,
          description: "Độ tin cậy tự đánh giá khi suy luận phường mới",
        },
      },
      required: [
        "streetAddress",
        "wardMentioned",
        "districtMentioned",
        "provinceMentioned",
        "administrativeSystem",
        "suggestedNewWard",
        "suggestedNewAddress",
        "confidence",
        "suggestedNewWardConfidence",
      ],
    },
    invoiceAddress: {
      type: Type.STRING,
      nullable: true,
    },
  },
  required: [
    "deliveryLocation",
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

  // 1. Khởi tạo Gemini client
  const client = getVertexClient();
  const model = getGeminiModel();

  // 2. Gọi Gemini đúng một lần
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

  // 3. Kiểm tra phản hồi
  const rawText = response.text;

  if (!rawText?.trim()) {
    throw new Error("Gemini không trả về nội dung phân tích.");
  }

  // 4. Parse JSON
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error("Gemini trả về JSON không hợp lệ.");
  }

  // 5. Validate với Zod
  const validated = TicketAnalysisSchema.parse(parsed);

  // 6. Chuẩn hóa dữ liệu chuyển đổi địa chỉ
  const normalized = normalizeTicketAnalysis(validated);

  // 7. Chuẩn hóa các trường nghiệp vụ hiện có
  const analysis: TicketAnalysis = {
    ...normalized,

    addressConfidence: normalized.deliveryAddress
      ? normalized.addressConfidence
      : null,

    carrier: normalized.carrier.hasCarrier
      ? normalized.carrier
      : {
          name: null,
          address: null,
          hasCarrier: false,
        },
  };

  // 8. Trả kết quả và token usage
  return {
    analysis,
    model,
    inputTokens: response.usageMetadata?.promptTokenCount ?? 0,
    outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
    totalTokens: response.usageMetadata?.totalTokenCount ?? 0,
  };
}
