import { API_BASE_URL, apiDelete, apiGet, apiPost, apiPostForm } from "./client";

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

export interface UpdateUserProfileInput {
  name?: string;
  phone_number?: string;
  designation?: string;
}

/** Update the signed-in user's own profile details (all fields optional). */
export async function updateUserProfile(input: UpdateUserProfileInput): Promise<{ message: string }> {
  const res = await apiPost<{ message: string }>("/update_user_profile", input);
  if (!res.ok) throw new Error(res.message);
  return { message: res.message };
}

/** Change password while logged in (requires knowing the current one). */
export async function changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
  const res = await apiPost<{ message: string }>("/change_password", {
    old_password: oldPassword,
    new_password: newPassword,
  });
  if (!res.ok) throw new Error(res.message);
  return { message: res.message };
}

/** Upload/replace the profile picture. JPEG/PNG only, ≤2MB. */
export async function updateProfilePicture(file: File): Promise<{ message: string }> {
  const res = await apiPostForm<{ message: string }>("/update_profile_picture", { profile_picture: file });
  if (!res.ok) throw new Error(res.message);
  return { message: res.message };
}

export async function deleteProfilePicture(): Promise<{ message: string }> {
  const res = await apiDelete<{ message: string }>("/delete_profile_picture");
  if (!res.ok) throw new Error(res.message);
  return { message: res.message };
}

/** Streams the user's picture on success, or a JSON 404 when absent — use as an <img src> with an onError fallback. */
export const profilePictureUrl = `${API_BASE_URL}/fetch_profile_picture`;
