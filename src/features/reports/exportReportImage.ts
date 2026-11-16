import { toBlob } from "html-to-image";

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
  await waitForImages(element);


  await new Promise((resolve) => setTimeout(resolve, 100));

  const rect = element.getBoundingClientRect();
  const width = Math.ceil(element.scrollWidth || rect.width);
  const height = Math.ceil(element.scrollHeight || rect.height);

  if (!width || !height) {
    throw new Error("Không tìm thấy nội dung báo cáo.");
  }

 
  const totalBasePixels = width * height;
  let pixelRatio = 3;
  if (totalBasePixels * 9 > MAX_IMAGE_PIXELS) {
    pixelRatio = 2;
  }
  if (totalBasePixels * 4 > MAX_IMAGE_PIXELS) {
    pixelRatio = 1.5;
  }

  const outputWidth = Math.ceil(width * pixelRatio);
  const outputHeight = Math.ceil(height * pixelRatio);

  if (
    outputWidth > MAX_IMAGE_WIDTH ||
    outputHeight > MAX_IMAGE_HEIGHT ||
    outputHeight * outputWidth > MAX_IMAGE_PIXELS
  ) {
    throw new Error("Báo cáo quá dài để xuất thành một ảnh trên thiết bị này.");
  }

  // Xuất file PNG (lossless - không nén làm mờ chữ như JPEG)
  const blob = await toBlob(element, {
    backgroundColor: "#ffffff",
    pixelRatio,
    cacheBust: true,
    type: "image/png",
    quality: 1,
    // Khắc phục lỗi font chữ bị mảnh hoặc lệch khi scale lớn
    style: {
      transform: "scale(1)",
      transformOrigin: "top left",
    },
  });

  if (!blob) {
    throw new Error("Không thể tạo file ảnh báo cáo.");
  }

  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement("a");
    link.href = url;
    // Đảm bảo đuôi file luôn là .png để giữ chất lượng gốc không nén
    link.download = filename.endsWith(".png") ? filename : `${filename}.png`;

    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
}
