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

  const groupedItems = useMemo(() => {
    const groups: Record<string, Item[]> = {};
    const noSubItems: Item[] = [];

    items.forEach(item => {
      const sub = subcategories.find(s => s.id === item.subcategoryId);
      if (item.subcategoryId && sub) {
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

  if (category.visible === false) return null;

  const categoryImage =
    category.image ||
    activeSubcategories[0]?.image ||
    items.find(i => i.image)?.image;

  return (
    <div className="w-full mb-4">

      {/* Header */}
      <motion.button
        layout
        onClick={() => setIsOpen(!isOpen)}
        className="w-full relative group overflow-hidden rounded-4xl
        bg-(--bg-card)/80 backdrop-blur-md
        border border-(--border-color)
        shadow-[0_8px_25px_-10px_rgba(0,0,0,0.15)]
        hover:shadow-[0_12px_35px_-12px_rgba(0,0,0,0.2)]
        transition-all duration-500"
      >
        <div className="relative h-48 sm:h-56 w-full overflow-hidden">

          {categoryImage ? (
            <>
              <motion.img
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.8 }}
                src={`/images/${categoryImage}`}
                className="w-full h-full object-cover opacity-65 group-hover:scale-105 transition-transform duration-700"
                alt={catName}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />

              {/* Soft overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-(--bg-card)/90 via-(--bg-card)/30 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-linear-to-br from-primary/1 to-secondary/1" />
          )}

          {/* Content */}
          <div className="absolute inset-x-4 bottom-3 flex items-end justify-between gap-4">

            <div className="flex flex-col text-right">
              <h2 className="text-xl sm:text-2xl font-black text-(--text-main)">
                {catName}
              </h2>
              <p className="text-[10px] sm:text-xs font-bold text-(--text-muted) uppercase tracking-widest mt-1">
                {items.length} {t('common.items')}
              </p>
            </div>

            {/* Arrow */}
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              className="w-10 h-10 rounded-xl 
              bg-primary text-white 
              flex items-center justify-center
              shadow-md shadow-primary/10"
            >
              <FiChevronDown size={20} />
            </motion.div>
          </div>
        </div>
      </motion.button>

      {/* Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden"
          >
            <div className="pt-5 pb-4 flex flex-col gap-6">

              {/* بدون sub */}
              {groupedItems.noSubItems.length > 0 && (
                <div className="flex flex-col gap-3">
                  {groupedItems.noSubItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <ItemRow item={item} orderSystem={orderSystem} />
                    </motion.div>
                  ))}
                </div>
              )}

              {/* مع sub */}
              {activeSubcategories.map((sub, sIdx) => (
                <div key={sub.id} className="flex flex-col gap-4">

                  {/* Title */}
                  <div className="flex items-center gap-3 px-4">
                    <div className="h-px w-6 bg-primary/20" />
                    <h3 className="text-sm sm:text-base font-bold text-primary/90">
                      {i18n.language === 'en' ? (sub.nameEn || sub.nameAr) : sub.nameAr}
                    </h3>
                    <div className="h-px flex-1 bg-primary/20" />
                  </div>

                  {/* Items */}
                  <div className="flex flex-col gap-3">
                    {groupedItems.groups[sub.id].map((item, iIdx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (sIdx + 1) * 0.08 + iIdx * 0.04 }}
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