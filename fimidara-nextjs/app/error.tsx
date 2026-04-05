"use client"; // Error components must be Client Components

import { OwnError } from "@/lib/common/error.ts";
import { fimidxConsoleLogger } from "@/lib/common/logger";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    fimidxConsoleLogger.error(error);
  }, [error]);

  const errorMessage = OwnError.isOwnError(error)
    ? error.message
    : "An unknown error occurred";

  // TODO: only display ExternalErrors
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{errorMessage}</p>
      {/* <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </button> */}
    </div>
  );
}
