"use client";

import { TypingAnimation } from "../ui/typing-animation";
import { CloudShader } from "../ui/cloud-shader";
import { Cloudy, CloudyIcon, Moon, Sun, Truck } from "lucide-react";
import { useState } from "react";

const navItems = [
  {
    label: "Tạo phiếu",
    href: "/create",
  },
  {
    label: "Lịch sử phiếu",
    href: "/history",
  },
];
export function Header() {
  const [isDarkMode, setIsDarkMode] = useState(Boolean);

  return (
 <header
  className="
    relative z-0 w-full shrink-0
    bg-(--color-bg)
    pt-[calc(env(safe-area-inset-top,0px)+8px)]
    pb-8
  "
>
          {/* <CloudShader className="absolute inset-0" /> */}
      <div className="mx-auto flex max-w-lg items-center justify-between gap-2 px-5 py-2 z-100">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
            <Truck className="size-5 text-primary" />
          </div>

          <div>
            <TypingAnimation className="text-base tracking-widest font-caveat  tracking-tight text-white">
              Teokbokki
            </TypingAnimation>

            <p className="text-[11px] leading-none text-white/80">
              Sổ phiếu & Phí ship
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label="Thời tiết"
          className="flex size-9 items-center justify-center rounded-xl text-white"
        >
          <CloudyIcon className="size-5" />
        </button>
      </div>
    </header>
  );
}
