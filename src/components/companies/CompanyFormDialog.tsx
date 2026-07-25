"use client";

/**
 * Add/Edit dialog for a company (super_admin). Multi-step wizard with a full-width
 * horizontal step bar (not a sidebar), so the whole dialog width goes to the
 * field grid instead of being split into narrow columns. Multipart form incl.
 * optional logo upload.
 */
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Building2, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/FormField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddCompany, useUpdateCompany } from "@/hooks/use-companies";
import { companySchema, type CompanyValues } from "@/lib/validations/company";
import { COMPANY_FIELD_META, normalizeGstPan } from "./company-field-meta";
import { cn } from "@/lib/utils";
import type { BillingPlan, Company, CompanyDetailsInput } from "@/lib/api";

interface CompanyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: Company | null;
}

const emptyValues: CompanyValues = {
  legal_name: "",
  phone_number: "",
  address_1: "",
  address_2: "",
  country: "",
  state: "",
  city: "",
  pincode: "",
  name: "",
  email: "",
  industry: "",
  company_size: "",
  gst_number: "",
  pan_number: "",
  mobile_number: "",
  website: "",
  designation: "",
  employee_limit: "",
  billing_plan: "free",
};

const STEPS = [
  {
    key: "basic",
    title: "Basic info",
    fields: ["legal_name", "name", "email", "phone_number", "designation"] as const,
  },
  {
    key: "address",
    title: "Address",
    fields: ["address_1", "address_2", "city", "state", "country", "pincode"] as const,
  },
  {
    key: "business",
    title: "Business details",
    fields: [
      "employee_limit",
      "billing_plan",
      "industry",
      "company_size",
      "website",
      "mobile_number",
      "gst_number",
      "pan_number",
    ] as const,
  },
];

const INPUT_HEIGHT = "h-10";

