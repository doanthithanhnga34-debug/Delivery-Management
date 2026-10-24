import { Order } from "@/types/order.types";

export function StatusBadge({ status }: { status: Order["status"] }) {
  return (
    <span
      className={`status status-${status === "Đã giao" ? "done" : status === "Đang giao" ? "shipping" : "pending"}`}
    >
      <i />
      {status}
    </span>
  );
}
