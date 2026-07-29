"use client";

/** Route: `/company-profile` — company details & logo (company_admin only). */
import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Building2, Pencil } from "lucide-react";
import { RequireAccess } from "@/components/common/RequireAccess";
import { PageHeader } from "@/components/common/PageHeader";
import { IconTooltip } from "@/components/common/IconTooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateCompanyProfile } from "@/hooks/use-companies";
import { isCompanyAdmin } from "@/lib/rbac";
import { companyProfileSchema, type CompanyProfileValues } from "@/lib/validations/company";
import { normalizeGstPan } from "@/components/companies/company-field-meta";
import { cn } from "@/lib/utils";
import { companyLogoUrl, type CompanyProfileInput, type Profile } from "@/lib/api";

export default function CompanyProfilePage() {
  return (
    <RequireAccess allow={isCompanyAdmin}>
      <CompanyProfileContent />
    </RequireAccess>
  );
}

function toDefaults(companyData: Profile["company_data"]): CompanyProfileValues {
  const d = (companyData ?? {}) as Record<string, string | undefined>;
  return {
    legal_name: d.legal_name ?? "",
    phone_number: d.phone_number ?? "",
    address_1: d.address_1 ?? "",
    address_2: d.address_2 ?? "",
    country: d.country ?? "",
    state: d.state ?? "",
    city: d.city ?? "",
    pincode: d.pincode ?? "",
    name: d.name ?? "",
    industry: d.industry ?? "",
    company_size: d.company_size ?? "",
    gst_number: d.gst_number ?? "",
    pan_number: d.pan_number ?? "",
    mobile_number: d.mobile_number ?? "",
    website: d.website ?? "",
    designation: d.designation ?? "",
  };
}

function CompanyProfileContent() {
  const auth = useAuth();
  const updateMutation = useUpdateCompanyProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoBroken, setLogoBroken] = useState(false);

  function clearLogoSelection() {
    setLogo(null);
    setLogoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }

  function handleSelectLogo(file: File | undefined) {
    setLogo(file ?? null);
    setLogoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cleanup-only, runs on unmount
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CompanyProfileValues>({ resolver: zodResolver(companyProfileSchema), defaultValues: toDefaults(undefined) });

  const companyData = auth.status === "authed" ? auth.profile.company_data : undefined;
  useEffect(() => {
    if (auth.status === "authed") reset(toDefaults(companyData));
  }, [auth.status, companyData, reset]);

  function handleCancel() {
    reset(toDefaults(companyData));
    clearLogoSelection();
    setLogoBroken(false);
    setIsEditing(false);
  }

  async function onSubmit(values: CompanyProfileValues) {
    const input: CompanyProfileInput = { ...normalizeGstPan(values), company_logo: logo ?? undefined };
    try {
      const result = await updateMutation.mutateAsync(input);
      toast.success(result.message || "Company profile updated.");
      clearLogoSelection();
      setLogoBroken(false);
      setIsEditing(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Company Profile"
        description="Your company's details and logo."
        actions={
          !isEditing && (
            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
              <Pencil className="size-4" />
              Edit details
            </Button>
          )
        }
      />

      <div className="flex items-center gap-4 rounded-2xl border bg-card p-4">
        <IconTooltip label={isEditing ? "Change logo" : "Enable editing to change the logo"}>
          <label
            htmlFor="company-logo"
            aria-label="Change company logo"
            aria-disabled={!isEditing}
            className={cn(
              "group relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-muted",
              isEditing ? "cursor-pointer" : "cursor-not-allowed",
            )}
          >
            {logoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element -- local object URL preview of the selected file
              <img src={logoPreview} alt="Company logo" className="size-16 object-cover" />
            ) : logoBroken ? (
              <Building2 className="size-7 text-muted-foreground" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- credentialed, dynamic backend image; not a static asset
              <img
                src={companyLogoUrl}
                alt="Company logo"
                className="size-16 object-cover"
                onError={() => setLogoBroken(true)}
              />
            )}
            {isEditing && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                <Pencil className="size-5 text-white" />
              </span>
            )}
            <input
              id="company-logo"
              type="file"
              accept="image/jpeg,image/png"
              className="sr-only"
              disabled={!isEditing}
              onChange={(e) => handleSelectLogo(e.target.files?.[0])}
            />
          </label>
        </IconTooltip>
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium text-foreground">Company logo</p>
          <p className="text-xs text-muted-foreground">
            {isEditing
              ? "Click the logo to choose a new image. JPEG or PNG, up to 2MB — saved with the form below."
              : "Click \"Edit details\" to change the logo or fields below."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4 rounded-2xl border bg-card p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Legal name" error={errors.legal_name?.message}>
            <Input disabled={!isEditing || isSubmitting} {...register("legal_name")} />
          </Field>
          <Field label="Contact name" error={errors.name?.message}>
            <Input disabled={!isEditing || isSubmitting} {...register("name")} />
          </Field>
          <Field label="Phone number" error={errors.phone_number?.message}>
            <Input disabled={!isEditing || isSubmitting} {...register("phone_number")} />
          </Field>
          <Field label="Mobile number (optional)" error={errors.mobile_number?.message}>
            <Input disabled={!isEditing || isSubmitting} {...register("mobile_number")} />
          </Field>
          <Field label="Address" error={errors.address_1?.message} className="sm:col-span-2">
            <Input disabled={!isEditing || isSubmitting} {...register("address_1")} />
          </Field>
          <Field label="Address line 2 (optional)" className="sm:col-span-2">
            <Input disabled={!isEditing || isSubmitting} {...register("address_2")} />
          </Field>
          <Field label="City" error={errors.city?.message}>
            <Input disabled={!isEditing || isSubmitting} {...register("city")} />
          </Field>
          <Field label="State" error={errors.state?.message}>
            <Input disabled={!isEditing || isSubmitting} {...register("state")} />
          </Field>
          <Field label="Country" error={errors.country?.message}>
            <Input disabled={!isEditing || isSubmitting} {...register("country")} />
          </Field>
          <Field label="Pincode" error={errors.pincode?.message}>
            <Input disabled={!isEditing || isSubmitting} {...register("pincode")} />
          </Field>
          <Field label="Industry (optional)">
            <Input disabled={!isEditing || isSubmitting} {...register("industry")} />
          </Field>
          <Field label="Company size (optional)">
            <Input disabled={!isEditing || isSubmitting} {...register("company_size")} />
          </Field>
          <Field label="Website (optional)" error={errors.website?.message}>
            <Input disabled={!isEditing || isSubmitting} {...register("website")} />
          </Field>
          <Field label="Designation (optional)">
            <Input disabled={!isEditing || isSubmitting} {...register("designation")} />
          </Field>
          <Field label="GST number (optional)" error={errors.gst_number?.message}>
            <Input disabled={!isEditing || isSubmitting} {...register("gst_number")} />
          </Field>
          <Field label="PAN number (optional)" error={errors.pan_number?.message}>
            <Input disabled={!isEditing || isSubmitting} {...register("pan_number")} />
          </Field>
        </div>
        {isEditing && (
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        )}
      </form>
    </div>
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
