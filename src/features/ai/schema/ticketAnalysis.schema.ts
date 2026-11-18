import { z } from "zod";

export const TicketAnalysisSchema = z.object({
  deliveryAddress: z.string().nullable(),

  addressConfidence: z.number().min(0).max(1).nullable(),

  carrier: z.object({
    name: z.string().nullable(),
    address: z.string().nullable(),
    hasCarrier: z.boolean(),
  }),

  payment: z
    .object({
      type: z.enum(["cash", "bank_transfer", "debt"]),
      label: z.string(),
      amount: z.string(),
    })
    .nullable(),

  invoiceAddress: z.string().nullable(),
});

export type TicketAnalysis = z.infer<
  typeof TicketAnalysisSchema
>;