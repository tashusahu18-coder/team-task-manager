"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type User = {
  id: string;
  name: string;
  email: string;
};

export function useAuth({ redirectToLogin = false } = {}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    api
      .get<{ user: User }>("/auth/me")
      .then((response) => {
        if (mounted) {
          setUser(response.data.user);
        }
      })
      .catch(() => {
        if (mounted) {
          setUser(null);
          if (redirectToLogin) router.replace("/login");
        }
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [redirectToLogin, router]);

  return { user, isLoading };
}
