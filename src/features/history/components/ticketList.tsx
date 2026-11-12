import { AnalyzedTicket } from "@/types/ticket.types";
import { TicketCard } from "./ticketCard";
import { useState } from "react";
import { TicketDetailModal } from "./ticketDetailModal";

export type DateFilterType = "today" | "yesterday" | "last7days" | "custom";

interface TicketListProps {
  tickets: AnalyzedTicket[];
}

export function TicketList({ tickets }: TicketListProps) {
  const [selectedTicket, setSelectedTicket] = useState<AnalyzedTicket | null>(
    null,
  );
  return (
    <>
      <div
        className="
          min-h-0 flex-1
          overflow-y-auto overscroll-contain
          mt-3 pb-6
          [scrollbar-width:none]
        "
      >
        <div className="space-y-3">
          {tickets.map((ticket) => {
            return (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onOpenDetail={(selected) => {
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
