import { z } from "zod";


const CarrierSchema = z.object({
  name: z.string().nullable(),
  address: z.string().nullable(),
  hasCarrier: z.boolean(),
});

export const DeliveryLocationSchema = z.object({
  streetAddress: z.string().nullable(),

  wardMentioned: z.string().nullable(),

  districtMentioned: z.string().nullable(),

  provinceMentioned: z.string().nullable(),

  administrativeSystem: z.enum([
    "legacy",
    "current",
    "mixed",
    "unknown",
  ]),

  // Phường mới mà Gemini suy luận
  suggestedNewWard: z.string().nullable(),

  // Địa chỉ sau sáp nhập mà Gemini đề xuất
  suggestedNewAddress: z.string().nullable(),

  // Độ tin cậy của việc nhận diện địa giới ban đầu
  confidence: z.number().min(0).max(1).nullable(),

  // Độ tin cậy tự đánh giá của việc suy luận phường mới
  suggestedNewWardConfidence: z
    .number()
    .min(0)
    .max(1)
    .nullable(),
});


const PaymentSchema = z.object({
  type: z.enum(["cash", "bank_transfer", "debt"]),
  label: z.string(),
  amount: z.string(),
});
export const TicketAnalysisSchema = z.object({
  deliveryAddress: z.string().nullable(),

  addressConfidence: z.number().min(0).max(1).nullable(),
  deliveryLocation : DeliveryLocationSchema,

  carrier:CarrierSchema,

  payment: PaymentSchema.nullable(),

  invoiceAddress: z.string().nullable(),
});

export type TicketAnalysis = z.infer<
  typeof TicketAnalysisSchema
>;

export type DeliveryLocation = z.infer<typeof DeliveryLocationSchema>