import { ApiRequestError } from "./types";

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)??"http://localhost:5000";

// Session auth uses HttpOnly cookies — always send credentials.
// Never store access/refresh tokens in the browser.
const DEFAULT_HEADERS: Record<string, string> = {
  Accept: "application/json",
};

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: BodyInit;
  signal?: AbortSignal;
  isFormData?: boolean;
}

function buildUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

async function parseResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type") ?? "";

  // Webhook-like plain text responses
  if (contentType.includes("text/plain")) {
    const text = await res.text();
    if (!res.ok) throw new ApiRequestError(text || res.statusText, res.status);
    return text as unknown as T;
  }

  if (contentType.includes("application/json")) {
    const json = await res.json();
    if (!res.ok || json.success === false) {
      const message = json.message ?? "Request failed";
      const errors = json.errors as string[] | undefined;
      throw new ApiRequestError(message, res.status, errors);
    }
    return json as T;
  }

  // Unknown content type but non-OK
  if (!res.ok) {
    throw new ApiRequestError(res.statusText || "Request failed", res.status);
  }

  return {} as T;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    headers = {},
    body,
    signal,
    isFormData = false,
  } = options;

  const finalHeaders: Record<string, string> = {
    ...DEFAULT_HEADERS,
    ...headers,
  };

  // Let the browser set the multipart Content-Type with boundary
  if (!isFormData && body !== undefined) {
    finalHeaders["Content-Type"] = "application/json";
  }

  const requestInit: RequestInit = {
    method,
    headers: finalHeaders,
    body: body === undefined ? undefined : body,
    credentials: "include",
    signal,
  };

  let res = await fetch(buildUrl(path), requestInit);
  if (res.status === 401 && !path.startsWith("/api/v1/auth/")) {
    const refreshResponse = await fetch(buildUrl("/api/v1/auth/refresh"), {
      method: "POST",
      headers: DEFAULT_HEADERS,
      credentials: "include",
      signal,
    });
    if (refreshResponse.ok) {
      const refreshResult = await refreshResponse.json().catch(() => null);
      if (refreshResult?.success !== false) {
        res = await fetch(buildUrl(path), requestInit);
      }
    }
  }

  return parseResponse<T>(res);
}

// Convenience helpers
export const api = {
  get: <T>(path: string, signal?: AbortSignal) =>
    apiRequest<T>(path, { method: "GET", signal }),

  post: <T>(path: string, signal?: AbortSignal) =>
    apiRequest<T>(path, { method: "POST", signal }),

  postJson: <T>(path: string, data: unknown, signal?: AbortSignal) =>
    apiRequest<T>(path, { method: "POST", body: JSON.stringify(data), signal }),

  postForm: <T>(path: string, formData: FormData, signal?: AbortSignal) =>
    apiRequest<T>(path, {
      method: "POST",
      body: formData,
      isFormData: true,
      signal,
    }),

  patchJson: <T>(path: string, data: unknown, signal?: AbortSignal) =>
    apiRequest<T>(path, {
      method: "PATCH",
      body: JSON.stringify(data),
      signal,
    }),

  putJson: <T>(path: string, data: unknown, signal?: AbortSignal) =>
    apiRequest<T>(path, { method: "PUT", body: JSON.stringify(data), signal }),

  putForm: <T>(path: string, formData: FormData, signal?: AbortSignal) =>
    apiRequest<T>(path, {
      method: "PUT",
      body: formData,
      isFormData: true,
      signal,
    }),

  delete: <T>(path: string, signal?: AbortSignal) =>
    apiRequest<T>(path, { method: "DELETE", signal }),
};
