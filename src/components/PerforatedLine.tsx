import { PropsWithChildren } from "react";

export function PerforatedLine({ children }: PropsWithChildren) {
  return (
    <div className="flex items-center mt-4 mb-2">
      <div className="flex-1 h-px border-1 border-dashed border-gray-200"></div>
      <div className="px-3">{children}</div>
      <div className="flex-1 h-px border-1 border-dashed border-gray-200"></div>
    </div>
  );
}
