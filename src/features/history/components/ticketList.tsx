import { AnalyzedTicket } from "@/types/ticket.types";
import { TicketCard } from "./ticketCard";
import { useRef, useState } from "react";
import { TicketDetailModal } from "./ticketDetailModal";
import { usePullToRefresh } from "use-pull-to-refresh";

import { RefreshCw } from "lucide-react";

export type DateFilterType = "today" | "yesterday" | "last7days" | "custom";

interface TicketListProps {
  tickets: AnalyzedTicket[];
  onRefresh: ()=> Promise<void>
}

export function TicketList({ tickets, onRefresh, }: TicketListProps) {
  const [selectedTicket, setSelectedTicket] = useState<AnalyzedTicket | null>(
    null,
  );
    const scrollRef = useRef<HTMLDivElement>(null);
     const { isRefreshing, pullPosition } = usePullToRefresh({
    onRefresh,
    elementRef: scrollRef,
    refreshThreshold: 80,
    maximumPullLength: 120,
    enableResistance: true,
  });
  return (
    <>
      <div
        ref={scrollRef}
        className="
          relative mt-3 min-h-0 flex-1
          overflow-y-auto overscroll-contain
          touch-pan-y pb-6
          [scrollbar-width:none]
        "
      >
        <div
          className="flex items-center justify-center overflow-hidden"
          style={{
            height: isRefreshing ? 50 : pullPosition,
          }}
        >
          <RefreshCw
            className={`size-5 text-blue-600 ${
              isRefreshing ? "animate-spin" : ""
            }`}
          />
        </div>

        <div className="space-y-3">
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onOpenDetail={setSelectedTicket}
            />
          ))}
        </div>
      </div>

      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={selectedTicket !== null}
        onClose={() => setSelectedTicket(null)}
      />
    </>
  );
 
}

//  return (
//     <>
//       <div
//         className="
//           min-h-0 flex-1
//           overflow-y-auto overscroll-contain
//           mt-3 pb-6
//           [scrollbar-width:none]
//         "
//       >
//         <div className="space-y-3">
//           {tickets.map((ticket) => {
//             return (
//               <TicketCard
//                 key={ticket.id}
//                 ticket={ticket}
//                 onOpenDetail={(selected) => {
//                   setSelectedTicket(selected);
//                 }}
//               />
//             );
//           })}
//         </div>
//         <TicketDetailModal
//           ticket={selectedTicket}
//           isOpen={selectedTicket !== null}
//           onClose={() => setSelectedTicket(null)}
//         />
//       </div>
//     </>
//   );