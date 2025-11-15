"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Loader2,
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { authApi } from "@/lib/api/auth";

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
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// Password strength checker
function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  if (score <= 2)
    return { score, label: "Weak", color: "bg-red-500 dark:bg-red-600" };
  if (score <= 4)
    return {
      score,
      label: "Medium",
      color: "bg-yellow-500 dark:bg-yellow-600",
    };
  return { score, label: "Strong", color: "bg-green-500 dark:bg-green-600" };
}

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "",
    color: "",
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      fullName: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const password = watch("password");

  // Update password strength as user types
  useState(() => {
    if (password) {
      setPasswordStrength(getPasswordStrength(password));
    }
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      const { confirmPassword, acceptTerms, ...registerData } = data;
      await authApi.register(registerData);

      toast.success("Account created successfully!", {
        description: "Please check your email for verification.",
      });

      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (error) {
      toast.error("Registration failed", {
        description:
          error instanceof Error ? error.message : "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Password requirements
  const requirements = [
    { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
    { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
    { label: "One number", test: (p: string) => /[0-9]/.test(p) },
    {
      label: "One special character",
      test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
    },
  ];

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Start your personalized learning journey"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
            Email address
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="pl-10"
              {...register("email")}
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-600 dark:text-red-400"
            >
              {errors.email.message}
            </motion.p>
          )}
        </div>

        {/* Username Field */}
        <div className="space-y-2">
          <Label
            htmlFor="username"
            className="text-gray-700 dark:text-gray-300"
          >
            Username
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="username"
              type="text"
              placeholder="johndoe"
              className="pl-10"
              {...register("username")}
              disabled={isLoading}
            />
          </div>
          {errors.username && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-600 dark:text-red-400"
            >
              {errors.username.message}
            </motion.p>
          )}
        </div>

        {/* Full Name Field */}
        <div className="space-y-2">
          <Label
            htmlFor="fullName"
            className="text-gray-700 dark:text-gray-300"
          >
            Full name <span className="text-gray-400">(optional)</span>
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder="John Doe"
            {...register("fullName")}
            disabled={isLoading}
          />
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-gray-700 dark:text-gray-300"
          >
            Password
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pl-10 pr-10"
              {...register("password")}
              disabled={isLoading}
              onChange={(e) => {
                register("password").onChange(e);
                setPasswordStrength(getPasswordStrength(e.target.value));
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
              )}
            </button>
          </div>
          {errors.password && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-600 dark:text-red-400"
            >
              {errors.password.message}
            </motion.p>
          )}

          {/* Password Strength Indicator */}
          {password && password.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(passwordStrength.score / 6) * 100}%`,
                    }}
                    className={`h-full ${passwordStrength.color} transition-all`}
                  />
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {passwordStrength.label}
                </span>
              </div>

              {/* Password Requirements */}
              <div className="grid grid-cols-1 gap-1">
                {requirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {req.test(password) ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                    <span
                      className={`text-xs ${
                        req.test(password)
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label
            htmlFor="confirmPassword"
            className="text-gray-700 dark:text-gray-300"
          >
            Confirm password
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pl-10 pr-10"
              {...register("confirmPassword")}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-600 dark:text-red-400"
            >
              {errors.confirmPassword.message}
            </motion.p>
          )}
        </div>

        {/* Terms & Conditions */}
        <div className="space-y-2">
          <Checkbox
            id="acceptTerms"
            label={
              <span className="text-sm text-gray-600 dark:text-gray-400">
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-primary hover:text-primary/80 font-medium"
                  target="_blank"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-primary hover:text-primary/80 font-medium"
                  target="_blank"
                >
                  Privacy Policy
                </Link>
              </span>
            }
            {...register("acceptTerms")}
            disabled={isLoading}
          />
          {errors.acceptTerms && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-600 dark:text-red-400"
            >
              {errors.acceptTerms.message}
            </motion.p>
          )}
        </div>

        {/* Submit Button */}
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

        {/* Sign In Link */}
        <div className="text-center pt-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
