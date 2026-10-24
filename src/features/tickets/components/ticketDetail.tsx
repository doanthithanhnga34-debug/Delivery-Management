"use client";

import type { Ticket } from "@/types/ticket.types";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";

import { FileText, UserRound, CalendarDays } from "lucide-react";

type TicketDetailDrawerProps = {
  ticket: Ticket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TicketDetailDrawer({
  ticket,
  open,
  onOpenChange,
}: TicketDetailDrawerProps) {
  if (!ticket) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[50vh]">
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader className="text-left">
            <DrawerTitle className="flex items-center gap-2 text-[#19342B]">
              <FileText className="size-5 text-primary" />
              Chi tiết phiếu #{ticket.id}
            </DrawerTitle>
            <DrawerDescription>Thông tin phiếu giao hàng</DrawerDescription>
          </DrawerHeader>

          <div className="max-h-[65dvh] space-y-5 overflow-y-auto px-4 py-3">
            <div className="space-y-3 rounded-xl border bg-white p-4">
              <div className="flex items-center gap-3">
                <UserRound className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Tên shipper</p>
                  <p className="text-sm font-semibold">{ticket.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CalendarDays className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Ngày tạo</p>
                  <p className="text-sm font-semibold">{ticket.createdAt}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-[#19342B]">
                Nội dung phiếu
              </h3>

              <div className="rounded-xl bg-muted p-4">
                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
                  {ticket.content}
                </p>
              </div>
            </div>
          </div>

          <DrawerFooter>
            <DrawerClose>Đóng</DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
