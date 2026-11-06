"use client";
import { OrderTicket, Ticket, TicketHistoryProps } from "@/types/ticket.types";
import { Calendar, DollarSign, ImageIcon, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { DatePickerInput } from "./filter/dateInputPicker";

import { format } from "date-fns";
import { getTicketDateKey } from "@/utils/date";
import { DateFilterType, TicketList } from "./ticketList";
import { formatCurrency } from "@/utils/formatter";
import { TicketCard } from "./ticketCard";
import { TicketDetailModal } from "./ticketDetailModal";

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
    content:
      "số điện thoại: 0981981295.Người nhận: Nguyễn Thành Đồng đường số 1, KĐT Mỹ Gia, Xã Vĩnh Thái, TP Nha Trang, T.Khánh Hòa 10 Bột Chiên Bánh Xèo Beksul (Pajeon) 1kg - 600 1 thùng 10 gói Miến khoai lang Chackhan Nongwoo 1kg-680 ck 1.280.000 ship 20   Xe Phúc An 258 lê hồng phong Q5  Tên đơn vị: CÔNG TY TNHH THƯƠNG MẠI TD FOODS Mã số thuế: 4202060295 Địa chỉ: 404/17/37B Lê Hồng Phong, Phường Nam Nha Trang, Tỉnh Khánh Hòa, Việt Nam email: tdfoods9595@gmail.com",
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
const filterOptions: {
  value: DateFilterType;
  label: string;
}[] = [
  { value: "today", label: "Hôm nay" },
  { value: "yesterday", label: "Hôm qua" },
  { value: "last7days", label: "7 ngày" },
  { value: "custom", label: "Chọn ngày" },
];

const mockTickets: OrderTicket[] = [
  {
    id: "1",
    code: "SHIP-1234",
    shipperName: "Huy",
    customerName: "Nguyễn Văn A",
    customerPhone: "0901234567",
    deliveryAddress: "319 Tôn Đản, Quận 4, TP.HCM",
    deliveryMethod: "bus_station",
    packageContent: "10 Bánh gạo Tèobokki",
    shippingFee: 20000,
    busStation: 0,
    codAmount: "thu khách 450.000",
    otherFee: 25000,
    createdAt: "2026-11-06T08:30:00.000Z",
    invoiceInfo: {
      hasInvoice: true,
      companyName: "Công ty TNHH",
      taxCode: "0999999",
      address: "Tôn Đản",
    },
    busStationInfo: {
      name: "Nhà xe Minh Huy",
      stationAddress: "Địa chỉ nhà xe Minh Huy",
    },
    rawMessage: "Nội dung tin nhắn gốc...",
  },
  {
    id: "2",
    code: "SHIP-122123",
    shipperName: "Huy",
    customerName: "Thanh Hương",
    customerPhone: "0909894497",
    deliveryAddress: "69 Hàm Nghi, phường Nguyễn Thái Bình, Q1",
    deliveryMethod: "direct", // Sửa "delivery" thành "direct"
    packageContent: "10 Nước cốt lẩu nấm, 10 Sốt chấm lẩu",
    shippingFee: 20000,
    busStation: 0,
    codAmount: "thu khách 1.180",
    otherFee: 25000,
    createdAt: "2026-11-06T08:30:00.000Z",
    invoiceInfo: {
      hasInvoice: true,
      companyName: "HỘ KINH DOANH PHƯƠNG HÀ III",
      taxCode: "079204034700",
      address: "69-71 Hàm Nghi, Phường Sài Gòn, TP.HCM",
    },
    rawMessage:
      "THỨ 5 GIAO TRƯỚC 10H CHUYỂN XBG Chị Mai: kios số 14 đường lê lai chợ Hóc Môn 0704477930 80kg gạo đỏ -3.600 20kg sốt trong-720 10 bịch sốt 500g -230 10kg bgpm 2 - 900 thu khách 5.450.000 2 chuyến ship 120",
  },
  {
    id: "3",
    code: "SHIP-122123",
    shipperName: "Huy",
    customerName: "Thanh Hương",
    customerPhone: "0909894497",
    deliveryAddress: "69 Hàm Nghi, phường Nguyễn Thái Bình, Q1",
    deliveryMethod: "direct", // Sửa "delivery" thành "direct"
    packageContent: "10 Nước cốt lẩu nấm, 10 Sốt chấm lẩu",
    shippingFee: 20000,
    busStation: 0,
    codAmount: "thu khách 1.180",
    otherFee: 25000,
    createdAt: "2026-11-06T08:30:00.000Z",
    invoiceInfo: {
      hasInvoice: true,
      companyName: "HỘ KINH DOANH PHƯƠNG HÀ III",
      taxCode: "079204034700",
      address: "69-71 Hàm Nghi, Phường Sài Gòn, TP.HCM",
    },
    rawMessage:
      "MANG HÀNG SHOPEE RA BƯU CỤC   GHN  Đ/C : 16A lê hồng phong  2 chuyến  SHIP 40",
  },
  {
    id: "4",
    code: "SHIP-122123",
    shipperName: "Huy",
    customerName: "Thanh Hương",
    customerPhone: "0909894497",
    deliveryAddress: "69 Hàm Nghi, phường Nguyễn Thái Bình, Q1",
    deliveryMethod: "direct", // Sửa "delivery" thành "direct"
    packageContent: "10 Nước cốt lẩu nấm, 10 Sốt chấm lẩu",
    shippingFee: 20000,
    busStation: 0,
    codAmount: "thu khách 1.180",
    otherFee: 25000,
    createdAt: "2026-11-06T08:30:00.000Z",
    invoiceInfo: {
      hasInvoice: true,
      companyName: "HỘ KINH DOANH PHƯƠNG HÀ III",
      taxCode: "079204034700",
      address: "69-71 Hàm Nghi, Phường Sài Gòn, TP.HCM",
    },
    rawMessage:
      "Nhi Nha Trang ■0905906212 -10kg bg thỏi - 480 ship 20 ck 500 XE PHƯƠNG NAM ( bỏ bill vô thùng hàng cho khách KO dán bill lên thùng làm mất chữ trên bill )",
  },
  {
    id: "5",
    code: "SHIP-122123",
    shipperName: "Huy",
    customerName: "Thanh Hương",
    customerPhone: "0909894497",
    deliveryAddress: "69 Hàm Nghi, phường Nguyễn Thái Bình, Q1",
    deliveryMethod: "direct", // Sửa "delivery" thành "direct"
    packageContent: "10 Nước cốt lẩu nấm, 10 Sốt chấm lẩu",
    shippingFee: 20000,
    busStation: 0,
    codAmount: "thu khách 1.180",
    otherFee: 25000,
    createdAt: "2026-11-06T08:30:00.000Z",
    invoiceInfo: {
      hasInvoice: true,
      companyName: "HỘ KINH DOANH PHƯƠNG HÀ III",
      taxCode: "079204034700",
      address: "69-71 Hàm Nghi, Phường Sài Gòn, TP.HCM",
    },
    rawMessage:
      "69 hàm nghi phường Nguyễn thái bình q1 Thanh Hương 0909894497 - 10 Nước cốt lẩu nấm Haidilao 150g- 480 -10 Sốt chấm lẩu đậu phộng vị mala Haidilao 120g- 350 -10 Sốt chấm lẩu đậu phộng cay Haidilao 120g-350 thu khách 1.180 ship 20 ---- Tên đơn vị: HỘ KINH DOANH PHƯƠNG HÀ III CCCD: 079204034700 Địa chỉ:69-71 Hàm nghi, Phường Sài Gòn , Thành phố Hồ Chí Minh, Việt Nam    Người đại diện: Ông Nguyễn Phúc Thiện   Chức vụ: Chủ Cửa Hàng Mail: invoicehkdphuongha3@gmail.com",
  },
];
export function TicketHistory({
  tickets = initialTickets,
  onCreateTicket,
  onCreateReport,
}: TicketHistoryProps) {
  const [activeTab, setActiveTab] = useState<"create" | "history">("history");

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [dateFilter, setDateFilter] = useState<DateFilterType>("today");

  const todayTickets = useMemo(() => {
    const dateKey = format(selectedDate, "yyyy-MM-dd");

    return tickets
      .filter((ticket) => {
        return getTicketDateKey(ticket.createdAt) === dateKey;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [tickets, selectedDate]);

  const totalShipEarnings = useMemo(() => {
    return todayTickets.reduce((sum, o) => sum + (o.shippingFee || 0), 0);
  }, [todayTickets]);

  const totalCodAmount = useMemo(() => {
    return todayTickets.reduce((sum, o) => sum + (o.shippingFee || 0), 0);
  }, [todayTickets]);

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
          <span className="text-[11px]">{tickets.length} phiếu</span>
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
                Tiền COD:
              </span>
            </div>
            <span className="font-mono font-bold text-xs text-blue-700 dark:text-blue-400">
              {formatCurrency(totalCodAmount)}
            </span>
          </div>
        </div>

        {/* Ticket Feed */}  
      </div>
       <TicketList tickets={mockTickets} />
    </div>
  );
}

{
  /* <main className="mx-auto w-full max-w-md flex-1 space-y-6 px-4 pb-28 pt-8">

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
      /> */
}
