import React, {useState, useEffect, useCallback, useMemo, useRef} from "react";
import {fetchAdditionalTags} from "../services/api";
import type {Tag, Category, Product} from "../types/index";

interface TagSidebarProps {
  onTagSelect: (tag: Tag | null) => void;
  selectedTag: Tag | null;
  onMainTagSelect?: (mainTag: string | null) => void;
  selectedMainTag?: string | null;
  products?: Product[];
  onProductSearch?: (query: string) => void;
}

const TagSidebar: React.FC<TagSidebarProps> = ({
  onTagSelect,
  selectedTag,
  onMainTagSelect,
  selectedMainTag,
  products = [],
  onProductSearch,
}) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Use refs for timeouts to avoid state updates
  const searchTimeoutRef = useRef<number | null>(null);
  const animationTimeoutRef = useRef<number | null>(null);

  // Optimized handlers with better performance
  const handleMainTagClick = useCallback(
    (mainTag: string) => {
      if (!onMainTagSelect) return;

      if (selectedMainTag === mainTag) {
        // Deselecting current main tag - immediate feedback
        onMainTagSelect(null);
        onTagSelect(null);
        // Smooth collapse animation
        setTimeout(() => {
          setExpandedCategories(new Set());
        }, 100);
      } else {
        // Selecting new main tag - smooth transition
        onMainTagSelect(mainTag);
        onTagSelect(null);

        const categoryToExpand = categories.find(
          (cat) => cat.mainTagValue === mainTag
        );
        if (categoryToExpand) {
          // Small delay to allow smooth expand animation
          setTimeout(() => {
            setExpandedCategories(new Set([categoryToExpand.id]));
          }, 50);
        }
      }
    },
    [onMainTagSelect, selectedMainTag, onTagSelect, categories]
  );

  const handleTagClick = useCallback(
    (tag: Tag) => {
      onTagSelect(tag);
    },
    [onTagSelect]
  );

  const handleClearFilter = useCallback(() => {
    // Immediate visual feedback
    onTagSelect(null);
    if (onMainTagSelect) {
      onMainTagSelect(null);
    }

    // Smooth collapse animation
    setTimeout(() => {
      setExpandedCategories(new Set());
    }, 100);
  }, [onTagSelect, onMainTagSelect]);

  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);

      // Clear existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Set new timeout
      searchTimeoutRef.current = setTimeout(() => {
        if (onProductSearch) {
          onProductSearch(query);
        }
      }, 300);
    },
    [onProductSearch]
  );

  const handleSearchBlur = useCallback(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    if (onProductSearch) {
      onProductSearch(searchQuery);
    }
  }, [onProductSearch, searchQuery]);

  const isCategoryExpanded = useCallback(
    (categoryId: string) => {
      return expandedCategories.has(categoryId);
    },
    [expandedCategories]
  );

  // Memoize filtered categories to prevent unnecessary recalculations
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;

    return categories
      .map((category) => ({
        ...category,
        tags: category.tags.filter(
          (tag: Tag) =>
            tag.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tag.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tag.tag?.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
      .filter((category) => category.tags.length > 0);
  }, [categories, searchQuery]);

  // Memoize category processing to avoid recalculating on every render
  const processedCategories = useMemo(() => {
    const gameAdditionalTags: Tag[] = [];
    const softwareAdditionalTags: Tag[] = [];

    products.forEach((product) => {
      if (product.additionalTags && product.additionalTags.length > 0) {
        product.additionalTags.forEach((tag) => {
          if (product.mainTag === "Game") {
            if (!gameAdditionalTags.find((t) => t._id === tag._id)) {
              gameAdditionalTags.push(tag);
            }
          } else if (product.mainTag === "Software") {
            if (!softwareAdditionalTags.find((t) => t._id === tag._id)) {
              softwareAdditionalTags.push(tag);
            }
          }
        });
      }
    });

    return [
      {
        id: "games",
        name: "Тоглоом",
        mainTagValue: "Game",
        icon: "🎮",
        tags: gameAdditionalTags,
        isExpanded: false,
      },
      {
        id: "software",
        name: "Програм",
        mainTagValue: "Software",
        icon: "💻",
        tags: softwareAdditionalTags,
        isExpanded: false,
      },
    ];
  }, [products]);

  useEffect(() => {
    const loadTags = async () => {
      try {
        setLoading(true);
        const tagsData = await fetchAdditionalTags();
        setTags(tagsData);
        setCategories(processedCategories);
        setError(null);
      } catch (err) {
        setError("Тег ачаалахад алдаа гарлаа");
        console.error("Error loading tags:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTags();
  }, [processedCategories]);

  // Handle selectedMainTag changes
  useEffect(() => {
    if (selectedMainTag && categories.length > 0) {
      const categoryToExpand = categories.find(
        (cat) => cat.mainTagValue === selectedMainTag
      );
      if (categoryToExpand) {
        setExpandedCategories(new Set([categoryToExpand.id]));
      }
    } else if (!selectedMainTag) {
      setExpandedCategories(new Set());
    }
  }, [selectedMainTag, categories]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Ангилал
        </h2>
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-md animate-pulse"
              style={{animationDelay: `${index * 0.1}s`}}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-red-200 dark:border-red-700 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Ангилал
        </h2>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-600 dark:text-red-400 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-red-700 dark:text-red-300 text-sm">
              {error}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Ангилал
      </h2>

      {/* Search Input */}
      <div className="mb-6">
        <div className="relative group">
          <input
            type="text"
            placeholder="Бүтээгдэхүүн хайх..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onBlur={handleSearchBlur}
            className="w-full px-4 py-3 pl-11 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg transition-all duration-200 group-hover:border-gray-300 dark:group-hover:border-gray-500"
          />
          <svg
            className="absolute left-3 top-3.5 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 hover:scale-110 transform"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {/* All Products Button */}
        <button
          onClick={handleClearFilter}
          className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ease-out transform hover:scale-[1.01] active:scale-[0.98] ${
            selectedTag === null && selectedMainTag === null
              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.01]"
              : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="text-base">📁</span>
            <span>Бүх бүтээгдэхүүн</span>
          </div>
        </button>

        {/* Category Sections */}
        {filteredCategories.map((category) => (
          <div key={category.id} className="space-y-1">
            {/* Category Header */}
            <button
              onClick={() => handleMainTagClick(category.mainTagValue ?? "")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ease-out transform hover:scale-[1.01] active:scale-[0.98] ${
                selectedMainTag === category.mainTagValue
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.01]"
                  : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg transition-transform duration-200 hover:scale-110">
                  {category.icon}
                </span>
                <span className="font-medium">{category.name}</span>
                {category.tags.length > 0 && (
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium transition-all duration-200 ${
                      selectedMainTag === category.mainTagValue
                        ? "bg-white/20 text-white"
                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {category.tags.length}
                  </span>
                )}
              </div>
              {category.tags.length > 0 && (
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ease-out ${
                    isCategoryExpanded(category.id) ? "rotate-90" : "rotate-0"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </button>

            {/* Category Tags with smooth slide animation */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out transform ${
                selectedMainTag === category.mainTagValue &&
                isCategoryExpanded(category.id)
                  ? "max-h-96 opacity-100 translate-y-0"
                  : "max-h-0 opacity-0 -translate-y-2"
              }`}
            >
              {category.tags.length > 0 && (
                <div className="ml-6 mt-2 space-y-1 border-l-2 border-blue-200 dark:border-blue-600 pl-4">
                  {category.tags.map((tag, index) => (
                    <button
                      key={tag._id || tag._id}
                      onClick={() => handleTagClick(tag)}
                      style={{
                        transitionDelay: `${index * 30}ms`,
                        animationDelay: `${index * 30}ms`,
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 ease-out transform hover:scale-[1.02] active:scale-[0.98] ${
                        selectedTag &&
                        (selectedTag._id === tag._id ||
                          selectedTag._id === tag._id)
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm scale-[1.02]"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600 hover:text-blue-600 dark:hover:text-blue-400 border border-transparent hover:border-blue-200 dark:hover:border-blue-700"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                        <span>{tag.name || tag.title || tag.tag}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Empty state for selected category */}
              {selectedMainTag === category.mainTagValue &&
                isCategoryExpanded(category.id) &&
                category.tags.length === 0 && (
                  <div className="ml-6 mt-2 pl-4 border-l-2 border-gray-200 dark:border-gray-600">
                    <div className="text-xs text-gray-500 dark:text-gray-400 italic py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                          />
                        </svg>
                        <span>{category.name.toLowerCase()} тег олдсонгүй</span>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        ))}

        {/* Fallback for old tag structure */}
        {categories.length === 0 && Array.isArray(tags) && tags.length > 0 && (
          <div className="space-y-1">
            {tags.map((tag: Tag) => (
              <button
                key={tag._id || tag._id}
                onClick={() => handleTagClick(tag)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  selectedTag &&
                  (selectedTag._id === tag._id || selectedTag._id === tag._id)
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/25"
                    : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                }`}
              >
                {tag.name || tag.title || tag.tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* No search results */}
      {searchQuery && filteredCategories.length === 0 && (
        <div className="text-center py-8 animate-fade-in">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border-2 border-dashed border-gray-200 dark:border-gray-600">
            <svg
              className="w-12 h-12 text-gray-400 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
              "{searchQuery}"-д зориулсан бүтээгдэхүүн олдсонгүй
            </p>
            <button
              onClick={() => handleSearchChange("")}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium underline underline-offset-2 transition-colors duration-200"
            >
              Хайлт цэвэрлэх
            </button>
          </div>
        </div>
      )}

      {/* No categories available */}
      {!searchQuery &&
        categories.length === 0 &&
        (!tags || tags.length === 0) && (
          <div className="text-center py-8 animate-fade-in">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border-2 border-dashed border-gray-200 dark:border-gray-600">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Ангилал байхгүй
              </p>
            </div>
          </div>
        )}
    </div>
  );
};

export default TagSidebar;
