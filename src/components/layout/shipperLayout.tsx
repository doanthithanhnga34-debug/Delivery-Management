import type { ReactNode } from "react";
import { BottomNav } from "./bottomNav";
import { Header } from "./header";

interface ShipperLayoutProps {
  children: ReactNode;
}
export function ShipperLayout({ children }: ShipperLayoutProps) {
  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden ">
      <Header />

      <main
        className="
          relative z-10 mx-auto -mt-5
          flex min-h-0 w-full max-w-lg flex-1 flex-col
          overflow-hidden
        "
      >
        {children}
      </main>

      <BottomNav />
    </div>
  );
}

