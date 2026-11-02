"use client";

import { SubmitEvent, useEffect, useState, useSyncExternalStore } from "react";
import { Plus, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";

const SHIPPER_STORAGE_KEY = "delivery_shipper_name";

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener("storage", callback);
  };
}

function getShipperSnapshot() {
  return localStorage.getItem(SHIPPER_STORAGE_KEY) ?? "";
}

function getServerSnapshot() {
  return "";
}

export function TicketForm() {
  const savedShipperName = useSyncExternalStore(
    subscribeToStorage,
    getShipperSnapshot,
    getServerSnapshot,
  );

  const [editedShipperName, setEditedShipperName] = useState<string | null>(
    null,
  );

  const shipperName = editedShipperName ?? savedShipperName;
  const [content, setContent] = useState("");
  const [feeShip, setFeeShip] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const quickFees = [
    { label: "20.000", value: "20000" },
    { label: "25.000", value: "25000" },
    { label: "30.000", value: "30000" },
    { label: "35.000", value: "35000" },
    { label: "40.000", value: "40000" },
    { label: "50.000", value: "50000" },
    { label: "Freeship", value: "0" },
  ];

  function handleFeeChange(value: string) {
    const digits = value.replace(/\D/g, "");
    setFeeShip(digits);
  }

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isSubmitting) return;

    const name = shipperName.trim();
    const ticketContent = content.trim();

    setSubmitError(null);
    setSubmitSuccess(false);

    if (!name || !ticketContent) {
      setSubmitError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (feeShip === "") {
      setSubmitError("Vui lòng nhập phí ship.");
      return;
    }

    const shippingFee = Number(feeShip);

    if (!Number.isSafeInteger(shippingFee) || shippingFee < 0) {
      setSubmitError("Phí ship không hợp lệ.");
      return;
    }

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
          shippingFee,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Tạo phiếu thất bại");
      }
      localStorage.setItem(SHIPPER_STORAGE_KEY, name);
      setEditedShipperName(name);
      setContent("");
      setFeeShip("");

      toast.add({
        type: "success",
        description: `Tạo phiếu thành công`,
      });
    } catch (error) {
      toast.add({
        type: "error",
        description:
          error instanceof Error
            ? error.message
            : "Không thể kết nối đến máy chủ.",
      });
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
          Ghi lại phiếu hàng, sẵn sàng cho chuyến giao.
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
                  onChange={(e) => setEditedShipperName(e.target.value)}
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
                className="min-h-[110px] w-full resize-y rounded-xl 
                border-[#E1E9E4] bg-white px-3 py-3 text-[13px] 
                leading-6 text-[#263F34] shadow 
                focus-visible:border-1 focus-visible:ring-1"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="input-field-fee">Phí ship</FieldLabel>
              <Input
                id="input-field-fee"
                type="text"
                placeholder="Nhập phí ship"
                value={feeShip ? Number(feeShip).toLocaleString("vi-VN") : ""}
                onChange={(e) => handleFeeChange(e.target.value)}
                className="w-full resize-y rounded-xl 
                border-[#E1E9E4] bg-white px-3 py-3 text-[13px] 
                leading-6 text-[#263F34] shadow 
                focus-visible:border-1 focus-visible:ring-1"
              />
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-400 mr-1">Gợi ý:</span>
                {quickFees.map((item) => {
                  const isSelected = feeShip === item.value;
                  return (
                    <Badge
                      key={item.value}
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => setFeeShip(item.value)}
                      className={`cursor-pointer px-2.5 py-1 text-[11px] font-medium transition-all rounded-xl ${
                        isSelected
                          ? "bg-red-600 text-white hover:bg-red-700 border-transparent shadow-sm"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-700 hover:border-red-50"
                      }`}
                    >
                      {item.label}
                    </Badge>
                  );
                })}
              </div>
            </Field>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-[48px] w-full rounded-xl bg-[#d92d45] text-[13px] font-semibold text-white shadow-none hover:from-red-700 hover:to-rose-700"
            >
              <Plus className="size-4" strokeWidth={2} />
              {isSubmitting ? "Đang xử lý" : "Tạo phiếu"}
            </Button>
            {submitError && (
              <p role="alert" className="text-sm text-red-600">
                {submitError}
              </p>
            )}

            {submitSuccess && (
              <p role="status" className="text-sm text-green-700">
                Tạo phiếu thành công.
              </p>
            )}
          </FieldGroup>
        </CardContent>
      </Card>
    </form>
  );
}
