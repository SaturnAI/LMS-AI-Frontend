/** Zod schema for add/update employee. Permissions are edited separately via PermissionsEditor. */
import { z } from "zod";

export const employeeSchema = z.object({
  name: z.string().min(1, "Enter a name.").max(100, "Name is too long."),
  email: z.string().min(1, "Enter an email.").email("Enter a valid email address."),
  phone_number: z.string().min(1, "Enter a phone number.").max(15, "Too long."),
});
export type EmployeeValues = z.infer<typeof employeeSchema>;
