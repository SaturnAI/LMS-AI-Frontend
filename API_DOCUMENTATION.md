# LMS-AI Backend — API Documentation

A complete reference of every HTTP API in this project, what each one expects, what it returns, the feature it serves, and everything the frontend needs to integrate against it.

---

## 1. Overview & Global Conventions

**Framework:** FastAPI (Python, ASGI). Run with `uvicorn app:app --reload --port 5015`.

**Base URL:** All routes are mounted under the `/api` prefix.

| Router | Mount prefix | Feature area |
|--------|-------------|--------------|
| `authentication` | `/api` | Login, logout, OAuth, password reset, profile |
| `super_admin_master` | `/api/super_admin_master` | Managing platform super admins |
| `company_master` | `/api/company_master` | Managing tenant companies (by super admins) + company profile |
| `employee_master` | `/api/employee_master` | Managing a company's employees |
| `lead_management` | `/api/lead_management` | CRM leads + comments |
| `log_manager` | `/api/log_manager` | Activity/audit logs |

### Authentication mechanism
- Auth is **cookie-based**, not header token based. On login the server sets an **`auth_token` cookie** — `HttpOnly`, `Secure`, `SameSite=lax` (production) / `none` (non-production), `max_age = 7 days` (`MAX_AUTH_DAYS`).
- The cookie value is a **Fernet-encrypted blob** of the user's identity (`email`, `role`, and for company admins/employees `tenant_id`). The frontend never reads or parses it — it is `HttpOnly`.
- **Frontend must send `credentials: "include"`** on every request (fetch/axios `withCredentials: true`) so the cookie travels.
- Protected endpoints are guarded by the `@requires_verification` decorator. If the cookie is missing/invalid/expired the server responds **401** with `{"is_successful": false, "message": "Unverified User, please login again."}` and clears the cookie. The frontend should treat any 401 as "redirect to login".

### Roles (`UserRoles`)
- `super_admin` — platform owner; manages companies and other super admins. Has no `tenant_id` until they "enter" a company via `set_tenant_id`.
- `company_admin` — admin of one company (tenant). `tenant_id` = their company's `company_code`.
- `employee` — belongs to a company; access is gated by per-page permissions.

### Employee permissions (`EmployeePermissionType`)
Each employee has a `permissions` object with a value per page: `view`, `edit`, or `not_allowed`.
Pages currently permissioned: `employee_master`, `leads`, `log_manager`.
- `@employee_page_permission(page)` — allows super_admin & company_admin always; employee needs anything other than `not_allowed`.
- `@employee_edit_permission(page)` — allows super_admin & company_admin always; employee needs exactly `edit`.

### Standard response envelope
Almost every JSON response follows:
```json
{ "is_successful": true | false, "message": "human readable string", ...extra fields }
```
- On success `is_successful` is `true`; extra data is in named fields (`user_data`, `leads`, `companies`, etc.).
- On failure `is_successful` is `false` with a `message`. HTTP status codes are set meaningfully (400/401/403/404/409/500).

### Common status codes
| Code | Meaning in this app |
|------|--------------------|
| 200 | Success |
| 201 | Created (add super admin) |
| 400 | Bad/invalid/incomplete request data (Pydantic validation, missing fields) |
| 401 | Not authenticated / bad login / expired session |
| 403 | Authenticated but not authorized (role/permission) |
| 404 | Resource not found |
| 409 | Conflict (company email already exists) |
| 415 | Unsupported media type (profile picture) |
| 500 | Server error / DB not acknowledged / email send failure |
| 503 | Google OAuth not configured |

### CORS
Allowed origins are configured in `config.py`:
- Production: `https://lmsai.saturnai.in`
- Non-production adds: `http://localhost:3000`

`allow_credentials=True`; methods `GET, POST, PUT, DELETE, OPTIONS`; headers `Authorization, Content-Type, Accept, Origin, X-Requested-With`. **The frontend origin must be in this list**, otherwise cookies will be blocked.

