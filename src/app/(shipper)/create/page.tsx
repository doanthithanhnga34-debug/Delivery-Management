import { TicketForm } from "@/features/tickets/components/ticketForm";

export default function CreatePage() {
  return (
    <div className="relative max-w-xl mx-auto ">
    
      <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
      
        <div className="h-2 w-full bg-gradient-to-r from-red-600 via-rose-500 to-red-500"></div>
        
        <div className="p-6 md:p-8">
          <TicketForm />
        </div>
      </div>
    </div>
  );
}
