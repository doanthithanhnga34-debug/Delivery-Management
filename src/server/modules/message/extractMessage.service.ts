import { AnalyzedTicket, Ticket } from "@/types/ticket.types";
import { extractAddresses } from "../address/addressExtractor.service";
import { extractCarrierInfo } from "./extractCarrierInfo.service";
import { TicketPayment } from "@/types/ticket.types";


const PAYMENT_PATTERN =
  /(?:^|[^\p{L}])(thu\s*khách|ck|chuyển\s*khoản|công\s*nợ)\s*(sau\s*)?[:：-]?\s*(\d+(?:[.,]\d+)*(?:\s*(?:k|nghìn|ngàn))?)/giu;

export function extractPaymentInfo(
  content: string,
): TicketPayment | null {
  const matches = [...content.matchAll(PAYMENT_PATTERN)];

  if (matches.length === 0) return null;

  const match = matches[matches.length - 1];

  const rawType = match[1]?.toLowerCase();
  const isLater = Boolean(match[2]?.trim());
  const amount = match[3]?.trim();

  if (!rawType || !amount) return null;

  if (rawType.includes("thu")) {
    return {
      type: "cash",
      label: "Thu khách",
      amount,
    };
  }

  if (rawType.includes("công")) {
    return {
      type: "debt",
      label: "Công nợ",
      amount,
    };
  }

  return {
    type: "bank_transfer",
    label: isLater ? "CK sau" : "Chuyển khoản (CK)",
    amount,
  };
}

export function extractShippingFee(content: string): string | null {
  const pattern =
    /(?:^|[^\p{L}])(?:phí\s*ship|tiền\s*ship|ship)\s*[:：=-]?\s*(\d+(?:[.,]\d+)*)(?:\s*(k|nghìn|ngàn))?(?![\p{L}\d])/giu;

  const matches = [...content.matchAll(pattern)];

  if (matches.length === 0) {
    return null;
  }
  const lastMatch = matches[matches.length - 1];

  const amount = lastMatch[1];
  const unit = lastMatch[2];

  return unit ? `${amount} ${unit}` : amount;
}

export function analyzeShippingAddresses(content: string) {
  const addresses = extractAddresses(content);

  return {
    deliveryAddresses: addresses.filter((item) => item.type === "delivery"),

    carrier: extractCarrierInfo(content),

    invoiceAddresses: addresses.filter((item) => item.type === "invoice"),

    unknownAddresses: addresses.filter((item) => item.type === "unknown"),
  };
}

export function analyzeTicket(ticket: Ticket): AnalyzedTicket {
  const addresses = extractAddresses(ticket.content);
  const delivery = addresses
    .filter((addresses) => addresses.type === "delivery")
    .sort((a, b) => b.confidence - a.confidence)[0];

  const deliveryAddress = delivery?.text ?? null;
  const invoice = addresses
    .filter((address) => address.type === "invoice")
    .sort((a, b) => b.confidence - a.confidence)[0];
  const carrier = extractCarrierInfo(ticket.content);
  const payment = extractPaymentInfo(ticket.content);
  return {
    ...ticket,
    analysis: {
      deliveryAddress: deliveryAddress,
      addressConfidence: delivery?.confidence ?? null,

      carrier: {
        name: carrier.name,
        address: carrier.address,
        hasCarrier: carrier.hasCarrier,
      },

      payment,

      invoiceAddress: invoice?.text ?? null,
    },
  };
}
