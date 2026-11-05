"use client"
import { CloudShader } from "@/components/ui/cloud-shader";
import { TicketForm } from "@/features/tickets/components/ticketForm";

export default function CreatePage() {
   return (
    <div className="flex min-h-0 w-full flex-1 flex-col">
         {/* <CloudShader className="absolute inset-0" /> */}
      <div className="flex min-h-0 flex-1 flex-col rounded-t-[28px] bg-[#F0F9FF]">
        <div className="mt-3 flex shrink-0 items-center justify-between px-4 pb-2">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">
            Tạo phiếu giao
          </h1>

          <span className="rounded-full border  px-2.5 py-1 font-mono text-[11px] font-bold text-primary">
            #1234s
          </span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4">
          <TicketForm />
        </div>
      </div>
    </div>
  );
}

//   <div className="relative mx-auto flex w-full max-w-xl flex-1 flex-col">
//       <div className="flex flex-1 flex-col rounded-4xl border border-slate-100 bg-[#FFF5F6] shadow-xl">
//         <div className="flex flex-1 flex-col p-4 md:p-6 ">
//           <TicketForm />
//         </div>
//       </div>
//     </div>
