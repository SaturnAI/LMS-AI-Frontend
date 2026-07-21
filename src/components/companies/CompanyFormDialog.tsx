"use client";

/** Add/Edit dialog for a company (super_admin). Multipart form incl. optional logo upload. */
import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddCompany, useUpdateCompany } from "@/hooks/use-companies";
import { companySchema, type CompanyValues } from "@/lib/validations/company";
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

export function CompanyFormDialog({ open, onOpenChange, editing }: CompanyFormDialogProps) {
  const isEdit = Boolean(editing);
  const addMutation = useAddCompany();
  const updateMutation = useUpdateCompany();
  const [logo, setLogo] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CompanyValues>({ resolver: zodResolver(companySchema), defaultValues: emptyValues });

  useEffect(() => {
    if (!open) return;
    setLogo(null);
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

  async function onSubmit(values: CompanyValues) {
    const input: CompanyDetailsInput = {
      ...values,
      employee_limit: Number(values.employee_limit),
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit company" : "Add company"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this company's details. Email cannot be changed."
              : "A company admin account will be created and the password emailed automatically."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Legal name" error={errors.legal_name?.message}>
              <Input disabled={isSubmitting} {...register("legal_name")} />
            </Field>
            <Field label="Contact name" error={errors.name?.message}>
              <Input disabled={isSubmitting} {...register("name")} />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <Input type="email" disabled={isEdit || isSubmitting} {...register("email")} />
            </Field>
            <Field label="Phone number" error={errors.phone_number?.message}>
              <Input disabled={isSubmitting} {...register("phone_number")} />
            </Field>
            <Field label="Address" error={errors.address_1?.message} className="sm:col-span-2">
              <Input disabled={isSubmitting} {...register("address_1")} />
            </Field>
            <Field label="Address line 2 (optional)" className="sm:col-span-2">
              <Input disabled={isSubmitting} {...register("address_2")} />
            </Field>
            <Field label="City" error={errors.city?.message}>
              <Input disabled={isSubmitting} {...register("city")} />
            </Field>
            <Field label="State" error={errors.state?.message}>
              <Input disabled={isSubmitting} {...register("state")} />
            </Field>
            <Field label="Country" error={errors.country?.message}>
              <Input disabled={isSubmitting} {...register("country")} />
            </Field>
            <Field label="Pincode" error={errors.pincode?.message}>
              <Input disabled={isSubmitting} {...register("pincode")} />
            </Field>
            <Field label="Employee limit" error={errors.employee_limit?.message}>
              <Input inputMode="numeric" disabled={isSubmitting} {...register("employee_limit")} />
            </Field>
            <Field label="Billing plan">
              <Select
                value={billingPlan}
                onValueChange={(v) => setValue("billing_plan", v as BillingPlan)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Industry (optional)">
              <Input disabled={isSubmitting} {...register("industry")} />
            </Field>
            <Field label="Company size (optional)">
              <Input disabled={isSubmitting} {...register("company_size")} />
            </Field>
            <Field label="Website (optional)">
              <Input disabled={isSubmitting} {...register("website")} />
            </Field>
            <Field label="Mobile number (optional)">
              <Input disabled={isSubmitting} {...register("mobile_number")} />
            </Field>
            <Field label="GST number (optional)">
              <Input disabled={isSubmitting} {...register("gst_number")} />
            </Field>
            <Field label="PAN number (optional)">
              <Input disabled={isSubmitting} {...register("pan_number")} />
            </Field>
            <Field label="Designation (optional)">
              <Input disabled={isSubmitting} {...register("designation")} />
            </Field>
            <Field label="Company logo (optional, JPEG/PNG, ≤2MB)" className="sm:col-span-2">
              <Input
                type="file"
                accept="image/jpeg,image/png"
                disabled={isSubmitting}
                onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
              />
            </Field>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Add company"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
