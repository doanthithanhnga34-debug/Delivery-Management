"use client";

import { SubmitEvent, useState, useSyncExternalStore } from "react";
import { DollarSign, Send, SquareText, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { extractShippingFee } from "../services/extractShippingFee";
import { TokbokkiButton } from "@/components/layout/button";

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
  const [shipFee, setShipFee] = useState("");
  const [otherFee, setOtherFee] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const quickFees = [
    { label: "20k", value: "20000" },
    { label: "25k", value: "25000" },
    { label: "30k", value: "30000" },
    { label: "35k", value: "35000" },
    { label: "40k", value: "40000" },
    { label: "45k", value: "45000" },
    { label: "50k", value: "50000" },
  ];
  const [isShippingFeeEdited, setIsShippingFeeEdited] = useState(false);

  function handleContentChange(value: string) {
    setContent(value);

    if (!isShippingFeeEdited) {
      const extracted = extractShippingFee(value);
      setShipFee(extracted !== null ? String(extracted) : "");
    }
  }

  function handleFeeChange(value: string) {
    const digits = value.replace(/\D/g, "");
    setOtherFee(digits);
  }
  function clearForm() {
    setContent("");
    setShipFee("");
    setOtherFee("");
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

    if (shipFee === "") {
      setSubmitError("Vui lòng nhập phí ship.");
      return;
    }

    const shippingFee = Number(shipFee);
    const parsedOtherFee = otherFee.trim() === "" ? 0 : Number(otherFee);

    if (!Number.isSafeInteger(shippingFee) || shippingFee < 0) {
      setSubmitError("Phí ship không hợp lệ.");
      return;
    }

    if (!Number.isSafeInteger(parsedOtherFee) || parsedOtherFee < 0) {
      setSubmitError("Phí chành/phí khác không hợp lệ.");
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
          otherFee: parsedOtherFee,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Tạo phiếu thất bại");
      }
      localStorage.setItem(SHIPPER_STORAGE_KEY, name);
      setEditedShipperName(name);
      clearForm();

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
    <div className="">

      <form onSubmit={handleSubmit} className="flex w-full flex-1 flex-col">
        <Card className="mt-4 overflow-hidden rounded-[24px] border-0 bg-white py-0 shadow-none ring-0">
          <CardContent className="p-5 sm:p-6">
            <FieldGroup className="gap-5">
              <Field
                orientation="vertical"
                className="w-full items-stretch gap-2"
              >
                <FieldLabel
                  htmlFor="shipper-name"
                  className="!flex w-full flex-row items-center justify-start gap-1 text-left text-xs font-semibold text-[#264237]"
                >
                  <User className="w-3.5 h-3.5 text-(--primary)" />
                  <span>Tên shipper</span>
                  <span aria-hidden="true" className="text-primary">
                    *
                  </span>
                </FieldLabel>
                <Input
                  id="shipper-name"
                  name="shipperName"
                  type="text"
                  placeholder="Nhập tên"
                  autoComplete="name"
                  required
                  value={shipperName}
                  onChange={(e) => setEditedShipperName(e.target.value)}
                  className="h-full min-w-0 text-[13px] text-[#263F34] input-custom h-11 "
                />
              </Field>

              <Field
                orientation="vertical"
                className="w-full items-stretch gap-2"
              >
                <FieldLabel
                  htmlFor="ticket-content"
                  className="flex w-full flex-row items-center justify-start gap-1 text-left text-xs font-semibold text-[#264237]"
                >
                  <SquareText className="w-3.5 h-3.5 text-(--primary)" />
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
                  onChange={(event) => handleContentChange(event.target.value)}
                  className="min-h-[120px] resize-y py-3 
                leading-6 input-custom"
                />
              </Field>

              <Field>
                <FieldLabel
                  htmlFor="ticket-fee"
                  className="!flex w-full flex-row items-center justify-start gap-1 text-left text-xs font-semibold text-[#264237]"
                >
                  <DollarSign className="w-3.5 h-3.5 text-(--primary)" />
                  <span>Phí ship</span>
                  <span aria-hidden="true" className="text-primary">
                    *
                  </span>
                </FieldLabel>
                <Input
                  id="ticket-fee"
                  type="text"
                  placeholder="Nhập phí ship"
                  value={shipFee ? Number(shipFee).toLocaleString("vi-VN") : ""}
                  onChange={(event) => {
                    setShipFee(event.target.value);
                    setIsShippingFeeEdited(true);
                  }}
                  className="input-custom h-12"
                />
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 mr-1">
                    Gợi ý:
                  </span>
                  {quickFees.map((item) => {
                    const isSelected = shipFee === item.value;
                    return (
                      <Badge
                        key={item.value}
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => setShipFee(item.value)}
                        className={`cursor-pointer px-2.5 py-1 text-[11px] font-medium transition-all rounded-xl ${
                          isSelected
                            ? "bg-(--color-bg) text-white hover:bg-(--color-bg) border-transparent shadow-sm"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-(--color-bg) hover:text-primary hover:border-primary"
                        }`}
                      >
                        {item.label}
                      </Badge>
                    );
                  })}
                </div>
              </Field>

              <Field>
                <FieldLabel
                  htmlFor="ticket-other-fee"
                  className="!flex w-full flex-row items-center justify-start gap-1 text-left text-xs font-semibold text-[#264237]"
                >
                  <DollarSign className="w-3.5 h-3.5 text-(--primary)" />
                  <span>Phí chành/ phí khác</span>
                </FieldLabel>
                <Input
                  id="ticket-other-fee"
                  type="text"
                  placeholder="Nhập phí chành/ phí khác"
                  value={
                    otherFee ? Number(otherFee).toLocaleString("vi-VN") : ""
                  }
                  onChange={(e) => handleFeeChange(e.target.value)}
                  className="input-custom h-12"
                />
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 mr-1">
                    Gợi ý:
                  </span>
                  {quickFees.map((item) => {
                    const isSelected = otherFee === item.value;
                    return (
                      <Badge
                        key={item.value}
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => setOtherFee(item.value)}
                        className={`cursor-pointer px-2.5 py-1 text-[11px] font-medium transition-all rounded-xl ${
                          isSelected
                            ? "bg-(--color-bg) text-white hover:bg-(--color-bg) border-transparent shadow-sm"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-(--color-bg) hover:text-primary hover:border-red-50"
                        }`}
                      >
                        {item.label}
                      </Badge>
                    );
                  })}
                </div>
              </Field>

              {submitError && (
                <p role="alert" className="text-sm text-primary">
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
        <div className="mt-auto shrink-0 pt-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full rounded-xl bg-(--color-bg) text-white hover:bg-(--hover-bg)"
          >
            {isSubmitting ? "Đang xử lý..." : "Gửi phiếu"}
            <Send className="size-4" strokeWidth={2} />
          </Button>
          {/* <TokbokkiButton/> */}
        </div>
      </form>
    </div>
  );
}
