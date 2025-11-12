"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmailVerification?: boolean;
}

export function ProtectedRoute({
  children,
  requireEmailVerification = false,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, accessToken, setUser, setAccessToken, logout } =
    useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Check if we have an access token
      if (!accessToken) {
        // Try to refresh the token
        try {
          const newAccessToken = await authApi.refreshToken();
          setAccessToken(newAccessToken);

          // Fetch user data
          const userData = await authApi.getCurrentUser();
          setUser(userData);

          // Check email verification if required
          if (requireEmailVerification && !userData.emailVerified) {
            router.push("/auth/verify-required");
            return;
          }

          setIsAuthorized(true);
        } catch (error) {
          // Redirect to login with return URL
          logout();
          router.push(
            `/auth/login?returnUrl=${encodeURIComponent(pathname || "/")}`
          );
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // We have an access token, check if we have user data
      if (!user) {
        try {
          const userData = await authApi.getCurrentUser();
          setUser(userData);

          // Check email verification if required
          if (requireEmailVerification && !userData.emailVerified) {
            router.push("/auth/verify-required");
            return;
          }

          setIsAuthorized(true);
        } catch (error) {
          // Token is invalid, try to refresh
          try {
            const newAccessToken = await authApi.refreshToken();
            setAccessToken(newAccessToken);

            const userData = await authApi.getCurrentUser();
            setUser(userData);

            if (requireEmailVerification && !userData.emailVerified) {
              router.push("/auth/verify-required");
              return;
            }

            setIsAuthorized(true);
          } catch (refreshError) {
            logout();
            router.push(
              `/auth/login?returnUrl=${encodeURIComponent(pathname || "/")}`
            );
          }
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // Check email verification if required
      if (requireEmailVerification && !user.emailVerified) {
        router.push("/auth/verify-required");
        setIsLoading(false);
        return;
      }

      // User is authenticated
      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [
    accessToken,
    user,
    router,
    pathname,
    setUser,
    setAccessToken,
    logout,
    requireEmailVerification,
  ]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