### File uploads
- Middleware cap on any upload: **5 MB** (`MAX_UPLOAD_SIZE_MB`).
- Company logo / profile picture hard limit: **2 MB** (`MAX_LOGO_SIZE_MB`).
- Allowed image types: **JPEG, PNG** only (validated by magic bytes, not extension).
- Uploads use `multipart/form-data`.

---

## 2. Authentication APIs (`/api`)

### 2.1 `GET /api/google/start`
- **Feature:** Begin Google OAuth login (SSO).
- **Auth:** None.
- **Request:** No body. (GET)
- **Behavior:** Generates a CSRF `state`, stores it (10 min TTL), and **302 redirects** the browser to Google's consent screen.
- **Output:** `302 Redirect` to Google. If OAuth not configured → `503 {"is_successful": false, "message": "Google OAuth is not configured on this server."}`.
- **Frontend:** Navigate the browser (`window.location.href = "/api/google/start"`); do not call via fetch/XHR.

### 2.2 `GET /api/google/callback`
- **Feature:** Google OAuth redirect target — completes login.
- **Auth:** None (validated via `state`).
- **Query params:** `code`, `state`, `error` (all supplied by Google).
- **Behavior:** Validates `state`, exchanges `code` for tokens, verifies identity, confirms the email exists and is enabled in `user_master`, then sets the `auth_token` cookie and **302 redirects to the frontend home (`/`)**.
- **Errors:** On failure redirects to `{frontend}/login?error=...` or returns a 400/401 JSON error.
- **Frontend:** This is a browser redirect endpoint; not called directly. After it lands the user on `/`, call `GET /api/get_profile` to hydrate state.

### 2.3 `POST /api/login`
- **Feature:** Email/password login.
- **Auth:** None.
- **Request body (JSON):**
```json
{ "email": "user@example.com", "password": "secret" }
```
- **Success (200):** Sets `auth_token` cookie and returns:
```json
{
  "is_successful": true,
  "is_user_exists": true,
  "message": "Sign-in successful!",
  "name": "Jane Doe",
  "role": "company_admin",
  "permissions": { "employee_master": "edit", "leads": "view", "log_manager": "not_allowed" },
  "email": "user@example.com"
}
```
(`auth_token` is stripped from the body and delivered as a cookie.)
- **Failure (401):** `{"is_successful": false, "is_user_exists": true|false, "message": "..."}`
  - Wrong credentials → `"Email ID and Password doesn't match."`
  - Unknown/not-permitted email → `"Email ID: ... is not permitted on the portal."`
  - Locked out → `"Account is locked. Try again later. Lockout ends in H hours, M minutes, and S seconds."`
- **Brute-force protection:** temporary lock every 5 failed attempts (`LOCKOUT_COUNTER`); hard 1-day lock at 20 attempts (`MAX_LOGIN_ATTEMPTS_PER_DAY`).
- **Frontend:** Store `role`/`name`/`permissions` in app state to drive routing & menu visibility.

### 2.4 `GET /api/logout`
- **Feature:** Log the user out.
- **Auth:** Required (cookie).
- **Request:** No body.
- **Output (200):** `{"is_successful": true, "message": "User successfully logged out!"}` and clears the `auth_token` cookie. `404` if user not found.
- **Frontend:** Clear client state, redirect to login.

### 2.5 `POST /api/forgot_password`
- **Feature:** Request a password-reset OTP by email.
- **Auth:** None.
- **Request body (JSON):** `{ "email": "user@example.com" }`
- **Output:** `200 {"is_successful": true, "message": "OTP has been sent to your email ..."}` or `400` with a reason (email not found, or `"You can only request a new OTP every 30 seconds."`).
- **Notes:** OTP is 6 digits, valid for 10 minutes (`OTP_VALIDITY_MINUTES`); resend cooldown 30s (`OTP_RESEND_COOLDOWN_SECONDS`).

