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
            <TypingAnimation className="text-base font-bold tracking-tight text-white">
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

// return (
//     <header className="sticky top-0 z-0 border-b bg-[var(--color-bg)]">
//       <div className="mx-auto flex flex-col items-center h-48 max-w-lg gap-3 px-4 ">
//         <h2 className="text-2xl font-bold leading-tight text-white">
//           Tạo phiếu
//         </h2>
//         <TypingAnimation className="text-white text-[10px]">
//           Hé nhô
//         </TypingAnimation>
//         <span className="text-[10px] text-white/70"></span>
//       </div>
//     </header>
//   );
//    <div className="mx-auto flex flex-col items-center justify-content h-48 max-w-lg gap-3 px-4 ">

//           <TypingAnimation className="text-xl text-white font-semibold ">Teokbokki</TypingAnimation>
//         <div className="grid grid-cols-2 gap-3 mt-2 w-full">
//           {navigation.map((item) => {
//             const isActive = pathName === item.href;
//             return (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 className={`w-full whitespace-nowrap rounded-2xl px-2 py-2 text-center ${
//                   isActive ? "header__btn-active" : "header__btn-glass"
//                 }`}
//               >
//                 {item.label}
//               </Link>
//             );
//           })}
//         </div>

//       </div>

/* <div>
          <TypingAnimation className="text-white text-[10px]">Hé nhô</TypingAnimation>
          <h2 className="text-2xl font-bold leading-tight text-white">
            Tạo phiếu
          </h2>
          <span className="text-[10px] text-white/70"></span>
        </div> */
