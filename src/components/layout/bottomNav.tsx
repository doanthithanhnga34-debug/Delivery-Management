"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FilePlus2, History } from "lucide-react";

const navigation = [
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
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const isEditable = (element: Element | null) =>
      element instanceof HTMLElement &&
      (element.matches("input, textarea, select") ||
        element.isContentEditable);

    const updateFocus = () => {
      // const isMobile = window.matchMedia("(pointer: coarse)").matches;
      const isMobile = window.matchMedia("(max-width: 768px)").matches;

      setIsTyping(isMobile && isEditable(document.activeElement));
    };

    const handleFocusOut = () => {
      // Chạy sau khi trình duyệt cập nhật phần tử đang focus.
      requestAnimationFrame(updateFocus);
    };

    document.addEventListener("focusin", updateFocus);
    document.addEventListener("focusout", handleFocusOut);

    updateFocus();

    return () => {
      document.removeEventListener("focusin", updateFocus);
      document.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  if (isTyping) {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-lg">
        {navigation.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-1 flex-col items-center gap-1 px-3 py-3 text-xs transition-colors ${
                active
                  ? "font-semibold text-red-600"
                  : "text-gray-500"
              }`}
            >
              <Icon size={22} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}