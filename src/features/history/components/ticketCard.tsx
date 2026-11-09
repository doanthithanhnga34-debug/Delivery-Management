import { AnalyzedTicket } from "@/types/ticket.types";
import { formatCurrency } from "@/utils/formatter";
import { Bus, CalendarDays, MapPin, Truck, Wallet } from "lucide-react";

interface TicketCardProps {
  ticket: AnalyzedTicket;
  onOpenDetail: (ticket: AnalyzedTicket) => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  onOpenDetail,
}) => {
  const { carrier, payment, deliveryAddress } = ticket.analysis;

  const hasCarrier = carrier.hasCarrier;
  const hasPayment = payment !== null;
  const hasDeliveryAddress = deliveryAddress !== null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetail(ticket)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenDetail(ticket);
        }
      }}
      className="rounded-2xl cursor-pointer bg-white border border-zinc-200/70  shadow-sm overflow-hidden transition-all hover:border-zinc-300 "
    >
      <article className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-blue-600">
            #{ticket.id}
          </span>

          <span className="flex items-center gap-1 text-xs text-zinc-500">
            <CalendarDays className="size-3.5" />
            {ticket.createdAt
              ? new Date(ticket.createdAt).toLocaleString("vi-VN", {
                  timeZone: "Asia/Ho_Chi_Minh",
                })
              : "Chưa có ngày"}
          </span>
        </div>

        <p className="line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-zinc-700">
          {ticket.content || "Không có nội dung phiếu"}
        </p>
        {hasDeliveryAddress && (
          <div className="flex items-start gap-2 rounded-lg  bg-blue-50 p-2.5">
            <MapPin className="mt-0.5 size-4 shrink-0 text-blue-600" />

            <div className="min-w-0 space-y-1">
              {/* <p className="text-xs font-semibold text-blue-700">
            Địa chỉ giao hàng
          </p> */}

              <p className="text-sm leading-5 text-blue-700 wrap-break-word">
                {deliveryAddress || ""}
              </p>
            </div>
          </div>
        )}

        {hasCarrier && (
          <div className="p-2 rounded-lg  bg-amber-50  text-xs text-amber-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Bus className="w-3.5 h-3.5 text-amber-600" />
              <span>{ticket.analysis.carrier.name}</span>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
              Điểm gửi: {ticket.analysis.carrier.address}
            </p>
          </div>
        )}
        {hasPayment && (
          <div className="flex items-center justify-between gap-3 rounded-lg bg-violet-50 p-2.5">
            <div className="flex items-center gap-1.5 text-xs text-violet-700">
              <Wallet className="size-4 shrink-0" />
              <span>{payment.label}</span>
            </div>

            <span className="font-mono text-sm font-semibold text-violet-800">
              {payment.amount}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Truck className="size-4" />
            Phí ship
          </div>

          <span className="font-semibold text-emerald-700">
            {formatCurrency(ticket.shippingFee ?? 0)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500">Phí chành/phí khác</span>
          <span className="font-semibold">
            {formatCurrency(ticket.otherFee)}
          </span>
        </div>
      </article>
    </div>
  );
};
