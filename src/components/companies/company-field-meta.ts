/**
 * Placeholder/hint/max-length metadata for company form fields, shared between the
 * scrollable and stepped CompanyFormDialog prototypes so both stay in sync.
 * maxLength values mirror src/lib/validations/company.ts.
 */
import type { CompanyValues } from "@/lib/validations/company";

interface FieldMeta {
  placeholder?: string;
  hint?: string;
  maxLength?: number;
  /** Mirrors src/lib/validations/company.ts — drives the "*" marker instead of an "(optional)" label suffix. */
  required?: boolean;
}

type CompanyFieldKey = Exclude<keyof CompanyValues, "billing_plan">;

export const COMPANY_FIELD_META: Record<CompanyFieldKey, FieldMeta> = {
  email: { placeholder: "name@company.com", required: true },
  legal_name: { placeholder: "e.g., Acme Technologies Pvt. Ltd.", maxLength: 200, required: true },
  name: { placeholder: "e.g., Priya Sharma", maxLength: 100, required: true },
  phone_number: {
    placeholder: "e.g., 9876543210",
    maxLength: 15,
    hint: "Numbers only, 6-15 digits.",
    required: true,
  },
  address_1: { placeholder: "Street address, building, area", maxLength: 200, required: true },
  address_2: { placeholder: "Apartment, suite, floor", maxLength: 200 },
  city: { placeholder: "e.g., Bengaluru", maxLength: 100, required: true },
  state: { placeholder: "e.g., Karnataka", maxLength: 100, required: true },
  country: { placeholder: "e.g., India", maxLength: 100, required: true },
  pincode: { placeholder: "e.g., 560001", maxLength: 10, required: true },
  employee_limit: { placeholder: "e.g., 50", hint: "Whole number, at least 1.", required: true },
  industry: { placeholder: "e.g., Software & IT Services", maxLength: 100 },
  company_size: { placeholder: "e.g., 51-200 employees", maxLength: 50 },
  website: { placeholder: "e.g., example.com", maxLength: 200, hint: "Include the domain, e.g. example.com." },
  mobile_number: { placeholder: "e.g., 9876543210", maxLength: 15, hint: "Numbers only, 6-15 digits." },
  gst_number: { placeholder: "e.g., 22AAAAA0000A1Z5", maxLength: 15, hint: "15-character GSTIN." },
  pan_number: { placeholder: "e.g., AAAAA9999A", maxLength: 10, hint: "10-character PAN." },
  designation: { placeholder: "e.g., HR Manager", maxLength: 100 },
};

/** Uppercases GST/PAN before they leave the form — validation accepts either case, storage should be consistent. */
export function normalizeGstPan<T extends { gst_number?: string; pan_number?: string }>(values: T): T {
  return {
    ...values,
    gst_number: values.gst_number?.toUpperCase(),
    pan_number: values.pan_number?.toUpperCase(),
  };
}
