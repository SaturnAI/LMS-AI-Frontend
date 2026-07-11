"use client";

/** Forgot-password stepper: email → OTP → new password. Rendered on: `/forgot-password`. */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword, verifyForgotPasswordOtp, updatePassword } from "@/lib/api";
import {
  forgotEmailSchema,
  otpSchema,
  newPasswordSchema,
  type ForgotEmailValues,
  type OtpValues,
  type NewPasswordValues,
} from "@/lib/validations/auth";

type Step = "email" | "otp" | "password" | "done";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const emailForm = useForm<ForgotEmailValues>({
    resolver: zodResolver(forgotEmailSchema),
    defaultValues: { email: "" },
  });
  const otpForm = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });
  const passwordForm = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { newPassword: "", confirm: "" },
  });

  async function onSubmitEmail(values: ForgotEmailValues) {
    setError(null);
    const res = await forgotPassword(values.email);
    if (res.ok) {
      setEmail(values.email);
      setInfo(res.message || "We've sent a 6-digit code to your email.");
      setStep("otp");
    } else {
      setError(res.message);
    }
  }

  async function onSubmitOtp(values: OtpValues) {
    setError(null);
    const res = await verifyForgotPasswordOtp(email, values.otp);
    if (res.ok) {
      setInfo(null);
      setStep("password");
    } else {
      setError(res.message);
    }
  }

  async function onSubmitPassword(values: NewPasswordValues) {
    setError(null);
    const res = await updatePassword(email, values.newPassword);
    if (res.ok) {
      setStep("done");
    } else {
      setError(res.message);
    }
  }

  async function resend() {
    setError(null);
    setInfo(null);
    const res = await forgotPassword(email);
    if (res.ok) setInfo(res.message || "A new code has been sent.");
    else setError(res.message);
  }

  return (
    <div className="w-full max-w-sm">
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
        >
          {error}
        </div>
      )}
      {info && step !== "done" && (
        <div
          role="status"
          className="mb-4 rounded-lg border border-brand-lime/60 bg-brand-lime/20 px-3.5 py-2.5 text-sm text-foreground"
        >
          {info}
        </div>
      )}

      {step === "email" && (
        <>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Reset your password</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a verification code.
          </p>
          <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} noValidate className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="username"
                autoFocus
                aria-invalid={!!emailForm.formState.errors.email}
                {...emailForm.register("email")}
              />
              {emailForm.formState.errors.email && (
                <p className="text-sm text-destructive">{emailForm.formState.errors.email.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={emailForm.formState.isSubmitting}>
              {emailForm.formState.isSubmitting ? "Sending…" : "Send code"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            <Link href="/login" className="font-medium text-primary hover:underline">
              ← Back to sign in
            </Link>
          </div>
        </>
      )}

      {step === "otp" && (
        <>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Enter the code</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            We sent a 6-digit code to <strong>{email}</strong>. It expires in 10 minutes.
          </p>
          <form onSubmit={otpForm.handleSubmit(onSubmitOtp)} noValidate className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="otp">Verification code</Label>
              <Input
                id="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="••••••"
                autoFocus
                className="text-center text-lg tracking-[0.5em]"
                aria-invalid={!!otpForm.formState.errors.otp}
                {...otpForm.register("otp")}
              />
              {otpForm.formState.errors.otp && (
                <p className="text-sm text-destructive">{otpForm.formState.errors.otp.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={otpForm.formState.isSubmitting}>
              {otpForm.formState.isSubmitting ? "Verifying…" : "Verify code"}
            </Button>
          </form>
          <div className="mt-6 flex justify-between text-sm">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setInfo(null);
                setStep("email");
              }}
              className="font-medium text-primary hover:underline"
            >
              ← Change email
            </button>
            <button type="button" onClick={resend} className="font-medium text-primary hover:underline">
              Resend code
            </button>
          </div>
        </>
      )}

      {step === "password" && (
        <>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Set a new password</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Choose a new password for <strong>{email}</strong>.
          </p>
          <form
            onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
            noValidate
            className="mt-6 flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="newPassword">New password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  autoFocus
                  aria-invalid={!!passwordForm.formState.errors.newPassword}
                  {...passwordForm.register("newPassword")}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 text-xs font-medium text-primary"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {passwordForm.formState.errors.newPassword && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter your new password"
                autoComplete="new-password"
                aria-invalid={!!passwordForm.formState.errors.confirm}
                {...passwordForm.register("confirm")}
              />
              {passwordForm.formState.errors.confirm && (
                <p className="text-sm text-destructive">{passwordForm.formState.errors.confirm.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={passwordForm.formState.isSubmitting}>
              {passwordForm.formState.isSubmitting ? "Updating…" : "Update password"}
            </Button>
          </form>
        </>
      )}

      {step === "done" && (
        <>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Password updated</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Your password has been changed. You can now sign in with it.
          </p>
          <Button className="mt-6 w-full" onClick={() => router.push("/login")}>
            Back to sign in
          </Button>
        </>
      )}
    </div>
  );
}
