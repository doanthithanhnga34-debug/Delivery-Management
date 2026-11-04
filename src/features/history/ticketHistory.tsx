"use client";
import { Ticket, TicketHistoryProps } from "@/types/ticket.types";
import { ClipboardList, History, ImageIcon, PlusCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { TicketCard } from "../tickets/components/ticketCard";
import { Button } from "@/components/ui/button";
import { DatePicker } from "./date";
import { TicketDetailDrawer } from "../tickets/components/ticketDetail";
import { format } from "date-fns";
import { getTicketDateKey } from "@/utils/date";

const initialTickets: Ticket[] = [
  {
    id: "1",
    shipperName: "Huy",
    content:
      "219A phạm viết chánh quận 1  090 9867441 3 Gạo Japonica Tèobokki 5kg-384 ship 20 thu khách 404",
    shipperId: "1",
    shippingFee: 20,
    codAmount: "404",
    otherFee: 0,
    transportFee: 0,
    createdAt: "2026-10-23T17:19:28.000Z",
  },
  {
    id: "2",
    shipperName: "Huy",
    content: "số điện thoại: 0981981295.Người nhận: Nguyễn Thành Đồng đường số 1, KĐT Mỹ Gia, Xã Vĩnh Thái, TP Nha Trang, T.Khánh Hòa 10 Bột Chiên Bánh Xèo Beksul (Pajeon) 1kg - 600 1 thùng 10 gói Miến khoai lang Chackhan Nongwoo 1kg-680 ck 1.280.000 ship 20   Xe Phúc An 258 lê hồng phong Q5  Tên đơn vị: CÔNG TY TNHH THƯƠNG MẠI TD FOODS Mã số thuế: 4202060295 Địa chỉ: 404/17/37B Lê Hồng Phong, Phường Nam Nha Trang, Tỉnh Khánh Hòa, Việt Nam email: tdfoods9595@gmail.com",
    shipperId: "1",
    shippingFee: 20,
    codAmount: "404",
    otherFee: 0,
    transportFee: 0,
    createdAt: "2026-10-23T17:19:28.000Z",
  },
  {
    id: "3",
    shipperName: "Huy",
    content:
      "3h giao mới có người nhận #33397 Khang Vĩ Seawoo bongbong 42 đường số 22 KDC Mỹ Viên phường Tân Mỹ Hồ Chí Minh Vietnam +84 877 070 022 2 sốt Mayonnaise Ottogi 3kg -620 ship 40 thu khách 660  - Tên doanh nghiệp: CÔNG TY TNHH JL GLOBAL - Mã số thuế: 0318709648 - Địa chỉ trụ sở chính: 92-94-96 Phan Khiêm Ích, Khu Phố Hưng Gia 2, Phường Tân Hưng, Thành Phố Hồ Chí Minh, Việt Nam - Email: jlglobalvn@gmail.com",
    shipperId: "1",
    shippingFee: 20,
    codAmount: "404",
    otherFee: 0,
    transportFee: 0,
    createdAt: "2026-10-23T17:19:28.000Z",
  },
];

export function TicketHistory({
  tickets = initialTickets,
  onCreateTicket,
  onCreateReport,
}: TicketHistoryProps) {
  const [activeTab, setActiveTab] = useState<"create" | "history">("history");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

const todayTickets = useMemo(() => {
  const dateKey = format(selectedDate, "yyyy-MM-dd");

  return tickets
    .filter((ticket) => {
      return getTicketDateKey(ticket.createdAt) === dateKey;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    );
}, [tickets, selectedDate]);
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <main className="mx-auto w-full max-w-md flex-1 space-y-6 px-4 pb-28 pt-8">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-[#19342B]">
            Lịch sử phiếu
          </h1>

          <p className="text-xs text-slate-400">
            Tất cả phiếu bạn đã tạo, ngay tại đây.
          </p>
        </header>

        <section className="space-y-3">
          <div className="flex items-center justify-between mb-5">
            <DatePicker
              value={selectedDate}
              onChange={(date) => {
                if (date) setSelectedDate(date);
              }}
            ></DatePicker>

            <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-medium text-white">
              {todayTickets.length} phiếu
            </span>
          </div>
          {todayTickets.length > 0 ? (
            <div className="space-y-2.5">
              {todayTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedTicket(ticket)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedTicket(ticket);
                    }
                  }}
                  className="cursor-pointer rounded-2xl transition-transform active:scale-[0.98]"
                >
                  <TicketCard ticket={ticket} />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-col items-center rounded-2xl border bg-white px-5 py-12 text-center shadow-sm">
                <ClipboardList size={40} className="mb-3 text-gray-400" />

                <h3 className="font-semibold">Chưa có dữ liệu phiếu</h3>

                <p className="mt-2 text-sm text-gray-500">
                  Ngày {format(selectedDate, "dd-MM-yyyy")} không có phiếu nào
                </p>
              </div>
            </div>
          )}
        </section>

        <section className="space-y-2">
          <Button
            type="button"
            className="h-12 w-full rounded-xl bg-primary text-white hover:bg-[#116D47]"
            disabled={todayTickets.length === 0}
            onClick={() => onCreateReport?.(todayTickets)}
          >
            <ImageIcon className="mr-2 size-4" />
            Tạo ảnh báo cáo cuối ngày
          </Button>

          <p className="text-center text-[11px] text-slate-400">
            Tổng hợp {todayTickets.length} phiếu hôm nay thành một ảnh.
          </p>
        </section>
      </main>

      <TicketDetailDrawer
        ticket={selectedTicket}
        open={selectedTicket !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedTicket(null);
        }}
      />
    </div>
  );
}
