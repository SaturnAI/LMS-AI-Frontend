/**
 * Placeholder/hint/max-length metadata for the lead form's fields, split by the
 * shape they belong to (core lead fields vs. the repeated address shape vs. the
 * point-of-contact shape). maxLength values mirror src/lib/validations/lead.ts.
 */

interface FieldMeta {
  placeholder?: string;
  hint?: string;
  maxLength?: number;
  /** Mirrors the zod schema — drives the "*" marker instead of an "(optional)" label suffix. */
  required?: boolean;
}

export const LEAD_CORE_FIELD_META = {
  name: { placeholder: "e.g., Jordan Blake", maxLength: 200, required: true },
  company_name: { placeholder: "e.g., Acme Technologies", maxLength: 100, required: true },
  email: { placeholder: "name@company.com", maxLength: 200 },
  phone_number: { placeholder: "e.g., 9876543210", maxLength: 15, hint: "Numbers only, 6-15 digits." },
  designation: { placeholder: "e.g., Head of Procurement", maxLength: 100 },
  remarks: { placeholder: "Any additional context about this lead…", maxLength: 1000 },
} satisfies Record<string, FieldMeta>;

export const LEAD_ADDRESS_FIELD_META = {
  address_1: { placeholder: "Street address, building, area", maxLength: 200 },
  address_2: { placeholder: "Apartment, suite, floor", maxLength: 200 },
  city: { placeholder: "e.g., Bengaluru", maxLength: 100 },
  state: { placeholder: "e.g., Karnataka", maxLength: 100 },
  country: { placeholder: "e.g., India", maxLength: 100 },
  pincode: { placeholder: "e.g., 560001", maxLength: 10 },
} satisfies Record<string, FieldMeta>;

export const LEAD_CONTACT_FIELD_META = {
  name: { placeholder: "e.g., Priya Sharma", maxLength: 100 },
  email: { placeholder: "name@company.com", maxLength: 200 },
  phone_number: { placeholder: "e.g., 9876543210", maxLength: 15, hint: "Numbers only, 6-15 digits." },
  designation: { placeholder: "e.g., Procurement Manager", maxLength: 100 },
} satisfies Record<string, FieldMeta>;
