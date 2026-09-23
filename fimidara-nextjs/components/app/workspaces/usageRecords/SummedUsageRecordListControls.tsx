import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { endOfYear, startOfYear } from "date-fns";
import { Workspace } from "fimidara";
import { first, range } from "lodash-es";
import React, { useMemo } from "react";

export interface ISummedUsageRecordListControlsProps {
  workspace: Workspace;
  year: number;
  month: number;
  disabled?: boolean;
  onChange: (year: number, month: number) => void;
}

const monthLabels = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const monthLabelsMap = Object.values(monthLabels).reduce((acc, key, index) => {
  acc[key] = index;
  return acc;
}, {} as Record<string, number>);

const SummedUsageRecordListControls: React.FC<
  ISummedUsageRecordListControlsProps
> = (props) => {
  const { year, month, disabled, onChange, workspace } = props;

  const { monthOptions, months } = useMemo(() => {
    const startYear = startOfYear(new Date(year));
    const endYear = endOfYear(new Date(year));
    const now = new Date();
    const end = now.getFullYear() === year ? now : endYear;
    const months = range(startYear.getMonth(), end.getMonth() + 1);
    const monthOptions = months.map((iMonth) => ({
      label: monthLabels[iMonth],
      value: monthLabels[iMonth],
    }));

    return { monthOptions, months };
  }, [year]);

  const { yearOptions } = useMemo(() => {
    const startYear = startOfYear(new Date(workspace.createdAt));
    const now = new Date();
    const years = range(startYear.getFullYear(), now.getFullYear() + 1);
    const yearOptions = years.map((iYear) => ({
      label: iYear,
      value: iYear,
    }));

    return { yearOptions };
  }, [workspace.createdAt]);

  return (
    <div className="flex items-center space-x-2">
      <Select
        disabled={disabled}
        onValueChange={(value) => {
          if (value == null) return;
          onChange(Number(value), first(months)!);
        }}
        defaultValue={year.toString()}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {yearOptions.map((y) => (
            <SelectItem key={y.value} value={y.value.toString()}>
              {y.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        disabled={disabled}
        onValueChange={(value) => {
          if (value == null) return;
          onChange(year, monthLabelsMap[value]);
        }}
        defaultValue={monthLabels[month]?.toString()}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {monthOptions.map((m) => (
            <SelectItem key={m.value} value={m.value.toString()}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SummedUsageRecordListControls;
