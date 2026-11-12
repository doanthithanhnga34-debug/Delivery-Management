"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    label: "Tạo phiếu",
    href: "/",
  },
  {
    label: "Lịch sử phiếu",
    href: "/history",
  },
];

export function BottomNav() {
  const pathname = usePathname();

  const activeIndex = navItems.findIndex(
    (item) =>
      pathname === item.href ||
      (item.href !== "/" && pathname.startsWith(`${item.href}/`)),
  );

  return (
    <nav
      className="
        relative z-50 w-full shrink-0
        border-t border-slate-200
        bg-white px-2 pt-2
        pb-[calc(8px+env(safe-area-inset-bottom))]
        shadow-[0_-4px_16px_rgba(0,0,0,0.08)]
      "
    >
      <div className="bottom-nav mx-auto max-w-lg">
        <div
          className="bottom-nav__slider"
          style={{
            width: `calc((100% - 8px) / ${navItems.length})`,
            transform: `translateX(${Math.max(activeIndex, 0) * 100}%)`,
          }}
        />

        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" &&
              pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
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