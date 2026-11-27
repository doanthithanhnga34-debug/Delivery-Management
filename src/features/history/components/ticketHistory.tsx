"use client";

import {
  Calendar,
  DollarSign,
  ImageIcon,
  Siren,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { DatePickerInput } from "./filter/dateInputPicker";

import { format, parseISO, subDays } from "date-fns";
import { getTicketDateKey } from "@/utils/date";
import { DateFilterType, TicketList } from "./ticketList";
import { formatCurrency } from "@/utils/formatter";

import { useShipperName } from "../hooks/useShipperName";
import Loading from "@/app/(shipper)/history/loading";

import { useTicketHistory } from "../hooks/useTicketHistory";
import { DailyReportExport } from "@/features/reports/components/dailyReport";
import { toBlob, toPng } from "html-to-image";
import {
  calcReportSummary,
  DailyReportTable,
} from "@/features/reports/dailyReportTable";
import { toast } from "@/components/ui/toast";
import { createReportImages } from "@/features/reports/exportReportImage";

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

  const { tickets, isLoading, error, refetch } = useTicketHistory(shipperName);

  const [selectedDate, setSelectedDate] = useState<Date>(() => parseISO(today));
  const [dateFilter, setDateFilter] = useState<DateFilterType>("today");
  const reportRef = useRef<HTMLDivElement | null>(null);

  const [reportFile, setReportFile] = useState<File | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const maxDate = parseISO(today);
  const minDate = subDays(maxDate, 6);

  console.log("[DATE_RANGE]", {
  today,
  minDate: format(minDate, "dd/MM/yyyy"),
  maxDate: format(maxDate, "dd/MM/yyyy"),
});

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
            return (
              selectedDateKey !== null &&
              selectedDateKey >= last7Days &&
              selectedDateKey <= today &&
              ticketDate === selectedDateKey
            );

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

  const PAGE_SIZE = 4;

  const pages = useMemo(() => {
    const result: (typeof filteredTickets)[] = [];
    for (let i = 0; i < filteredTickets.length; i += PAGE_SIZE) {
      result.push(filteredTickets.slice(i, i + PAGE_SIZE));
    }
    return result;
  }, [filteredTickets]);

  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [reportFiles, setReportFiles] = useState<File[]>([]);
  const [isPreparing, setIsPreparing] = useState(false);

  const reportSummary = useMemo(
    () => calcReportSummary(filteredTickets),
    [filteredTickets],
  );
  const reportKey = useMemo(
    () =>
      JSON.stringify([
        shipperName,
        today,
        format(selectedDate, "yyyy-MM-dd"),
        filteredTickets.map((t) => [
          t.id,
          t.content,
          t.shippingFee,
          t.transportFee,
          t.otherFee,
        ]),
      ]),
    [filteredTickets, shipperName, today, selectedDate],
  );

  // Giữ pages mới nhất để effect đọc mà không cần đưa vào dependency
  const pagesRef = useRef(pages);
  pagesRef.current = pages;
  useEffect(() => {
    let cancelled = false;

    // Chỉ set khi thực sự cần, tránh re-render thừa
    setReportFiles((prev) => (prev.length === 0 ? prev : []));

    const pageCount = pagesRef.current.length;
    if (pageCount === 0 || !shipperName) {
      setIsPreparing(false);
      return;
    }

    setIsPreparing(true);

    const timer = window.setTimeout(async () => {
      try {
        await document.fonts.ready;
        if (cancelled) return;

        const elements = pageRefs.current
          .slice(0, pageCount)
          .filter((el): el is HTMLDivElement => el !== null);

        const safeName = shipperName.trim().replace(/[^\p{L}\p{N}-]+/gu, "-");
        const files = await createReportImages(
          elements,
          `bao-cao-${safeName}-${today}`,
        );

        if (!cancelled) setReportFiles(files);
      } catch (e) {
        console.error("[PREPARE_REPORT_ERROR]", e);
      } finally {
        if (!cancelled) setIsPreparing(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [reportKey]);

  async function handleExportAndShare() {
    if (isExporting || isPreparing) return;

    if (reportFiles.length === 0) {
      toast.add({
        type: "warning",
        title: "Không có dữ liệu",
        description: "Không có phiếu giao hàng để xuất báo cáo.",
      });
      return;
    }

    setIsExporting(true);
    try {
      if (navigator.canShare?.({ files: reportFiles })) {
        try {
          await navigator.share({ files: reportFiles }); // tất cả ảnh, một lần
          return;
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError")
            return;
          console.warn("[SHARE_REPORT_ERROR]", error);
        }
      }
      for (const file of reportFiles) {
        const url = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
        await new Promise((r) => setTimeout(r, 400));
      }

      toast.add({
        type: "info",
        title: "Đã tạo ảnh báo cáo",
        description:
          "Không thể mở chia sẻ trực tiếp. Hãy chọn các ảnh đã tải trong Zalo để gửi.",
      });
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white px-4 pt-3">
      <div className="shrink-0 space-y-2">
        <button
          onClick={handleExportAndShare}
          disabled={isExporting || isLoading || !shipperName}
          className="flex justify-between items-center rounded-lg gap-2 w-full p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25"
        >
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

        <div className="absolute -left-[99999px] top-0">
          {pages.map((pageTickets, i) => (
            <div
              key={i}
              ref={(el) => {
                pageRefs.current[i] = el;
              }}
            >
              <DailyReportTable
                tickets={pageTickets}
                shipperName={shipperName}
                reportDate={format(selectedDate, "dd/MM/yyyy")}
                pageIndex={i + 1}
                totalPages={pages.length}
                startIndex={i * PAGE_SIZE}
                summary={reportSummary}
              />
            </div>
          ))}
        </div>

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
              minDate={minDate}
              maxDate={maxDate}
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
        <div className="flex min-h-0 flex-1 items-center justify-center text-center text-sm text-zinc-500">
          Vui lòng nhập tên shipper tại trang Tạo phiếu
        </div>
      ) : error && tickets.length === 0 ? (
        <div className="flex min-h-0 flex-1 items-center justify-center text-red-600">
          {error}
        </div>
      ) : isLoading && tickets.length === 0 ? (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <Loading />
        </div>
      ) : (
        <TicketList
          tickets={filteredTickets}
          onRefresh={refetch}
          emptyMessage={
            dateFilter === "today"
              ? "Hôm nay không có phiếu nào!"
              : dateFilter === "yesterday"
                ? "Hôm qua không có phiếu nào!"
                : "Không có phiếu trong khoảng thời gian này!"
          }
        />
      )}
    </div>
  );
}
