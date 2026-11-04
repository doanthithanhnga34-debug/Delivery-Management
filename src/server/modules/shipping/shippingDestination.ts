import { extractAddresses } from "../address/addressExtractor.service";

export type DestinationResult =
  | {
      status: "ready";
      type: "delivery" | "carrier";
      address: string;
    }
  | {
      status: "missing_address";
      type: "delivery" | "carrier";
      address: null;
    }
  | {
      status: "needs_review";
      type: "delivery" | "carrier";
      address: null;
    };

const CARRIER_INTENT =
  /(?:gửi\s*(?:hàng\s*)?(?:qua\s*)?(?:nhà\s*xe|xe|chành)|gởi\s*(?:hàng\s*)?(?:qua\s*)?(?:nhà\s*xe|xe|chành)|chuyển\s*(?:qua\s*)?(?:nhà\s*xe|chành)|(?:nhà\s*xe|chành\s*xe)\s+(?!check\b|trước\b|chưa\b)[\p{L}]+|(?<!gọi\s)\bxe\s+(?!chạy\b|giao\b|đến\b|đi\b|về\b|check\b)[\p{Lu}][\p{L}]+)/iu;

export function resolveShippingDestination(content: string): DestinationResult {
  const addresses = extractAddresses(content);
  const carrierAddresses = addresses.filter(
    (item) => item.type === "carrier" && item.confidence >= 0.7,
  );
  const deliveryAddresses = addresses.filter(
    (item) => item.type === "delivery" && item.confidence >= 0.7,
  );
  const isCarrierOrder = CARRIER_INTENT.test(content);
  if (isCarrierOrder) {
    if (carrierAddresses.length > 1) {
      return {
        status: "needs_review",
        type: "carrier",
        address: null,
      };
    }

    if (carrierAddresses.length === 1) {
      return {
        status: "ready",
        type: "carrier",
        address: carrierAddresses[0].text,
      };
    }

    return {
      status: "missing_address",
      type: "carrier",
      address: null,
    };
  }
  if (deliveryAddresses.length > 1) {
    return {
      status: "needs_review",
      type: "delivery",
      address: null,
    };
  }

  if (deliveryAddresses.length === 1) {
    return {
      status: "ready",
      type: "delivery",
      address: deliveryAddresses[0].text,
    };
  }
  return {
    status: "missing_address",
    type: "delivery",
    address: null,
  };
}
