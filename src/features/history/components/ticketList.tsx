import { OrderTicket } from "@/types/ticket.types";


interface TicketListProps{
    tickets:OrderTicket[];
    onDeleteTicket:(orderId:string) => void;
    onNavigateCreate:() => void;
}

export type DateFilterType = "today" | "yesterday" | "last7days" |"custom"

export const OrderList: React.FC<TicketListProps>=({tickets, onDeleteTicket,  onNavigateCreate}) => {
    
}