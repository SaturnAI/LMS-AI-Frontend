"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import GoogleIcon from "@/components/GoogleIcon";
import { login, googleLoginUrl } from "@/lib/api";
import styles from "@/components/authForm.module.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    // Light client-side guard to avoid needless round-trips; the API remains
    // the source of truth for full validation.
    if (!EMAIL_RE.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await login(email, password);
      if (result.ok) {
        // Session is now set via the auth_token cookie.
        router.replace("/dashboard");
        return; // navigating away — leave `submitting` true
      }
      setError(result.message);
    } catch {
      setError("Something went wrong signing in. Please try again.");
    }
    setSubmitting(false);
  }

  function handleGoogleLogin() {
    // Full-page navigation — this endpoint 302-redirects to Google.
    window.location.href = googleLoginUrl;
  }

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>Welcome back</h1>
      <p className={styles.subtitle}>Sign in to continue to LMS AI.</p>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <label className={styles.field}>
          <span className={styles.label}>Email</span>
          <input
            className={styles.input}
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            autoComplete="username"
            autoFocus
            required
            disabled={submitting}
            aria-invalid={!!error}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Password</span>
          <div className={styles.passwordWrap}>
            <input
              className={styles.input}
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              disabled={submitting}
              aria-invalid={!!error}
            />
            <button
              type="button"
              className={styles.reveal}
              onClick={() => setShowPassword((s) => !s)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        <div className={styles.row}>
          <a className={styles.link} href="/forgot-password">
            Forgot password?
          </a>
        </div>

        <button type="submit" className={styles.primary} disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className={styles.divider}>
        <span>or</span>
      </div>

      <button type="button" className={styles.google} onClick={handleGoogleLogin} disabled={submitting}>
        <GoogleIcon />
        Continue with Google
      </button>

      <p className={styles.footer}>
        Don&apos;t have an account? <a className={styles.link} href="mailto:">Contact your admin</a>
      </p>
    </div>
  );
}
