import { Suspense } from "react";
import { TicketHistory } from "@/features/history/ticketHistory";

export default function HistoryPage() {
  return (
    <Suspense fallback={<div>Đang tải lịch sử...</div>}>
      <div className="relative mx-auto flex w-full max-w-xl flex-1 flex-col">
        <div className="flex flex-1 flex-col rounded-2xl border border-slate-100 bg-[#FFF5F6] shadow-xl">
          <div className="flex flex-1 flex-col p-4 md:p-6 ">
            <TicketHistory />
          </div>
        </div>
      </div>
    </Suspense>
  );
}
