import { Label } from "@/components/ui/label.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import { cn } from "@/components/utils.ts";
import { QuestionCircleOutlined } from "@ant-design/icons";
import React from "react";
import { PermissionMapItemInfo } from "./types";

export interface PermissionActionInfo extends PermissionMapItemInfo {
  disabled?: boolean;
  disabledReason?: React.ReactNode;
}

export interface PermissionActionProps {
  disabledReason?: React.ReactNode;
  access: boolean;
  disabled?: boolean;
  label: string;
  onChange: (access: boolean) => void;
  info?: React.ReactNode;
}

const PermissionAction: React.FC<PermissionActionProps> = (props) => {
  const { access, disabledReason, disabled, label, info, onChange } = props;

  return (
    <Label>
      <div className="flex justify-center space-x-2">
        <div
          className={cn(
            "flex items-center flex-1",
            disabled ? "text-secondary" : undefined
          )}
        >
          <span className="line-clamp-1">{label}</span>
        </div>
        <div className="space-x-2 flex">
          {(disabledReason || info) && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <QuestionCircleOutlined />
                </TooltipTrigger>
                <TooltipContent>{disabledReason || info}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Switch
            disabled={disabled}
            checked={access}
            onCheckedChange={(value) => {
              onChange(value);
            }}
          />
        </div>
      </div>
    </Label>
  );
};

export default PermissionAction;
