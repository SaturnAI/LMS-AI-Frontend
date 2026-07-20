/** Zod schemas for company forms (super_admin add/update + company_admin profile). Logo files are handled outside RHF (see CompanyFormDialog). */
import { z } from "zod";

const baseFields = {
  legal_name: z.string().min(1, "Enter the legal name.").max(200, "Too long."),
  phone_number: z.string().min(1, "Enter a phone number.").max(15, "Too long."),
  address_1: z.string().min(1, "Enter an address."),
  address_2: z.string().optional(),
  country: z.string().min(1, "Enter a country."),
  state: z.string().min(1, "Enter a state."),
  city: z.string().min(1, "Enter a city."),
  pincode: z.string().min(1, "Enter a pincode."),
  name: z.string().min(1, "Enter a contact name."),
  industry: z.string().optional(),
  company_size: z.string().optional(),
  gst_number: z.string().optional(),
  pan_number: z.string().optional(),
  mobile_number: z.string().optional(),
  website: z.string().optional(),
  designation: z.string().optional(),
};

export const companySchema = z.object({
  ...baseFields,
  email: z.string().min(1, "Enter an email.").email("Enter a valid email address."),
  employee_limit: z
    .string()
    .min(1, "Enter the employee limit.")
    .regex(/^\d+$/, "Enter a whole number.")
    .refine((v) => Number(v) >= 1, "Must be at least 1."),
  billing_plan: z.enum(["free", "pro", "enterprise"]),
});
export type CompanyValues = z.infer<typeof companySchema>;

export const companyProfileSchema = z.object(baseFields);
export type CompanyProfileValues = z.infer<typeof companyProfileSchema>;
