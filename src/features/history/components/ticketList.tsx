import { OrderTicket } from "@/types/ticket.types";
import { TicketCard } from "./ticketCard";
import { useState } from "react";
import { TicketDetailModal } from "./ticketDetailModal";

export type DateFilterType = "today" | "yesterday" | "last7days" | "custom";

interface TicketListProps {
  tickets: OrderTicket[];
}

export function TicketList({ tickets }: TicketListProps) {
  const [selectedTicket, setSelectedTicket] = useState<OrderTicket | null>(
    null,
  );
  return (
    <>
      <div
        className="
          mt-3 min-h-0 flex-1
          overflow-y-auto overscroll-contain
          pb-6
        "
      >
        <div className="space-y-3">
          {tickets.map((ticket) => {
            return (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onOpenDetail={(selected) => {
                  console.log("Đã click phiếu:", selected.code);
                  setSelectedTicket(selected);
                }}
              />
            );
          })}
        </div>
        <TicketDetailModal
          ticket={selectedTicket}
          isOpen={selectedTicket !== null}
          onClose={() => setSelectedTicket(null)}
        />
      </div>
    </>
  );
}
