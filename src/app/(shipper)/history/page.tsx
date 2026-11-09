
import { TicketHistory } from "@/features/history/components/ticketHistory";
import { connection } from "next/server";
import { Suspense } from "react";

async function HistoryContent() {
  await connection();

  const today = new Date()
    .toLocaleDateString("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

  return <TicketHistory today={today} />;
}

export default  function HistoryPage() {

  return (
    <Suspense fallback={<></>}>
      <div className="flex min-h-0 w-full flex-1 flex-col">
      <HistoryContent />
      </div>
    </Suspense>
  );
}
