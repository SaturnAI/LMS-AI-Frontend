"use client";

/**
 * Add/Edit dialog for a lead. Multi-step wizard matching CompanyFormDialog's
 * pattern (full-width horizontal step bar, no scrollbar): Lead details ->
 * Addresses -> Point of contact & team.
 */
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight, Contact } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/common/FormField";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddLead, useSalesRepDropdown, useUpdateLead } from "@/hooks/use-leads";
import { leadSchema, type LeadValues } from "@/lib/validations/lead";
import { LEAD_ADDRESS_FIELD_META, LEAD_CONTACT_FIELD_META, LEAD_CORE_FIELD_META } from "./lead-field-meta";
import {
  LEAD_PRIORITIES,
  LEAD_SOURCES,
  LEAD_STATUSES,
  type LeadInput,
  type LeadListItem,
  type LeadPriority,
  type LeadSource,
  type LeadStatus,
} from "@/lib/api";

interface LeadFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: LeadListItem | null;
}

const emptyValues: LeadValues = {
  name: "",
  company_name: "",
  email: "",
  phone_number: "",
  designation: "",
  status: "new",
  source: "other",
  priority: "medium",
  remarks: "",
  company_registered_address: {},
  company_operational_address: {},
  person_of_contact: {},
};

const STEPS = [
  {
    key: "details",
    title: "Lead details",
    fields: ["name", "company_name", "designation", "email", "phone_number", "status", "priority", "source", "remarks"] as const,
  },
  {
    key: "addresses",
    title: "Addresses",
    fields: ["company_registered_address", "company_operational_address"] as const,
  },
  {
    key: "contact",
    title: "Point of contact & team",
    fields: ["person_of_contact"] as const,
  },
];

const INPUT_HEIGHT = "h-10";

