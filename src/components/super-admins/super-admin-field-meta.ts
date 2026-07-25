/** Placeholder/hint/max-length metadata for the super admin form's fields. Mirrors src/lib/validations/super-admin.ts. */

interface FieldMeta {
  placeholder?: string;
  hint?: string;
  maxLength?: number;
  required?: boolean;
}

export const SUPER_ADMIN_FIELD_META = {
  email: { placeholder: "name@company.com", required: true },
  name: { placeholder: "e.g., Priya Sharma", maxLength: 100, required: true },
  phone_number: {
    placeholder: "e.g., 9876543210",
    maxLength: 15,
    hint: "Numbers only, 6-15 digits.",
    required: true,
  },
} satisfies Record<string, FieldMeta>;
