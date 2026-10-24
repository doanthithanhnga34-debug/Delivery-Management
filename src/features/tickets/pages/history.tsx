import { Order } from "@/types/order.types";
import { ChevronDown, FileText, Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

export function ShipperHistory({ orders }: { orders: Order[] }) {
  const [showReport, setShowReport] = useState(false);
  return (
    <>
      <section className="panel orders-panel history-view">
        <div className="panel-heading">
          <div>
            <h2>Lịch sử phiếu của tôi</h2>
            <p>Theo dõi trạng thái các đơn hàng đã tạo</p>
          </div>
          <button
            className="outline-button"
            onClick={() => setShowReport(true)}
          >
            <FileText /> Báo cáo cuối ngày
          </button>
        </div>
        <div className="filter-row">
          <div className="search-box">
            <Search />
            <input placeholder="Tìm mã phiếu, người nhận..." />
          </div>
          <button className="filter-button">
            <SlidersHorizontal /> Bộ lọc <ChevronDown />
          </button>
        </div>
      </section>
      {showReport}
    </>
  );
}
