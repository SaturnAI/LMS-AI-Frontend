"use client";

/** Add/Edit dialog for a lead: core fields, sales-rep assignment, and optional address/contact details. */
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddLead, useSalesRepDropdown, useUpdateLead } from "@/hooks/use-leads";
import { leadSchema, type LeadValues } from "@/lib/validations/lead";
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
};

export function LeadFormDialog({ open, onOpenChange, editing }: LeadFormDialogProps) {
  const isEdit = Boolean(editing);
  const addMutation = useAddLead();
  const updateMutation = useUpdateLead();
  const repsQuery = useSalesRepDropdown();
  const [selectedReps, setSelectedReps] = useState<string[]>([]);
  const [repsError, setRepsError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LeadValues>({ resolver: zodResolver(leadSchema), defaultValues: emptyValues });

  useEffect(() => {
    if (!open) return;
    setRepsError(null);
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
            company_registered_address: editing.company_registered_address,
            company_operational_address: editing.company_operational_address,
            person_of_contact: editing.person_of_contact,
          }
        : emptyValues,
    );
  }, [open, editing, reset]);

  function toggleRep(email: string) {
    setSelectedReps((prev) => (prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]));
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit lead" : "Add lead"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this lead's details." : "Create a new lead and assign it to your team."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Lead name" error={errors.name?.message} className="sm:col-span-2">
              <Input disabled={isSubmitting} {...register("name")} />
            </Field>
            <Field label="Company name" error={errors.company_name?.message}>
              <Input disabled={isSubmitting} {...register("company_name")} />
            </Field>
            <Field label="Designation (optional)">
              <Input disabled={isSubmitting} {...register("designation")} />
            </Field>
            <Field label="Email (optional)">
              <Input type="email" disabled={isSubmitting} {...register("email")} />
            </Field>
            <Field label="Phone number (optional)">
              <Input disabled={isSubmitting} {...register("phone_number")} />
            </Field>

            <Field label="Status">
              <Select value={status} onValueChange={(v) => setValue("status", v as LeadStatus)} disabled={isSubmitting}>
                <SelectTrigger className="w-full">
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
            </Field>
            <Field label="Priority">
              <Select
                value={priority}
                onValueChange={(v) => setValue("priority", v as LeadPriority)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-full">
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
            </Field>
            <Field label="Source" className="sm:col-span-2">
              <Select value={source} onValueChange={(v) => setValue("source", v as LeadSource)} disabled={isSubmitting}>
                <SelectTrigger className="w-full">
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
            </Field>

            <Field label="Remarks (optional)" error={errors.remarks?.message} className="sm:col-span-2">
              <Textarea rows={2} disabled={isSubmitting} {...register("remarks")} />
            </Field>
          </div>

          <details className="rounded-lg border p-3">
            <summary className="cursor-pointer text-sm font-medium text-foreground">
              Additional details (addresses, point of contact)
            </summary>
            <div className="mt-3 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">Registered address</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input placeholder="Address line 1" disabled={isSubmitting} {...register("company_registered_address.address_1")} />
                  <Input placeholder="Address line 2" disabled={isSubmitting} {...register("company_registered_address.address_2")} />
                  <Input placeholder="City" disabled={isSubmitting} {...register("company_registered_address.city")} />
                  <Input placeholder="State" disabled={isSubmitting} {...register("company_registered_address.state")} />
                  <Input placeholder="Country" disabled={isSubmitting} {...register("company_registered_address.country")} />
                  <Input placeholder="Pincode" disabled={isSubmitting} {...register("company_registered_address.pincode")} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">Operational address</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input placeholder="Address line 1" disabled={isSubmitting} {...register("company_operational_address.address_1")} />
                  <Input placeholder="Address line 2" disabled={isSubmitting} {...register("company_operational_address.address_2")} />
                  <Input placeholder="City" disabled={isSubmitting} {...register("company_operational_address.city")} />
                  <Input placeholder="State" disabled={isSubmitting} {...register("company_operational_address.state")} />
                  <Input placeholder="Country" disabled={isSubmitting} {...register("company_operational_address.country")} />
                  <Input placeholder="Pincode" disabled={isSubmitting} {...register("company_operational_address.pincode")} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">Point of contact</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input placeholder="Name" disabled={isSubmitting} {...register("person_of_contact.name")} />
                  <Input placeholder="Designation" disabled={isSubmitting} {...register("person_of_contact.designation")} />
                  <Input placeholder="Email" disabled={isSubmitting} {...register("person_of_contact.email")} />
                  <Input placeholder="Phone number" disabled={isSubmitting} {...register("person_of_contact.phone_number")} />
                </div>
              </div>
            </div>
          </details>

          <div className="flex flex-col gap-1.5">
            <Label>Sales representatives</Label>
            {repsQuery.isPending ? (
              <p className="text-sm text-muted-foreground">Loading team…</p>
            ) : repsQuery.isError ? (
              <p className="text-sm text-destructive">Could not load the team list.</p>
            ) : repsQuery.data.length === 0 ? (
              <p className="text-sm text-muted-foreground">No assignable team members found.</p>
            ) : (
              <div className="flex max-h-36 flex-col gap-1 overflow-y-auto rounded-lg border p-2">
                {repsQuery.data.map((rep) => (
                  <label key={rep.email} className="flex items-center gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-muted">
                    <input
                      type="checkbox"
                      checked={selectedReps.includes(rep.email)}
                      onChange={() => toggleRep(rep.email)}
                      disabled={isSubmitting}
                      className="size-4 rounded border-input"
                    />
                    <span>{rep.name}</span>
                    <span className="text-muted-foreground">({rep.email})</span>
                  </label>
                ))}
              </div>
            )}
            {repsError && <p className="text-sm text-destructive">{repsError}</p>}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Create lead"}
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
