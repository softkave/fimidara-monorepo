"use client";

import * as React from "react";
import { toast as toastManager } from "@/components/ui/toast";

type ToastOptions = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive";
  duration?: number;
  action?: React.ReactElement<{
    children?: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
  }>;
  actionProps?: React.ComponentPropsWithoutRef<"button">;
};

function toast(options: ToastOptions) {
  const id = toastManager.add({
    title: options.title,
    description: options.description,
    type: options.variant === "destructive" ? "error" : undefined,
    timeout: options.duration,
    actionProps:
      options.actionProps ??
      (options.action
        ? {
            children: options.action.props.children,
            onClick: options.action.props.onClick,
          }
        : undefined),
  });

  return {
    id,
    dismiss: () => toastManager.close(id),
    update: (updates: ToastOptions) =>
      toastManager.update(id, {
        title: updates.title,
        description: updates.description,
      }),
  };
}

function useToast() {
  return {
    toast,
    dismiss: (toastId?: string) => toastManager.close(toastId),
  };
}

export { useToast, toast };
