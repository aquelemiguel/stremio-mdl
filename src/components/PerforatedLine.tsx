import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";

type PerforatedLineProps = PropsWithChildren & {
  className?: string;
};

export function PerforatedLine({ className, children }: PerforatedLineProps) {
  return (
    <div className={cn(className, "flex items-center")}>
      <div className="flex-1 h-px border-1 border-dashed border-gray-200"></div>
      <div className="px-3">{children}</div>
      <div className="flex-1 h-px border-1 border-dashed border-gray-200"></div>
    </div>
  );
}
