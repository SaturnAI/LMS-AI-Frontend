/** Zod schema for add/update super admin. Backend types phone_number as int (AddUpdateUserRequest). */
import { z } from "zod";

// phone_number stays a string in the form (matches the <input> value); the
// caller converts to a number at submit time, since the backend schema for
// super admins types it as int.
export const superAdminSchema = z.object({
  email: z.string().min(1, "Enter an email.").email("Enter a valid email address."),
  name: z.string().min(1, "Enter a name.").max(100, "Name is too long."),
  phone_number: z.string().regex(/^\d{6,15}$/, "Enter a valid phone number."),
});
export type SuperAdminValues = z.infer<typeof superAdminSchema>;
