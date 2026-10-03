import { api } from "@/lib/apiClient";
import type { ApiSuccess, Product, ProductsListData } from "../lib/types";

/** GET /api/v1/admin/products — includes drafts (not public-safe) */
export async function fetchAdminProducts(
  signal?: AbortSignal,
): Promise<ProductsListData> {
  const res = await api.get<ApiSuccess<ProductsListData>>(
    "/api/v1/admin/products",
    signal,
  );
  return res.data;
}

/** GET /api/v1/admin/products/:id — :id may be Mongo ID or slug */
export async function fetchAdminProductById(
  id: string,
  signal?: AbortSignal,
): Promise<Product> {
  const res = await api.get<ApiSuccess<{ product: Product }>>(
    `/api/v1/admin/products/${encodeURIComponent(id)}`,
    signal,
  );
  return res.data.product;
}

/** POST /api/v1/admin/products — multipart form data */
export async function createAdminProduct(
  form: FormData,
  signal?: AbortSignal,
): Promise<Product> {
  const res = await api.postForm<ApiSuccess<{ product: Product }>>(
    "/api/v1/admin/products",
    form,
    signal,
  );
  return res.data.product;
}

/** PUT /api/v1/admin/products/:id — multipart form data (all fields optional) */
export async function updateAdminProduct(
  id: string,
  form: FormData,
  signal?: AbortSignal,
): Promise<Product> {
  const res = await api.putForm<ApiSuccess<{ product: Product }>>(
    `/api/v1/admin/products/${encodeURIComponent(id)}`,
    form,
    signal,
  );
  return res.data.product;
}

/** DELETE /api/v1/admin/products/:id */
export async function deleteAdminProduct(id: string): Promise<void> {
  await api.delete<ApiSuccess<null>>(
    `/api/v1/admin/products/${encodeURIComponent(id)}`,
  );
}

/** PATCH /api/v1/admin/products/:id/toggle-publish */
export async function togglePublishProduct(id: string): Promise<boolean> {
  const res = await api.patchJson<ApiSuccess<{ isPublished: boolean }>>(
    `/api/v1/admin/products/${encodeURIComponent(id)}/toggle-publish`,
    {},
  );
  return res.data.isPublished;
}

/** DELETE /api/v1/admin/products/:id/images/:public_id — URL-encode public_id */
export async function deleteProductImage(
  productId: string,
  publicId: string,
): Promise<Product["images"]> {
  const res = await api.delete<ApiSuccess<{ images: Product["images"] }>>(
    `/api/v1/admin/products/${encodeURIComponent(productId)}/images/${encodeURIComponent(publicId)}`,
  );
  return res.data.images;
}

/**
 * BACKEND NOTE: There is no public catalog route. The endpoints above are all
 * admin-prefixed and include drafts. Do not treat them as public-safe listings.
 */
