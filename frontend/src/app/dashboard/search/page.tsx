"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, X, Sparkles, TrendingUp, FileText, Tag } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ContentCard, ContentItem } from "@/components/dashboard/content-card";
import { searchService, type SearchSuggestion } from "@/services/api";

const mockSearchResults: ContentItem[] = [
  {
    id: "search-1",
    type: "article",
    title: "Quantum Entanglement: New Experiments Challenge Classical Understanding",
    description: "Groundbreaking research demonstrates quantum effects at unprecedented scales, potentially revolutionizing our understanding of reality and paving the way for quantum internet.",
    source: "Science Magazine",
    author: "Dr. Jennifer Park",
    publishedAt: "2024-01-12",
    thumbnailUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    url: "/content/search-1",
    category: "Physics",
    tags: ["quantum mechanics", "entanglement", "research"],
    readTime: 14,
    isRead: false,
    isSaved: false,
  },
  {
    id: "search-2",
    type: "video",
    title: "The Art of Renaissance Engineering: Building the Impossible",
    description: "How medieval engineers constructed cathedrals and bridges using innovative techniques that still amaze modern architects.",
    source: "Engineering Explained",
    author: "Prof. Thomas Wright",
    publishedAt: "2024-01-10",
    thumbnailUrl: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&q=80",
    url: "/content/search-2",
    category: "History",
    tags: ["engineering", "architecture", "Renaissance"],
    duration: 1800,
    isRead: false,
    isSaved: false,
  },
  {
    id: "search-3",
    type: "paper",
    title: "Machine Learning Applications in Climate Prediction Models",
    description: "A comprehensive study on how advanced AI algorithms are improving the accuracy of long-term climate forecasting and extreme weather prediction.",
    source: "Nature AI",
    author: "Dr. Maria Garcia et al.",
    publishedAt: "2024-01-09",
    thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    url: "/content/search-3",
    category: "AI & Climate",
    tags: ["machine learning", "climate", "prediction models"],
    readTime: 22,
    isRead: true,
    isSaved: true,
  },
  {
    id: "search-4",
    type: "article",
    title: "Geopolitical Implications of Rare Earth Mineral Scarcity",
    description: "Analysis of how the global competition for rare earth elements is reshaping international alliances and economic strategies.",
    source: "Foreign Affairs",
    author: "Robert Johnson",
    publishedAt: "2024-01-08",
    thumbnailUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
    url: "/content/search-4",
    category: "Geopolitics",
    tags: ["rare earths", "economics", "international relations"],
    readTime: 18,
    isRead: false,
    isSaved: false,
  },
  {
    id: "search-5",
    type: "video",
    title: "CRISPR Gene Editing: The Future of Genetic Medicine",
    description: "Leading geneticists explain how CRISPR technology is being used to treat genetic diseases and its ethical implications.",
    source: "Kurzgesagt",
    author: "Science Team",
    publishedAt: "2024-01-07",
    thumbnailUrl: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80",
    url: "/content/search-5",
    category: "Biotechnology",
    tags: ["CRISPR", "genetics", "medicine"],
    duration: 720,
    isRead: false,
    isSaved: true,
  },
];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "article" | "video" | "paper">("all");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounce timer
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Fetch suggestions when user types
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer for debounced search
    debounceTimer.current = setTimeout(async () => {
      try {
        setLoadingSuggestions(true);
        const results = await searchService.getSuggestions(searchQuery, 8);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowResults(query.length > 0);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowResults(true);
    setShowSuggestions(false);
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'content':
        return FileText;
      case 'tag':
        return Tag;
      default:
        return TrendingUp;
    }
  };

  const filteredResults = mockSearchResults.filter((item) => {
    if (activeFilter === "all") return true;
    return item.type === activeFilter;
  });

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl"
        >
          <div className="max-w-3xl mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Search className="h-8 w-8 text-pink-500" />
              <h1 className="text-5xl lg:text-6xl font-semibold text-gray-900 dark:text-white leading-tight">
                Search
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Find papers, articles, and videos across all topics
            </p>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    handleSearch(searchQuery);
                  }
                }}
                onFocus={() => {
                  if (suggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                placeholder="Try 'quantum physics', 'climate change', or 'machine learning'..."
                className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-pink-300 dark:focus:border-pink-700 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setShowResults(false);
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors z-10"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              )}

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && (suggestions.length > 0 || loadingSuggestions) && (
                  <motion.div
                    ref={suggestionsRef}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden z-50"
                  >
                    {loadingSuggestions ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                          <span>Searching...</span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-2">
                        {suggestions.map((suggestion, index) => {
                          const Icon = getSuggestionIcon(suggestion.type);
                          return (
                            <motion.button
                              key={`${suggestion.query}-${index}`}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              onClick={() => handleSuggestionClick(suggestion.query)}
                              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-pink-50 dark:hover:bg-pink-950/20 transition-colors text-left group"
                            >
                              <Icon className="h-4 w-4 text-gray-400 group-hover:text-pink-500 transition-colors flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-gray-900 dark:text-white font-medium truncate">
                                  {suggestion.query}
                                </div>
                                {suggestion.count !== undefined && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {suggestion.count} result{suggestion.count !== 1 ? 's' : ''}
                                  </div>
                                )}
                              </div>
                              <div className="flex-shrink-0 text-xs text-gray-400 capitalize">
                                {suggestion.type}
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Filters */}
            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mt-4"
              >
                <Filter className="h-4 w-4 text-gray-400" />
                <div className="flex gap-2">
                  {(["all", "article", "video", "paper"] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        activeFilter === filter
                          ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      {filter !== "all" && `s`}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {!showResults ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-16 text-center py-20"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-950/20 dark:to-rose-950/20 mb-6">
                  <Sparkles className="h-10 w-10 text-pink-500" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                  Start typing to discover content
                </p>
                <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                  {["quantum physics", "history", "AI", "climate"].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSearch(suggestion)}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-pink-100 dark:hover:bg-pink-950/30 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Results Header */}
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {filteredResults.length} result{filteredResults.length !== 1 && "s"}
                    {activeFilter !== "all" && (
                      <span className="text-gray-500 dark:text-gray-400">
                        {" "}
                        · {activeFilter}s
                      </span>
                    )}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Showing results for "{searchQuery}"
                  </p>
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredResults.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ContentCard content={item} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
