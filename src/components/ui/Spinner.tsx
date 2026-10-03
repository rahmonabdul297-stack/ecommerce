export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };
  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizes[size]} animate-spin rounded-full border-2 border-gray-200 border-t-teal-600`}
      />
    </div>
  );
}

export function FullPageSpinner({ message }: { message?: string }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      {message && <p className="text-gray-500 text-sm">{message}</p>}
    </div>
  );
}