export function CompanyFormDialog({ open, onOpenChange, editing }: CompanyFormDialogProps) {
  const isEdit = Boolean(editing);
  const addMutation = useAddCompany();
  const updateMutation = useUpdateCompany();
  const [logo, setLogo] = useState<File | null>(null);
  const [step, setStep] = useState(0);
  const isLastStep = step === STEPS.length - 1;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<CompanyValues>({ resolver: zodResolver(companySchema), defaultValues: emptyValues });

  useEffect(() => {
    if (!open) return;
    setLogo(null);
    setStep(0);
    reset(
      editing
        ? {
            legal_name: editing.legal_name,
            phone_number: editing.phone_number ?? "",
            address_1: editing.address_1 ?? "",
            address_2: editing.address_2 ?? "",
            country: editing.country ?? "",
            state: editing.state ?? "",
            city: editing.city ?? "",
            pincode: editing.pincode ?? "",
            name: editing.name,
            email: editing.email,
            industry: editing.industry ?? "",
            company_size: editing.company_size ?? "",
            gst_number: editing.gst_number ?? "",
            pan_number: editing.pan_number ?? "",
            mobile_number: editing.mobile_number ?? "",
            website: editing.website ?? "",
            designation: editing.designation ?? "",
            employee_limit: editing.employee_limit != null ? String(editing.employee_limit) : "",
            billing_plan: editing.billing_plan ?? "free",
          }
        : emptyValues,
    );
  }, [open, editing, reset]);

  async function handleNext() {
    const valid = await trigger(STEPS[step].fields as unknown as (keyof CompanyValues)[]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(values: CompanyValues) {
    const normalized = normalizeGstPan(values);
    const input: CompanyDetailsInput = {
      ...normalized,
      employee_limit: Number(normalized.employee_limit),
      company_logo: logo ?? undefined,
    };
    try {
      const result = isEdit
        ? await updateMutation.mutateAsync({ companyCode: editing!.company_code, input })
        : await addMutation.mutateAsync(input);
      toast.success(result.message || (isEdit ? "Company updated." : "Company added."));
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const billingPlan = watch("billing_plan");
  const values = watch();
  const fieldGridClass = "grid gap-x-8 gap-y-5 sm:grid-cols-2";
  // All steps are stacked in the same grid cell so the dialog's height is always the tallest
  // step's height — switching steps never resizes the dialog. Inactive steps stay mounted
  // (so their field values are never lost) but are invisible, non-interactive, and inert.
  function stepPanelClass(active: boolean) {
    return cn(
      "col-start-1 row-start-1 transition-all duration-300",
      active ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-5xl">
        <div className="flex items-center gap-4 border-b p-6 sm:p-8 sm:pb-6">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Building2 className="size-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-lg font-semibold">
              {isEdit ? "Edit company" : "Add a new company"}
            </DialogTitle>
            <DialogDescription className="mt-1">
              {isEdit
                ? "Update this company's details. Email cannot be changed."
                : "A company admin account will be created and the password emailed automatically."}
            </DialogDescription>
          </div>
        </div>

        <div className="border-b bg-gradient-to-r from-secondary to-brand-sky/25 px-6 py-5 sm:px-8">
          <ol className="flex items-center">
            {STEPS.map((s, i) => (
              <li key={s.key} className={cn("flex items-center", i < STEPS.length - 1 && "flex-1")}>
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-200",
                      i < step
                        ? "bg-primary text-primary-foreground"
                        : i === step
                          ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                          : "border-2 border-primary/15 bg-background text-muted-foreground",
                    )}
                  >
                    {i < step ? <Check className="size-4" /> : i + 1}
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium whitespace-nowrap",
                      i <= step ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {s.title}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "mx-4 h-0.5 flex-1 rounded-full transition-colors duration-200",
                      i < step ? "bg-primary" : "bg-primary/15",
                    )}
                  />
                )}
              </li>
            ))}
          </ol>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isLastStep) e.preventDefault();
          }}
        >
          <div className="p-6 sm:p-8">
            <div className="relative grid">
              <div
                key="step-basic"
                inert={step !== 0}
                aria-hidden={step !== 0}
                className={cn(fieldGridClass, stepPanelClass(step === 0))}
              >
                <FormField
                  label="Legal name"
                  required={COMPANY_FIELD_META.legal_name.required}
                  error={errors.legal_name?.message}
                  maxLength={COMPANY_FIELD_META.legal_name.maxLength}
                  currentLength={values.legal_name?.length}
                >
                  <Input
                    className={INPUT_HEIGHT}
                    placeholder={COMPANY_FIELD_META.legal_name.placeholder}
                    maxLength={COMPANY_FIELD_META.legal_name.maxLength}
                    disabled={isSubmitting}
                    {...register("legal_name")}
                  />
                </FormField>
                <FormField
                  label="Contact name"
                  required={COMPANY_FIELD_META.name.required}
                  error={errors.name?.message}
                  maxLength={COMPANY_FIELD_META.name.maxLength}
                  currentLength={values.name?.length}
                >
                  <Input
                    className={INPUT_HEIGHT}
                    placeholder={COMPANY_FIELD_META.name.placeholder}
                    maxLength={COMPANY_FIELD_META.name.maxLength}
                    disabled={isSubmitting}
                    {...register("name")}
                  />
                </FormField>
                <FormField label="Email" required={COMPANY_FIELD_META.email.required} error={errors.email?.message}>
                  <Input
                    className={INPUT_HEIGHT}
                    type="email"
                    placeholder={COMPANY_FIELD_META.email.placeholder}
                    disabled={isEdit || isSubmitting}
                    {...register("email")}
                  />
                </FormField>
                <FormField
                  label="Phone number"
                  required={COMPANY_FIELD_META.phone_number.required}
                  error={errors.phone_number?.message}
                  hint={COMPANY_FIELD_META.phone_number.hint}
                  maxLength={COMPANY_FIELD_META.phone_number.maxLength}
                  currentLength={values.phone_number?.length}
                >
                  <Input
                    className={INPUT_HEIGHT}
                    type="tel"
                    inputMode="numeric"
                    placeholder={COMPANY_FIELD_META.phone_number.placeholder}
                    maxLength={COMPANY_FIELD_META.phone_number.maxLength}
                    disabled={isSubmitting}
                    {...register("phone_number")}
                  />
                </FormField>
                <FormField
                  label="Designation"
                  maxLength={COMPANY_FIELD_META.designation.maxLength}
                  currentLength={values.designation?.length}
                >
                  <Input
                    className={INPUT_HEIGHT}
                    placeholder={COMPANY_FIELD_META.designation.placeholder}
                    maxLength={COMPANY_FIELD_META.designation.maxLength}
                    disabled={isSubmitting}
                    {...register("designation")}
                  />
                </FormField>
              </div>

              <div
                key="step-address"
                inert={step !== 1}
                aria-hidden={step !== 1}
                className={cn(fieldGridClass, stepPanelClass(step === 1))}
              >
                <FormField
                  label="Address"
                  required={COMPANY_FIELD_META.address_1.required}
                  error={errors.address_1?.message}
                  className="sm:col-span-2"
                  maxLength={COMPANY_FIELD_META.address_1.maxLength}
                  currentLength={values.address_1?.length}
                >
                  <Input
                    className={INPUT_HEIGHT}
                    placeholder={COMPANY_FIELD_META.address_1.placeholder}
                    maxLength={COMPANY_FIELD_META.address_1.maxLength}
                    disabled={isSubmitting}
                    {...register("address_1")}
                  />
                </FormField>
                <FormField
                  label="Address line 2"
                  className="sm:col-span-2"
                  maxLength={COMPANY_FIELD_META.address_2.maxLength}
                  currentLength={values.address_2?.length}
                >
                  <Input
                    className={INPUT_HEIGHT}
                    placeholder={COMPANY_FIELD_META.address_2.placeholder}
                    maxLength={COMPANY_FIELD_META.address_2.maxLength}
                    disabled={isSubmitting}
                    {...register("address_2")}
                  />
                </FormField>
                <FormField
                  label="City"
                  required={COMPANY_FIELD_META.city.required}
                  error={errors.city?.message}
                  maxLength={COMPANY_FIELD_META.city.maxLength}
                  currentLength={values.city?.length}
                >
                  <Input
                    className={INPUT_HEIGHT}
                    placeholder={COMPANY_FIELD_META.city.placeholder}
                    maxLength={COMPANY_FIELD_META.city.maxLength}
                    disabled={isSubmitting}
                    {...register("city")}
                  />
                </FormField>
                <FormField
                  label="State"
                  required={COMPANY_FIELD_META.state.required}
                  error={errors.state?.message}
                  maxLength={COMPANY_FIELD_META.state.maxLength}
                  currentLength={values.state?.length}
                >
                  <Input
                    className={INPUT_HEIGHT}
                    placeholder={COMPANY_FIELD_META.state.placeholder}
                    maxLength={COMPANY_FIELD_META.state.maxLength}
                    disabled={isSubmitting}
                    {...register("state")}
                  />
                </FormField>
                <FormField
                  label="Country"
                  required={COMPANY_FIELD_META.country.required}
                  error={errors.country?.message}
                  maxLength={COMPANY_FIELD_META.country.maxLength}
                  currentLength={values.country?.length}
                >
                  <Input
                    className={INPUT_HEIGHT}
                    placeholder={COMPANY_FIELD_META.country.placeholder}
                    maxLength={COMPANY_FIELD_META.country.maxLength}
                    disabled={isSubmitting}
                    {...register("country")}
                  />
                </FormField>
                <FormField
                  label="Pincode"
                  required={COMPANY_FIELD_META.pincode.required}
                  error={errors.pincode?.message}
                  maxLength={COMPANY_FIELD_META.pincode.maxLength}
                  currentLength={values.pincode?.length}
                >
                  <Input
                    className={INPUT_HEIGHT}
                    placeholder={COMPANY_FIELD_META.pincode.placeholder}
                    maxLength={COMPANY_FIELD_META.pincode.maxLength}
                    disabled={isSubmitting}
                    {...register("pincode")}
                  />
                </FormField>
              </div>

              <div
                key="step-business"
                inert={step !== 2}
                aria-hidden={step !== 2}
                className={cn(fieldGridClass, stepPanelClass(step === 2))}
              >
                <FormField
                  label="Employee limit"
                  required={COMPANY_FIELD_META.employee_limit.required}
                  error={errors.employee_limit?.message}
                  hint={COMPANY_FIELD_META.employee_limit.hint}
                >
                  <Input
                    className={INPUT_HEIGHT}
                    inputMode="numeric"
                    placeholder={COMPANY_FIELD_META.employee_limit.placeholder}
                    disabled={isSubmitting}
                    {...register("employee_limit")}
                  />
                </FormField>
                <FormField label="Billing plan">
                  <Select
                    value={billingPlan}
                    onValueChange={(v) => setValue("billing_plan", v as BillingPlan)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className={cn("w-full", INPUT_HEIGHT)}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField
                  label="Industry"
                  maxLength={COMPANY_FIELD_META.industry.maxLength}
                  currentLength={values.industry?.length}
                >
                  <Input
                    className={INPUT_HEIGHT}
                    placeholder={COMPANY_FIELD_META.industry.placeholder}
                    maxLength={COMPANY_FIELD_META.industry.maxLength}
                    disabled={isSubmitting}
                    {...register("industry")}
                  />
                </FormField>
                <FormField
                  label="Company size"
                  maxLength={COMPANY_FIELD_META.company_size.maxLength}
                  currentLength={values.company_size?.length}
                >
                  <Input
                    className={INPUT_HEIGHT}
                    placeholder={COMPANY_FIELD_META.company_size.placeholder}
                    maxLength={COMPANY_FIELD_META.company_size.maxLength}
                    disabled={isSubmitting}
                    {...register("company_size")}
                  />
                </FormField>
                <FormField
                  label="Website"
                  error={errors.website?.message}
                  hint={COMPANY_FIELD_META.website.hint}
                  maxLength={COMPANY_FIELD_META.website.maxLength}
                  currentLength={values.website?.length}
                >
                  <Input
                    className={INPUT_HEIGHT}
                    type="url"
                    placeholder={COMPANY_FIELD_META.website.placeholder}
                    maxLength={COMPANY_FIELD_META.website.maxLength}
                    disabled={isSubmitting}
                    {...register("website")}
                  />
                </FormField>
                <FormField
                  label="Mobile number"
                  error={errors.mobile_number?.message}
                  hint={COMPANY_FIELD_META.mobile_number.hint}
                  maxLength={COMPANY_FIELD_META.mobile_number.maxLength}
                  currentLength={values.mobile_number?.length}
                >
                  <Input
                    className={INPUT_HEIGHT}
                    type="tel"
                    inputMode="numeric"
                    placeholder={COMPANY_FIELD_META.mobile_number.placeholder}
                    maxLength={COMPANY_FIELD_META.mobile_number.maxLength}
                    disabled={isSubmitting}
                    {...register("mobile_number")}
                  />
                </FormField>
                <FormField
                  label="GST number"
                  error={errors.gst_number?.message}
                  hint={COMPANY_FIELD_META.gst_number.hint}
                  maxLength={COMPANY_FIELD_META.gst_number.maxLength}
                  currentLength={values.gst_number?.length}
                >
                  <Input
                    className={cn(INPUT_HEIGHT, "uppercase placeholder:normal-case")}
                    placeholder={COMPANY_FIELD_META.gst_number.placeholder}
                    maxLength={COMPANY_FIELD_META.gst_number.maxLength}
                    disabled={isSubmitting}
                    {...register("gst_number")}
                  />
                </FormField>
                <FormField
                  label="PAN number"
                  error={errors.pan_number?.message}
                  hint={COMPANY_FIELD_META.pan_number.hint}
                  maxLength={COMPANY_FIELD_META.pan_number.maxLength}
                  currentLength={values.pan_number?.length}
                >
                  <Input
                    className={cn(INPUT_HEIGHT, "uppercase placeholder:normal-case")}
                    placeholder={COMPANY_FIELD_META.pan_number.placeholder}
                    maxLength={COMPANY_FIELD_META.pan_number.maxLength}
                    disabled={isSubmitting}
                    {...register("pan_number")}
                  />
                </FormField>
                <FormField label="Company logo" hint="JPEG or PNG, up to 2MB." className="sm:col-span-2">
                  <Input
                    className={INPUT_HEIGHT}
                    type="file"
                    accept="image/jpeg,image/png"
                    disabled={isSubmitting}
                    onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
                  />
                </FormField>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 border-t p-6 sm:px-8">
            {step > 0 ? (
              <Button type="button" variant="outline" onClick={handleBack} disabled={isSubmitting}>
                <ChevronLeft className="size-4" />
                Back
              </Button>
            ) : (
              <span />
            )}
            {isLastStep ? (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  "Saving…"
                ) : (
                  <>
                    <Check className="size-4" />
                    {isEdit ? "Save changes" : "Add company"}
                  </>
                )}
              </Button>
            ) : (
              <Button type="button" onClick={handleNext}>
                Next
                <ChevronRight className="size-4" />
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
