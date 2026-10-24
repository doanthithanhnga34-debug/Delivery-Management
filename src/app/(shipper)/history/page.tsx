

import { Suspense } from "react";
import { TicketHistory } from "@/features/history/ticketHistory";

export default function HistoryPage() {
  return (
    <Suspense fallback={<div>Đang tải lịch sử...</div>}>
      <TicketHistory />
    </Suspense>
  );
}