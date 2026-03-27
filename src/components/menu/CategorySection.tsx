import { useState, useMemo } from "react";
import ItemRow from "./ItemRow";
import type { Category, Item, Subcategory } from "./Menu";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";

interface Props {
  category: Category;
  subcategories: Subcategory[];
  items: Item[];
  orderSystem: boolean;
}

export default function CategorySection({ category, subcategories, items, orderSystem }: Props) {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const catName = category.nameAr || category.name || "";

  // Group items by subcategory
  const groupedItems = useMemo(() => {
    const groups: Record<string, Item[]> = {};
    const noSubItems: Item[] = [];

    // Filter items by subcategory visibility
    items.forEach(item => {
      const sub = subcategories.find(s => s.id === item.subcategoryId);
      if (item.subcategoryId && sub) {
        // Skip items in hidden subcategories
        if (sub.visible === false) return;

        if (!groups[item.subcategoryId]) groups[item.subcategoryId] = [];
        groups[item.subcategoryId].push(item);
      } else {
        noSubItems.push(item);
      }
    });

    return { groups, noSubItems };
  }, [items, subcategories]);

  const activeSubcategories = useMemo(() => {
    return subcategories
      .filter(sub => sub.categoryId === category.id && sub.visible !== false && groupedItems.groups[sub.id])
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [category.id, subcategories, groupedItems.groups]);

  // If the category itself is hidden, don't show it (handled by parent typically, but good for safety)
  if (category.visible === false) return null;

  // Priority for category image: 1. category.image, 2. first subcategory image, 3. first item image
  const categoryImage = category.image || activeSubcategories[0]?.image || items.find(i => i.image)?.image;

  return (
    <div className="w-full mb-6 px-2 sm:px-0">
      <motion.button
        layout
        onClick={() => setIsOpen(!isOpen)}
        className="w-full relative group overflow-hidden rounded-[2.5rem] bg-(--bg-card) border border-(--border-color) shadow-xl hover:shadow-2xl transition-all duration-500"
      >
        <div className="relative h-50 sm:h-60 w-full overflow-hidden">
          {categoryImage ? (
            <>
              <motion.img
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 1.2 }}
                src={`/images/${categoryImage}`}
                className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-1000"
                alt={catName}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-linear-to-t from-(--bg-card) via-(--bg-card)/40 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-linear-to-br from-primary/5 to-secondary/5" />
          )}

          <div className="absolute inset-x-6 sm:inset-x-8 bottom-4 sm:bottom-6 flex items-end justify-between gap-4">
            <div className="flex flex-col text-right">
              <h2 className="text-xl sm:text-3xl font-black text-(--text-main) tracking-tight">
                {catName}
              </h2>
              <p className="text-[10px] sm:text-xs font-bold text-(--text-muted) uppercase tracking-widest mt-1">
                {items.length} {t('common.items')}
              </p>
            </div>

            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20"
            >
              <FiChevronDown size={20} className="sm:size-[22px]" />
            </motion.div>
          </div>
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <div className="pt-6 pb-4 flex flex-col gap-6 sm:gap-8">
              {/* Items without subcategories */}
              {groupedItems.noSubItems.length > 0 && (
                <div className="flex flex-col gap-3 sm:gap-4">
                  {groupedItems.noSubItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ItemRow item={item} orderSystem={orderSystem} />
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Items grouped by subcategories */}
              {activeSubcategories.map((sub, sIdx) => (
                <div key={sub.id} className="flex flex-col gap-4">
                  <div className="flex items-center gap-4 px-4 overflow-hidden">
                    <div className="h-px w-8 bg-primary/20" />
                    <h3 className="text-base sm:text-lg font-black text-primary/90 px-2 whitespace-nowrap">
                      {i18n.language === 'en' ? (sub.nameEn || sub.nameAr) : sub.nameAr}
                    </h3>
                    <div className="h-px flex-1 bg-primary/20" />
                  </div>

                  <div className="flex flex-col gap-3 sm:gap-4">
                    {groupedItems.groups[sub.id].map((item, iIdx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (sIdx + 1) * 0.1 + iIdx * 0.05 }}
                      >
                        <ItemRow item={item} orderSystem={orderSystem} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
