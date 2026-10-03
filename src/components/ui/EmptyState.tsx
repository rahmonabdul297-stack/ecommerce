import { PackageOpen } from "lucide-react";

interface EmptyStateProps {
  icon?: typeof PackageOpen;
  title: string;
  message?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon = PackageOpen, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="bg-gray-100 rounded-full p-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <div>
        <p className="text-gray-900 font-medium">{title}</p>
        {message && <p className="text-gray-500 text-sm mt-1 max-w-sm">{message}</p>}
      </div>
      {action}
    </div>
  );
}
