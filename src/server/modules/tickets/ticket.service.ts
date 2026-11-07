
import { CreateTicketInput } from "@/types/ticket.types";
import { saveTicketToSheet, } from "./ticket.repository";




export async function createTicket(input:CreateTicketInput){
    const shipperName = input.shipperName.trim().toUpperCase();
      const content = input.content.trim();

      if (!shipperName || !content) {
    throw new Error("Thiếu thông tin phiếu giao hàng");
  }

  if (
    !Number.isSafeInteger(input.shippingFee) ||
    input.shippingFee < 0
  ) {
    throw new Error("Phí ship không hợp lệ");
  }
     return saveTicketToSheet({
       shipperName,
       content,
       shippingFee: input.shippingFee,
       otherFee:input.otherFee
     });
}

