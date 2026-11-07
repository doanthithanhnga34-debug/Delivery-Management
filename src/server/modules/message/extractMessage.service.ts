import { extractAddresses } from "../address/addressExtractor.service";
import { extractCarrierInfo } from "./extractCarrierInfo.service";

export function analyzeShippingAddresses(content: string) {
  const addresses = extractAddresses(content);

  return {
    deliveryAddresses: addresses.filter(
      (item) => item.type === "delivery",
    ),

    carrier: extractCarrierInfo(content),

    invoiceAddresses: addresses.filter(
      (item) => item.type === "invoice",
    ),

    unknownAddresses: addresses.filter(
      (item) => item.type === "unknown",
    ),
  };
}