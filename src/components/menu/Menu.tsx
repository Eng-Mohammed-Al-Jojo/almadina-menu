import { useEffect, useState, useMemo, useRef } from "react";
import CategorySection from "./CategorySection";
import ItemRow from "./ItemRow";
import MenuSkeleton from "./MenuSkeleton";
import { AnimatePresence, motion } from "framer-motion";
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

/* ================= Props ================= */
interface Props {
  onLoadingChange?: (loading: boolean) => void;
  onFeaturedCheck?: (hasFeatured: boolean) => void;
  orderSystem?: boolean;
}

import { MenuService } from "../../services/menuService";

/**
 * Loading phases:
 *   "loading"  → Firebase data is still being fetched (LoadingScreen is shown by parent)
 *   "skeleton" → Data arrived, LoadingScreen is fading out, Skeleton shown for 700ms
 *   "ready"    → Full menu rendered
 */
type LoadingPhase = "loading" | "skeleton" | "ready";

/* ================= Configuration ================= */
const MIN_LOADING_TIME = 3000; // وقت شاشة التحميل (مثلاً 3 ثوانٍ)
const SKELETON_DURATION = 800; // وقت الـ Skeleton (مثلاً 0.8 ثانية)

export default function Menu({ onLoadingChange, onFeaturedCheck, orderSystem: initialOrderSystem }: Props) {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [phase, setPhase] = useState<LoadingPhase>("loading");
  const [orderSystem, setOrderSystem] = useState<boolean>(initialOrderSystem ?? true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const isMounted = useRef(true);
  const startTime = useRef(Date.now()); // لتتبع وقت البداية

  /* ================= Data Fetching ================= */
  useEffect(() => {
    isMounted.current = true;
    onLoadingChange?.(true);

    let unsubscribe: (() => void) | null = null;

    const loadData = async () => {
      try {
        // 1. جلب البيانات
        const { data } = await MenuService.getMenuWithFallback();

        if (!isMounted.current) return;

        setCategories(data.categories);
        setSubcategories(data.subcategories);
        setItems(data.items);
        setOrderSystem(data.orderSystem);

        // حساب الوقت المتبقي لضمان ظهور الـ Loading Screen للمدة المطلوبة
        const elapsed = Date.now() - startTime.current;
        const remainingFetchTime = Math.max(0, MIN_LOADING_TIME - elapsed);

        setTimeout(() => {
          if (!isMounted.current) return;

          // 2. إخفاء LoadingScreen (بداية الـ Fade out)
          onLoadingChange?.(false);

          // 3. الدخول في مرحلة الـ Skeleton
          setPhase("skeleton");

          // 4. بعد انتهاء وقت الـ Skeleton، اعرض المنيو الحقيقي
          setTimeout(() => {
            if (isMounted.current) {
              setPhase("ready");
            }
          }, SKELETON_DURATION);

        }, remainingFetchTime);

        // 5. التحديث التلقائي في الخلفية
        unsubscribe = MenuService.subscribeToMenuUpdates((freshData) => {
          if (!isMounted.current) return;
          setCategories(freshData.categories);
          setSubcategories(freshData.subcategories);
          setItems(freshData.items);
          setOrderSystem(freshData.orderSystem);
        });

      } catch (err) {
        console.error("Menu load failed:", err);
        if (isMounted.current) {
          onLoadingChange?.(false);
          setPhase("ready");
        }
      }
    };

    loadData();

    return () => {
      isMounted.current = false;
      unsubscribe?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================= Derived Data ================= */
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

  /* ================= Phase: Loading ================= */
  // Still waiting for data — render nothing (LoadingScreen is in the parent/overlay)
  if (phase === "loading") {
    return null;
  }

  /* ================= Phase: Skeleton ================= */
  if (phase === "skeleton") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-8 pb-32"
      >
        <MenuSkeleton />
      </motion.div>
    );
  }

  /* ================= Phase: Ready ================= */
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-8 pb-32"
    >
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
            {/* Case 1: Search active */}
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
              /* Case 2: Normal category view */
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
    </motion.div>
  );
}