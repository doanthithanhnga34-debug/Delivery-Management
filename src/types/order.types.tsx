export type Order = {
  id: string;
  recipient: string;
  address: string;
  shipper: string;
  amount: string;
  status: "Đã giao" | "Đang giao" | "Chờ lấy hàng";
  time: string;
  origin?: string;
  shipFee?: string;
  chanhFee?: string;
  content?: string;
};