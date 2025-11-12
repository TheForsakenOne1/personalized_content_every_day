"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/store/authStore";

export default function VerifyEmailPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser, setAccessToken } = useAuthStore();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await authApi.verifyEmail(token);

        // Store user and token
        setUser(response.user);
        setAccessToken(response.accessToken);

        setIsSuccess(true);
        toast.success("Email verified!", {
          description: "Your account is now active.",
        });

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Verification failed. The link may be invalid or expired."
        );
        toast.error("Verification failed", {
          description: "The verification link may be invalid or expired.",
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [token, router, setUser, setAccessToken]);

  if (isVerifying) {
    return (
      <AuthLayout title="Verifying your email" subtitle="Please wait...">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-6 py-8"
        >
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <Loader2 className="h-10 w-10 text-blue-600 dark:text-blue-400 animate-spin" />
          </div>

          <p className="text-gray-600 dark:text-gray-400">
            We're verifying your email address...
          </p>
        </motion.div>
      </AuthLayout>
    );
  }

  if (isSuccess) {
    return (
      <AuthLayout
        title="Email verified!"
        subtitle="Your account is now active"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </motion.div>
          </div>

          <div className="space-y-2">
            <p className="text-gray-600 dark:text-gray-400">
              Your email has been successfully verified! You're being redirected
              to your dashboard...
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              Go to Dashboard
            </Button>

            <Link
              href="/"
              className="text-sm font-medium text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              Return to home
            </Link>
          </div>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Verification failed"
      subtitle="Unable to verify your email"
      showBackToLogin
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>

        <div className="space-y-2">
          <p className="text-gray-600 dark:text-gray-400">
            {error ||
              "The verification link is invalid or has expired. Please request a new verification email."}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/auth/login">
            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all">
              Sign in to resend
            </Button>
          </Link>

          <Link
            href="/auth/register"
            className="text-sm font-medium text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          >
            Create new account
          </Link>
        </div>
      </motion.div>
    </AuthLayout>
  );
}
