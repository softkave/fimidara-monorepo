import { Toaster } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/components/utils.ts";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { DM_Mono, DM_Sans, Source_Code_Pro } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });

const codeFont = DM_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-source-code",
});

export const metadata: Metadata = {
  title: "fimidara",
  description: "File storage service for developers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", dmSans.variable)}>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          codeFont.variable,
          "flex",
          "flex-col"
        )}
      >
        <NextTopLoader />
        <TooltipProvider>
          <SessionProvider>{children}</SessionProvider>
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
