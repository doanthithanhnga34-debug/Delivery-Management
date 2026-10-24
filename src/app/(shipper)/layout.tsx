import type { ReactNode } from "react";
import { ShipperLayout } from "@/components/layout/shipperLayout";

export default function Layout({
  children,
}: {
  children: ReactNode;
}) {
  return <ShipperLayout>{children}</ShipperLayout>;
}