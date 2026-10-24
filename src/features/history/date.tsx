import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";

import { useEffect, useState } from "react";

type DatePickerProps = {
  value?: Date;
  onChange: (date: Date | undefined) => void;
};


export function DatePicker({value,onChange}:DatePickerProps) {
 

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant={"outline"}
            type="button"
            className="w-[212px] justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
          >
            {value
              ? format(value, "dd/MM/yyyy")
              : "Chọn ngày"}
            <ChevronDownIcon data-icon="inline-end" />
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          defaultMonth={value}
        />
      </PopoverContent>
    </Popover>
  );
}
