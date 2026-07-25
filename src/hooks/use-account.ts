"use client";

/** Mutation hooks for the Account page: update profile, change password, profile picture upload/delete. */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  changePassword,
  deleteProfilePicture,
  profilePictureUrl,
  updateProfilePicture,
  updateUserProfile,
  type UpdateUserProfileInput,
} from "@/lib/api";
import { profileQueryKey } from "./use-auth";

const profilePictureVersionKey = ["profile-picture-version"] as const;

/**
 * `profilePictureUrl` is a static endpoint, so the browser keeps showing the
 * previously-fetched image after a new one is uploaded. This appends a version
 * query param that changes whenever the picture is updated/deleted, forcing a
 * fresh request instead of a cache hit.
 */
export function useProfilePictureUrl() {
  const { data: version } = useQuery({
    queryKey: profilePictureVersionKey,
    queryFn: () => 0,
    initialData: 0,
    staleTime: Infinity,
  });
  return `${profilePictureUrl}?v=${version}`;
}

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileQueryKey });
      queryClient.setQueryData(profilePictureVersionKey, (v: number = 0) => v + 1);
    },
  });
}

export function useDeleteProfilePicture() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteProfilePicture(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileQueryKey });
      queryClient.setQueryData(profilePictureVersionKey, (v: number = 0) => v + 1);
    },
  });
}
