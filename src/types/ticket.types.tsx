export interface Ticket {
  id: string;
  shipperName: string;
  deliveryDate: string;
  shippingFee: number | null;
  codAmount: number;
  transportFee: number;
  otherFee: number;
  createdAt: string;
  content: string;
}

export interface CreateTicketInput {
  shipperName: string;
  content: string;
}
export type TicketHistoryProps = {
  tickets?: Ticket[];
  onCreateTicket?: () => void;
  onCreateReport?: (tickets: Ticket[]) => void;
};
