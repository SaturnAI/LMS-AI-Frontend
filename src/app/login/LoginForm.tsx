"use client";

/** Login form (React Hook Form + Zod + login mutation). Rendered on: `/login`. */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GoogleIcon from "@/components/GoogleIcon";
import { useLogin } from "@/hooks/use-auth";
import { googleLoginUrl } from "@/lib/api";
import { loginSchema, type LoginValues } from "@/lib/validations/auth";

export default function LoginForm() {
  const router = useRouter();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setServerError(null);
    try {
      const result = await loginMutation.mutateAsync(values);
      if (result.ok) {
        router.replace("/dashboard");
        return;
      }
      setServerError(result.message);
    } catch {
      setServerError("Something went wrong signing in. Please try again.");
    }
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Sign in to continue to LMS AI.</p>

      {serverError && (
        <div
          role="alert"
          className="mt-5 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
        >
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            autoComplete="username"
            autoFocus
            aria-invalid={!!errors.email}
            disabled={isSubmitting}
            {...register("email")}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              disabled={isSubmitting}
              {...register("password")}
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
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>

        <div className="flex justify-end text-sm">
          <a href="/forgot-password" className="font-medium text-primary hover:underline">
            Forgot password?
          </a>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={isSubmitting}
        onClick={() => {
          window.location.href = googleLoginUrl;
        }}
      >
        <GoogleIcon />
        Continue with Google
      </Button>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <a href="mailto:" className="font-medium text-primary hover:underline">
          Contact your admin
        </a>
      </p>
    </div>
  );
}
