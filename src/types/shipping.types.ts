export type ShippingQuote =
  | {
      status: "matched";
      fee: number;
      origin: "3/2" | "HTL";
      district: string;
      ward: string;
    }
  | {
      status: "needs_review" | "not_found";
      fee: null;
      reason: string;
    };

export type ShippingResult =
  | {
      status: "matched";
      district: string;
      ward: string;
      shippingFee: number;
      source: "old_address" | "new_address";
    }
  | {
      status: "needs_review";
      district: string | null;
      ward: string | null;
      shippingFee: null;
      reason: string;
    };