### 2.6 `POST /api/verify_forgot_password_otp`
- **Feature:** Verify the reset OTP.
- **Auth:** None.
- **Request body (JSON):** `{ "email": "user@example.com", "input_otp": "123456" }`
- **Output:** `200 {"is_successful": true, "message": "OTP verified successfully!"}` grants a **5-minute window** to set a new password, or `400` with reason (`"Invalid OTP, ... You have N attempts left."`, `"Maximum OTP attempts reached. ..."` after 5 tries).

### 2.7 `POST /api/update_password`
- **Feature:** Set a new password after OTP verification (forgot-password flow).
- **Auth:** None (gated by the server-side `update_password_permission` flag set by step 2.6).
- **Request body (JSON):** `{ "email": "user@example.com", "new_password": "NewPass123" }`
- **Output:** `200 {"is_successful": true, "message": "Password updated successfully!"}` or `403 {"is_successful": false, "message": "You do not have permission to update the password"}` (window expired / OTP not verified).

### 2.8 `GET /api/get_profile`
- **Feature:** Fetch the logged-in user's profile (used to hydrate the app after load/login).
- **Auth:** Required.
- **Request:** No body.
- **Output (200):**
```json
{
  "is_successful": true,
  "message": "Profile fetched successfully",
  "email": "user@example.com",
  "role": "company_admin",
  "name": "Jane Doe",
  "phone_number": "9998887777",
  "permissions": { "employee_master": "edit", "leads": "edit", "log_manager": "view" },
  "designation": "Sales Head",
  "created_at": "06-07-2026",
  "tenant_id": "…",            // present for employees
  "company_data": { …company fields except billing_plan/employee_limit/logo… }  // for company_admin/employee
}
```
- `404` if user not found. **Frontend:** call on app boot; if 401/404 → send to login.

### 2.9 `POST /api/update_user_profile`
- **Feature:** Update your own profile details.
- **Auth:** Required.
- **Request body (JSON)** — all optional (`UpdateUserDetails`):
```json
{ "name": "Jane D.", "phone_number": "9998887777", "designation": "VP Sales" }
```
(`name` ≤100, `phone_number` ≤15, `designation` ≤100 chars.)
- **Output:** `200 {"is_successful": true, "message": "User '...' updated successfully."}`, `"No changes were made..."`, or `400/404`.

### 2.10 `POST /api/change_password`
- **Feature:** Change password while logged in (knowing the old one).
- **Auth:** Required.
- **Request body (JSON):** `{ "old_password": "old", "new_password": "new" }`
- **Output:** `200 {"is_successful": true, "message": "Password updated successfully."}` or `400` (`"Old password is incorrect."`).

### 2.11 `POST /api/update_profile_picture`
- **Feature:** Upload/replace the user's profile picture.
- **Auth:** Required.
- **Request:** `multipart/form-data` with field **`profile_picture`** (JPEG/PNG, ≤2 MB).
- **Output:** `200 {"is_successful": true, "message": "Profile picture updated successfully"}`; `400` if missing, `415` if unsupported type, `404` if user missing.

### 2.12 `GET /api/fetch_profile_picture`
- **Feature:** Retrieve the user's profile picture.
- **Auth:** Required.
- **Output:** On success, **binary image stream** (`StreamingResponse`, raw bytes) — not JSON. On failure `404 {"is_successful": false, "message": "Profile picture not found"}`.
- **Frontend:** Use as an image `src` (with credentials) or fetch as blob → object URL. Handle the 404 JSON case for "no picture".

### 2.13 `DELETE /api/delete_profile_picture`
- **Feature:** Remove the user's profile picture.
- **Auth:** Required.
- **Output:** `200 {"is_successful": true, "message": "Profile picture deleted successfully"}` or `404`.

### 2.14 `GET /api/`
- **Feature:** Built-in HTML test page for Google login (dev only). Returns an HTML document. Not used by the real frontend.

---

## 3. Super Admin Master APIs (`/api/super_admin_master`)
All require login **and** `super_admin` role (`@super_admin_only`). Non-super-admins get `403`.

