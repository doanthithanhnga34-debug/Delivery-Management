import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { OrderTicket } from "@/types/ticket.types";
import { formatDateTime } from "@/utils/formatter";
import { X } from "lucide-react";
import React from "react";

interface TicketDetailProps {
  ticket: OrderTicket | null;
  isOpen: boolean;
  onClose: () => void;
}

const SNAP_POINTS = [0.75, 0.95];
export const TicketDetailModal: React.FC<TicketDetailProps> = ({
  ticket,
  isOpen,
  onClose,
}) => {
  if (!ticket) return null;
  const isBusStation = ticket.deliveryMethod === "bus_station";
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <div className="text-[10px] flex gap-2">
              <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-lg">
                {ticket.code}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {formatDateTime(ticket.createdAt)}
              </span>
            </div>
          </DialogTitle>
          <DialogDescription>Tin nhắn</DialogDescription>
        </DialogHeader>
        <div className="-mx-4 no-scrollbar max-h-[50vh]  overflow-y-auto px-4">
          <p className="mb-4 bg-blue-50 leading-normal p-3 rounded-sm">{ticket.rawMessage}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

//  return (
//     <Drawer
//       open={isOpen}
//       onOpenChange={(open) => {
//         if (!open) {
//           onClose();
//         }
//       }}
//       // snapPoints={SNAP_POINTS}
//       showSwipeHandle
//     >
//      <DrawerContent className="max-h-[95dvh]">
//         <DrawerHeader>
//           <DrawerTitle className="flex justify-between items-center">
//             <div className="text-[10px] flex gap-2">
//               <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-lg">
//                 {ticket.code}
//               </span>
//               <span className="text-xs text-zinc-500 dark:text-zinc-400">
//                 {formatDateTime(ticket.createdAt)}
//               </span>
//             </div>
//             <div>
//               <DrawerClose
//                 render={
//                   <Button>
//                     <X />
//                   </Button>
//                 }
//               />
//             </div>
//           </DrawerTitle>
//         </DrawerHeader>
//         <div className="flex-1 p-4">
//            <span>Tin nhắn</span>
//           <div className="rounded-2xl mt-2 p-4 bg-blue-50 group-data-[swipe-axis=x]/drawer-popup:size-full  group-data-[swipe-axis=y]/drawer-popup:w-full">
//           <div>
//            {ticket.rawMessage}

//           </div>

//           </div>
//         </div>
//       </DrawerContent>
//     </Drawer>
//   );
