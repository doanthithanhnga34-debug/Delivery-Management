import { Card, CardContent } from "@/components/ui/card";
import { Ticket } from "@/types/ticket.types";
import { FileText } from "lucide-react";

function parseTicketDate(value: string): Date {
  const [datePart, timePart] = value.split(" ");
  const [day, month, year] = datePart.split("/").map(Number);
  const [hour, minute, second] = timePart.split(":").map(Number);

  return new Date(year, month - 1, day, hour, minute, second);
}
const formatTime = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(parseTicketDate(value));
export function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <Card className="rounded-sm border-[#E5EBE7] bg-white shadow-none">
      <CardContent className="space-y-1.5 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
            <FileText className="size-3.5" />
          </div>

          <span className="text-xs text-slate-400">
            {formatTime(ticket.createdAt)}
          </span>
        </div>

        <p className="line-clamp-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-[#233B31]">
          {ticket.content}
        </p>
      </CardContent>
    </Card>
  );
}