### 3.1 `POST /add_super_admin`
- **Feature:** Create a new super admin (auto-generates password, emails it).
- **Request body (JSON)** (`AddUpdateUserRequest`): `{ "email": "new@x.com", "name": "New Admin", "phone_number": 9998887777 }`
  - Note: `phone_number` is typed as **int** in this schema.
- **Output:** `201 {"is_successful": true, "message": "Super Admin Successfully Added."}`; `400` if invalid or email already exists; `500` on DB/email failure.

### 3.2 `POST /update_super_admin`
- **Feature:** Update a super admin's name/phone.
- **Request body (JSON):** `{ "email": "existing@x.com", "name": "Updated", "phone_number": 9998887777 }`
- **Output:** `200` success / "No changes were made..."; `404` if not found.

### 3.3 `GET /fetch_all_super_admins`
- **Feature:** List all super admins.
- **Output (200):**
```json
{
  "is_successful": true,
  "message": "Successfully Fetched the Data!",
  "user_data": [ { "code": "...", "email": "...", "name": "...", "phone_number": "...", "is_disabled": false } ]
}
```

### 3.4 `GET /disable_super_admin`
- **Feature:** Disable a super admin.
- **Query param:** `disable_user_email` (string).
- **Output:** `200` success; `403` if trying to disable yourself; `404` if not found/already disabled.

### 3.5 `GET /enable_super_admin`
- **Feature:** Re-enable a disabled super admin.
- **Query param:** `enable_user_email` (string).
- **Output:** `200` success; `404` if not found/already enabled.

---

## 4. Company Master APIs (`/api/company_master`)
Company management endpoints require `super_admin`; `update_company_profile` and `fetch_company_logo` are for the company admin themselves.

### 4.1 `POST /add_company`  *(super_admin)*
- **Feature:** Create a company (tenant) and its company-admin user (password auto-emailed).
- **Request:** `multipart/form-data`. Fields map to `CompanyDetails`:
  - Required: `legal_name`, `phone_number`, `address_1`, `country`, `state`, `city`, `pincode`, `employee_limit` (int ≥1), `name` (contact), `email` (contact/admin login).
  - Optional: `address_2`, `industry`, `company_size`, `gst_number`, `pan_number`, `billing_plan` (`free`|`pro`|`enterprise`, default `free`), `mobile_number`, `website`, `designation`.
  - Optional file: **`company_logo`** (JPEG/PNG ≤2 MB).
- **Output:** `200 {"is_successful": true, "message": "Company '...' added successfully."}`; `400` invalid/missing email; `409` if email already exists; `500` on failure.

### 4.2 `POST /update_company`  *(super_admin)*
- **Feature:** Update a company's full details.
- **Request:** `multipart/form-data` — all `CompanyDetails` fields **plus** `company_code` (identifies the company). Optional `company_logo` file. Email cannot be changed.
- **Output:** `200` success / "No changes were made..."; `400` if `company_code` missing/invalid; `404` if not found.

### 4.3 `POST /update_company_profile`  *(company_admin only)*
- **Feature:** Company admin edits their own company profile.
- **Auth:** Login required; endpoint itself enforces `role == company_admin` (else `403`).
- **Request:** `multipart/form-data`, fields map to `CompanyProfile` (same as CompanyDetails **without** `billing_plan`, `employee_limit`, `email`). Optional `company_logo`.
- **Output:** `200` success / "No changes were made..."; `400`/`404` on error.

### 4.4 `GET /fetch_company_logo`  *(any logged-in user)*
- **Feature:** Get the logged-in user's own company logo (uses their `tenant_id`).
- **Output:** Binary image stream, or `404 {"is_successful": false, "message": "Company logo not found."}`.

