import { Suspense } from "react";
import { TicketHistory } from "@/features/history/components/ticketHistory";

export default function HistoryPage() {
  return (
    <Suspense fallback={<div>Đang tải lịch sử...</div>}>
      <div className="relative mx-auto flex w-full max-w-xl flex-1 flex-col">

            <TicketHistory />
      </div>
    </Suspense>
  );
}
