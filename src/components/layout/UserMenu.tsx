"use client";

/** User avatar dropdown (account, sign out). Compact in the mobile header; expanded in the sidebar footer. */
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import type { Profile } from "@/lib/api";
import { useLogout } from "@/hooks/use-auth";
import { useProfilePictureUrl } from "@/hooks/use-account";
import { ROUTES } from "@/lib/constants";
import { cn, initials, roleLabel } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconTooltip } from "@/components/common/IconTooltip";
import { TruncatedText } from "@/components/common/TruncatedText";

export function UserMenu({ profile, expanded = false }: { profile: Profile; expanded?: boolean }) {
  const router = useRouter();
  const logout = useLogout();
  const profilePictureUrl = useProfilePictureUrl();

  async function handleLogout() {
    await logout.mutateAsync();
    router.replace(ROUTES.login);
  }

  return (
    <DropdownMenu>
      <IconTooltip label="Account menu">
        <DropdownMenuTrigger
          aria-label="Open account menu"
          className={cn(
            "outline-none focus-visible:ring-2 focus-visible:ring-ring",
            expanded
              ? "flex w-full items-center gap-2.5 rounded-full bg-card p-1.5 pr-3 text-left shadow-sm"
              : "rounded-full",
          )}
        >
          <Avatar size={expanded ? "default" : "lg"} className={expanded ? undefined : "lg:size-11"}>
            {/* fetch_profile_picture 404s when absent → Base UI falls back to initials */}
            <AvatarImage src={profilePictureUrl} alt={profile.name} />
            <AvatarFallback className="bg-brand-lime text-brand-navy">{initials(profile.name)}</AvatarFallback>
          </Avatar>
          {expanded && (
            <div className="min-w-0 flex-1">
              <TruncatedText text={profile.name} className="text-sm font-medium text-foreground" />
              <TruncatedText text={roleLabel(profile.role)} className="text-xs text-muted-foreground" />
            </div>
          )}
        </DropdownMenuTrigger>
      </IconTooltip>
      <DropdownMenuContent align={expanded ? "start" : "end"} side={expanded ? "top" : "bottom"} className="w-56">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <Avatar>
            <AvatarImage src={profilePictureUrl} alt={profile.name} />
            <AvatarFallback className="bg-brand-lime text-brand-navy">{initials(profile.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <TruncatedText text={profile.name} className="text-sm font-medium" />
            <TruncatedText text={roleLabel(profile.role)} className="text-xs text-muted-foreground" />
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(ROUTES.account)}>
          <User className="size-4" />
          Account
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} disabled={logout.isPending}>
          <LogOut className="size-4" />
          {logout.isPending ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
