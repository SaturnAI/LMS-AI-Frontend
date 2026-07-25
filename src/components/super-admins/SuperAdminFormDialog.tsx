"use client";

/** Add/Edit dialog for a super admin. Email is locked when editing (identifies the record). */
import { useEffect } from "react";
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
import { FormField } from "@/components/common/FormField";
import { useAddSuperAdmin, useUpdateSuperAdmin } from "@/hooks/use-super-admins";
import { superAdminSchema, type SuperAdminValues } from "@/lib/validations/super-admin";
import type { SuperAdmin } from "@/lib/api";

interface SuperAdminFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: SuperAdmin | null;
}

export function SuperAdminFormDialog({ open, onOpenChange, editing }: SuperAdminFormDialogProps) {
  const isEdit = Boolean(editing);
  const addMutation = useAddSuperAdmin();
  const updateMutation = useUpdateSuperAdmin();
  const mutation = isEdit ? updateMutation : addMutation;

  const {
    register,
    handleSubmit,
    reset,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit super admin" : "Add super admin"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this administrator's name and phone number."
              : "A password will be generated and emailed automatically."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <FormField label="Email" htmlFor="sa-email" error={errors.email?.message}>
            <Input id="sa-email" type="email" disabled={isEdit || isSubmitting} {...register("email")} />
          </FormField>

          <FormField label="Name" htmlFor="sa-name" error={errors.name?.message}>
            <Input id="sa-name" disabled={isSubmitting} {...register("name")} />
          </FormField>

          <FormField label="Phone number" htmlFor="sa-phone" error={errors.phone_number?.message}>
            <Input id="sa-phone" type="tel" disabled={isSubmitting} {...register("phone_number")} />
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
