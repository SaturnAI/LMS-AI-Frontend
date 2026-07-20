/** Zod schema for add/update lead. Sales rep emails are edited outside RHF (see LeadFormDialog) and validated separately. */
import { z } from "zod";

const addressSchema = z.object({
  address_1: z.string().optional(),
  address_2: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  pincode: z.string().optional(),
});

const personOfContactSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone_number: z.string().optional(),
  designation: z.string().optional(),
});

export const leadSchema = z.object({
  name: z.string().min(1, "Enter a lead name.").max(200, "Too long."),
  company_name: z.string().min(1, "Enter a company name.").max(100, "Too long."),
  email: z.string().optional(),
  phone_number: z.string().optional(),
  designation: z.string().optional(),
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
