
import { TicketHistory } from "@/features/history/components/ticketHistory";
import { Suspense } from "react";

export default function HistoryPage() {
  return (
    <Suspense fallback={<></>}>
      <div className="flex min-h-0 w-full flex-1 flex-col">
        <TicketHistory />
      </div>
    </Suspense>
  );
}
