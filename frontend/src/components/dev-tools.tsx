"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { toast } from "sonner";

export function DevTools() {
  const router = useRouter();
  const { setUser, setAccessToken } = useAuthStore();
  const { completeOnboarding } = useOnboardingStore();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Shift + A to activate mock authentication
      if (e.shiftKey && e.key === "A") {
        activateMockAuth();
      }
    };

    const activateMockAuth = () => {
      // Mock user data
      const mockUser = {
        id: "mock-user-123",
        email: "demo@vidya.com",
        username: "demo",
        fullName: "Demo User",
        avatarUrl: null,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        isActive: true,
      };

      // Mock access token
      const mockToken = "mock-jwt-token-for-development";

      // Set auth state
      setUser(mockUser);
      setAccessToken(mockToken);

      // Complete onboarding
      completeOnboarding();

      // Store in localStorage for persistence
      localStorage.setItem("mock-auth", "true");
      localStorage.setItem("mock-user", JSON.stringify(mockUser));

      // Show success notification
      toast.success("🔓 Dev Mode Activated", {
        description: "Logged in as Demo User",
        duration: 3000,
      });

      // Redirect to dashboard
      router.push("/dashboard");
    };

    window.addEventListener("keydown", handleKeyPress);

    // Auto-activate if mock-auth is set
    if (typeof window !== "undefined") {
      const mockAuthActive = localStorage.getItem("mock-auth");
      const mockUser = localStorage.getItem("mock-user");

      if (mockAuthActive === "true" && mockUser) {
        try {
          const parsedUser = JSON.parse(mockUser);
          // Convert string dates back to Date objects
          const user = {
            ...parsedUser,
            createdAt: new Date(parsedUser.createdAt),
            updatedAt: new Date(parsedUser.updatedAt),
            lastLoginAt: parsedUser.lastLoginAt ? new Date(parsedUser.lastLoginAt) : null,
          };
          setUser(user);
          setAccessToken("mock-jwt-token-for-development");
          completeOnboarding();
        } catch (error) {
          console.error("Failed to restore mock auth:", error);
        }
      }
    }

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [router, setUser, setAccessToken, completeOnboarding]);

  // Show dev indicator if mock auth is active
  if (typeof window !== "undefined" && localStorage.getItem("mock-auth") === "true") {
    return (
      <div className="fixed bottom-4 left-4 z-[9999] hidden md:block">
        <div className="bg-yellow-500 text-black px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-black rounded-full animate-pulse" />
          DEV MODE
        </div>
      </div>
    );
  }

  return null;
}
