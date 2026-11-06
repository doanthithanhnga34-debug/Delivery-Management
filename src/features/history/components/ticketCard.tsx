import { OrderTicket } from "@/types/ticket.types";
import { formatCurrency, formatDateTime } from "@/utils/formatter";
import { Bus, ChevronRight, MapPin, Package, Receipt } from "lucide-react";

interface TicketCardProps {
  ticket: OrderTicket;
  onOpenDetail: (ticket: OrderTicket) => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  onOpenDetail,
}) => {
  const isBusStation = ticket.deliveryMethod === "bus_station";

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
      className="rounded-2xl bg-white border border-zinc-200/70  shadow-sm overflow-hidden transition-all hover:border-zinc-300 "
    >
      <div className="p-3.5 pb-2.5 cursor-pointer flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-lg">
            {ticket.code}
          </span>
          {isBusStation && (
            <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Bus className="w-3 h-3" />
              <span>Gửi nhà xe</span>
            </span>
          )}
          {ticket.invoiceInfo?.hasInvoice && (
            <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/60 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <Receipt className="w-3 h-3" />
              <span>VAT</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-zinc-400 text-xs">
          <span className="text-[11px] text-zinc-500">
            {formatDateTime(ticket.createdAt)}
          </span>
          <ChevronRight className="w-4 h-4 ml-0.5" />
        </div>
      </div>

      <div className="p-3.5 space-y-2 cursor-pointer">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              {ticket.customerName}
            </h4>
          </div>

          <div className="text-right">
            <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(ticket.shippingFee)}{" "}
              <span className="text-[10px] font-sans font-normal text-zinc-500">
                ship
              </span>
            </div>
            {ticket.otherFee && ticket.otherFee > 0 ? (
              <div className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-semibold">
                +{formatCurrency(ticket.otherFee)}{" "}
                <span className="text-[9px] font-sans font-normal text-zinc-500">
                  xe
                </span>
              </div>
            ) : null}
            {ticket.codAmount && (
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">
                  {ticket.codAmount}
                </span>
              </div>
            )}
          </div>
        </div>

        {isBusStation && ticket.busStationInfo && (
          <div className="p-2 rounded-lg border border-amber-400 bg-amber-50  text-xs text-amber-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Bus className="w-3.5 h-3.5 text-amber-600" />
              <span>{ticket.busStationInfo.name}</span>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
              Điểm gửi: {ticket.busStationInfo.stationAddress}
            </p>
          </div>
        )}
        {/* Delivery Address */}
        <div className="flex items-start gap-1.5 text-xs text-zinc-600 dark:text-zinc-300 pt-0.5">
          <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
          <span className="line-clamp-2 leading-relaxed">
            {ticket.deliveryAddress}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 pt-0.5">
          <Package className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span className="truncate">{ticket.packageContent}</span>
          <span className="text-zinc-300 dark:text-zinc-700">·</span>
        </div>
      </div>
    </div>
  );
};
