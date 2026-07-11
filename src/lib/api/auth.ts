import { API_BASE_URL, apiGet, apiPost } from "./client";

export type UserRole = "super_admin" | "company_admin" | "employee";
export type PermissionLevel = "view" | "edit" | "not_allowed";

/** POST /api/login success body (auth_token is delivered as a cookie). */
export interface LoginSuccess {
  is_successful: true;
  is_user_exists: boolean;
  message: string;
  name: string;
  role: UserRole;
  permissions: Record<string, PermissionLevel>;
  email: string;
}

/** GET /api/get_profile body. */
export interface Profile {
  email: string;
  role: UserRole;
  name: string;
  phone_number?: string;
  permissions: Record<string, PermissionLevel>;
  designation?: string;
  created_at?: string;
  tenant_id?: string;
  company_data?: Record<string, unknown>;
}

export interface SimpleResult {
  ok: boolean;
  message: string;
}

export type LoginResult = { ok: true; data: LoginSuccess } | { ok: false; message: string };

export async function login(email: string, password: string): Promise<LoginResult> {
  const res = await apiPost<LoginSuccess>("/login", { email, password });
  return res.ok && res.data
    ? { ok: true, data: res.data }
    : { ok: false, message: res.message || "Sign-in failed. Please try again." };
}

export type ProfileResult = { ok: true; data: Profile } | { ok: false; status: number; message: string };

export async function getProfile(): Promise<ProfileResult> {
  const res = await apiGet<Profile>("/get_profile");
  return res.ok && res.data
    ? { ok: true, data: res.data }
    : { ok: false, status: res.status, message: res.message || "Not authenticated." };
}

export async function logout(): Promise<SimpleResult> {
  const res = await apiGet<Record<string, never>>("/logout");
  return { ok: res.ok, message: res.message };
}

export const forgotPassword = async (email: string): Promise<SimpleResult> => {
  const res = await apiPost("/forgot_password", { email });
  return { ok: res.ok, message: res.message };
};

export const verifyForgotPasswordOtp = async (email: string, input_otp: string): Promise<SimpleResult> => {
  const res = await apiPost("/verify_forgot_password_otp", { email, input_otp });
  return { ok: res.ok, message: res.message };
};

export const updatePassword = async (email: string, new_password: string): Promise<SimpleResult> => {
  const res = await apiPost("/update_password", { email, new_password });
  return { ok: res.ok, message: res.message };
};

/**
 * Google OAuth begins with a full-page browser navigation to this URL (it
 * 302-redirects to Google). Never call via fetch/XHR.
 */
export const googleLoginUrl = `${API_BASE_URL}/google/start`;
