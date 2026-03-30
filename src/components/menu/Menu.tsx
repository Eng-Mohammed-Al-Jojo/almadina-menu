import { useEffect, useState, useMemo } from "react";
import CategorySection from "./CategorySection";
import ItemRow from "./ItemRow";
import MenuSkeleton from "./MenuSkeleton";
import LoadingScreen from "../common/LoadingScreen";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FiSearch, FiX } from "react-icons/fi";
import { FaCommentDots } from "react-icons/fa";
import FeedbackModal from "./FeedbackModal";

/* ================= Types ================= */
export interface Category {
  id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  available?: boolean;
  order?: number;
  image?: string;
  visible?: boolean;
}

export interface Subcategory {
  id: string;
  nameAr: string;
  nameEn?: string;
  categoryId: string;
  image?: string;
  visible?: boolean;
  order?: number;
}

export interface Item {
  featured: any;
  image: string | undefined;
  id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  price: number;
  ingredients?: string;
  ingredientsAr?: string;
  ingredientsEn?: string;
  priceTw?: number;
  categoryId: string;
  subcategoryId?: string | null;
  visible?: boolean;
  star?: boolean;
  createdAt?: number;
  order?: number;
}

/* ================= Main Component ================= */
interface Props {
  onLoadingChange?: (loading: boolean) => void;
  onFeaturedCheck?: (hasFeatured: boolean) => void;
  orderSystem?: boolean; // لو بدك تمرره من بره MenuPage
}

import { MenuService } from "../../services/menuService";

export default function Menu({ onLoadingChange, onFeaturedCheck, orderSystem: initialOrderSystem }: Props) {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loadingPhase, setLoadingPhase] = useState<"splash" | "skeleton" | "ready">("splash");
  const [orderSystem, setOrderSystem] = useState<boolean>(initialOrderSystem ?? true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [startTime] = useState(Date.now());

  /* ================= Data Fetching ================= */
  useEffect(() => {
    onLoadingChange?.(true);
    let isMounted = true;

    // Transition from splash to skeleton after 1200ms
    const splashTimer = setTimeout(() => {
      if (isMounted) {
        setLoadingPhase((prev) => (prev === "splash" ? "skeleton" : prev));
      }
    }, 1200);

    const loadData = async () => {
      // 1. Fetch initial fast data
      const { data } = await MenuService.getMenuWithFallback();
      
      if (!isMounted) return;

      setCategories(data.categories);
      setSubcategories(data.subcategories);
      setItems(data.items);
      setOrderSystem(data.orderSystem);

      // We want to enter "ready" phase only after splash (1200ms) + skeleton (800ms) = 2000ms minimum.
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 2000 - elapsed);

      setTimeout(() => {
        if (isMounted) {
          setLoadingPhase("ready");
          onLoadingChange?.(false);
        }
      }, remaining);

      // 2. Subscribe to background real-time updates to keep data fresh without loading spinners
      const unsubscribe = MenuService.subscribeToMenuUpdates((freshData) => {
        if (isMounted) {
          setCategories(freshData.categories);
          setSubcategories(freshData.subcategories);
          setItems(freshData.items);
          setOrderSystem(freshData.orderSystem);
        }
      });

      return unsubscribe;
    };

    const cleanupPromise = loadData();

    return () => {
      isMounted = false;
      clearTimeout(splashTimer);
      cleanupPromise.then(unsub => unsub && unsub());
    };
  }, [onLoadingChange]);

  /* ================= Filtered Data ================= */
  const featuredItems = useMemo(() => items.filter(i => i.star === true && i.visible !== false), [items]);
  const availableCategories = useMemo(() => categories.filter(cat => cat.available), [categories]);

  const filteredItems = useMemo(() => {
    const search = searchTerm?.toLowerCase() ?? "";
    return items.filter((item) => {
      if (!item) return false;
      const name = (item.nameAr || item.name || "").toLowerCase();
      const ingredients = (item.ingredientsAr || item.ingredients || "").toLowerCase();

      return name.includes(search) || ingredients.includes(search);
    });
  }, [items, searchTerm]);

  useEffect(() => {
    onFeaturedCheck?.(featuredItems.length > 0);
  }, [featuredItems, onFeaturedCheck]);

  if (loadingPhase === "splash") {
    return <LoadingScreen />;
  }

  if (loadingPhase === "skeleton") {
    return (
      <div className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-8 pb-32">
        <MenuSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-8 pb-32">
      {/* Header / Search Section */}
      <div className="flex flex-col items-center mb-10 gap-6">
        <div className="w-full max-w-2xl relative group">

          {/* Search Icon */}
          <FiSearch className="right-5 absolute top-1/2 -translate-y-1/2 
    text-(--text-muted) group-focus-within:text-primary 
    transition-colors text-lg" />

          <input
            type="text"
            placeholder={t('common.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-(--bg-card)/70 backdrop-blur-xl 
      border border-(--border-color) rounded-3xl 
      py-3 pr-12 pl-5 text-sm font-semibold 
      focus:ring-4 focus:ring-primary/10 focus:border-primary 
      outline-none transition-all shadow-md text-right"
          />

          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 
        w-7 h-7 rounded-lg bg-(--bg-main) 
        flex items-center justify-center 
        text-(--text-muted) hover:text-red-500 
        transition-all border border-(--border-color)"
            >
              <FiX size={14} />
            </button>
          )}
        </div>

        {/* Search Results Title */}
        {searchTerm && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="h-px w-8 bg-primary/30" />
            <h3 className="text-xl font-black text-(--text-main)">
              {t('common.results_for')} "{searchTerm}"
            </h3>
            <div className="h-px w-8 bg-primary/30" />
          </motion.div>
        )}
      </div>

      {/* Main Content Area */}
      <main className="min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={searchTerm}
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Case 1: Search active - show flat list of items */}
            {searchTerm ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <ItemRow key={item.id} item={item} orderSystem={orderSystem} />
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-32 text-(--text-muted) bg-(--bg-card)/30 rounded-4xl border-2 border-dashed border-(--border-color)">
                    <div className="w-24 h-24 rounded-4xl bg-(--bg-main) flex items-center justify-center mb-6 text-5xl shadow-inner opacity-40">
                      🔍
                    </div>
                    <p className="text-2xl font-black text-(--text-main)">{t('menu.no_results')}</p>
                    <button
                      onClick={() => setSearchTerm("")}
                      className="mt-8 px-10 py-4 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                    >
                      {t('common.all')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Case 2: Normal view - Category Cards with Accordions */
              <div className="flex flex-col gap-6">
                {availableCategories.map((cat, index) => {
                  const catItems = items.filter((i) => i.categoryId === cat.id && i.visible !== false);
                  if (!catItems.length) return null;
                  return (
                    <CategorySection
                      key={cat.id}
                      category={cat}
                      subcategories={subcategories}
                      items={catItems}
                      orderSystem={orderSystem}
                      index={index}
                    />
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Feedback Button Floating */}
      <button
        onClick={() => setShowFeedbackModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-2xl shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group"
      >
        <FaCommentDots size={24} />
        <span className="absolute right-full mr-4 bg-primary text-white px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl shadow-primary/20">
          {t('admin.feedback')}
        </span>
      </button>

      {/* Feedback Modal */}
      <FeedbackModal
        show={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        orderSystem={orderSystem}
      />
    </div>
  );
}