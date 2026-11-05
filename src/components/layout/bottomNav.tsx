"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FilePlus2, History } from "lucide-react";

const navItems = [
  {
    label: "Tạo phiếu",
    href: "/create",
    icon: FilePlus2,
  },
  {
    label: "Lịch sử phiếu",
    href: "/history",
    icon: History,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  const activeIndex = navItems.findIndex(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  return (
    <nav
  className="
    relative z-20 mx-auto w-full max-w-lg shrink-0
    bg-white
    px-3 pt-2
    pb-[calc(env(safe-area-inset-bottom,0px)+8px)]
  "
>
      <div className="bottom-nav">
        <div
          className="bottom-nav__slider"
          style={{
            width: `calc((100% - 8px) / ${navItems.length})`,
            transform: `translateX(${Math.max(activeIndex, 0) * 100}%)`,
          }}
        />

        {navItems.map((item, index) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`bottom-nav__item ${
                isActive ? "bottom-nav__item--active" : ""
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
