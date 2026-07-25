/** Zod schema for add/update employee. Permissions are edited separately via PermissionsEditor. */
import { z } from "zod";

export const employeeSchema = z.object({
  name: z.string().min(1, "Enter a name.").max(100, "Name is too long."),
  email: z.string().min(1, "Enter an email.").email("Enter a valid email address."),
  phone_number: z.string().regex(/^\d{6,15}$/, "Enter a valid phone number (6-15 digits)."),
});
export type EmployeeValues = z.infer<typeof employeeSchema>;
