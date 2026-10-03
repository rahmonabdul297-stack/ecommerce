import { useEffect, useState, useCallback } from "react";
import { Users, Trash2, ShieldAlert } from "lucide-react";
import type { AdminUser } from "@/lib/types";
import { fetchAdminUsers, deleteAdminUser } from "@/services/adminUserService";
import { useToast } from "@/context/ToastContext";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
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
      showToast("error", err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">{users.length} users</p>
        </div>
      </div>

      {/* Security warning */}
      <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
        <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
        <div className="text-sm text-red-700">
          <p className="font-medium">Security warning</p>
          <p className="mt-1 text-red-600">
            The backend user endpoint currently returns all fields including password hashes and lacks
            authorization checks. The password field is stripped client-side but this is not a substitute
            for server-side filtering. Backend authorization and response filtering are absent.
          </p>
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
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left font-medium text-gray-600 px-4 py-3">Name</th>
                  <th className="text-left font-medium text-gray-600 px-4 py-3">Email</th>
                  <th className="text-left font-medium text-gray-600 px-4 py-3">Role</th>
                  <th className="text-left font-medium text-gray-600 px-4 py-3">Joined</th>
                  <th className="text-right font-medium text-gray-600 px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">{user.name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{user.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      {user.role ? (
                        <Badge tone={user.role === "admin" ? "warning" : "neutral"}>{user.role}</Badge>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(user.createdAt ?? "")}</td>
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
