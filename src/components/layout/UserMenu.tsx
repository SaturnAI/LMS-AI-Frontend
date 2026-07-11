"use client";

/** Avatar dropdown: name/role, account link, sign out. Rendered in the header on all `(app)` routes. */
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { API_BASE_URL, type Profile } from "@/lib/api";
import { useLogout } from "@/hooks/use-auth";
import { ROUTES } from "@/lib/constants";
import { initials, roleLabel } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu({ profile }: { profile: Profile }) {
  const router = useRouter();
  const logout = useLogout();

  async function handleLogout() {
    await logout.mutateAsync();
    router.replace(ROUTES.login);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open account menu"
        className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar>
          {/* fetch_profile_picture 404s when absent → Base UI falls back to initials */}
          <AvatarImage src={`${API_BASE_URL}/fetch_profile_picture`} alt={profile.name} />
          <AvatarFallback>{initials(profile.name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex flex-col px-2 py-1.5">
          <span className="truncate text-sm font-medium">{profile.name}</span>
          <span className="truncate text-xs text-muted-foreground">{roleLabel(profile.role)}</span>
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
