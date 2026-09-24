"use client";

import React from "react";
import { cn } from "../utils.ts";
import { CopyButton } from "./buttons/CopyButton.tsx";
import { StyleableComponentProps } from "./styling/types.ts";

export interface ITextProps extends StyleableComponentProps {
  type?: "secondary" | "danger" | "warning" | "success";
  code?: boolean;
  copyable?: boolean;
  children?: React.ReactNode;
}

export function Text(props: ITextProps) {
  const { type, style, code, copyable, className, children } = props;
  const textClassName = cn(
    type === "secondary"
      ? "text-secondary"
      : type === "success"
        ? "text-green-600"
        : type === "danger"
          ? "text-red-600"
          : type === "warning"
            ? "text-yellow-600"
            : undefined,
    code && "font-mono text-base break-all",
    className
  );

  const content = code ? (
    <code style={style} className={textClassName}>
      {children}
    </code>
  ) : (
    <span style={style} className={textClassName}>
      {children}
    </span>
  );

  if (!copyable) {
    return content;
  }

  const copyText =
    typeof children === "string" || typeof children === "number"
      ? String(children)
      : "";

  return (
    <span className="inline-flex max-w-full items-center gap-2">
      <span className="min-w-0 break-words">{content}</span>
      {copyText ? <CopyButton text={copyText} /> : null}
    </span>
  );
}
