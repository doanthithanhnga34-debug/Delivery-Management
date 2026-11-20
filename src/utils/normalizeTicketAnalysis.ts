import { TicketAnalysis } from "@/server/modules/ai/schema/ticketAnalysis.schema";

export function normalizeTicketAnalysis(
  analysis: TicketAnalysis,
): TicketAnalysis {
  const location = analysis.deliveryLocation;

  const newWard =
    location.suggestedNewWard?.trim() || null;

  const newAddress =
    location.suggestedNewAddress?.trim() || null;

  return {
    ...analysis,

    deliveryLocation: {
      ...location,

      suggestedNewWard: newWard,

      suggestedNewAddress: newWard
        ? newAddress
        : null,

      suggestedNewWardConfidence: newWard
        ? location.suggestedNewWardConfidence
        : null,
    },
  };
}