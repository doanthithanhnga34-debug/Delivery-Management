import type { ReactNode } from "react";
import { BottomNav } from "./bottomNav";
import { Header } from "./header";

interface ShipperLayoutProps {
  children: ReactNode;
}
export function ShipperLayout({ children }: ShipperLayoutProps) {
  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-white">
      <div className="shrink-0">
        <Header />
      </div>

      <main
        className="
          relative z-10 mx-auto -mt-5
          flex min-h-0 w-full max-w-lg flex-1 flex-col
          overflow-hidden rounded-t-[28px] bg-white
        "
      >
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
