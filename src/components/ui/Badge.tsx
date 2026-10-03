import type { ReactNode } from "react";
import { classNames } from "@/lib/utils";

type Tone = "success" | "warning" | "error" | "info" | "neutral";

const tones: Record<Tone, string> = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  error: "bg-red-50 text-red-700 border-red-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
  neutral: "bg-gray-100 text-gray-700 border-gray-200",
};

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
