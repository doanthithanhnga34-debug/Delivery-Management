"use client";

import { Calendar, DollarSign, ImageIcon, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { DatePickerInput } from "./filter/dateInputPicker";

import { format, parseISO, subDays } from "date-fns";
import { getTicketDateKey } from "@/utils/date";
import { DateFilterType, TicketList } from "./ticketList";
import { formatCurrency } from "@/utils/formatter";

import { useShipperName } from "../hooks/useShipperName";
import Loading from "@/app/(shipper)/history/loading";

import { useTicketHistory } from "../hooks/useTicketHistory";

const filterOptions: {
  value: DateFilterType;
  label: string;
}[] = [
  { value: "today", label: "Hôm nay" },
  { value: "yesterday", label: "Hôm qua" },
  { value: "last7days", label: "7 ngày" },
  { value: "custom", label: "Chọn ngày" },
];

export function TicketHistory({ today }: { today: string }) {
  const shipperName = useShipperName();

  const { tickets, isLoading, error } = useTicketHistory(shipperName);

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [dateFilter, setDateFilter] = useState<DateFilterType>("today");

  const filteredTickets = useMemo(() => {
    const todayDate = parseISO(today);

    const yesterday = format(subDays(todayDate, 1), "yyyy-MM-dd");

    const last7Days = format(subDays(todayDate, 6), "yyyy-MM-dd");

    const selectedDateKey = selectedDate
      ? format(selectedDate, "yyyy-MM-dd")
      : null;

    return tickets
      .filter((ticket) => {
        const ticketDate = getTicketDateKey(ticket.createdAt);

        switch (dateFilter) {
          case "today":
            return ticketDate === today;

          case "yesterday":
            return ticketDate === yesterday;

          case "last7days":
            return ticketDate >= last7Days && ticketDate <= today;

          case "custom":
            return selectedDateKey !== null && ticketDate === selectedDateKey;

          default:
            return false;
        }
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [tickets, dateFilter, selectedDate, today]);

  const totalShipEarnings = useMemo(() => {
    return filteredTickets.reduce((sum, o) => sum + (o.shippingFee || 0), 0);
  }, [filteredTickets]);

  const totalCodAmount = useMemo(() => {
    return filteredTickets.reduce((sum, o) => sum + (o.shippingFee || 0), 0);
  }, [filteredTickets]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white px-4 pt-3">
      <div className="space-y-2">
        <button className="flex justify-between items-center rounded-lg gap-2 w-full p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25">
          <div>
            <ImageIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-[14px]">Tạo ảnh báo các cuối ngày hôm nay</div>
          </div>
          <span className="text-xs px-2.5 py-1 bg-white/20 rounded-xl">
            Xuất ảnh
          </span>
        </button>
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-1">
          <span className="font-semibold flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
            <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Lọc phiếu theo ngày:</span>
          </span>
          <span className="text-[11px]">{filteredTickets.length} phiếu</span>
        </div>
        <div className="rounded-xl bg-zinc-200/60 dark:bg-zinc-800/80 p-1 flex items-center justify-between text-xs font-medium transition-all">
          {filterOptions.map((option) => {
            const isActive = dateFilter === option.value;
            return (
              <button
                key={option.value}
                onClick={() => setDateFilter(option.value)}
                className={`flex-1 py-1.5 px-1.5 rounded-xl text-center transition-all ${
                  isActive
                    ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {dateFilter === "custom" && (
          <div className="flex items-center gap-2 p-2 bg-blue-50/70 dark:bg-blue-950/30 rounded-xl border border-blue-200/50 dark:border-blue-900/40 animate-in fade-in duration-150">
            <span className="text-[11px] text-zinc-600 dark:text-zinc-400 shrink-0">
              Chọn ngày cụ thể:
            </span>
            <DatePickerInput
              date={selectedDate}
              onDateChange={(newDate) => {
                if (!newDate) return;
                setSelectedDate(newDate);
              }}
            />
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/50 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px] text-zinc-600 dark:text-zinc-400">
                Tiền ship:
              </span>
            </div>
            <span className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400">
              +{formatCurrency(totalShipEarnings)}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/50 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] text-zinc-600 dark:text-zinc-400">
                Tiền:
              </span>
            </div>
            <span className="font-mono font-bold text-xs text-blue-700 dark:text-blue-400">
              {formatCurrency(totalCodAmount)}
            </span>
          </div>
        </div>

        {/* Ticket Feed */}
      </div>
      {!shipperName ? (
        <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-zinc-500">
          Vui lòng nhập tên shipper tại trang Tạo phiếu
        </div>
      ) : error ? (
        <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-red-600">
          {error}
        </div>
      ) : isLoading ? (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <Loading />
        </div>
      ) : (
        <TicketList tickets={filteredTickets} />
      )}
    </div>
  );
}
