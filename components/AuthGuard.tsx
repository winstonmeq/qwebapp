"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isAuthorized =
    session?.user?.role === "system-admin"

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && !isAuthorized) {
      router.push("/");
    }
  }, [session, status, router, isAuthorized]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
        <span className="text-white text-xl">Loading...</span>
      </div>
    );
  }

  if (!session || !isAuthorized) {
    return null;
  }

  return <>{children}</>;
}