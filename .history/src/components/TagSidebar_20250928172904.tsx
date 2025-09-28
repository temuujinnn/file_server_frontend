import React, {useState, useEffect} from "react";
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
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);

  useEffect(() => {
    const loadTags = async () => {
      try {
        setLoading(true);
        const tagsData = await fetchAdditionalTags();
        setTags(tagsData);

        // Extract additional tags from products
        const gameAdditionalTags: Tag[] = [];
        const softwareAdditionalTags: Tag[] = [];

        products.forEach((product) => {
          if (product.additionalTags && product.additionalTags.length > 0) {
            product.additionalTags.forEach((tag) => {
              if (product.mainTag === "Game") {
                // Avoid duplicates
                if (!gameAdditionalTags.find((t) => t._id === tag._id)) {
                  gameAdditionalTags.push(tag);
                }
              } else if (product.mainTag === "Software") {
                // Avoid duplicates
                if (!softwareAdditionalTags.find((t) => t._id === tag._id)) {
                  softwareAdditionalTags.push(tag);
                }
              }
            });
          }
        });

        // Create mainTag categories based on your product data
        const organizedCategories: Category[] = [
          {
            id: "games",
            name: "Тоглоом",
            mainTagValue: "Game", // Store the actual API value
            icon: "🎮",
            tags: gameAdditionalTags,
            isExpanded: false,
            onclick: () => handleMainTagClick("Game"),
          },
          {
            id: "software",
            name: "Програм",
            mainTagValue: "Software", // Store the actual API value
            icon: "💻",
            tags: softwareAdditionalTags,
            isExpanded: false,
            onclick: () => handleMainTagClick("Software"),
          },
        ];

        setCategories(organizedCategories);
        setError(null);
      } catch (err) {
        setError("Тег ачаалахад алдаа гарлаа");
        console.error("Error loading tags:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTags();
  }, [products]);

  // Separate effect to handle selectedMainTag changes
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const handleTagClick = (tag: Tag) => {
    onTagSelect(tag);
  };

  const handleClearFilter = () => {
    onTagSelect(null);
    if (onMainTagSelect) {
      onMainTagSelect(null);
    }
    // Collapse all categories when clearing filters
    setExpandedCategories(new Set());
  };

  const handleMainTagClick = (mainTag: string) => {
    if (onMainTagSelect) {
      // If same main tag is clicked, clear it
      if (selectedMainTag === mainTag) {
        onMainTagSelect(null);
        onTagSelect(null);
        setExpandedCategories(new Set());
      } else {
        onMainTagSelect(mainTag);
        onTagSelect(null); // Clear additional tag selection

        // Find and expand the corresponding category
        const categoryToExpand = categories.find(
          (cat) => cat.mainTagValue === mainTag
        );
        if (categoryToExpand) {
          setExpandedCategories(new Set([categoryToExpand.id]));
        }
      }
    }
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const isCategoryExpanded = (categoryId: string) => {
    return expandedCategories.has(categoryId);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      if (onProductSearch) {
        onProductSearch(query);
      }
    }, 300); // 300ms delay

    setSearchTimeout(timeout);
  };

  const handleSearchBlur = () => {
    // Clear any pending timeout and apply search immediately
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      setSearchTimeout(null);
    }

    // Ensure search is applied even on blur
    if (onProductSearch) {
      onProductSearch(searchQuery);
    }
  };

  const filterCategoriesBySearch = (categories: Category[], query: string) => {
    if (!query.trim()) return categories;

    return categories
      .map((category) => ({
        ...category,
        tags: category.tags.filter(
          (tag: Tag) =>
            tag.name?.toLowerCase().includes(query.toLowerCase()) ||
            tag.title?.toLowerCase().includes(query.toLowerCase()) ||
            tag.tag?.toLowerCase().includes(query.toLowerCase())
        ),
      }))
      .filter((category) => category.tags.length > 0);
  };

  const filteredCategories = filterCategoriesBySearch(categories, searchQuery);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Ангилал
        </h2>
        <div className="space-y-2">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Ангилал
        </h2>
        <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Ангилал
      </h2>

      {/* Search Input */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Бүтээгдэхүүн хайх..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onBlur={handleSearchBlur}
            className="w-full px-3 py-2 pl-10 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue-500 focus:border-transparent rounded-lg"
          />
          <svg
            className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
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
              className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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

      <div className="space-y-3">
        {/* All Products Button */}
        <button
          onClick={handleClearFilter}
          className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
            selectedTag === null && selectedMainTag === null
              ? "bg-electric-blue-500 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-electric-blue-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Бүх бүтээгдэхүүн
        </button>

        {/* Category Sections */}
        {filteredCategories.map((category) => (
          <div key={category.id} className="space-y-1">
            {/* Category Header */}
            <button
              onClick={() => handleMainTagClick(category.mainTagValue ?? "")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                selectedMainTag === category.mainTagValue
                  ? "bg-electric-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-electric-blue-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-base">{category.icon}</span>
                <span>{category.name}</span>
                {category.tags.length > 0 && (
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      selectedMainTag === category.mainTagValue
                        ? "bg-white/20 text-white"
                        : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {category.tags.length}
                  </span>
                )}
              </div>
              {category.tags.length > 0 && (
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isCategoryExpanded(category.id) ? "rotate-90" : ""
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

            {/* Category Tags - Show when main tag is selected and category is expanded */}
            {selectedMainTag === category.mainTagValue &&
              isCategoryExpanded(category.id) &&
              category.tags.length > 0 && (
                <div className="ml-4 space-y-1 border-l-2 border-electric-blue-200 dark:border-electric-blue-600 pl-3">
                  {category.tags.map((tag) => (
                    <button
                      key={tag.id || tag._id}
                      onClick={() => handleTagClick(tag)}
                      className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-200 ${
                        selectedTag &&
                        (selectedTag.id === tag.id ||
                          selectedTag._id === tag._id)
                          ? "bg-electric-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-electric-blue-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      {tag.name || tag.title || tag.tag}
                    </button>
                  ))}
                </div>
              )}

            {/* Show message if category is selected but has no tags */}
            {selectedMainTag === category.mainTagValue &&
              isCategoryExpanded(category.id) &&
              category.tags.length === 0 && (
                <div className="ml-4 text-xs text-gray-500 dark:text-gray-400 italic">
                  {category.name.toLowerCase()} тег олдсонгүй
                </div>
              )}
          </div>
        ))}

        {/* Fallback for old tag structure */}
        {categories.length === 0 && Array.isArray(tags) && tags.length > 0 && (
          <div className="space-y-1">
            {tags.map((tag: Tag) => (
              <button
                key={tag.id || tag._id}
                onClick={() => handleTagClick(tag)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  selectedTag &&
                  (selectedTag.id === tag.id || selectedTag._id === tag._id)
                    ? "bg-electric-blue-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-electric-blue-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white"
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
        <div className="text-center py-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            "{searchQuery}"-д зориулсан бүтээгдэхүүн олдсонгүй
          </p>
          <button
            onClick={() => handleSearchChange("")}
            className="text-electric-blue-500 hover:text-electric-blue-600 text-xs mt-1 underline"
          >
            Хайлт цэвэрлэх
          </button>
        </div>
      )}

      {/* No categories available */}
      {!searchQuery &&
        categories.length === 0 &&
        (!tags || tags.length === 0) && (
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Ангилал байхгүй
          </p>
        )}
    </div>
  );
};

export default TagSidebar;
