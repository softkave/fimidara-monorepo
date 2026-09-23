"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { StyleableComponentProps } from "../utils/styling/types.ts";

export interface IDatePickerProps extends StyleableComponentProps {
  disabled?: boolean;
  value?: Date;
  onChange: (value?: Date) => void;
}

export function DatePicker(props: IDatePickerProps) {
  const { disabled, value, className, style, onChange } = props;

  return (
    <Popover>
      <PopoverTrigger
        disabled={disabled}
        className={className}
        style={style}
        render={
          <Button
            type="button"
            disabled={disabled}
            variant={"outline"}
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !value && "text-muted-foreground",
              className
            )}
          />
        }
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {value ? format(value, "PPP") : <span>Pick a date</span>}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          disabled={disabled}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
