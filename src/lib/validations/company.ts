/** Zod schemas for company forms (super_admin add/update + company_admin profile). Logo files are handled outside RHF (see CompanyFormDialog). */
import { z } from "zod";

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const PHONE_REGEX = /^\d{6,15}$/;
const WEBSITE_REGEX = /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/\S*)?$/i;

const baseFields = {
  legal_name: z.string().min(1, "Enter the legal name.").max(200, "Too long."),
  phone_number: z.string().regex(PHONE_REGEX, "Enter a valid phone number (6-15 digits)."),
  address_1: z.string().min(1, "Enter an address.").max(200, "Too long."),
  address_2: z.string().max(200, "Too long.").optional(),
  country: z.string().min(1, "Enter a country.").max(100, "Too long."),
  state: z.string().min(1, "Enter a state.").max(100, "Too long."),
  city: z.string().min(1, "Enter a city.").max(100, "Too long."),
  pincode: z.string().min(1, "Enter a pincode.").max(10, "Too long."),
  name: z.string().min(1, "Enter a contact name.").max(100, "Too long."),
  industry: z.string().max(100, "Too long.").optional(),
  company_size: z.string().max(50, "Too long.").optional(),
  gst_number: z
    .string()
    .max(15, "Too long.")
    .optional()
    .refine((v) => !v || GSTIN_REGEX.test(v.toUpperCase()), "Enter a valid 15-character GSTIN (e.g. 22AAAAA0000A1Z5)."),
  pan_number: z
    .string()
    .max(10, "Too long.")
    .optional()
    .refine((v) => !v || PAN_REGEX.test(v.toUpperCase()), "Enter a valid 10-character PAN (e.g. AAAAA9999A)."),
  mobile_number: z
    .string()
    .max(15, "Too long.")
    .optional()
    .refine((v) => !v || PHONE_REGEX.test(v), "Enter a valid mobile number (6-15 digits)."),
  website: z
    .string()
    .max(200, "Too long.")
    .optional()
    .refine((v) => !v || WEBSITE_REGEX.test(v), "Enter a valid website (e.g. example.com)."),
  designation: z.string().max(100, "Too long.").optional(),
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
