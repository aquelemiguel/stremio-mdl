import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

type HintSpanProps = {
  text: string;
  hint: string;
};

export function HintSpan({ text, hint }: HintSpanProps) {
  return (
    <Tooltip>
      <TooltipTrigger className="cursor-pointer">
        <span className="font-semibold underline decoration-dotted">
          {text}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        For example,
        <p className="font-semibold">{hint}</p>
      </TooltipContent>
    </Tooltip>
  );
}
