import { api } from "@/lib/apiClient";
import { ApiSuccess, Category } from "@/lib/types";


export interface CategoryListData {
  count: number;
  categories: Category[];
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateCategoryPayload {
  name?: string;
  description?: string;
  isActive?: boolean;
}

/** GET /api/v1/admin/categories — only active categories */
export async function fetchCategories(signal?: AbortSignal): Promise<CategoryListData> {
  const res = await api.get<ApiSuccess<CategoryListData>>("/api/v1/admin/categories", signal);
  return res.data;
}

/** POST /api/v1/admin/category */
export async function createCategory(payload: CreateCategoryPayload): Promise<Category> {
  const res = await api.postJson<ApiSuccess<{ category: Category }>>("/api/v1/admin/category", payload);
  return res.data.category;
}

/** PUT /api/v1/admin/category/:id */
export async function updateCategory(id: string, payload: UpdateCategoryPayload): Promise<Category> {
  const res = await api.putJson<ApiSuccess<{ category: Category }>>(`/api/v1/admin/category/${encodeURIComponent(id)}`, payload);
  return res.data.category;
}

/** DELETE /api/v1/admin/category/:id — fails if products still use it */
export async function deleteCategory(id: string): Promise<void> {
  await api.delete<ApiSuccess<null>>(`/api/v1/admin/category/${encodeURIComponent(id)}`);
}
