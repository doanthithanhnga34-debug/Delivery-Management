import { toBlob } from "html-to-image";

const MAX_IMAGE_WIDTH = 12000;
const MAX_IMAGE_HEIGHT = 12000;
const MAX_IMAGE_PIXELS = 32_000_000;

export async function exportReportImage(element:HTMLElement, filename:string):Promise<void>{
await document.fonts.ready;
const width = Math.ceil(element.scrollWidth);
const height = Math.ceil(element.scrollHeight);
 if (!width || !height) {
    throw new Error("Không tìm thấy nội dung báo cáo.");
  }
const pixelRatio = 2;
// const pixelRatio = height <=5000 ? 2:height<=9000 ? 1.5:1;
const outputWidth = Math.ceil(width * pixelRatio);
 const outputHeight = Math.ceil(height * pixelRatio);
 if(outputWidth>MAX_IMAGE_WIDTH || outputHeight > MAX_IMAGE_HEIGHT || outputHeight * outputWidth >MAX_IMAGE_PIXELS){
    throw new Error("Báo cáo quá dài để xuất thành một ảnh trên thiết bị này")
 }
 const blob = await toBlob(element, {
    backgroundColor:"#ffffff",
    pixelRatio,
    cacheBust:true,
    width,
    height
 })
 if (!blob) {
    throw new Error("Không thể tạo file ảnh báo cáo.");
  }
   const url = URL.createObjectURL(blob);
   try {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
}