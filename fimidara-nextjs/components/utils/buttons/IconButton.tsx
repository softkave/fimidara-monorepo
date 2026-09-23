import { Button } from "@/components/ui/button.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Omit1 } from "@/lib/utils/types";
import React, { ButtonHTMLAttributes, ComponentProps } from "react";

export interface IIconButtonProps {
  style?: React.CSSProperties;
  className?: string;
  disabled?: boolean;
  title?: string;
  icon: React.ReactNode;
  onClick?: () => void;
  buttonProps?: Partial<ComponentProps<typeof Button>>;
  children?: React.ReactNode;
  type?: ButtonHTMLAttributes<unknown>["type"];
  asChild?: boolean;
}

export type IExtendsIconButtonProps = Omit1<IIconButtonProps, "icon">;

const IconButton = React.forwardRef<HTMLButtonElement, IIconButtonProps>(
  (props, ref) => {
    const {
      style,
      className,
      disabled,
      icon,
      title,
      onClick,
      buttonProps,
      children,
      type,
    } = props;

    const btnNode = (
      <Button
        {...buttonProps}
        ref={ref}
        disabled={disabled}
        onClick={onClick}
        className={className}
        style={style}
        variant="outline"
        size="icon"
        type={type || "button"}
      >
        {icon}
        {children}
      </Button>
    );

    return title ? (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger render={btnNode} />
          <TooltipContent>{title}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : (
      btnNode
    );
  }
);

IconButton.displayName = "IconButton";

export default React.memo(IconButton);
