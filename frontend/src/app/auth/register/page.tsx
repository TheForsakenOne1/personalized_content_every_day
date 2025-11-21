"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/store/authStore";
import { useOnboardingStore } from "@/store/onboardingStore";

const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be at most 20 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      ),
    fullName: z.string().optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setAccessToken } = useAuthStore();
  const { resetOnboarding } = useOnboardingStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      fullName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      const { confirmPassword, ...registerData } = data;

      // Step 1: Register the user
      await authApi.register(registerData);

      // Step 2: Automatically log them in
      const authResponse = await authApi.login({
        email: registerData.email,
        password: registerData.password,
      });

      // Step 3: Store tokens and user data in auth store
      setAccessToken(authResponse.accessToken);
      setUser(authResponse.user);

      // Step 4: Reset onboarding state for fresh start
      resetOnboarding();

      toast.success("Welcome to Vidya! 🎉", {
        description: "Let's personalize your experience.",
      });

      // Step 5: Redirect to onboarding
      setTimeout(() => router.push("/onboarding"), 1000);
    } catch (error) {
      toast.error("Registration failed", {
        description:
          error instanceof Error ? error.message : "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="inline-block mb-12">
            <div className="flex items-center gap-2">
              <svg
                className="h-8 w-8 text-primary"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.86-.94-7-5.19-7-9V8.3l7-3.5 7 3.5V11c0 3.81-3.14 8.06-7 9z" />
              </svg>
              <span className="text-xl font-semibold text-gray-900 dark:text-white">
                Vidya
              </span>
            </div>
          </Link>

          {/* Title */}
          <div className="mb-10">
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">
              Welcome to Vidya
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create an account to get started
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-gray-900 dark:text-white font-medium mb-2">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
                {...register("email")}
                disabled={isLoading}
              />
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600 dark:text-red-400 mt-1.5"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </div>

            <div>
              <Label htmlFor="username" className="text-gray-900 dark:text-white font-medium mb-2">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a username"
                autoComplete="username"
                {...register("username")}
                disabled={isLoading}
              />
              {errors.username && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600 dark:text-red-400 mt-1.5"
                >
                  {errors.username.message}
                </motion.p>
              )}
            </div>

            <div>
              <Label htmlFor="fullName" className="text-gray-900 dark:text-white font-medium mb-2">
                Full name <span className="text-gray-400 font-normal">(optional)</span>
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                autoComplete="name"
                {...register("fullName")}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-900 dark:text-white font-medium mb-2">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                autoComplete="new-password"
                {...register("password")}
                disabled={isLoading}
              />
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600 dark:text-red-400 mt-1.5"
                >
                  {errors.password.message}
                </motion.p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-gray-900 dark:text-white font-medium mb-2">
                Confirm password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                autoComplete="new-password"
                {...register("confirmPassword")}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600 dark:text-red-400 mt-1.5"
                >
                  {errors.confirmPassword.message}
                </motion.p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          {/* Terms */}
          <p className="mt-6 text-xs text-center text-gray-500 dark:text-gray-500">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-gray-700 dark:hover:text-gray-400">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-gray-700 dark:hover:text-gray-400">
              Privacy Policy
            </Link>
          </p>

          {/* Links */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-950 text-gray-500 dark:text-gray-400">
                  or
                </span>
              </div>
            </div>

            <Link
              href="/auth/login"
              className="mt-4 block w-full text-center px-6 py-3 border border-gray-900 dark:border-white text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              Sign in to existing account
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Image/Visual (hidden on mobile) */}
      <div className="hidden lg:block flex-1 bg-gray-50 dark:bg-gray-900 relative">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center">
            <div className="text-6xl mb-6">🚀</div>
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">
              Start your learning journey
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Join thousands of learners discovering personalized content tailored to their interests.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
