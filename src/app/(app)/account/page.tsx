"use client";

/** Route: `/account` — the signed-in user's profile, picture, and password. */
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  useChangePassword,
  useDeleteProfilePicture,
  useUpdateProfile,
  useUpdateProfilePicture,
} from "@/hooks/use-account";
import { roleLabel } from "@/lib/utils";
import { profilePictureUrl } from "@/lib/api";
import { changePasswordSchema, updateProfileSchema, type ChangePasswordValues, type UpdateProfileValues } from "@/lib/validations/account";
import FullPageLoader from "@/components/FullPageLoader";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AccountPage() {
  const auth = useAuth();
  if (auth.status !== "authed") return <FullPageLoader />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Account" description="Your profile, picture, and password." />
      <ProfilePictureSection />
      <ProfileDetailsSection name={auth.profile.name} phone={auth.profile.phone_number} designation={auth.profile.designation} email={auth.profile.email} role={auth.profile.role} createdAt={auth.profile.created_at} />
      <ChangePasswordSection />
    </div>
  );
}

function ProfilePictureSection() {
  const [broken, setBroken] = useState(false);
  const upload = useUpdateProfilePicture();
  const remove = useDeleteProfilePicture();

  async function handleUpload(file: File | undefined) {
    if (!file) return;
    try {
      const result = await upload.mutateAsync(file);
      toast.success(result.message || "Profile picture updated.");
      setBroken(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not upload picture.");
    }
  }

  async function handleDelete() {
    try {
      const result = await remove.mutateAsync();
      toast.success(result.message || "Profile picture removed.");
      setBroken(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove picture.");
    }
  }

  return (
    <section className="flex items-center gap-4 rounded-2xl border bg-card p-5">
      <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-muted">
        {broken ? (
          <User className="size-7 text-muted-foreground" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- credentialed, dynamic backend image
          <img
            src={profilePictureUrl}
            alt="Profile"
            className="size-16 object-cover"
            onError={() => setBroken(true)}
          />
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-picture">Profile picture</Label>
        <div className="flex items-center gap-2">
          <Input
            id="profile-picture"
            type="file"
            accept="image/jpeg,image/png"
            className="max-w-xs"
            disabled={upload.isPending}
            onChange={(e) => handleUpload(e.target.files?.[0])}
          />
          <Button type="button" variant="outline" size="sm" onClick={handleDelete} disabled={remove.isPending || broken}>
            Remove
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">JPEG or PNG, up to 2MB.</p>
      </div>
    </section>
  );
}

function ProfileDetailsSection({
  name,
  phone,
  designation,
  email,
  role,
  createdAt,
}: {
  name: string;
  phone?: string;
  designation?: string;
  email: string;
  role: string;
  createdAt?: string;
}) {
  const updateMutation = useUpdateProfile();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name, phone_number: phone ?? "", designation: designation ?? "" },
  });

  useEffect(() => {
    reset({ name, phone_number: phone ?? "", designation: designation ?? "" });
  }, [name, phone, designation, reset]);

  async function onSubmit(values: UpdateProfileValues) {
    try {
      const result = await updateMutation.mutateAsync(values);
      toast.success(result.message || "Profile updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <section className="rounded-2xl border bg-card p-5">
      <h2 className="text-sm font-semibold text-foreground">Profile details</h2>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-4 flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>Email</Label>
            <Input value={email} disabled />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Role</Label>
            <Input value={roleLabel(role)} disabled />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="acc-name">Name</Label>
            <Input id="acc-name" disabled={isSubmitting} {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="acc-phone">Phone number</Label>
            <Input id="acc-phone" disabled={isSubmitting} {...register("phone_number")} />
            {errors.phone_number && <p className="text-sm text-destructive">{errors.phone_number.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="acc-designation">Designation</Label>
            <Input id="acc-designation" disabled={isSubmitting} {...register("designation")} />
            {errors.designation && <p className="text-sm text-destructive">{errors.designation.message}</p>}
          </div>
          {createdAt && (
            <div className="flex flex-col gap-1.5">
              <Label>Member since</Label>
              <Input value={createdAt} disabled />
            </div>
          )}
        </div>
        <Button type="submit" className="self-start" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </section>
  );
}

function ChangePasswordSection() {
  const changePasswordMutation = useChangePassword();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { old_password: "", new_password: "", confirm_password: "" },
  });

  async function onSubmit(values: ChangePasswordValues) {
    try {
      const result = await changePasswordMutation.mutateAsync({
        oldPassword: values.old_password,
        newPassword: values.new_password,
      });
      toast.success(result.message || "Password updated.");
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <section className="rounded-2xl border bg-card p-5">
      <h2 className="text-sm font-semibold text-foreground">Change password</h2>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-4 flex flex-col gap-4 sm:max-w-sm">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="old-password">Current password</Label>
          <Input id="old-password" type="password" disabled={isSubmitting} {...register("old_password")} />
          {errors.old_password && <p className="text-sm text-destructive">{errors.old_password.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-password">New password</Label>
          <Input id="new-password" type="password" disabled={isSubmitting} {...register("new_password")} />
          {errors.new_password && <p className="text-sm text-destructive">{errors.new_password.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm-password">Confirm new password</Label>
          <Input id="confirm-password" type="password" disabled={isSubmitting} {...register("confirm_password")} />
          {errors.confirm_password && <p className="text-sm text-destructive">{errors.confirm_password.message}</p>}
        </div>
        <Button type="submit" className="self-start" disabled={isSubmitting}>
          {isSubmitting ? "Updating…" : "Update password"}
        </Button>
      </form>
    </section>
  );
}
