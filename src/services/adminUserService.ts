import { api } from "@/lib/apiClient";
import type { AdminUser, ApiSuccess } from "../lib/types";

/**
 * GET /api/v1/admin/users
 * BACKEND CAVEAT: This endpoint currently selects ALL fields including
 * `password`. Treat this endpoint as unsafe — never render or retain the
 * password field. Backend authorization and response filtering are absent.
 */
export async function fetchAdminUsers(
  signal?: AbortSignal,
): Promise<AdminUser[]> {
  const res = await api.get<ApiSuccess<AdminUser[]>>(
    "/api/v1/admin/users",
    signal,
  );
  // Strip any password field defensively at the client boundary
  const users = res.data as unknown as Array<Record<string, unknown>>;
  return users.map((u) => {
    const { password, ...safe } = u;
    void password;
    return safe as unknown as AdminUser;
  });
}

/**
 * DELETE /api/v1/admin/delete/:id
 * Returns the deleted user document. Use a confirmation step before calling.
 */
export async function deleteAdminUser(id: string): Promise<AdminUser> {
  const res = await api.delete<ApiSuccess<AdminUser>>(
    `/api/v1/admin/delete/${encodeURIComponent(id)}`,
  );
  const { password, ...safeUser } = res.data as AdminUser & {
    password?: unknown;
  };
  void password;
  return safeUser;
}
