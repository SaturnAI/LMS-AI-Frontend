/** Zod schemas for the Account page: profile details + password change. */
import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Enter a name.").max(100, "Name is too long."),
  phone_number: z.string().max(15, "Too long.").optional(),
  designation: z.string().max(100, "Too long.").optional(),
});
export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    old_password: z.string().min(1, "Enter your current password."),
    new_password: z.string().min(8, "Password must be at least 8 characters."),
    confirm_password: z.string().min(1, "Re-enter your new password."),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  });
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
