"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AdminRoute } from "@/components/auth/admin-route";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { adminService, type AdminUser, type UserListParams } from "@/services/api";
import { logger } from "@/lib/logger";
import { toast } from "sonner";
import {
  Users,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldOff,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  Activity,
} from "lucide-react";

export default function UsersManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  const [filterAdmin, setFilterAdmin] = useState<boolean | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const limit = 20;

  useEffect(() => {
    fetchUsers();
  }, [currentPage, filterActive, filterAdmin]);

  useEffect(() => {
    // Reset to page 1 when search changes
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchUsers();
    }
  }, [searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: UserListParams = {
        page: currentPage,
        limit,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (filterActive !== undefined) {
        params.isActive = filterActive;
      }

      if (filterAdmin !== undefined) {
        params.isAdmin = filterAdmin;
      }

      const data = await adminService.getUsers(params);
      setUsers(data.users);
      setTotalPages(data.pagination.totalPages);
      setTotalUsers(data.pagination.total);
    } catch (error: any) {
      logger.error("Failed to fetch users", error);
      toast.error("Failed to load users", {
        description: error.message || "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await adminService.toggleUserStatus(userId, !currentStatus);
      toast.success(`User ${!currentStatus ? "activated" : "deactivated"} successfully`);
      fetchUsers();
    } catch (error: any) {
      logger.error("Failed to toggle user status", error);
      toast.error("Failed to update user status", {
        description: error.message || "Please try again",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <AdminRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-8 w-8 text-pink-500" />
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  User Management
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {totalUsers} total users
              </p>
            </div>
          </div>

          {/* Filters */}
          <Card className="p-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by email, username, or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter Toggles */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setFilterActive(filterActive === true ? undefined : true)
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filterActive === true
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-2 border-green-500"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <UserCheck className="inline h-4 w-4 mr-2" />
                    Active Only
                  </button>
                  <button
                    onClick={() =>
                      setFilterActive(filterActive === false ? undefined : false)
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filterActive === false
                        ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-2 border-red-500"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <UserX className="inline h-4 w-4 mr-2" />
                    Inactive Only
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setFilterAdmin(filterAdmin === true ? undefined : true)
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filterAdmin === true
                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-2 border-purple-500"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <ShieldCheck className="inline h-4 w-4 mr-2" />
                    Admins Only
                  </button>
                </div>

                {(filterActive !== undefined || filterAdmin !== undefined || searchQuery) && (
                  <button
                    onClick={() => {
                      setFilterActive(undefined);
                      setFilterAdmin(undefined);
                      setSearchQuery("");
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </Card>

          {/* Users Table */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
            </div>
          ) : users.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No users found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your filters or search query
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {users.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.username}
                              className="w-12 h-12 rounded-full"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white font-semibold text-lg">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                              {user.fullName || user.username}
                            </h3>
                            {user.isAdmin && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                                <ShieldCheck className="h-3 w-3" />
                                Admin
                              </span>
                            )}
                            {!user.isActive && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                                Inactive
                              </span>
                            )}
                            {user.emailVerified && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                <Mail className="h-3 w-3" />
                                Verified
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {user.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Joined {formatDate(user.createdAt)}
                            </span>
                            {user.lastLoginAt && (
                              <span className="flex items-center gap-1">
                                <Activity className="h-4 w-4" />
                                Last login {formatDate(user.lastLoginAt)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                          <Switch
                            checked={user.isActive}
                            onCheckedChange={() =>
                              handleToggleStatus(user.id, user.isActive)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && users.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {(currentPage - 1) * limit + 1} to{" "}
                  {Math.min(currentPage * limit, totalUsers)} of {totalUsers} users
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </AdminRoute>
  );
}
