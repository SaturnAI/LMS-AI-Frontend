/** Placeholder/hint/max-length metadata for the employee form's fields. Mirrors src/lib/validations/employee.ts. */

interface FieldMeta {
  placeholder?: string;
  hint?: string;
  maxLength?: number;
  required?: boolean;
}

export const EMPLOYEE_FIELD_META = {
  name: { placeholder: "e.g., Priya Sharma", maxLength: 100, required: true },
  email: { placeholder: "name@company.com", required: true },
  phone_number: {
    placeholder: "e.g., 9876543210",
    maxLength: 15,
    hint: "Numbers only, 6-15 digits.",
    required: true,
  },
} satisfies Record<string, FieldMeta>;
