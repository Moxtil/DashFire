"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function RouteContext({ children }) {
  const { isSignedIn, isLoaded, user } = useUser();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && path === "/") {
      router.push("/dashboard");
    } else if (!isSignedIn && isLoaded) {
      if (!path.includes("/sign-in")) {
        if (!path.includes("/sign-up")) {
          router.push("/");
        }
      }
    }
  }, [isSignedIn, isLoaded, path, router]);

  return <>{children}</>;
}
