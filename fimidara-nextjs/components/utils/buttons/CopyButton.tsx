"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/components/utils.ts";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export interface ICopyButtonProps {
  text: string | (() => string);
  disabled?: boolean;
  className?: string;
  variant?: "outline" | "ghost";
  size?: "icon" | "icon-sm" | "icon-xs";
  /** How long to show the check icon before reverting. Default 2000ms. */
  resetMs?: number;
}

export function CopyButton(props: ICopyButtonProps) {
  const {
    text,
    disabled,
    className,
    variant = "outline",
    size = "icon-sm",
    resetMs = 2000,
  } = props;
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) {
      return;
    }

    const timeout = setTimeout(() => {
      setIsCopied(false);
    }, resetMs);

    return () => clearTimeout(timeout);
  }, [isCopied, resetMs]);

  const handleClick = useCallback(() => {
    const value = typeof text === "function" ? text() : text;
    void navigator.clipboard.writeText(value);
    setIsCopied(true);
  }, [text]);

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled}
      className={cn("shrink-0", className)}
      title={isCopied ? "Copied" : "Copy"}
      aria-label={isCopied ? "Copied" : "Copy"}
    >
      {isCopied ? (
        <CheckIcon className="w-4 h-4 text-green-600" />
      ) : (
        <CopyIcon className="w-4 h-4" />
      )}
    </Button>
  );
}
