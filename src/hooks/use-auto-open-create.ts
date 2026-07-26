"use client";

/** Opens the create dialog when the page is reached via a `?create=true` link (e.g. dashboard quick actions), then strips the param. */
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export function useAutoOpenCreate(onOpen: () => void) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("create") === "true") {
      onOpen();
      router.replace(pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
