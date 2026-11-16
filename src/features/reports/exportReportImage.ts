import { toBlob } from "html-to-image";

import { toPng } from "html-to-image";


const MAX_IMAGE_WIDTH = 16000;
const MAX_IMAGE_HEIGHT = 16000;
const MAX_IMAGE_PIXELS = 64_000_000; 


async function waitForImages(element: HTMLElement): Promise<void> {
  const images = Array.from(element.querySelectorAll("img"));
  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve(); 
      });
    })
  );
}

export async function exportReportImage(
  element: HTMLElement,
  filename: string
): Promise<void> {
  await document.fonts.ready;

  // 1. Tạo một bản sao ẩn ngoài màn hình với chiều rộng chuẩn Desktop (1400px)
  // Giúp bảng không bao giờ bị co chữ hay bóp cột khi xuất trên điện thoại/màn nhỏ
  const clone = element.cloneNode(true) as HTMLElement;
  const container = document.createElement("div");

  Object.assign(container.style, {
    position: "fixed",
    left: "-9999px",
    top: "0",
    width: "1400px", // Ép chiều rộng cố định 1400px để cột và chữ luôn thoáng, to rõ
    backgroundColor: "#ffffff",
    zIndex: "-1",
  });

  // 2. Tăng độ sắc nét cho font chữ bên trong bản sao
  Object.assign(clone.style, {
    width: "1400px",
    maxWidth: "1400px",
    padding: "32px",
    backgroundColor: "#ffffff",
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
    textRendering: "geometricPrecision",
  });

  // Ép cỡ chữ tối thiểu trong bảng lên 15px - 16px để khi gửi Zalo không bị vỡ chữ
  clone.querySelectorAll("td, th").forEach((cell) => {
    const htmlCell = cell as HTMLElement;
    htmlCell.style.fontSize = "15px";
    htmlCell.style.lineHeight = "1.5";
    htmlCell.style.color = "#111827"; // Đen đậm thay vì xám nhạt giúp tương phản nét hơn
  });

  container.appendChild(clone);
  document.body.appendChild(container);

  try {
    // Chờ trình duyệt render xong bản sao
    await new Promise((resolve) => setTimeout(resolve, 100));

    // 3. Xuất PNG với pixelRatio = 3 (Tạo ra ảnh rộng tới 4200px - chuẩn 4K siêu nét)
    const dataUrl = await toPng(clone, {
      backgroundColor: "#ffffff",
      pixelRatio: 3,
      cacheBust: true,
      width: 1400,
      height: clone.scrollHeight,
    });

    // 4. Tải file về máy
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename.endsWith(".png") ? filename : `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    // Dọn dẹp bản sao khỏi DOM
    document.body.removeChild(container);
  }
}

