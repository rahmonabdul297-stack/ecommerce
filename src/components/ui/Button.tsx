import type { ReactNode } from "react";
import { classNames } from "@/lib/utils";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary: "bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800 shadow-sm",
  secondary: "bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-700 shadow-sm",
  danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm",
  ghost: "text-gray-700 hover:bg-gray-100 active:bg-gray-200",
  outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={classNames(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-500/40 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...rest}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      )}
      {children}
    </button>
  );
}

export function IconButton({
  children,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      className={classNames(
        "inline-flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
