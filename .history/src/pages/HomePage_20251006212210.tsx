import React, {useState, useEffect, useRef, useCallback} from "react";
import TagSidebar from "../components/TagSidebar";
import ProductGrid from "../components/ProductGrid";
import ProductDetailModal from "../components/ProductDetailModal";
import ViewToggle from "../components/ViewToggle";
import {fetchAllProducts, fetchProductsByTag, searchProducts} from "../services/api";
import type {Product, Tag} from "../types/index";
import type {ViewMode} from "../components/ViewToggle";

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [selectedMainTag, setSelectedMainTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isLoadingRef = useRef<boolean>(false);
  const selectedTagIdRef = useRef<string | null>(null);
  const selectedMainTagRef = useRef<string | null>(null);

  const loadAllProducts = useCallback(
    async (page: number = 1, reset: boolean = false) => {
      // Prevent concurrent loads
      if (isLoadingRef.current) {
        console.log("Already loading, skipping...");
        return;
      }

      try {
        isLoadingRef.current = true;
        if (reset) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setError(null);

        const {products: productsData, currentPage: responsePage} =
          await fetchAllProducts(page, 20);

        if (reset) {
          setAllProducts(productsData);
          setProducts(productsData);
          setCurrentPage(responsePage);
        } else {
          setAllProducts((prev) => [...prev, ...productsData]);
          setProducts((prev) => [...prev, ...productsData]);
          setCurrentPage(responsePage);
        }

        // If we got less than 20 items, we've reached the end
        setHasMore(productsData.length === 20);
      } catch (err) {
        setError("Бүтээгдэхүүн ачаалахад алдаа гарлаа");
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        isLoadingRef.current = false;
      }
    },
    []
  );

  const loadProductsByTag = useCallback(
    async (tagId: string, page: number = 1, reset: boolean = false) => {
      // Prevent concurrent loads
      if (isLoadingRef.current) {
        console.log("Already loading tag products, skipping...");
        return;
      }

      try {
        isLoadingRef.current = true;
        if (reset) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setError(null);

        const {products: productsData, currentPage: responsePage} =
          await fetchProductsByTag(tagId, page, 20);

        if (reset) {
          setProducts(productsData);
          setCurrentPage(responsePage);
        } else {
          setProducts((prev) => [...prev, ...productsData]);
          setCurrentPage(responsePage);
        }

        // If we got less than 20 items, we've reached the end
        setHasMore(productsData.length === 20);
      } catch (err) {
        setError("Шүүсэн бүтээгдэхүүн ачаалахад алдаа гарлаа");
        console.error("Error loading filtered products:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        isLoadingRef.current = false;
      }
    },
    []
  );

  const loadSearchResults = useCallback(
    async (query: string, page: number = 1, reset: boolean = false) => {
      // Prevent concurrent loads
      if (isLoadingRef.current) {
        console.log("Already loading search results, skipping...");
        return;
      }

      try {
        isLoadingRef.current = true;
        if (reset) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setError(null);

        const {products: productsData, currentPage: responsePage} =
          await searchProducts(query, page, 20);

        if (reset) {
          setProducts(productsData);
          setCurrentPage(responsePage);
        } else {
          setProducts((prev) => [...prev, ...productsData]);
          setCurrentPage(responsePage);
        }

        // If we got less than 20 items, we've reached the end
        setHasMore(productsData.length === 20);
      } catch (err) {
        setError("Хайлтын үр дүн ачаалахад алдаа гарлаа");
        console.error("Error loading search results:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        isLoadingRef.current = false;
      }
    },
    []
  );

  // Load all products on initial page load
  useEffect(() => {
    loadAllProducts(1, true);
  }, [loadAllProducts]);

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const handleTagSelect = async (tag: Tag | null) => {
    setSelectedTag(tag);
    setSearchQuery(""); // Clear search when selecting tag
    setCurrentPage(1);
    setHasMore(true);

    // Update refs
    selectedTagIdRef.current = tag?._id || null;
    selectedMainTagRef.current = null;

    try {
      setLoading(true);
      setError(null);

      if (tag === null) {
        // Load all products
        await loadAllProducts(1, true);
      } else {
        // Load products filtered by tag with pagination
        const tagId = tag._id ?? tag._id;
        if (!tagId) {
          throw new Error("Тегийн ID байхгүй байна");
        }
        await loadProductsByTag(tagId, 1, true);
      }
    } catch (err) {
      setError("Шүүсэн бүтээгдэхүүн ачаалахад алдаа гарлаа");
      console.error("Error loading filtered products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMainTagSelect = async (mainTag: string | null) => {
    setSelectedMainTag(mainTag);
    setSelectedTag(null); // Clear tag selection when selecting mainTag
    setSearchQuery(""); // Clear search when selecting main tag
    setCurrentPage(1);

    // Update refs
    selectedTagIdRef.current = null;
    selectedMainTagRef.current = mainTag;

    try {
      setLoading(true);
      setError(null);

      if (mainTag === null) {
        // Load all products
        setHasMore(true);
        await loadAllProducts(1, true);
      } else {
        // Filter products by mainTag on the client side
        const filteredProducts = allProducts.filter(
          (product) => product.mainTag === mainTag
        );
        setProducts(filteredProducts);
        setHasMore(false); // Disable infinite scroll for filtered results
      }
    } catch (err) {
      setError("Шүүсэн бүтээгдэхүүн ачаалахад алдаа гарлаа");
      console.error("Error loading filtered products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const handleProductSearch = async (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);

    if (!query.trim()) {
      // If search is empty, show all products or apply current filters
      setHasMore(true); // Re-enable infinite scroll
      
      if (selectedMainTag) {
        const filteredProducts = allProducts.filter(
          (product) => product.mainTag === selectedMainTag
        );
        setProducts(filteredProducts);
        setHasMore(false); // Disable infinite scroll for client-side filtering
      } else if (selectedTag) {
        // Keep current tag filter - reload products for the selected tag
        const tagId = selectedTag._id ?? selectedTag._id;
        if (tagId) {
          await loadProductsByTag(tagId, 1, true);
        }
      } else {
        // Load all products
        await loadAllProducts(1, true);
      }
      return;
    }

    // Use API search for non-empty queries
    try {
      setLoading(true);
      setError(null);
      await loadSearchResults(query, 1, true);
    } catch (err) {
      setError("Хайлтын үр дүн ачаалахад алдаа гарлаа");
      console.error("Error in product search:", err);
    } finally {
      setLoading(false);
    }
  };

  // Infinite scroll observer - simplified to avoid recreation
  const lastProductRef = useCallback(
    (node: HTMLDivElement | null) => {
      // Disconnect existing observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      // Don't create observer if loading or no more items
      if (!node || loading || loadingMore || !hasMore) {
        return;
      }

      // Create new observer
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];

          // Check all conditions before loading
          if (!entry.isIntersecting) return;
          if (isLoadingRef.current) return;
          if (!hasMore) return;

          console.log("Intersection detected, loading more...");

          // Use refs to get current values without causing re-renders
          const tagId = selectedTagIdRef.current;
          const mainTag = selectedMainTagRef.current;
          const currentSearchQuery = searchQuery;

          // If searching, load more search results
          if (currentSearchQuery) {
            loadSearchResults(currentSearchQuery, currentPage + 1, false);
          }
          // If a tag is selected, load more products for that tag
          else if (tagId) {
            loadProductsByTag(tagId, currentPage + 1, false);
          }
          // If no tag or mainTag is selected, load all products
          else if (!mainTag) {
            loadAllProducts(currentPage + 1, false);
          }
          // Note: mainTag filtering is client-side, so no infinite scroll
        },
        {
          root: null,
          rootMargin: "200px", // Load earlier
          threshold: 0,
        }
      );

      observerRef.current.observe(node);
    },
    [
      loading,
      loadingMore,
      hasMore,
      currentPage,
      searchQuery,
      loadProductsByTag,
      loadAllProducts,
    ]
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Бүх тоглоом болон програм-г нэг дороос татаж аваарай
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Та нэг удаа төлөөд бүх тоглоом болон програмыг татаж авах боломжтой.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4 order-2 lg:order-1">
            <TagSidebar
              onTagSelect={handleTagSelect}
              selectedTag={selectedTag}
              onMainTagSelect={handleMainTagSelect}
              selectedMainTag={selectedMainTag}
              products={products}
              onProductSearch={handleProductSearch}
            />
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4 order-1 lg:order-2">
            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/50 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm sm:text-base">
                  {error}
                </p>
                <button
                  onClick={() => loadAllProducts(1, true)}
                  className="mt-2 text-xs sm:text-sm text-red-500 dark:text-red-300 hover:text-red-700 dark:hover:text-red-200 underline"
                >
                  Дахин оролдох
                </button>
              </div>
            )}

            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
                  {searchQuery
                    ? `"${searchQuery}" хайлтын үр дүн`
                    : selectedMainTag
                    ? `${selectedMainTag} Бүтээгдэхүүн`
                    : selectedTag
                    ? `${
                        selectedTag.name || selectedTag.title || selectedTag.tag
                      } Бүтээгдэхүүн`
                    : "Бүх Бүтээгдэхүүн"}
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  {loading
                    ? "Ачааллаж байна..."
                    : `${products.length} бүтээгдэхүүн олдлоо`}
                </p>
              </div>

              {/* View Toggle */}
              <div className="flex-shrink-0">
                <ViewToggle
                  viewMode={viewMode}
                  onViewModeChange={handleViewModeChange}
                />
              </div>
            </div>

            <ProductGrid
              products={products}
              loading={loading}
              onProductClick={handleProductClick}
              viewMode={viewMode}
            />

            {/* Infinite Scroll Loading Indicator */}
            {!loading && hasMore && !selectedMainTag && !searchQuery && (
              <div ref={lastProductRef} className="flex justify-center py-8">
                {loadingMore && (
                  <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                    <svg
                      className="animate-spin h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span className="text-sm">Илүү ачаалж байна...</span>
                  </div>
                )}
              </div>
            )}

            {/* End of Results Message */}
            {!loading && !hasMore && products.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Бүх бүтээгдэхүүн харагдсан байна
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default HomePage;
