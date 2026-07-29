"use client";

/** Route: `/account` — the signed-in user's profile, picture, and password. */
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Pencil, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useDeleteProfilePicture, useUpdateProfile, useUpdateProfilePicture } from "@/hooks/use-account";
import { roleLabel } from "@/lib/utils";
import { useProfilePictureUrl } from "@/hooks/use-account";
import { updateProfileSchema, type UpdateProfileValues } from "@/lib/validations/account";
import FullPageLoader from "@/components/FullPageLoader";
import { PageHeader } from "@/components/common/PageHeader";
import { IconTooltip } from "@/components/common/IconTooltip";
import { ChangePasswordDialog } from "@/components/account/ChangePasswordDialog";
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
      <SecuritySection />
    </div>
  );
}

function ProfilePictureSection() {
  const [broken, setBroken] = useState(false);
  const upload = useUpdateProfilePicture();
  const remove = useDeleteProfilePicture();
  const profilePictureUrl = useProfilePictureUrl();

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
      <IconTooltip label="Change picture">
        <label
          htmlFor="profile-picture"
          aria-label="Change profile picture"
          className="group relative grid size-16 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-full bg-muted"
        >
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
          <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
            <Pencil className="size-5 text-white" />
          </span>
          <input
            id="profile-picture"
            type="file"
            accept="image/jpeg,image/png"
            className="sr-only"
            disabled={upload.isPending}
            onChange={(e) => handleUpload(e.target.files?.[0])}
          />
        </label>
      </IconTooltip>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-foreground">Profile picture</p>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleDelete} disabled={remove.isPending || broken}>
            Remove
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Click the picture to upload. JPEG or PNG, up to 2MB.</p>
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
  const [isEditing, setIsEditing] = useState(false);
  const defaults = { name, phone_number: phone ?? "", designation: designation ?? "" };
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileValues>({ resolver: zodResolver(updateProfileSchema), defaultValues: defaults });

  useEffect(() => {
    reset({ name, phone_number: phone ?? "", designation: designation ?? "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset() identity is stable; re-run only when the source values change
  }, [name, phone, designation]);

  function handleCancel() {
    reset(defaults);
    setIsEditing(false);
  }

  async function onSubmit(values: UpdateProfileValues) {
    try {
      const result = await updateMutation.mutateAsync(values);
      toast.success(result.message || "Profile updated.");
      setIsEditing(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <section className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Profile details</h2>
        {!isEditing && (
          <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Pencil className="size-4" />
            Edit
          </Button>
        )}
      </div>
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
            <Input id="acc-name" disabled={!isEditing || isSubmitting} {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="acc-phone">Phone number</Label>
            <Input id="acc-phone" disabled={!isEditing || isSubmitting} {...register("phone_number")} />
            {errors.phone_number && <p className="text-sm text-destructive">{errors.phone_number.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="acc-designation">Designation</Label>
            <Input id="acc-designation" disabled={!isEditing || isSubmitting} {...register("designation")} />
            {errors.designation && <p className="text-sm text-destructive">{errors.designation.message}</p>}
          </div>
          {createdAt && (
            <div className="flex flex-col gap-1.5">
              <Label>Member since</Label>
              <Input value={createdAt} disabled />
            </div>
          )}
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
    </section>
  );
}

function SecuritySection() {
  const [open, setOpen] = useState(false);

  return (
    <section className="flex items-center justify-between rounded-2xl border bg-card p-5">
      <div>
        <h2 className="text-sm font-semibold text-foreground">Password</h2>
        <p className="mt-1 text-sm text-muted-foreground">Change the password used to sign in.</p>
      </div>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        Change password
      </Button>
      <ChangePasswordDialog open={open} onOpenChange={setOpen} />
    </section>
  );
}
