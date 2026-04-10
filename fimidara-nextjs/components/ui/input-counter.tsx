import { ScissorsLineDashed } from "lucide-react";
import { cn } from "../utils.ts";
import { StyleableComponentProps } from "../utils/styling/types.ts";
import { Button } from "./button.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip.tsx";

export interface IInputCounterProps extends StyleableComponentProps {
  count: number;
  maxCount: number;
  onTruncate?: () => void;
}

export const InputCounter: React.FC<IInputCounterProps> = (props) => {
  const { count, maxCount, className, style, onTruncate } = props;

  if (!count) {
    return null;
  }

  return (
    <div className={cn("space-x-2 flex items-center", className)} style={style}>
      <span className="text-right text-sm text-gray-500">
        {count}/{maxCount}
      </span>
      {onTruncate && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                onClick={onTruncate}
                disabled={count <= maxCount}
                className="size-6"
                size="icon"
              >
                <ScissorsLineDashed className="size-4 text-gray-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Truncate</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};
