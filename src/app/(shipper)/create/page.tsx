import { TicketForm } from "@/features/tickets/components/ticketForm";

export default function CreatePage() {
  return (
    <div className="relative mx-auto flex w-full max-w-xl flex-1 flex-col">
      <div className="flex flex-1 flex-col rounded-4xl border border-slate-100 bg-[#FFF5F6] shadow-xl">
        <div className="flex flex-1 flex-col p-4 md:p-6 ">
          <TicketForm />
        </div>
      </div>
    </div>
  );
}