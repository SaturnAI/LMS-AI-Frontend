/** Zod schema for add/update lead. Sales rep emails are edited outside RHF (see LeadFormDialog) and validated separately. */
import { z } from "zod";

const PHONE_REGEX = /^\d{6,15}$/;
const emailSchema = z.string().email();

const optionalEmail = z
  .string()
  .max(200, "Too long.")
  .optional()
  .refine((v) => !v || emailSchema.safeParse(v).success, "Enter a valid email address.");

const optionalPhone = z
  .string()
  .max(15, "Too long.")
  .optional()
  .refine((v) => !v || PHONE_REGEX.test(v), "Enter a valid phone number (6-15 digits).");

const addressSchema = z.object({
  address_1: z.string().max(200, "Too long.").optional(),
  address_2: z.string().max(200, "Too long.").optional(),
  country: z.string().max(100, "Too long.").optional(),
  state: z.string().max(100, "Too long.").optional(),
  city: z.string().max(100, "Too long.").optional(),
  pincode: z.string().max(10, "Too long.").optional(),
});

const personOfContactSchema = z.object({
  name: z.string().max(100, "Too long.").optional(),
  email: optionalEmail,
  phone_number: optionalPhone,
  designation: z.string().max(100, "Too long.").optional(),
});

export const leadSchema = z.object({
  name: z.string().min(1, "Enter a lead name.").max(200, "Too long."),
  company_name: z.string().min(1, "Enter a company name.").max(100, "Too long."),
  email: optionalEmail,
  phone_number: optionalPhone,
  designation: z.string().max(100, "Too long.").optional(),
  status: z.enum(["new", "contacted", "nurture", "qualified", "won", "lost"]),
  source: z.enum(["website", "referral", "cold_call", "social_media", "email_campaign", "trade_show", "other"]),
  priority: z.enum(["high", "medium", "low"]),
  remarks: z.string().max(1000, "Too long.").optional(),
  company_registered_address: addressSchema.optional(),
  company_operational_address: addressSchema.optional(),
  person_of_contact: personOfContactSchema.optional(),
});
export type LeadValues = z.infer<typeof leadSchema>;

export const commentSchema = z.object({
  comment: z.string().min(1, "Enter a comment.").max(200, "Comments are limited to 200 characters."),
});
export type CommentValues = z.infer<typeof commentSchema>;
