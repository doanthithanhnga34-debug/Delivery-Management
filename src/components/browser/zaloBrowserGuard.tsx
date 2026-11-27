import { isAndroid, isZaloBrowser, openExternalBrowser } from "@/utils/browser";
import { Copy, ExternalLink, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";



export function ZaloBrowserGuard({children}:{children:React.ReactNode}){
    const [showGuard,setShowGuard] = useState(false);
    const [android, setAndroid] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(()=>{
        const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean })
        .standalone === true;
         if (standalone) return;

          setAndroid(isAndroid());
             setShowGuard(isZaloBrowser());
    },[]);
     async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(
        window.location.href,
      );

      setCopied(true);
    } catch {
      window.prompt(
        "Sao chép đường dẫn bên dưới:",
        window.location.href,
      );
    }
  }
   if (!showGuard) return <>{children}</>;
 return (
    <div className="fixed inset-0 z-[9999] flex min-h-dvh items-center justify-center overflow-y-auto bg-background p-6">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-blue-50">
          <Globe className="size-10 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold">
            Mở bằng trình duyệt
          </h1>

          <p className="text-sm text-muted-foreground">
            Vui lòng mở ứng dụng bằng trình duyệt ngoài
            để sử dụng đầy đủ các chức năng giao hàng
            và xuất ảnh báo cáo.
          </p>
        </div>

        <div className="space-y-3">
          {android && (
            <Button
              className="h-12 w-full"
              onClick={openExternalBrowser}
            >
              <ExternalLink className="size-4" />
              Mở bằng Chrome
            </Button>
          )}

          <Button
            variant="outline"
            className="h-12 w-full"
            onClick={handleCopyLink}
          >
            <Copy className="size-4" />
            {copied ? "Đã sao chép" : "Sao chép liên kết"}
          </Button>
        </div>

        <div className="rounded-xl bg-muted p-4 text-left text-sm text-muted-foreground">
          <p className="mb-2 font-semibold">
            Hướng dẫn:
          </p>

          <p>1. Nhấn dấu ba chấm ở góc màn hình Zalo.</p>
          <p>2. Chọn mở bằng trình duyệt nếu có.</p>
          <p>3. Hoặc sao chép link và mở Chrome/Safari.</p>
        </div>

        <p className="text-xs text-muted-foreground">
          Nếu đã cài đặt Shipper App, bạn có thể mở
          trực tiếp từ màn hình chính điện thoại.
        </p>

        <button
          type="button"
          onClick={() => setShowGuard(false)}
          className="text-xs text-muted-foreground underline"
        >
          Tiếp tục sử dụng trong Zalo
        </button>
      </div>
    </div>
  );


}