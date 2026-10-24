export type Ticket = {
    id:string,
  name: string;
  createdAt: string;
  content: string;
};

export type TicketHistoryProps = {
  tickets?: Ticket[];
  onCreateTicket?: () => void;
  onCreateReport?: (tickets: Ticket[]) => void;
};
