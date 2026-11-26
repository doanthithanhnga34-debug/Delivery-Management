import { CreateTicketInput } from "@/types/ticket.types";
import { saveTicketToSheet } from "./ticket.repository";
import { randomUUID } from "node:crypto";

export async function createTicket(input: CreateTicketInput) {
  const shipperName = input.shipperName.trim().toUpperCase();
  const content = input.content.trim();

  if (!shipperName || !content) {
    throw new Error("Thiếu thông tin phiếu giao hàng");
  }

  if (!Number.isSafeInteger(input.shippingFee) || input.shippingFee < 0) {
    throw new Error("Phí ship không hợp lệ");
  }

  if (!Number.isSafeInteger(input.otherFee) || input.otherFee < 0) {
    throw new Error("Phí khác không hợp lệ");
  }
  const ticketId = randomUUID();
  const result = await saveTicketToSheet({
    ticketId,
    shipperName,
    content,
    shippingFee: input.shippingFee,
    otherFee: input.otherFee,
  });

  return {
    ...result,
    ticketId,
  };
}
