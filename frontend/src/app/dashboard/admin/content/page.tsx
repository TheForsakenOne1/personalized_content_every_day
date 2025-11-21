"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { AdminRoute } from "@/components/auth/admin-route";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { adminService, categoryService, type Content, type Category } from "@/services/api";
import { logger } from "@/lib/logger";
import { toast } from "sonner";
import {
  FileText,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ExternalLink,
  Filter,
  Video,
  FileCode,
  BookOpen,
  Calendar,
  Eye,
} from "lucide-react";

export default function ContentManagementPage() {
  const [content, setContent] = useState<Content[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContent, setTotalContent] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const limit = 20;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchContent();
  }, [currentPage, selectedCategory, selectedType]);

  useEffect(() => {
    // Reset to page 1 when search changes
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchContent();
    }
  }, [searchQuery]);

  const fetchCategories = async () => {
    try {
      const cats = await categoryService.getCategories();
      setCategories(cats);
    } catch (error) {
      logger.error("Failed to fetch categories", error);
    }
  };

  const fetchContent = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (selectedCategory) {
        params.categoryId = selectedCategory;
      }

      if (selectedType) {
        params.contentType = selectedType;
      }

      const data = await adminService.getContent(params);
      setContent(data.content);
      setTotalPages(data.pagination.totalPages || 1);
      setTotalContent(data.pagination.total || 0);
      setSelectedItems(new Set()); // Clear selection on new fetch
    } catch (error: any) {
      logger.error("Failed to fetch content", error);
      toast.error("Failed to load content", {
        description: error.message || "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contentId: string) => {
    if (!confirm("Are you sure you want to delete this content? This action cannot be undone.")) {
      return;
    }

    try {
      await adminService.deleteContent(contentId);
      toast.success("Content deleted successfully");
      fetchContent();
    } catch (error: any) {
      logger.error("Failed to delete content", error);
      toast.error("Failed to delete content", {
        description: error.message || "Please try again",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) {
      toast.error("No items selected");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${selectedItems.size} content items? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      await adminService.bulkDeleteContent(Array.from(selectedItems));
      toast.success(`Successfully deleted ${selectedItems.size} items`);
      fetchContent();
    } catch (error: any) {
      logger.error("Failed to bulk delete content", error);
      toast.error("Failed to delete content", {
        description: error.message || "Please try again",
      });
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === content.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(content.map((c) => c.id)));
    }
  };

  const toggleSelectItem = (id: string) => {
    const newSet = new Set(selectedItems);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedItems(newSet);
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "article":
        return <FileText className="h-4 w-4" />;
      case "paper":
        return <FileCode className="h-4 w-4" />;
      case "blog":
        return <BookOpen className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
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
                <FileText className="h-8 w-8 text-pink-500" />
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  Content Management
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {totalContent} total content items
              </p>
            </div>

            {selectedItems.size > 0 && (
              <Button
                onClick={handleBulkDelete}
                disabled={deleting}
                variant="destructive"
                className="gap-2"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete Selected ({selectedItems.size})
              </Button>
            )}
          </div>

          {/* Filters */}
          <Card className="p-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by title, author, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Type:
                  </span>
                  <div className="flex gap-2">
                    {["video", "article", "paper", "blog"].map((type) => (
                      <button
                        key={type}
                        onClick={() =>
                          setSelectedType(selectedType === type ? "" : type)
                        }
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          selectedType === type
                            ? "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 border-2 border-pink-500"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category:
                  </span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {(searchQuery || selectedCategory || selectedType) && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("");
                      setSelectedType("");
                    }}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </Card>

          {/* Content Table */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
            </div>
          ) : content.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No content found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your filters or search query
              </p>
            </Card>
          ) : (
            <>
              {/* Select All */}
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedItems.size === content.length && content.length > 0}
                    onChange={toggleSelectAll}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Select all on this page
                  </span>
                </div>
              </Card>

              {/* Content List */}
              <div className="space-y-3">
                {content.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <Checkbox
                          checked={selectedItems.has(item.id)}
                          onChange={() => toggleSelectItem(item.id)}
                          className="mt-1"
                        />

                        {/* Thumbnail */}
                        {item.thumbnailUrl && (
                          <img
                            src={item.thumbnailUrl}
                            alt={item.title}
                            className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                          />
                        )}

                        {/* Content Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/dashboard/content/${item.id}`}
                                className="group"
                              >
                                <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                                  {item.title}
                                </h3>
                              </Link>
                              {item.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                                  {item.description}
                                </p>
                              )}
                              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600 dark:text-gray-400">
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800">
                                  {getContentIcon(item.contentType)}
                                  <span className="capitalize">{item.contentType}</span>
                                </span>
                                {item.category && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-lg bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400">
                                    {item.category.name}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {formatDate(item.publishedAt || item.createdAt)}
                                </span>
                                {item.author && (
                                  <span className="truncate max-w-xs">By {item.author}</span>
                                )}
                                <span className="truncate max-w-xs">{item.source}</span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                title="View original"
                              >
                                <ExternalLink className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                              </a>
                              <Link
                                href={`/dashboard/content/${item.id}`}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                title="View details"
                              >
                                <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                              </Link>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {/* Pagination */}
          {!loading && content.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {(currentPage - 1) * limit + 1} to{" "}
                  {Math.min(currentPage * limit, totalContent)} of {totalContent} items
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
