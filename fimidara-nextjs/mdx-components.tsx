import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "./lib/utils";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    a: ({ className, ...props }: ComponentPropsWithoutRef<"a">) => (
      <a className={cn("underline", className)} {...props} />
    ),
    pre: ({ className, ...props }: ComponentPropsWithoutRef<"pre">) => (
      <pre
        className={cn(
          "my-4 w-full max-w-full overflow-x-auto rounded-md border bg-muted/40 p-3 text-xs leading-relaxed",
          className
        )}
        {...props}
      />
    ),
    code: ({ className, ...props }: ComponentPropsWithoutRef<"code">) => {
      const isBlock = Boolean(className?.includes("language-"));
      return (
        <code
          className={cn(
            isBlock
              ? "block w-full bg-transparent border-0 p-0 rounded-none text-[inherit]"
              : undefined,
            className
          )}
          {...props}
        />
      );
    },
  };
}
