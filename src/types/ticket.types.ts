export interface Ticket {
  id: string;
  shipperId: string;
  shipperName: string;
  deliveryDate: string;
  shippingFee: number | null;
  codAmount: string | null;
  transportFee: number;
  otherFee: number;
  createdAt: string;
  content: string;
}

export interface CreateTicketInput {
  shipperName: string;
  content: string;
  shippingFee: number;
  deliveryDate: string;
}

export interface SaveTicketInput {
  shipperName: string;
  content: string;
  shippingFee: number;
}
export type TicketHistoryProps = {
  tickets?: Ticket[];
  onCreateTicket?: () => void;
  onCreateReport?: (tickets: Ticket[]) => void;
};

