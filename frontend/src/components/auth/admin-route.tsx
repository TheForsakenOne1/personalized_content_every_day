"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const router = useRouter();
  const { user, accessToken, setUser, setAccessToken, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAdminAuth = async () => {
      // Check if we have an access token
      if (!accessToken) {
        // Try to refresh the token
        try {
          const newAccessToken = await authApi.refreshToken();
          setAccessToken(newAccessToken);

          // Fetch user data
          const userData = await authApi.getCurrentUser();
          setUser(userData);

          // Check if user is admin
          if (!userData.isAdmin) {
            setIsAuthorized(false);
            setIsLoading(false);
            return;
          }

          setIsAuthorized(true);
        } catch (error) {
          // Redirect to login
          logout();
          router.push("/auth/login?returnUrl=/dashboard/admin");
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

          // Check if user is admin
          if (!userData.isAdmin) {
            setIsAuthorized(false);
            setIsLoading(false);
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

            if (!userData.isAdmin) {
              setIsAuthorized(false);
              setIsLoading(false);
              return;
            }

            setIsAuthorized(true);
          } catch (refreshError) {
            logout();
            router.push("/auth/login?returnUrl=/dashboard/admin");
          }
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // Check if user is admin
      if (!user.isAdmin) {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      // User is authenticated and is admin
      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAdminAuth();
  }, [accessToken, user, router, setUser, setAccessToken, logout]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-pink-600 dark:text-pink-400 mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">
            Checking authorization...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-6 p-8 max-w-md">
          <div className="flex justify-center">
            <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full">
              <ShieldAlert className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Access Denied
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              You don't have permission to access the admin dashboard. This area
              is restricted to administrators only.
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Link href="/dashboard">
              <Button variant="outline">Go to Dashboard</Button>
            </Link>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
