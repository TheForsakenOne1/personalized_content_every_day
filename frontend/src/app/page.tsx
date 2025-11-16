"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
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
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link
                href="/auth/login"
                className="text-gray-900 dark:text-white font-medium hover:text-pink-500 dark:hover:text-pink-400 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/auth/register"
                className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-5 py-2.5 rounded-lg font-medium hover:from-pink-600 hover:to-rose-600 transition-all shadow-md hover:shadow-lg hover:scale-105"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h1 className="text-6xl lg:text-7xl xl:text-8xl font-semibold text-gray-900 dark:text-white leading-tight mb-8">
              Discover content that matters
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-400 mb-12 leading-relaxed">
              Personalized research papers, articles, and videos delivered daily. Stay curious, stay informed.
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-4 rounded-xl text-lg font-medium hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Get started
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Image Grid Section */}
      <section className="pb-20 lg:pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 lg:p-12 border border-gray-200 dark:border-gray-800 hover:border-pink-300 dark:hover:border-pink-900/50 transition-all hover:shadow-lg hover:scale-105 cursor-pointer"
            >
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                Research
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Access the latest academic papers and breakthrough research from top institutions worldwide.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 lg:p-12 border border-gray-200 dark:border-gray-800 hover:border-pink-300 dark:hover:border-pink-900/50 transition-all hover:shadow-lg hover:scale-105 cursor-pointer"
            >
              <div className="text-5xl mb-4">✍️</div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                Articles
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Curated long-form content from leading experts and thought leaders in your field.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 lg:p-12 border border-gray-200 dark:border-gray-800 hover:border-pink-300 dark:hover:border-pink-900/50 transition-all hover:shadow-lg hover:scale-105 cursor-pointer"
            >
              <div className="text-5xl mb-4">🎥</div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                Videos
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Watch educational videos and lectures from renowned educators and scientists.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 lg:py-32 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-5xl lg:text-6xl font-semibold text-gray-900 dark:text-white mb-6">
                Tailored to your interests
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                Our intelligent system learns what topics you care about and surfaces the most relevant content every day.
              </p>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Choose your topics
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Select areas of interest from astronomy to software engineering
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Get daily content
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Receive curated recommendations every morning
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Learn and grow
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Expand your knowledge with quality content
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-12 border border-gray-200 dark:border-gray-800"
            >
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Astronomy
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    New research on exoplanets
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Software
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Latest in machine learning
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      History
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ancient civilizations discovered
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-5xl lg:text-6xl font-semibold text-gray-900 dark:text-white mb-6">
              Start learning today
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
              Join thousands of curious minds discovering new content every day
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-10 py-5 rounded-xl text-lg font-medium hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Create your account
              <ArrowRight className="h-5 w-5" />
            </Link>
            <p className="mt-6 text-sm text-gray-500 dark:text-gray-500">
              Press <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs font-mono mx-1">Shift+A</kbd> to explore with demo data
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <svg
                className="h-6 w-6 text-gray-900 dark:text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.86-.94-7-5.19-7-9V8.3l7-3.5 7 3.5V11c0 3.81-3.14 8.06-7 9z" />
              </svg>
              <span className="font-semibold text-gray-900 dark:text-white">
                Vidya
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              © {new Date().getFullYear()} Vidya. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
