import { toBlob } from "html-to-image";

import { toPng } from "html-to-image";
import html2canvas from "html2canvas-pro";

const MAX_IMAGE_WIDTH = 16000;
const MAX_IMAGE_HEIGHT = 16000;
const MAX_IMAGE_PIXELS = 64_000_000;
// const MAX_IMAGE_PIXELS = 32_000_000;
const MAX_IMAGE_SIDE = 12_000;

async function waitForImages(element: HTMLElement): Promise<void> {
  const images = Array.from(element.querySelectorAll("img"));
  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    }),
  );
}
export async function createReportImage(
  element: HTMLElement,
  filename: string,
): Promise<File> {
  await document.fonts.ready;

  const width = Math.ceil(element.scrollWidth);
  const height = Math.ceil(element.scrollHeight);

  if (!width || !height) {
    throw new Error("Không tìm thấy nội dung báo cáo.");
  }

  // Tính scale dựa trên kích thước thực tế
  const scale = Math.min(
    3,
    MAX_IMAGE_SIDE / width,
    MAX_IMAGE_SIDE / height,
    Math.sqrt(MAX_IMAGE_PIXELS / (width * height)),
  );

  if (scale < 1) {
    throw new Error(
      "Báo cáo quá dài để xuất thành một ảnh trên thiết bị này.",
    );
  }

  const canvas = await html2canvas(element, {
    scale,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
    width,
    height,
    windowWidth: Math.max(1400, width),
  });

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) {
        resolve(result);
      } else {
        reject(new Error("Không thể tạo file PNG."));
      }
    }, "image/png");
  });

  // Giải phóng bộ nhớ canvas
  canvas.width = 0;
  canvas.height = 0;

  return new File(
    [blob],
    filename.endsWith(".png") ? filename : `${filename}.png`,
    { type: "image/png" },
  );
}


export async function exportReportImage(
  element: HTMLElement,
  filename: string
): Promise<void> {
  await document.fonts.ready;


  const canvas = await html2canvas(element, {
    scale: 3, 
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
    windowWidth: 1400, 
  });

  const dataUrl = canvas.toDataURL("image/png", 1.0);

  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename.endsWith(".png") ? filename : `${filename}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
