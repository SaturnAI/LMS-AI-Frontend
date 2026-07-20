"use client";

/** Mutation hooks for the Account page: update profile, change password, profile picture upload/delete. */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  changePassword,
  deleteProfilePicture,
  updateProfilePicture,
  updateUserProfile,
  type UpdateUserProfileInput,
} from "@/lib/api";
import { profileQueryKey } from "./use-auth";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateUserProfileInput) => updateUserProfile(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileQueryKey }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) =>
      changePassword(oldPassword, newPassword),
  });
}

export function useUpdateProfilePicture() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => updateProfilePicture(file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileQueryKey }),
  });
}

export function useDeleteProfilePicture() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteProfilePicture(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileQueryKey }),
  });
}