export function LeadFormDialog({ open, onOpenChange, editing }: LeadFormDialogProps) {
  const isEdit = Boolean(editing);
  const addMutation = useAddLead();
  const updateMutation = useUpdateLead();
  const repsQuery = useSalesRepDropdown();
  const [selectedReps, setSelectedReps] = useState<string[]>([]);
  const [repsError, setRepsError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const isLastStep = step === STEPS.length - 1;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<LeadValues>({ resolver: zodResolver(leadSchema), defaultValues: emptyValues });

  useEffect(() => {
    if (!open) return;
    setRepsError(null);
    setStep(0);
    setSelectedReps(editing?.sales_representatives?.map((r) => r.email) ?? []);
    reset(
      editing
        ? {
            name: editing.name,
            company_name: editing.company_name,
            email: editing.email ?? "",
            phone_number: editing.phone_number ?? "",
            designation: editing.designation ?? "",
            status: editing.status,
            source: editing.source,
            priority: editing.priority,
            remarks: editing.remarks ?? "",
            company_registered_address: editing.company_registered_address ?? {},
            company_operational_address: editing.company_operational_address ?? {},
            person_of_contact: editing.person_of_contact ?? {},
          }
        : emptyValues,
    );
  }, [open, editing, reset]);

  function toggleRep(email: string) {
    setSelectedReps((prev) => (prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]));
  }

  async function handleNext() {
    const valid = await trigger(STEPS[step].fields as unknown as (keyof LeadValues)[]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(values: LeadValues) {
    if (selectedReps.length === 0) {
      setRepsError("Assign at least one sales representative.");
      return;
    }
    const input: LeadInput = { ...values, sales_representative_emails: selectedReps };
    try {
      const result = isEdit
        ? await updateMutation.mutateAsync({ leadCode: editing!.lead_code, input })
        : await addMutation.mutateAsync(input);
      toast.success(result.message || (isEdit ? "Lead updated." : "Lead created."));
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const status = watch("status");
  const source = watch("source");
  const priority = watch("priority");
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
            <Contact className="size-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-lg font-semibold">{isEdit ? "Edit lead" : "Add a new lead"}</DialogTitle>
            <DialogDescription className="mt-1">
              {isEdit ? "Update this lead's details." : "Create a new lead and assign it to your team."}
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
                key="step-details"
                inert={step !== 0}
                aria-hidden={step !== 0}
                className={cn(fieldGridClass, stepPanelClass(step === 0))}
              >
                <FormField
                  label="Lead name"
                  required={LEAD_CORE_FIELD_META.name.required}
                  error={errors.name?.message}
                  className="sm:col-span-2"
                  maxLength={LEAD_CORE_FIELD_META.name.maxLength}
                  currentLength={values.name?.length}
                >
                  <Input
                    className={INPUT_HEIGHT}
                    placeholder={LEAD_CORE_FIELD_META.name.placeholder}
                    maxLength={LEAD_CORE_FIELD_META.name.maxLength}
                    disabled={isSubmitting}
                    {...register("name")}
                  />
                </FormField>
                <FormField
                  label="Company name"
                  required={LEAD_CORE_FIELD_META.company_name.required}
                  error={errors.company_name?.message}
                  maxLength={LEAD_CORE_FIELD_META.company_name.maxLength}
                  currentLength={values.company_name?.length}
                >
                  <Input
                    className={INPUT_HEIGHT}
                    placeholder={LEAD_CORE_FIELD_META.company_name.placeholder}
                    maxLength={LEAD_CORE_FIELD_META.company_name.maxLength}
                    disabled={isSubmitting}
                    {...register("company_name")}
                  />
                </FormField>
                <FormField
                  label="Designation"
                  maxLength={LEAD_CORE_FIELD_META.designation.maxLength}
                  currentLength={values.designation?.length}
                >
                  <Input
                    className={INPUT_HEIGHT}
                    placeholder={LEAD_CORE_FIELD_META.designation.placeholder}
                    maxLength={LEAD_CORE_FIELD_META.designation.maxLength}
                    disabled={isSubmitting}
                    {...register("designation")}
                  />
                </FormField>
                <FormField
                  label="Email"
                  error={errors.email?.message}
                  maxLength={LEAD_CORE_FIELD_META.email.maxLength}
                  currentLength={values.email?.length}
                >
                  <Input
                    className={INPUT_HEIGHT}
                    type="email"
                    placeholder={LEAD_CORE_FIELD_META.email.placeholder}
                    maxLength={LEAD_CORE_FIELD_META.email.maxLength}
                    disabled={isSubmitting}
                    {...register("email")}
                  />
                </FormField>
                <FormField
                  label="Phone number"
                  error={errors.phone_number?.message}
                  hint={LEAD_CORE_FIELD_META.phone_number.hint}
                  maxLength={LEAD_CORE_FIELD_META.phone_number.maxLength}
                  currentLength={values.phone_number?.length}
                >
                  <Input
                    className={INPUT_HEIGHT}
                    type="tel"
                    inputMode="numeric"
                    placeholder={LEAD_CORE_FIELD_META.phone_number.placeholder}
                    maxLength={LEAD_CORE_FIELD_META.phone_number.maxLength}
                    disabled={isSubmitting}
                    {...register("phone_number")}
                  />
                </FormField>

                <FormField label="Status">
                  <Select value={status} onValueChange={(v) => setValue("status", v as LeadStatus)} disabled={isSubmitting}>
                    <SelectTrigger className={cn("w-full", INPUT_HEIGHT)}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Priority">
                  <Select
                    value={priority}
                    onValueChange={(v) => setValue("priority", v as LeadPriority)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className={cn("w-full", INPUT_HEIGHT)}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p} className="capitalize">
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Source" className="sm:col-span-2">
                  <Select value={source} onValueChange={(v) => setValue("source", v as LeadSource)} disabled={isSubmitting}>
                    <SelectTrigger className={cn("w-full", INPUT_HEIGHT)}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_SOURCES.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">
                          {s.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField
                  label="Remarks"
                  error={errors.remarks?.message}
                  className="sm:col-span-2"
                  maxLength={LEAD_CORE_FIELD_META.remarks.maxLength}
                  currentLength={values.remarks?.length}
                >
                  <Textarea
                    rows={3}
                    placeholder={LEAD_CORE_FIELD_META.remarks.placeholder}
                    maxLength={LEAD_CORE_FIELD_META.remarks.maxLength}
                    disabled={isSubmitting}
                    {...register("remarks")}
                  />
                </FormField>
              </div>

              <div
                key="step-addresses"
                inert={step !== 1}
                aria-hidden={step !== 1}
                className={cn("flex flex-col gap-8", stepPanelClass(step === 1))}
              >
                <div>
                  <h3 className="mb-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Registered address
                  </h3>
                  <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                    <FormField
                      label="Address"
                      className="sm:col-span-2"
                      error={errors.company_registered_address?.address_1?.message}
                      maxLength={LEAD_ADDRESS_FIELD_META.address_1.maxLength}
                      currentLength={values.company_registered_address?.address_1?.length}
                    >
                      <Input
                        className={INPUT_HEIGHT}
                        placeholder={LEAD_ADDRESS_FIELD_META.address_1.placeholder}
                        maxLength={LEAD_ADDRESS_FIELD_META.address_1.maxLength}
                        disabled={isSubmitting}
                        {...register("company_registered_address.address_1")}
                      />
                    </FormField>
                    <FormField
                      label="Address line 2"
                      className="sm:col-span-2"
                      error={errors.company_registered_address?.address_2?.message}
                      maxLength={LEAD_ADDRESS_FIELD_META.address_2.maxLength}
                      currentLength={values.company_registered_address?.address_2?.length}
                    >
                      <Input
                        className={INPUT_HEIGHT}
                        placeholder={LEAD_ADDRESS_FIELD_META.address_2.placeholder}
                        maxLength={LEAD_ADDRESS_FIELD_META.address_2.maxLength}
                        disabled={isSubmitting}
                        {...register("company_registered_address.address_2")}
                      />
                    </FormField>
                    <FormField
                      label="City"
                      error={errors.company_registered_address?.city?.message}
                      maxLength={LEAD_ADDRESS_FIELD_META.city.maxLength}
                      currentLength={values.company_registered_address?.city?.length}
                    >
                      <Input
                        className={INPUT_HEIGHT}
                        placeholder={LEAD_ADDRESS_FIELD_META.city.placeholder}
                        maxLength={LEAD_ADDRESS_FIELD_META.city.maxLength}
                        disabled={isSubmitting}
                        {...register("company_registered_address.city")}
                      />
                    </FormField>
                    <FormField
                      label="State"
                      error={errors.company_registered_address?.state?.message}
                      maxLength={LEAD_ADDRESS_FIELD_META.state.maxLength}
                      currentLength={values.company_registered_address?.state?.length}
                    >
                      <Input
                        className={INPUT_HEIGHT}
                        placeholder={LEAD_ADDRESS_FIELD_META.state.placeholder}
                        maxLength={LEAD_ADDRESS_FIELD_META.state.maxLength}
                        disabled={isSubmitting}
                        {...register("company_registered_address.state")}
                      />
                    </FormField>
                    <FormField
                      label="Country"
                      error={errors.company_registered_address?.country?.message}
                      maxLength={LEAD_ADDRESS_FIELD_META.country.maxLength}
                      currentLength={values.company_registered_address?.country?.length}
                    >
                      <Input
                        className={INPUT_HEIGHT}
                        placeholder={LEAD_ADDRESS_FIELD_META.country.placeholder}
                        maxLength={LEAD_ADDRESS_FIELD_META.country.maxLength}
                        disabled={isSubmitting}
                        {...register("company_registered_address.country")}
                      />
                    </FormField>
                    <FormField
                      label="Pincode"
                      error={errors.company_registered_address?.pincode?.message}
                      maxLength={LEAD_ADDRESS_FIELD_META.pincode.maxLength}
                      currentLength={values.company_registered_address?.pincode?.length}
                    >
                      <Input
                        className={INPUT_HEIGHT}
                        placeholder={LEAD_ADDRESS_FIELD_META.pincode.placeholder}
                        maxLength={LEAD_ADDRESS_FIELD_META.pincode.maxLength}
                        disabled={isSubmitting}
                        {...register("company_registered_address.pincode")}
                      />
                    </FormField>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Operational address
                  </h3>
                  <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                    <FormField
                      label="Address"
                      className="sm:col-span-2"
                      error={errors.company_operational_address?.address_1?.message}
                      maxLength={LEAD_ADDRESS_FIELD_META.address_1.maxLength}
                      currentLength={values.company_operational_address?.address_1?.length}
                    >
                      <Input
                        className={INPUT_HEIGHT}
                        placeholder={LEAD_ADDRESS_FIELD_META.address_1.placeholder}
                        maxLength={LEAD_ADDRESS_FIELD_META.address_1.maxLength}
                        disabled={isSubmitting}
                        {...register("company_operational_address.address_1")}
                      />
                    </FormField>
                    <FormField
                      label="Address line 2"
                      className="sm:col-span-2"
                      error={errors.company_operational_address?.address_2?.message}
                      maxLength={LEAD_ADDRESS_FIELD_META.address_2.maxLength}
                      currentLength={values.company_operational_address?.address_2?.length}
                    >
                      <Input
                        className={INPUT_HEIGHT}
                        placeholder={LEAD_ADDRESS_FIELD_META.address_2.placeholder}
                        maxLength={LEAD_ADDRESS_FIELD_META.address_2.maxLength}
                        disabled={isSubmitting}
                        {...register("company_operational_address.address_2")}
                      />
                    </FormField>
                    <FormField
                      label="City"
                      error={errors.company_operational_address?.city?.message}
                      maxLength={LEAD_ADDRESS_FIELD_META.city.maxLength}
                      currentLength={values.company_operational_address?.city?.length}
                    >
                      <Input
                        className={INPUT_HEIGHT}
                        placeholder={LEAD_ADDRESS_FIELD_META.city.placeholder}
                        maxLength={LEAD_ADDRESS_FIELD_META.city.maxLength}
                        disabled={isSubmitting}
                        {...register("company_operational_address.city")}
                      />
                    </FormField>
                    <FormField
                      label="State"
                      error={errors.company_operational_address?.state?.message}
                      maxLength={LEAD_ADDRESS_FIELD_META.state.maxLength}
                      currentLength={values.company_operational_address?.state?.length}
                    >
                      <Input
                        className={INPUT_HEIGHT}
                        placeholder={LEAD_ADDRESS_FIELD_META.state.placeholder}
                        maxLength={LEAD_ADDRESS_FIELD_META.state.maxLength}
                        disabled={isSubmitting}
                        {...register("company_operational_address.state")}
                      />
                    </FormField>
                    <FormField
                      label="Country"
                      error={errors.company_operational_address?.country?.message}
                      maxLength={LEAD_ADDRESS_FIELD_META.country.maxLength}
                      currentLength={values.company_operational_address?.country?.length}
                    >
                      <Input
                        className={INPUT_HEIGHT}
                        placeholder={LEAD_ADDRESS_FIELD_META.country.placeholder}
                        maxLength={LEAD_ADDRESS_FIELD_META.country.maxLength}
                        disabled={isSubmitting}
                        {...register("company_operational_address.country")}
                      />
                    </FormField>
                    <FormField
                      label="Pincode"
                      error={errors.company_operational_address?.pincode?.message}
                      maxLength={LEAD_ADDRESS_FIELD_META.pincode.maxLength}
                      currentLength={values.company_operational_address?.pincode?.length}
                    >
                      <Input
                        className={INPUT_HEIGHT}
                        placeholder={LEAD_ADDRESS_FIELD_META.pincode.placeholder}
                        maxLength={LEAD_ADDRESS_FIELD_META.pincode.maxLength}
                        disabled={isSubmitting}
                        {...register("company_operational_address.pincode")}
                      />
                    </FormField>
                  </div>
                </div>
              </div>

              <div
                key="step-contact"
                inert={step !== 2}
                aria-hidden={step !== 2}
                className={cn("flex flex-col gap-8", stepPanelClass(step === 2))}
              >
                <div>
                  <h3 className="mb-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Point of contact
                  </h3>
                  <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                    <FormField
                      label="Name"
                      error={errors.person_of_contact?.name?.message}
                      maxLength={LEAD_CONTACT_FIELD_META.name.maxLength}
                      currentLength={values.person_of_contact?.name?.length}
                    >
                      <Input
                        className={INPUT_HEIGHT}
                        placeholder={LEAD_CONTACT_FIELD_META.name.placeholder}
                        maxLength={LEAD_CONTACT_FIELD_META.name.maxLength}
                        disabled={isSubmitting}
                        {...register("person_of_contact.name")}
                      />
                    </FormField>
                    <FormField
                      label="Designation"
                      error={errors.person_of_contact?.designation?.message}
                      maxLength={LEAD_CONTACT_FIELD_META.designation.maxLength}
                      currentLength={values.person_of_contact?.designation?.length}
                    >
                      <Input
                        className={INPUT_HEIGHT}
                        placeholder={LEAD_CONTACT_FIELD_META.designation.placeholder}
                        maxLength={LEAD_CONTACT_FIELD_META.designation.maxLength}
                        disabled={isSubmitting}
                        {...register("person_of_contact.designation")}
                      />
                    </FormField>
                    <FormField
                      label="Email"
                      error={errors.person_of_contact?.email?.message}
                      maxLength={LEAD_CONTACT_FIELD_META.email.maxLength}
                      currentLength={values.person_of_contact?.email?.length}
                    >
                      <Input
                        className={INPUT_HEIGHT}
                        type="email"
                        placeholder={LEAD_CONTACT_FIELD_META.email.placeholder}
                        maxLength={LEAD_CONTACT_FIELD_META.email.maxLength}
                        disabled={isSubmitting}
                        {...register("person_of_contact.email")}
                      />
                    </FormField>
                    <FormField
                      label="Phone number"
                      error={errors.person_of_contact?.phone_number?.message}
                      hint={LEAD_CONTACT_FIELD_META.phone_number.hint}
                      maxLength={LEAD_CONTACT_FIELD_META.phone_number.maxLength}
                      currentLength={values.person_of_contact?.phone_number?.length}
                    >
                      <Input
                        className={INPUT_HEIGHT}
                        type="tel"
                        inputMode="numeric"
                        placeholder={LEAD_CONTACT_FIELD_META.phone_number.placeholder}
                        maxLength={LEAD_CONTACT_FIELD_META.phone_number.maxLength}
                        disabled={isSubmitting}
                        {...register("person_of_contact.phone_number")}
                      />
                    </FormField>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-baseline justify-between">
                    <Label>
                      Sales representatives<span className="text-destructive"> *</span>
                    </Label>
                  </div>
                  {repsQuery.isPending ? (
                    <p className="text-sm text-muted-foreground">Loading team…</p>
                  ) : repsQuery.isError ? (
                    <p className="text-sm text-destructive">Could not load the team list.</p>
                  ) : repsQuery.data.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No assignable team members found.</p>
                  ) : (
                    <div className="grid max-h-48 grid-cols-1 gap-1 overflow-y-auto rounded-lg border p-2 sm:grid-cols-2">
                      {repsQuery.data.map((rep) => (
                        <label
                          key={rep.email}
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                        >
                          <input
                            type="checkbox"
                            checked={selectedReps.includes(rep.email)}
                            onChange={() => toggleRep(rep.email)}
                            disabled={isSubmitting}
                            className="size-4 rounded border-input accent-primary"
                          />
                          <span className="truncate">{rep.name}</span>
                          <span className="truncate text-xs text-muted-foreground">({rep.email})</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {repsError && <p className="mt-1.5 text-sm text-destructive">{repsError}</p>}
                </div>
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
                    {isEdit ? "Save changes" : "Create lead"}
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
