"use client";

/** Add/Edit dialog for an employee. Email is locked when editing (identifies the record). */
import { useEffect, useState } from "react";
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
import { PermissionsEditor } from "@/components/common/PermissionsEditor";
import { useAddEmployee, useUpdateEmployee } from "@/hooks/use-employees";
import { employeeSchema, type EmployeeValues } from "@/lib/validations/employee";
import type { Employee, PermissionLevel } from "@/lib/api";

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: Employee | null;
}

const defaultPermissions: Record<string, PermissionLevel> = {
  employee_master: "not_allowed",
  leads: "not_allowed",
  log_manager: "not_allowed",
};

export function EmployeeFormDialog({ open, onOpenChange, editing }: EmployeeFormDialogProps) {
  const isEdit = Boolean(editing);
  const addMutation = useAddEmployee();
  const updateMutation = useUpdateEmployee();
  const [permissions, setPermissions] = useState<Record<string, PermissionLevel>>(defaultPermissions);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: { name: "", email: "", phone_number: "" },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      name: editing?.name ?? "",
      email: editing?.email ?? "",
      phone_number: editing?.phone_number ?? "",
    });
    setPermissions(editing?.permissions ?? defaultPermissions);
  }, [open, editing, reset]);

  async function onSubmit(values: EmployeeValues) {
    const mutation = isEdit ? updateMutation : addMutation;
    try {
      const result = await mutation.mutateAsync({ ...values, permissions });
      toast.success(result.message || (isEdit ? "Employee updated." : "Employee added."));
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit employee" : "Add employee"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this employee's details and permissions."
              : "A password will be generated and emailed automatically."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <FormField label="Name" htmlFor="emp-name" error={errors.name?.message}>
            <Input id="emp-name" disabled={isSubmitting} {...register("name")} />
          </FormField>

          <FormField label="Email" htmlFor="emp-email" error={errors.email?.message}>
            <Input id="emp-email" type="email" disabled={isEdit || isSubmitting} {...register("email")} />
          </FormField>

          <FormField label="Phone number" htmlFor="emp-phone" error={errors.phone_number?.message}>
            <Input id="emp-phone" disabled={isSubmitting} {...register("phone_number")} />
          </FormField>

          <PermissionsEditor value={permissions} onChange={setPermissions} />

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Add employee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
