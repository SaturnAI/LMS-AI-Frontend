// Central API client config + auth calls.
//
// The backend mounts everything under `/api` (see API_DOCUMENTATION.md). It runs
// cross-origin, so EVERY request must send `credentials: "include"` for the
// HttpOnly `auth_token` cookie to travel, and the frontend origin must be
// allow-listed in the backend CORS config.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5015/api";

export type UserRole = "super_admin" | "company_admin" | "employee";
export type PermissionLevel = "view" | "edit" | "not_allowed";

/** Shape returned by POST /api/login on success (auth_token is delivered as a cookie, not in the body). */
export interface LoginSuccess {
  is_successful: true;
  is_user_exists: boolean;
  message: string;
  name: string;
  role: UserRole;
  permissions: Record<string, PermissionLevel>;
  email: string;
}

/** Standard failure envelope used across the API. */
export interface ApiError {
  is_successful: false;
  is_user_exists?: boolean;
  message: string;
}

/** Minimal result for endpoints where we only care about success + the server message. */
export interface SimpleResult {
  ok: boolean;
  message: string;
}

const NETWORK_ERROR = "Unable to reach the server. Check your connection and try again.";
const PARSE_ERROR = "Unexpected server response. Please try again.";

/** POST JSON with credentials and normalise the response to `{ ok, message }`. */
async function postJson(path: string, body: Record<string, unknown>): Promise<SimpleResult> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
  } catch {
    return { ok: false, message: NETWORK_ERROR };
  }

  let data: { is_successful?: boolean; message?: string };
  try {
    data = await res.json();
  } catch {
    return { ok: false, message: PARSE_ERROR };
  }

  return {
    ok: res.ok && data.is_successful === true,
    message: data.message || (res.ok ? "" : "Request failed. Please try again."),
  };
}

export type LoginResult =
  | { ok: true; data: LoginSuccess }
  | { ok: false; message: string };

/**
 * Email/password login. Returns a discriminated result rather than throwing so
 * the UI can render the server's human-readable `message` (wrong credentials,
 * account locked, not permitted, etc.) directly.
 */
export async function login(email: string, password: string): Promise<LoginResult> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
  } catch {
    return { ok: false, message: NETWORK_ERROR };
  }

  let data: LoginSuccess | ApiError;
  try {
    data = (await res.json()) as LoginSuccess | ApiError;
  } catch {
    return { ok: false, message: PARSE_ERROR };
  }

  if (res.ok && data.is_successful) {
    return { ok: true, data };
  }
  return { ok: false, message: data.message || "Sign-in failed. Please try again." };
}

// ---- Forgot-password flow (3 steps) ----

/** Step 1 — request a 6-digit OTP by email (30s resend cooldown, 10-min validity). */
export const forgotPassword = (email: string): Promise<SimpleResult> =>
  postJson("/forgot_password", { email });

/** Step 2 — verify the OTP; on success the server opens a 5-minute window to set a new password. */
export const verifyForgotPasswordOtp = (email: string, input_otp: string): Promise<SimpleResult> =>
  postJson("/verify_forgot_password_otp", { email, input_otp });

/** Step 3 — set the new password (only valid inside the post-OTP window). */
export const updatePassword = (email: string, new_password: string): Promise<SimpleResult> =>
  postJson("/update_password", { email, new_password });

// ---- Session / profile ----

/** Shape returned by GET /api/get_profile. */
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

export type ProfileResult =
  | { ok: true; data: Profile }
  | { ok: false; status: number; message: string };

/**
 * Fetch the logged-in user's profile. Called on app boot to detect an existing
 * session via the auth_token cookie (hence `credentials: "include"`) and drive
 * auto-redirect. A 401 simply means "not logged in".
 */
export async function getProfile(): Promise<ProfileResult> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/get_profile`, { method: "GET", credentials: "include" });
  } catch {
    return { ok: false, status: 0, message: NETWORK_ERROR };
  }
  let data: (Profile & { is_successful?: boolean }) | { is_successful?: boolean; message?: string };
  try {
    data = await res.json();
  } catch {
    return { ok: false, status: res.status, message: PARSE_ERROR };
  }
  if (res.ok && (data as { is_successful?: boolean }).is_successful) {
    return { ok: true, data: data as Profile };
  }
  return { ok: false, status: res.status, message: (data as { message?: string }).message ?? "Not authenticated." };
}

/** Log out — clears the auth_token cookie server-side. */
export async function logout(): Promise<SimpleResult> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/logout`, { method: "GET", credentials: "include" });
  } catch {
    return { ok: false, message: NETWORK_ERROR };
  }
  let data: { is_successful?: boolean; message?: string };
  try {
    data = await res.json();
  } catch {
    return { ok: false, message: PARSE_ERROR };
  }
  return { ok: res.ok && data.is_successful === true, message: data.message ?? "" };
}

/**
 * Google OAuth (SSO) begins with a full-page browser navigation to this URL —
 * it 302-redirects to Google's consent screen, so it must NOT be called via
 * fetch/XHR. Use `window.location.href = googleLoginUrl`.
 */
export const googleLoginUrl = `${API_BASE_URL}/google/start`;
