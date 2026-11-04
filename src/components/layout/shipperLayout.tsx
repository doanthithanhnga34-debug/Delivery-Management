import type { ReactNode } from "react";
import { Truck } from "lucide-react";
import { BottomNav } from "./bottomNav";
import { Header } from "./header";

export function ShipperLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-[#FFF5F6]">
       <main className="relative z-10 mx-auto -mt-20 flex w-full max-w-lg flex-1 flex-col">
        {children}
      </main>
    <BottomNav/>
    </div>
  );
}
