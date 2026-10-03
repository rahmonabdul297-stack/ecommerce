import { api } from "@/lib/apiClient";

export interface AuthResult<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
}

export interface SignUpPayload {
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
}

export async function signUp(payload: SignUpPayload): Promise<AuthResult> {
  return api.postJson<AuthResult>("/api/v1/auth/sign-up", payload);
}

export async function verifyAccount(token: string): Promise<AuthResult> {
  return api.postJson<AuthResult>("/api/v1/auth/verify-account", { token });
}

export async function signIn(
  identifier: string,
  password: string,
): Promise<AuthResult> {
  const credential = identifier.includes("@")
    ? { email: identifier.trim() }
    : { username: identifier.trim() };
  return api.postJson<AuthResult>("/api/v1/auth/sign-in", {
    ...credential,
    password,
  });
}

export async function signOut(): Promise<AuthResult> {
  return api.post<AuthResult>("/api/v1/auth/sign-out");
}

export async function checkSession(): Promise<AuthResult> {
  return api.get<AuthResult>("/api/v1/auth/check-session");
}

export async function refreshSession(): Promise<
  AuthResult<{ accessToken?: string }>
> {
  return api.post<AuthResult<{ accessToken?: string }>>("/api/v1/auth/refresh");
}

export async function requestPasswordReset(email: string): Promise<AuthResult> {
  return api.postJson<AuthResult>("/api/v1/auth/forgot-password", { email });
}

export async function requestSmsPasswordReset(
  phone: string,
): Promise<AuthResult> {
  return api.postJson<AuthResult>("/api/v1/auth/SMS/forgot-password", {
    phone,
  });
}

export async function resetPasswordByEmail(
  token: string,
  userId: string,
  password: string,
): Promise<AuthResult> {
  const query = new URLSearchParams({ token, id: userId });
  return api.putJson<AuthResult>(
    `/api/v1/auth/reset-password?${query.toString()}`,
    { password },
  );
}

export async function resetPasswordBySms(
  OTP: string,
  password: string,
): Promise<AuthResult> {
  return api.putJson<AuthResult>("/api/v1/auth/OTP/reset-password", {
    OTP,
    password,
  });
}
