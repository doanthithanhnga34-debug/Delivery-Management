import { NumberField } from "@base-ui/react";

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
}

export interface SaveTicketInput {
  shipperName: string;
  content: string;
  shippingFee: number;
  otherFee:number;
}
export type TicketHistoryProps = {
  tickets?: Ticket[];
  onCreateTicket?: () => void;
  onCreateReport?: (tickets: Ticket[]) => void;
};

export type DeliveryMethod = | "direct" | "bus_station"

export interface BusStationInfo{
  name:string;
  stationAddress:string;
}
export interface InvoiceInfo{
  hasInvoice:boolean;
  companyName:string;
  taxCode?:string;
  address?:string;
  email?:string;
  phone?:string;
}
export interface OrderTicket{
  id:string;
  code:string;
  shipperName:string;
  customerName:string;
  customerPhone:string;
  deliveryAddress:string;
  deliveryMethod:DeliveryMethod;
  busStationInfo?:BusStationInfo;
  packageContent:string;
  shippingFee:number;
  busStation:number;
  otherFee:number;
  codAmount:string;
  invoiceInfo?:InvoiceInfo;
  createdAt:string;
  rawMessage:string;
}