### 4.5 `GET /fetch_company_logo_for_super_admin`  *(super_admin)*
- **Feature:** Get any company's logo.
- **Query param:** `tenant_id` (required — the company's `company_code`).
- **Output:** Binary image stream, or `404`.

### 4.6 `GET /disable_company`  *(super_admin)*
- **Feature:** Disable a company — disables the company admin **and all its employees**.
- **Query param:** `company_code` (required).
- **Output:** `200 {"is_successful": true, "message": "Company admin and all associated users have been disabled.", "modified_count": N}`; `404` if no admin for that code.

### 4.7 `GET /enable_company`  *(super_admin)*
- **Feature:** Re-enable a company's admin (only the admin, not employees).
- **Query param:** `company_code` (required).
- **Output:** `200` success / "already enabled"; `404` if not found.

### 4.8 `GET /fetch_all_companies`  *(super_admin)*
- **Feature:** List all companies with a computed `is_disabled` (derived from the company admin's status).
- **Output (200):**
```json
{
  "is_successful": true,
  "message": "Fetched N companies successfully.",
  "companies": [ { …CompanyDetails fields…, "company_code": "...", "is_disabled": false } ]
}
```
(Excludes `created_at`, `updated_at`, `company_logo`.)

### 4.9 `GET /set_tenant_id`  *(super_admin)*
- **Feature:** "Impersonate"/enter a specific company's context so subsequent tenant-scoped calls (employees, leads, logs) operate on that company. Rewrites the auth cookie to include `tenant_id`.
- **Query param:** `company_code` (required).
- **Output:** `200 {"is_successful": true, "message": "Tenant ID set successfully."}` + refreshed `auth_token` cookie; `404` if company admin not found/disabled.
- **Frontend:** Call this before navigating a super admin into a company's employee/leads/logs screens.

### 4.10 `GET /remove_tenant_id`  *(super_admin)*
- **Feature:** Exit company context (drops `tenant_id` from the cookie).
- **Output:** `200 {"is_successful": true, "message": "Tenant ID removed successfully."}` + refreshed cookie.

---

## 5. Employee Master APIs (`/api/employee_master`)
Tenant-scoped (operate on `decoded_data["tenant_id"]`). Guarded by employee page/edit permission on the `employee_master` page. Super admins must have set a tenant context first (§4.9).

### 5.1 `POST /add_employee`  *(edit permission)*
- **Feature:** Add an employee to the current company (password auto-emailed). Enforces the company's `employee_limit`.
- **Request body (JSON)** (`EmployeeDetails`):
```json
{
  "name": "Bob",
  "email": "bob@company.com",
  "phone_number": "9998887777",
  "permissions": { "employee_master": "view", "leads": "edit", "log_manager": "not_allowed" }
}
```
  - `permissions` values each ∈ `view|edit|not_allowed` (default `not_allowed` if omitted).
- **Output:** `200 {"is_successful": true, "message": "Employee added successfully"}`; `400` if invalid, duplicate email, or limit reached; `404` if company not found.

### 5.2 `POST /update_employee`  *(edit permission)*
- **Feature:** Update an employee's name/phone/permissions.
- **Request body (JSON):** same shape as `EmployeeDetails` (`email` identifies the employee; email itself isn't changed).
- **Output:** `200 {"is_successful": true, "message": "Employee updated successfully"}`; `404` if not found; `400` if invalid.

### 5.3 `GET /fetch_enabled_employees`  *(view permission)*
- **Feature:** List active employees of the company.
- **Output (200):**
```json
{
  "is_successful": true,
  "message": "Successfully Fetched the Data!",
  "user_data": [ { "code": "...", "email": "...", "name": "...", "phone_number": "...", "permissions": { … } } ]
}
```

### 5.4 `GET /fetch_disabled_employees`  *(view permission)*
- Same as 5.3 but returns disabled employees.

### 5.5 `GET /enable_employee`  *(edit permission)*
- **Feature:** Re-enable a disabled employee (re-checks `employee_limit`).
- **Query param:** `employee_to_enable_email` (string).
- **Output:** `200` success; `400` if limit reached; `404` if not found/already active.

### 5.6 `GET /disable_employee`  *(edit permission)*
- **Feature:** Disable an employee.
- **Query param:** `employee_to_disable_email` (string).
- **Output:** `200` success; `403` if disabling yourself; `404` if not found/already disabled.

---

## 6. Lead Management APIs (`/api/lead_management`)
CRM feature. All require login and are tenant-scoped. Employees only see leads where they are a listed sales representative; super_admin/company_admin see all leads in the tenant.

### 6.1 `POST /add_lead`
- **Feature:** Create a lead.
- **Request body (JSON)** (`LeadDetails`):
```json
{
  "name": "Acme Corp Deal",
  "company_name": "Acme Corp",
  "sales_representative_emails": ["rep1@company.com", "rep2@company.com"],
  "email": "contact@acme.com",
  "alt_email": null,
  "phone_number": "9998887777",
  "alt_phone_number": null,
  "designation": "CTO",
  "company_registered_address": { "address_1": "...", "address_2": "...", "country": "...", "state": "...", "city": "...", "pincode": "..." },
  "company_operational_address": { … same shape … },
  "status": "new",
  "source": "website",
  "priority": "medium",
  "remarks": "Interested in enterprise plan",
  "person_of_contact": { "name": "...", "email": "...", "phone_number": "...", "designation": "..." }
}
```
  - Required: `name` (≤200), `company_name` (≤100), and **at least one** valid `sales_representative_emails` (each rep must be an active user in the tenant).
  - Enums: `status` ∈ `new|contacted|nurture|qualified|won|lost` (default `new`); `source` ∈ `website|referral|cold_call|social_media|email_campaign|trade_show|other` (default `other`); `priority` ∈ `high|medium|low` (default `medium`).
- **Output:** `200 {"is_successful": true, "message": "Lead created successfully."}`; `400` if invalid, no reps, or reps not found; `500` on failure.

### 6.2 `POST /update_lead`
- **Feature:** Update an existing lead.
- **Request body (JSON):** same as `LeadDetails` **plus `lead_code`** (identifies the lead). Same rep-validation rules.
- **Output:** `200 {"is_successful": true, "message": "Lead updated successfully."}`; `400` invalid/no reps; `404` if lead not found in tenant.

### 6.3 `GET /fetch_leads`
- **Feature:** Paginated, searchable list of leads with embedded sales reps and comments.
- **Query params:** `batch_number` (default 1), `batch_size` (default 10), `search_query` (default ""; matches name, company, emails, phones, designation, rep emails — case-insensitive).
- **Output (200):**
```json
{
  "is_successful": true,
  "leads": [
    {
      "name": "...", "company_name": "...", "email": "...", "status": "new", "source": "website", "priority": "medium",
      "lead_code": "...", "created_by": "...", "created_at": "13:45:00 06-07-2026 UTC",
      "sales_representatives": [ { "name": "...", "email": "...", "phone_number": "..." } ],
      "comments": [ { "comment": "...", "comment_id": "...", "created_at": "…UTC", "commented_user": { "name": "...", "email": "...", "phone_number": "..." } } ]
    }
  ],
  "total": 42,
  "total_pages": 5
}
```
  (Excludes internal fields: `tenant_id`, `updated_at`, `updated_by`, `sales_representative_emails`.)
- **Notes:** Employees are automatically restricted to leads they're assigned to.

### 6.4 `GET /fetch_dropdown_sales_representatives`
- **Feature:** List assignable sales reps (active employees + company admin) for lead-assignment dropdowns.
- **Output (200):**
```json
{ "is_successful": true, "sales_representatives": [ { "email": "...", "name": "...", "phone_number": "..." } ] }
```

### 6.5 `POST /add_comment`
- **Feature:** Add a comment/note to a lead.
- **Request body (JSON):** `{ "lead_code": "…", "comment": "Called, will follow up" }`
  - `comment` max length 200 chars.
- **Output:** `200 {"is_successful": true, "message": "Comment added."}`; `404` if lead not found; `400` if comment too long.

---

## 7. Log Manager API (`/api/log_manager`)
Activity/audit trail. Tenant-scoped. Guarded by `log_manager` page view permission.

### 7.1 `GET /get_logs`  *(view permission)*
- **Feature:** Paginated, searchable activity log for the tenant. Logs are auto-written on add/edit/enable/disable of employees, leads, and comments.
- **Query params:** `page_number` (default 1), `search_query` (default ""; matches performer name/email, action type, message). **Page size is fixed at 50.**
- **Output (200):**
```json
{
  "is_successful": true,
  "total_pages": 3,
  "activity_logs": [
    {
      "action_performer_name": "Jane Doe",
      "action_performer_email": "jane@company.com",
      "action_type": "add",
      "message": "Jane Doe(jane@company.com) ADDED a new lead: Acme Deal(contact@acme.com)",
      "created_at": "13:45:00 06-07-2026 UTC"
    }
  ]
}
```
  - `action_type` ∈ `add|edit|delete|disable|enable|uploaded`.

---

## 8. Endpoint Quick Reference

| Method | Path | Auth | Role/Permission | Content type |
|--------|------|------|-----------------|--------------|
| GET | `/api/google/start` | none | — | — |
| GET | `/api/google/callback` | none | — | — |
| POST | `/api/login` | none | — | JSON |
| GET | `/api/logout` | cookie | any | — |
| POST | `/api/forgot_password` | none | — | JSON |
| POST | `/api/verify_forgot_password_otp` | none | — | JSON |
| POST | `/api/update_password` | none* | — | JSON |
| GET | `/api/get_profile` | cookie | any | — |
| POST | `/api/update_user_profile` | cookie | any | JSON |
| POST | `/api/change_password` | cookie | any | JSON |
| POST | `/api/update_profile_picture` | cookie | any | multipart |
| GET | `/api/fetch_profile_picture` | cookie | any | → image |
| DELETE | `/api/delete_profile_picture` | cookie | any | — |
| GET | `/api/` | none | — | → HTML |
| POST | `/api/super_admin_master/add_super_admin` | cookie | super_admin | JSON |
| POST | `/api/super_admin_master/update_super_admin` | cookie | super_admin | JSON |
| GET | `/api/super_admin_master/fetch_all_super_admins` | cookie | super_admin | — |
| GET | `/api/super_admin_master/disable_super_admin` | cookie | super_admin | — |
| GET | `/api/super_admin_master/enable_super_admin` | cookie | super_admin | — |
| POST | `/api/company_master/add_company` | cookie | super_admin | multipart |
| POST | `/api/company_master/update_company` | cookie | super_admin | multipart |
| POST | `/api/company_master/update_company_profile` | cookie | company_admin | multipart |
| GET | `/api/company_master/fetch_company_logo` | cookie | any | → image |
| GET | `/api/company_master/fetch_company_logo_for_super_admin` | cookie | super_admin | → image |
| GET | `/api/company_master/disable_company` | cookie | super_admin | — |
| GET | `/api/company_master/enable_company` | cookie | super_admin | — |
| GET | `/api/company_master/fetch_all_companies` | cookie | super_admin | — |
| GET | `/api/company_master/set_tenant_id` | cookie | super_admin | — |
| GET | `/api/company_master/remove_tenant_id` | cookie | super_admin | — |
| POST | `/api/employee_master/add_employee` | cookie | employee_master:edit | JSON |
| POST | `/api/employee_master/update_employee` | cookie | employee_master:edit | JSON |
| GET | `/api/employee_master/fetch_enabled_employees` | cookie | employee_master:view | — |
| GET | `/api/employee_master/fetch_disabled_employees` | cookie | employee_master:view | — |
| GET | `/api/employee_master/enable_employee` | cookie | employee_master:edit | — |
| GET | `/api/employee_master/disable_employee` | cookie | employee_master:edit | — |
| POST | `/api/lead_management/add_lead` | cookie | any (tenant) | JSON |
| POST | `/api/lead_management/update_lead` | cookie | any (tenant) | JSON |
| GET | `/api/lead_management/fetch_leads` | cookie | any (tenant) | — |
| GET | `/api/lead_management/fetch_dropdown_sales_representatives` | cookie | any (tenant) | — |
| POST | `/api/lead_management/add_comment` | cookie | any (tenant) | JSON |
| GET | `/api/log_manager/get_logs` | cookie | log_manager:view | — |

\* `update_password` has no cookie but is gated server-side by the OTP-verified permission flag.

---

## 9. Frontend Integration Notes / Gotchas

1. **Always send cookies.** Use `fetch(url, { credentials: "include" })` or axios `withCredentials: true`. Without it, the `auth_token` cookie won't be sent and every protected call returns 401.
2. **Origin must be allow-listed.** Local dev must run on `http://localhost:3000` (or add your origin to `config.py` `NON_PRODUCTION_ORIGINS`). Cross-origin cookies require it.
3. **401 handling.** Any protected endpoint may return 401 with the cookie cleared → globally intercept and route to login.
4. **Role-driven UI.** After login/`get_profile`, use `role` + `permissions` to gate menus. Employee page access follows the view/edit/not_allowed matrix (§1).
5. **Super admin → tenant context.** A super admin has no `tenant_id`. Before hitting employee/lead/log endpoints for a specific company, call `GET /set_tenant_id?company_code=…` (rewrites the cookie), and `GET /remove_tenant_id` when leaving.
6. **Binary endpoints.** `fetch_profile_picture`, `fetch_company_logo`, and `fetch_company_logo_for_super_admin` return a raw image stream on success but a **JSON 404** when absent — branch on status/content-type. Easiest: set them as an `<img src>` with credentials and provide an `onerror` fallback.
7. **Multipart endpoints.** `add_company`, `update_company`, `update_company_profile`, and `update_profile_picture` require `FormData` (do **not** set `Content-Type` manually; let the browser add the boundary). Logos/pictures: JPEG/PNG only, ≤2 MB; any upload ≤5 MB.
8. **Identifiers.** Companies are keyed by `company_code`; leads by `lead_code`; employees/super admins by `email`. Send exactly these on update/enable/disable calls.
9. **`add_super_admin` phone is an int** (`AddUpdateUserRequest.phone_number: int`), whereas employee/company phone numbers are strings. Send accordingly.
10. **Pagination differs:** leads use `batch_number`/`batch_size` (default 10) and return `total` + `total_pages`; logs use `page_number` with a fixed size of 50 and return `total_pages` only.
11. **Timestamps** in leads/logs are pre-formatted strings like `"13:45:00 06-07-2026 UTC"`; `created_at` in profile is `"DD-MM-YYYY"`. No parsing on the server side — display as-is or parse client-side.
12. **Passwords for new users** (super admin, company admin, employee) are auto-generated and **emailed** — there is no "set password" field on creation. Users then use forgot-password or change-password flows.

---

## 10. Environment / Deployment Reference

**Required environment variables** (`.env`, loaded via `src/cred.py`):

| Var | Purpose |
|-----|---------|
| `MONGO_URL` | MongoDB connection string |
| `DB_NAME` | Database name |
| `ENVIRONMENT` | `LOCAL` \| `UAT` \| `PRODUCTION` (controls cookie SameSite & CORS) |
| `REDIRECT_URL` | Base frontend URL for OAuth redirects |
| `SMTP_EMAIL`, `SMTP_PASSWORD`, `SMTP_PROVIDER`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USE_SSL` | Transactional email (passwords, OTPs) |
| `SMTP_OAUTH_CLIENT_ID`, `SMTP_OAUTH_CLIENT_SECRET`, `SMTP_OAUTH_REFRESH_TOKEN` | Google OAuth / Gmail XOAUTH2 |
| `OPENAI_API_KEY` | Reserved for AI features (schema present, not yet wired to an endpoint) |

**MongoDB collections:** `user_master`, `company_master`, `leads`, `lead_comments`, `log_manager`, `auth_key_store`, `oauth_states`.

**Run locally:** `uvicorn app:app --reload --port 5015` (or `./start-serve.sh`).

**Security background jobs:** A daemon thread rotates the Fernet auth-encryption key every 30 days (`KEY_ROTATION_DAYS`); MongoDB indexes are ensured on startup. Neither affects frontend integration directly, but note that a key rotation can invalidate old sessions.
