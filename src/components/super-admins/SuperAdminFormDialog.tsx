"use client";

/** Add/Edit dialog for a super admin. Email is locked when editing (identifies the record). */
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/FormField";
import { useAddSuperAdmin, useUpdateSuperAdmin } from "@/hooks/use-super-admins";
import { superAdminSchema, type SuperAdminValues } from "@/lib/validations/super-admin";
import { SUPER_ADMIN_FIELD_META } from "./super-admin-field-meta";
import type { SuperAdmin } from "@/lib/api";

interface SuperAdminFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: SuperAdmin | null;
}

const INPUT_HEIGHT = "h-10";

export function SuperAdminFormDialog({ open, onOpenChange, editing }: SuperAdminFormDialogProps) {
  const isEdit = Boolean(editing);
  const addMutation = useAddSuperAdmin();
  const updateMutation = useUpdateSuperAdmin();
  const mutation = isEdit ? updateMutation : addMutation;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SuperAdminValues>({
    resolver: zodResolver(superAdminSchema),
    defaultValues: { email: "", name: "", phone_number: "" },
  });

  useEffect(() => {
    if (open) {
      reset({
        email: editing?.email ?? "",
        name: editing?.name ?? "",
        phone_number: editing?.phone_number ?? "",
      });
    }
  }, [open, editing, reset]);

  async function onSubmit(values: SuperAdminValues) {
    try {
      const result = await mutation.mutateAsync({ ...values, phone_number: Number(values.phone_number) });
      toast.success(result.message || (isEdit ? "Super admin updated." : "Super admin added."));
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const values = watch();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <div className="flex items-center gap-3 pb-2">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <ShieldCheck className="size-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-lg font-semibold">
              {isEdit ? "Edit super admin" : "Add a new super admin"}
            </DialogTitle>
            <DialogDescription className="mt-1">
              {isEdit
                ? "Update this administrator's name and phone number."
                : "A password will be generated and emailed automatically."}
            </DialogDescription>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          <FormField
            label="Email"
            htmlFor="sa-email"
            required={SUPER_ADMIN_FIELD_META.email.required}
            error={errors.email?.message}
          >
            <Input
              id="sa-email"
              className={INPUT_HEIGHT}
              type="email"
              placeholder={SUPER_ADMIN_FIELD_META.email.placeholder}
              disabled={isEdit || isSubmitting}
              {...register("email")}
            />
          </FormField>

          <FormField
            label="Name"
            htmlFor="sa-name"
            required={SUPER_ADMIN_FIELD_META.name.required}
            error={errors.name?.message}
            maxLength={SUPER_ADMIN_FIELD_META.name.maxLength}
            currentLength={values.name?.length}
          >
            <Input
              id="sa-name"
              className={INPUT_HEIGHT}
              placeholder={SUPER_ADMIN_FIELD_META.name.placeholder}
              maxLength={SUPER_ADMIN_FIELD_META.name.maxLength}
              disabled={isSubmitting}
              {...register("name")}
            />
          </FormField>

          <FormField
            label="Phone number"
            htmlFor="sa-phone"
            required={SUPER_ADMIN_FIELD_META.phone_number.required}
            error={errors.phone_number?.message}
            hint={SUPER_ADMIN_FIELD_META.phone_number.hint}
            maxLength={SUPER_ADMIN_FIELD_META.phone_number.maxLength}
            currentLength={values.phone_number?.length}
          >
            <Input
              id="sa-phone"
              className={INPUT_HEIGHT}
              type="tel"
              inputMode="numeric"
              placeholder={SUPER_ADMIN_FIELD_META.phone_number.placeholder}
              maxLength={SUPER_ADMIN_FIELD_META.phone_number.maxLength}
              disabled={isSubmitting}
              {...register("phone_number")}
            />
          </FormField>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Add super admin"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
