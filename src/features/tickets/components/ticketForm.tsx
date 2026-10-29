"use client";

import { SubmitEvent, useState } from "react";
import { Plus, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

export function TicketForm() {
  const [shipperName, setShipperName] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = shipperName.trim();
    const ticketContent = content.trim();
    if (!name || !ticketContent || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shipperName: name,
          content: ticketContent,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Gửi phiếu thất bại");
      }
      console.log("Server response", result);
    } catch (error) {
      console.error("Submit ticket error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-[23px] font-bold tracking-tight text-[#17352B]">
          Tạo phiếu
        </h1>
        <p className="text-xs text-[#89978F]">
          Ghi lại đơn hàng, sẵn sàng cho chuyến giao.
        </p>
      </div>

      <Card className="gap-0 rounded-2xl border-[#E1E9E4] bg-white py-0 shadow-none">
        <CardContent className="p-4">
          <FieldGroup className="gap-5">
            <Field
              orientation="vertical"
              className="w-full items-stretch gap-2"
            >
              <FieldLabel
                htmlFor="shipper-name"
                className="!flex w-full flex-row items-center justify-start gap-1 text-left text-xs font-semibold text-[#264237]"
              >
                <span>Tên shipper</span>
                <span aria-hidden="true" className="text-primary">
                  *
                </span>
              </FieldLabel>

              <InputGroup
                className=" h-11 w-full rounded-xl bg-white shadow-none
                    !border-0 !ring-0 !outline-none
                    focus-within:!border-0
                    focus-within:!ring-0
                    focus-within:!outline-none
                    has-[[data-slot=input-group-control]:focus-visible]:!border-0
                    has-[[data-slot=input-group-control]:focus-visible]:!ring-0"
              >
                <InputGroupAddon align="inline-start">
                  <UserRound className="size-4 text-[#71877A]" />
                </InputGroupAddon>

                <InputGroupInput
                  id="shipper-name"
                  name="shipperName"
                  type="text"
                  placeholder="Nhập tên"
                  autoComplete="name"
                  required
                  value={shipperName}
                  onChange={(e) => setShipperName(e.target.value)}
                  className="h-full min-w-0 text-[13px] text-[#263F34] "
                />
              </InputGroup>
            </Field>

            <Field
              orientation="vertical"
              className="w-full items-stretch gap-2"
            >
              <FieldLabel
                htmlFor="ticket-content"
                className="!flex w-full flex-row items-center justify-start gap-1 text-left text-xs font-semibold text-[#264237]"
              >
                <span>Nội dung đơn hàng</span>
                <span aria-hidden="true" className="text-primary">
                  *
                </span>
              </FieldLabel>

              <Textarea
                id="ticket-content"
                name="content"
                placeholder={"Nội dung"}
                rows={6}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[140px] w-full resize-y rounded-xl 
                border-[#E1E9E4] bg-white px-3 py-3 text-[13px] 
                leading-6 text-[#263F34] shadow-none 
                focus-visible:border-0 focus-visible:ring-0"
              />

              <FieldDescription className="w-full text-left text-[11px] leading-relaxed text-[#8A998F]">
                Ghi mặt hàng, địa chỉ và số tiền thu hộ (nếu có).
              </FieldDescription>
            </Field>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full rounded-xl bg-[#d92d45] text-[13px] font-semibold text-white shadow-none hover:bg-[#116E4A]"
            >
              <Plus className="size-4" strokeWidth={2} />
              {isSubmitting ? "Đang xử lý" : "Tạo phiếu"}
            </Button>
          </FieldGroup>
        </CardContent>
      </Card>
    </form>
  );
}
