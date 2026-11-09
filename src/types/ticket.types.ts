export interface Ticket {
  id: string;
  shipperId: string;
  shipperName: string;
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
  otherFee: number;
}

export interface SaveTicketInput {
  shipperName: string;
  content: string;
  shippingFee: number;
  otherFee: number;
}
export type TicketHistoryProps = {
  tickets?: Ticket[];
  onCreateTicket?: () => void;
  onCreateReport?: (tickets: Ticket[]) => void;
};

export type DeliveryMethod = "direct" | "bus_station";

export interface TicketCarrier {
  name: string | null;
  address: string | null;
  hasCarrier: boolean;
}
export interface InvoiceInfo {
  hasInvoice: boolean;
  companyName: string;
  taxCode?: string;
  address?: string;
  email?: string;
  phone?: string;
}
export type TicketPayment = {
  type: "cash" | "debt" | "bank_transfer";
  label: string;
  amount: string;
};
export interface TicketAnalysis {
  deliveryAddress: string | null;
  addressConfidence: number | null;

  carrier: TicketCarrier;
  payment: TicketPayment | null;
  invoiceAddress: string | null;
}

export interface AnalyzedTicket extends Ticket {
  analysis: TicketAnalysis;
}
