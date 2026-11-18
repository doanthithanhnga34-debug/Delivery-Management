import { z } from "zod";


const CarrierSchema = z.object({
  name: z.string().nullable(),
  address: z.string().nullable(),
  hasCarrier: z.boolean(),
});

const PaymentSchema = z.object({
  type: z.enum(["cash", "bank_transfer", "debt"]),
  label: z.string(),
  amount: z.string(),
});
export const TicketAnalysisSchema = z.object({
  deliveryAddress: z.string().nullable(),

  addressConfidence: z.number().min(0).max(1).nullable(),

  carrier:CarrierSchema,

  payment: PaymentSchema.nullable(),

  invoiceAddress: z.string().nullable(),
});

export type TicketAnalysis = z.infer<
  typeof TicketAnalysisSchema
>;