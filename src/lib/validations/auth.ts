/** Zod schemas + inferred types for the auth forms (login + forgot-password steps). */
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Enter your email.").email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const forgotEmailSchema = z.object({
  email: z.string().min(1, "Enter your email.").email("Enter a valid email address."),
});
export type ForgotEmailValues = z.infer<typeof forgotEmailSchema>;

export const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code from your email."),
});
export type OtpValues = z.infer<typeof otpSchema>;

export const newPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters."),
    confirm: z.string().min(1, "Re-enter your password."),
  })
  .refine((d) => d.newPassword === d.confirm, {
    message: "Passwords do not match.",
    path: ["confirm"],
  });
export type NewPasswordValues = z.infer<typeof newPasswordSchema>;
