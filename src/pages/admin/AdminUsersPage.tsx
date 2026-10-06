import { useEffect, useState, useCallback } from "react";
import { Users, Trash2 } from "lucide-react";
import type { AdminUser } from "@/lib/types";
import { fetchAdminUsers, deleteAdminUser } from "@/services/adminUserService";
import { useToast } from "@/context/ToastContext";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatDate } from "@/lib/utils";

export function AdminUsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteAdminUser(deleteId);
      setUsers((prev) => prev.filter((u) => u._id !== deleteId));
      showToast("success", "User deleted");
      setDeleteId(null);
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to delete user",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">{users.length} users</p>
        </div>
      </div>

      {loading && <FullPageSpinner message="Loading users…" />}
      {error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && users.length === 0 && (
        <EmptyState
          icon={Users}
          title="No users found"
          message="User accounts will appear here."
        />
      )}

      {!loading && !error && users.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left font-medium text-gray-600 px-4 py-3">
                    Name
                  </th>
                  <th className="text-left font-medium text-gray-600 px-4 py-3">
                    Email
                  </th>
                  <th className="text-left font-medium text-gray-600 px-4 py-3">
                    verified
                  </th>
                  <th className="text-left font-medium text-gray-600 px-4 py-3">
                    Joined
                  </th>
                  <th className="text-right font-medium text-gray-600 px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {user.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {user.email ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {user.isVerified === undefined ? (
                        <span className="text-gray-400">Unknown</span>
                      ) : (
                        <Badge tone={user.isVerified ? "success" : "warning"}>
                          {user.isVerified ? "Verified" : "Unverified"}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {user.date ? formatDate(user.date) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setDeleteId(user._id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete user?"
        message="This will permanently delete the user account. This action cannot be undone."
        confirmLabel="Delete user"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
