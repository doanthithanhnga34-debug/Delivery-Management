import { resolveShippingDestination } from "@/server/modules/shipping/shippingDestination";


const samples = [
  {
    name: "Giao trực tiếp",
    content: "319 Tôn Đản, Q4 ship 35",
  },
  {
    name: "Nhà xe có địa chỉ",
    content:
      "Gửi xe Thanh Khuê A75/68 Bạch Đằng, P2, Tân Bình ship 35",
  },
  {
    name: "Nhà xe thiếu địa chỉ",
    content:
      "Giao 415 Quốc lộ 13, Lộc Ninh, Bình Phước. Nhà xe Huy Hiếu",
  },
  {
    name: "Không có địa chỉ",
    content: "HTL ship 20",
  },
];

for (const sample of samples) {
  console.log(`\n${sample.name}`);
  console.dir(resolveShippingDestination(sample.content), {
    depth: null,
  });
}