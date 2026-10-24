import type { ReactNode } from "react";
import { Truck } from "lucide-react";
import { BottomNav } from "./bottomNav";

export function ShipperLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-gray-50">
      <header className="sticky top-0 z-40 border-b bg-white">
        <div className="mx-auto flex h-16 max-w-lg items-center gap-3 px-4">
          <div className="rounded-xl bg-red-600 p-2 text-white">
            <Truck size={20} />
          </div>

          <h1 className="text-lg font-bold">
            TeokbokkiShip
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-5 pb-28">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}