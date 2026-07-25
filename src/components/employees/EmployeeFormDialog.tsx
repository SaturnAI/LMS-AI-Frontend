"use client";

/** Add/Edit dialog for an employee. Email is locked when editing (identifies the record). */
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Users } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/FormField";
import { PermissionsEditor } from "@/components/common/PermissionsEditor";
import { useAddEmployee, useUpdateEmployee } from "@/hooks/use-employees";
import { employeeSchema, type EmployeeValues } from "@/lib/validations/employee";
import { EMPLOYEE_FIELD_META } from "./employee-field-meta";
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

const INPUT_HEIGHT = "h-10";

export function EmployeeFormDialog({ open, onOpenChange, editing }: EmployeeFormDialogProps) {
  const isEdit = Boolean(editing);
  const addMutation = useAddEmployee();
  const updateMutation = useUpdateEmployee();
  const [permissions, setPermissions] = useState<Record<string, PermissionLevel>>(defaultPermissions);

  const {
    register,
    handleSubmit,
    reset,
    watch,
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

  const values = watch();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <div className="flex items-center gap-3 pb-2">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Users className="size-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-lg font-semibold">
              {isEdit ? "Edit employee" : "Add a new employee"}
            </DialogTitle>
            <DialogDescription className="mt-1">
              {isEdit
                ? "Update this employee's details and permissions."
                : "A password will be generated and emailed automatically."}
            </DialogDescription>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          <FormField
            label="Name"
            htmlFor="emp-name"
            required={EMPLOYEE_FIELD_META.name.required}
            error={errors.name?.message}
            maxLength={EMPLOYEE_FIELD_META.name.maxLength}
            currentLength={values.name?.length}
          >
            <Input
              id="emp-name"
              className={INPUT_HEIGHT}
              placeholder={EMPLOYEE_FIELD_META.name.placeholder}
              maxLength={EMPLOYEE_FIELD_META.name.maxLength}
              disabled={isSubmitting}
              {...register("name")}
            />
          </FormField>

          <FormField
            label="Email"
            htmlFor="emp-email"
            required={EMPLOYEE_FIELD_META.email.required}
            error={errors.email?.message}
          >
            <Input
              id="emp-email"
              className={INPUT_HEIGHT}
              type="email"
              placeholder={EMPLOYEE_FIELD_META.email.placeholder}
              disabled={isEdit || isSubmitting}
              {...register("email")}
            />
          </FormField>

          <FormField
            label="Phone number"
            htmlFor="emp-phone"
            required={EMPLOYEE_FIELD_META.phone_number.required}
            error={errors.phone_number?.message}
            hint={EMPLOYEE_FIELD_META.phone_number.hint}
            maxLength={EMPLOYEE_FIELD_META.phone_number.maxLength}
            currentLength={values.phone_number?.length}
          >
            <Input
              id="emp-phone"
              className={INPUT_HEIGHT}
              type="tel"
              inputMode="numeric"
              placeholder={EMPLOYEE_FIELD_META.phone_number.placeholder}
              maxLength={EMPLOYEE_FIELD_META.phone_number.maxLength}
              disabled={isSubmitting}
              {...register("phone_number")}
            />
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
