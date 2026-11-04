"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TypingAnimation } from "../ui/typing-animation";

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
export function Header(tabName: string) {
  const pathname = usePathname();

  const activeIndex = navItems.findIndex(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  return (
    <header className="sticky top-0 z-0 border-b bg-[var(--color-bg)]">
      <div className="mx-auto flex flex-col justify-start h-48 max-w-lg gap-1 px-4 ">
        <TypingAnimation className="text-white text-[12px]">
          Teokbokki
        </TypingAnimation>
        <h2 className="text-2xl font-bold leading-tight text-white">
           `${tabName}`
         </h2>
        <span className=" text-[11px] text-[#ffffff]">Xin chào </span>
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
