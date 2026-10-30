
import { parsedTicketContent } from "./ticket.parse";


interface CreateTicketInput{
    shipperName:string;
    content:string;
    deliveryDate:string;
}

export async function createTicket(input:CreateTicketInput){
    const parsed = parsedTicketContent(input.content);
    const ticket ={
        shipperName:input.shipperName.trim(),
        deliveryDate:input.deliveryDate,
        content:input.content.trim(),
        shippingFee:parsed.shippingFee,
        codAmount:parsed.codAmount,
        transportFee : parsed.transportFee,
        otherFee:parsed.otherFee
    }
    return ticket
}