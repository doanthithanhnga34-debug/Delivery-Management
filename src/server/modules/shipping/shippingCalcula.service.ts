export interface ShippingCalculationResult {
  destinationType: "delivery" | "carrier";
  address: string | null;
  calculatedShippingFee: number | null;
  status: "matched" | "needs_review" | "not_found";
}