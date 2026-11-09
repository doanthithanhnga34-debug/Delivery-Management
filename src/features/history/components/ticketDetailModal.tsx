import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { AnalyzedTicket } from "@/types/ticket.types";
import { formatDateTime } from "@/utils/formatter";
import React from "react";

interface TicketDetailProps {
  ticket: AnalyzedTicket | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TicketDetailModal: React.FC<TicketDetailProps> = ({
  ticket,
  isOpen,
  onClose,
}) => {
  if (!ticket) return null;
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
                {ticket.id}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {formatDateTime(ticket.createdAt)}
              </span>
            </div>
          </DialogTitle>
          <DialogDescription>Tin nhắn</DialogDescription>
        </DialogHeader>
        <div className="-mx-4 no-scrollbar max-h-[50vh]  overflow-y-auto px-4">
          <p className="mb-4 bg-blue-50 leading-normal p-3 rounded-sm">
            {ticket.content}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
