"use client";

import React, { useId, useState } from "react";
import {
  format,
  isAfter,
  isBefore,
  isValid,
  parse,
  startOfDay,
  subDays,
} from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Field } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const DATE_FORMAT = "dd/MM/yyyy";
interface DatePickerInputProps {
  date?: Date;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  onDateChange: (date: Date | undefined) => void;
}

function maskDate(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
    .filter(Boolean)
    .join("/");
}
function parseFullDate(value: string): Date | undefined {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return undefined;
  const parsed = parse(value, DATE_FORMAT, new Date());
  return isValid(parsed) && parsed.getFullYear() >= 1900 ? parsed : undefined;
}

export function DatePickerInput({
  date,
  placeholder = DATE_FORMAT,
  minDate,
  maxDate,
  onDateChange,
}: DatePickerInputProps) {
  const inputId = useId();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date>(() => date ?? new Date());
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");

  function isDateAllowed(value: Date): boolean {
    const day = startOfDay(value);
    const minDate = subDays(day, 6);

    if (minDate && isBefore(day, startOfDay(minDate))) {
      return false;
    }

    if (maxDate && isAfter(day, startOfDay(maxDate))) {
      return false;
    }

    return true;
  }

  const formatted = date ? format(date, DATE_FORMAT) : "";
  const inputValue = isEditing ? draft : formatted;
  const parsedDraft = parseFullDate(draft);

  const isInvalid =
    isEditing &&
    draft.length === 10 &&
    (!parsedDraft || !isDateAllowed(parsedDraft));

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = maskDate(e.target.value);
    setDraft(next);

    const parsed = parseFullDate(next);
    if (parsed && isDateAllowed(parsed)) {
      onDateChange(parsed);
      setMonth(parsed);
    } else if (next === "") {
      onDateChange(undefined);
    }
  }
  console.log("[DATE_PICKER_PROPS]", {
    minDate,
    maxDate,
  });

  return (
    <Field className="mx-auto w-48">
      <InputGroup className="input-custom pr-0">
        <InputGroupInput
          id={inputId}
          value={inputValue}
          placeholder={placeholder}
          inputMode="numeric"
          autoComplete="off"
          maxLength={10}
          aria-invalid={isInvalid}
          onFocus={() => {
            setDraft(formatted);
            setIsEditing(true);
          }}
          onBlur={() => setIsEditing(false)}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
            }
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
        />
        <InputGroupAddon align="inline-end">
          <Popover
            open={open}
            onOpenChange={(next) => {
              setOpen(next);
              if (next) setMonth(date ?? new Date());
            }}
          >
            <PopoverTrigger
              render={
                <InputGroupButton
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Chọn ngày"
                >
                  <CalendarIcon />
                  <span className="sr-only">Chọn ngày</span>
                </InputGroupButton>
              }
            />
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="end"
              alignOffset={-8}
              sideOffset={10}
            >
              <Calendar
                mode="single"
                locale={vi}
                selected={date}
                month={month}
                onMonthChange={setMonth}
                startMonth={minDate}
                endMonth={maxDate}
                disabled={[
                  ...(minDate ? [{ before: minDate }] : []),
                  ...(maxDate ? [{ after: maxDate }] : []),
                ]}
                onSelect={(selectedDate) => {
                  if (!selectedDate || !isDateAllowed(selectedDate)) {
                    return;
                  }

                  onDateChange(selectedDate);
                  setMonth(selectedDate);
                  setIsEditing(false);
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );
}
