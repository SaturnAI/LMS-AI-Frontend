// Shared HTTP client for the FastAPI backend.
//
// Everything is mounted under `/api` and auth is cookie-based, so every request
// sends `credentials: "include"`. Responses follow the envelope
// `{ is_successful, message, ...data }`; `request` normalises that into a
// discriminated `ApiResponse`.
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface ApiResponse<T> {
  ok: boolean;
  status: number;
  data: T | null;
  message: string;
}

const NETWORK_ERROR = "Unable to reach the server. Check your connection and try again.";
const PARSE_ERROR = "Unexpected server response. Please try again.";

async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { credentials: "include", ...init });
  } catch {
    return { ok: false, status: 0, data: null, message: NETWORK_ERROR };
  }

  type Envelope = { is_successful?: boolean; message?: string } & Record<string, unknown>;
  let json: Envelope | null = null;
  try {
    json = (await res.json()) as Envelope;
  } catch {
    json = null;
  }

  const ok = res.ok && json?.is_successful === true;
  return {
    ok,
    status: res.status,
    data: ok ? (json as unknown as T) : null,
    message: json?.message ?? (json === null ? PARSE_ERROR : "Request failed. Please try again."),
  };
}

export function apiGet<T>(path: string): Promise<ApiResponse<T>> {
  return request<T>(path, { method: "GET" });
}

export function apiPost<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  return request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/**
 * POST multipart/form-data. Do NOT set Content-Type manually — the browser
 * adds the multipart boundary. `fields` are stringified except File/Blob
 * values (sent as-is) and undefined/null (omitted).
 */
export function apiPostForm<T>(path: string, fields: object): Promise<ApiResponse<T>> {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields as Record<string, unknown>)) {
    if (value === undefined || value === null || value === "") continue;
    if (value instanceof Blob) {
      form.append(key, value);
    } else {
      form.append(key, String(value));
    }
  }
  return request<T>(path, { method: "POST", body: form });
}

export function apiDelete<T>(path: string): Promise<ApiResponse<T>> {
  return request<T>(path, { method: "DELETE" });
}

/** Unwrap a read/list response for query hooks — returns data or throws the server message. */
export function unwrap<T>(res: ApiResponse<T>): T {
  if (!res.ok || res.data === null) throw new Error(res.message || "Request failed.");
  return res.data;
}

/** Build a query string from defined params only. */
export function toQuery(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}
