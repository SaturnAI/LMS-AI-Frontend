"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { forgotPassword, verifyForgotPasswordOtp, updatePassword } from "@/lib/api";
import styles from "@/components/authForm.module.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

type Step = "email" | "otp" | "password" | "done";

const GENERIC_ERROR = "Something went wrong. Please try again.";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function reset(nextStep: Step) {
    setError(null);
    setInfo(null);
    setStep(nextStep);
  }

  async function submitEmail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!EMAIL_RE.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await forgotPassword(email);
      if (res.ok) {
        setError(null);
        setInfo(res.message || "We've sent a 6-digit code to your email.");
        setStep("otp");
      } else {
        setError(res.message);
      }
    } catch {
      setError(GENERIC_ERROR);
    }
    setSubmitting(false);
  }

  async function submitOtp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await verifyForgotPasswordOtp(email, otp);
      if (res.ok) {
        reset("password");
      } else {
        setError(res.message);
      }
    } catch {
      setError(GENERIC_ERROR);
    }
    setSubmitting(false);
  }

  async function submitPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (newPassword !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await updatePassword(email, newPassword);
      if (res.ok) {
        setStep("done");
      } else {
        // Most likely the 5-minute window expired.
        setError(res.message);
      }
    } catch {
      setError(GENERIC_ERROR);
    }
    setSubmitting(false);
  }

  async function resendOtp() {
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      const res = await forgotPassword(email);
      if (res.ok) {
        setInfo(res.message || "A new code has been sent.");
      } else {
        setError(res.message);
      }
    } catch {
      setError(GENERIC_ERROR);
    }
    setSubmitting(false);
  }

  return (
    <div className={styles.wrap}>
      {step === "email" && (
        <>
          <h1 className={styles.title}>Reset your password</h1>
          <p className={styles.subtitle}>Enter your email and we&apos;ll send you a verification code.</p>
          {error && <div className={styles.error} role="alert">{error}</div>}
          <form className={styles.form} onSubmit={submitEmail} noValidate>
            <label className={styles.field}>
              <span className={styles.label}>Email</span>
              <input
                className={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="username"
                autoFocus
                required
                disabled={submitting}
              />
            </label>
            <button type="submit" className={styles.primary} disabled={submitting}>
              {submitting ? "Sending…" : "Send code"}
            </button>
          </form>
          <div className={styles.subtleRow}>
            <Link className={styles.link} href="/login">← Back to sign in</Link>
          </div>
        </>
      )}

      {step === "otp" && (
        <>
          <h1 className={styles.title}>Enter the code</h1>
          <p className={styles.subtitle}>
            We sent a 6-digit code to <strong>{email}</strong>. It expires in 10 minutes.
          </p>
          {info && <div className={styles.success} role="status">{info}</div>}
          {error && <div className={styles.error} role="alert">{error}</div>}
          <form className={styles.form} onSubmit={submitOtp} noValidate>
            <label className={styles.field}>
              <span className={styles.label}>Verification code</span>
              <input
                className={`${styles.input} ${styles.otpInput}`}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="••••••"
                autoFocus
                required
                disabled={submitting}
              />
            </label>
            <button type="submit" className={styles.primary} disabled={submitting}>
              {submitting ? "Verifying…" : "Verify code"}
            </button>
          </form>
          <div className={styles.subtleRow}>
            <button type="button" className={styles.linkButton} onClick={() => reset("email")} disabled={submitting}>
              ← Change email
            </button>
            <button type="button" className={styles.linkButton} onClick={resendOtp} disabled={submitting}>
              Resend code
            </button>
          </div>
        </>
      )}

      {step === "password" && (
        <>
          <h1 className={styles.title}>Set a new password</h1>
          <p className={styles.subtitle}>Choose a new password for <strong>{email}</strong>.</p>
          {error && <div className={styles.error} role="alert">{error}</div>}
          <form className={styles.form} onSubmit={submitPassword} noValidate>
            <label className={styles.field}>
              <span className={styles.label}>New password</span>
              <div className={styles.passwordWrap}>
                <input
                  className={styles.input}
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  autoFocus
                  required
                  disabled={submitting}
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
            <label className={styles.field}>
              <span className={styles.label}>Confirm password</span>
              <input
                className={styles.input}
                type={showPassword ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter your new password"
                autoComplete="new-password"
                required
                disabled={submitting}
              />
            </label>
            <button type="submit" className={styles.primary} disabled={submitting}>
              {submitting ? "Updating…" : "Update password"}
            </button>
          </form>
        </>
      )}

      {step === "done" && (
        <>
          <h1 className={styles.title}>Password updated</h1>
          <p className={styles.subtitle}>Your password has been changed. You can now sign in with it.</p>
          <div className={styles.success} role="status">All set!</div>
          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              router.push("/login");
            }}
          >
            <button type="submit" className={styles.primary}>Back to sign in</button>
          </form>
        </>
      )}
    </div>
  );
}
