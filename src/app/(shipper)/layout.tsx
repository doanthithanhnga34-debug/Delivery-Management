import type { ReactNode } from "react";
import { ShipperLayout } from "@/components/layout/shipperLayout";
import { ZaloBrowserGuard } from "@/components/browser/ZaloBrowserGuard";


export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ZaloBrowserGuard>
      <ShipperLayout>{children}</ShipperLayout>
    </ZaloBrowserGuard>
  );
}
