import { AnalyzedTicket } from "@/types/ticket.types";
import { TicketCard } from "./ticketCard";
import { useRef, useState } from "react";
import { TicketDetailModal } from "./ticketDetailModal";
import { usePullToRefresh } from "use-pull-to-refresh";

import { RefreshCw, Siren } from "lucide-react";

export type DateFilterType = "today" | "yesterday" | "last7days" | "custom";

interface TicketListProps {
  tickets: AnalyzedTicket[];
  onRefresh: () => Promise<void>;
  emptyMessage?: string;
}

export function TicketList({
  tickets,
  onRefresh,
  emptyMessage = "Không có phiếu giao hàng.",
}: TicketListProps) {
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
          pb-6 touch-pan-y
          [scrollbar-width:none]
        "
      >
        <div
          className="pointer-events-none sticky top-0 z-10 flex h-0 justify-center"
          aria-hidden="true"
        >
          {(pullPosition > 0 || isRefreshing) && (
            <div
              className="flex size-10 items-center justify-center rounded-full bg-white shadow-md"
              style={{
                transform: `translateY(${
                  isRefreshing ? 12 : Math.min(pullPosition / 3, 40)
                }px)`,
              }}
            >
              <RefreshCw
                className={`size-5 text-blue-600 ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
            </div>
          )}
        </div>

        {tickets.length === 0 ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center">
            <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
              <Siren className="mx-auto mb-2 size-8 text-blue-500" />

              <p className="text-sm font-medium text-zinc-600">
                {emptyMessage}
              </p>

              {/* <p className="mt-1 text-xs text-zinc-400">
                Kéo xuống để kiểm tra phiếu mới
              </p> */}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onOpenDetail={setSelectedTicket}
              />
            ))}
          </div>
        )}
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
