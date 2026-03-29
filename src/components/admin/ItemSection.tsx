import React, { useState, useEffect } from "react";
import { ref, push, update } from "firebase/database";
import { db } from "../../firebase";
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiChevronDown, FiStar, FiImage, FiMinus, FiArrowUp, FiArrowDown, FiMove } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { PopupState, Category, Item, Subcategory } from "./types";
import FeaturedGallery from "./FeaturedGallery";
import CustomSelect from "./CustomSelect";

/* ================== auto load feature images ================== */
const galleryImages = Object.keys(
  import.meta.glob("/public/images/*")
).map((path) => path.replace("/public/images/", ""));

interface Props {
  categories: Record<string, Category>;
  subcategories: Record<string, Subcategory>;
  items: Record<string, Item>;
  popup: PopupState;
  setPopup: (popup: PopupState) => void;
}

const SortableItem: React.FC<{
  item: Item & { id: string };
  idx: number;
  totalItems: number;
  subcategories: Record<string, Subcategory>;
  toggleItem: (id: string, visible: boolean) => void;
  openGallery: (itemId: string, currentImage?: string) => void;
  removeImage: (id: string) => void;
  setPopup: (popup: PopupState) => void;
  moveItem: (categoryId: string, itemId: string, direction: 'up' | 'down') => void;
}> = ({ item, idx, totalItems, subcategories, toggleItem, openGallery, removeImage, setPopup, moveItem }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "none",
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      className={`flex flex-col sm:flex-row gap-3 sm:gap-6 py-3 sm:py-4 transition-all bg-(--bg-card) mb-1 px-2 rounded-2xl ${isDragging ? "z-50 shadow-xl border-primary border scale-[1.02]" : ""} ${!item.visible ? "opacity-40 grayscale" : ""
        }`}
    >
      {/* ===== Top Row (image + info) ===== */}
      <div className="flex gap-3 w-full items-center">
        {/* Drag Handle */}
        <div
          {...listeners}
          {...attributes}
          className="cursor-grab active:cursor-grabbing p-2 text-(--text-muted) hover:text-primary transition-colors"
        >
          <FiMove size={18} />
        </div>

        {/* Image */}
        <div className="relative group/img shrink-0">
          {item.image ? (
            <div className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden border border-(--border-color) shadow-inner">
              <img
                src={`/images/${item.image}`}
                alt={item.nameAr}
                className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500"
                onError={(e) => { e.currentTarget.src = "/logo.png" }}
              />

              <button
                onClick={() => removeImage(item.id)}
                className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg scale-0 group-hover/img:scale-100 transition-transform"
              >
                <FiMinus size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openGallery(item.id)}
              className="w-14 h-14 sm:w-20 sm:h-20 bg-(--bg-main) border-2 border-dashed border-(--border-color) rounded-xl sm:rounded-2xl flex items-center justify-center text-(--text-muted) hover:text-primary hover:border-primary/50 transition-all"
            >
              <FiImage size={18} />
            </button>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col">

          <div className="flex items-center gap-2">
            <h4 className="font-black text-sm sm:text-lg text-(--text-main) truncate">
              {item.nameAr}
            </h4>

            {item.star && (
              <FiStar
                className="text-yellow-400 fill-yellow-400 shrink-0"
                size={14}
              />
            )}
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            {item.subcategoryId && (
              <span className="text-[9px] px-2 py-0.5 bg-(--bg-main) border border-(--border-color) rounded-lg font-black text-(--text-muted) uppercase">
                {subcategories[item.subcategoryId]?.nameAr}
              </span>
            )}
            {item.ingredientsAr && (
              <p className="text-[11px] sm:text-xs text-(--text-muted) font-medium line-clamp-1">
                {item.ingredientsAr}
              </p>
            )}
          </div>

          <p className="text-primary font-black text-xs sm:text-sm mt-0.5">
            {item.price} <span className="text-[9px] opacity-70">₪</span>
          </p>

        </div>
      </div>

      {/* ===== Actions ===== */}
      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto bg-(--bg-main) p-1.5 rounded-xl sm:rounded-2xl border border-(--border-color)">

        {/* Animated Toggle */}
        <button
          onClick={() => toggleItem(item.id, item.visible)}
          className={`relative shrink-0 w-12 h-6 rounded-full flex items-center p-1 transition-all duration-300 border ${item.visible
            ? "bg-green-500 border-green-500 shadow-[0_0_12px_rgba(34,197,94,0.3)]"
            : "bg-(--bg-main) border-(--border-color)"
            }`}
          style={{
            justifyContent: item.visible ? "flex-end" : "flex-start"
          }}
        >
          <motion.div
            layout
            initial={false}
            transition={{ type: "spring", stiffness: 600, damping: 30 }}
            className={`w-4 h-4 rounded-full shadow-sm z-10 ${item.visible ? "bg-white" : "bg-(--text-muted)"
              }`}
          />
        </button>

        <div className="flex items-center gap-1">

          <button
            onClick={async () => {
              const newStar = !item.star;
              await update(ref(db, `items/${item.id}`), { star: newStar });
            }}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${item.star
              ? "bg-yellow-100 text-yellow-600"
              : "hover:bg-yellow-50 text-(--text-muted)"
              }`}
          >
            <FiStar size={16} fill={item.star ? "currentColor" : "none"} />
          </button>

          <button
            onClick={() => setPopup({ type: "editItem", id: item.id })}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary/10 hover:text-primary text-(--text-muted)"
          >
            <FiEdit size={16} />
          </button>

          <button
            onClick={() => setPopup({ type: "deleteItem", id: item.id })}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 hover:text-red-500 text-(--text-muted)"
          >
            <FiTrash2 size={16} />
          </button>

        </div>
        <div className="w-px h-6 bg-(--border-color) mx-1 hidden sm:block" />
        <div className="flex items-center gap-1">
          <button
            onClick={() => moveItem(item.categoryId, item.id, 'up')}
            disabled={idx === 0}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary/10 hover:text-primary text-(--text-muted) disabled:opacity-30 disabled:pointer-events-none"
          >
            <FiArrowUp size={16} />
          </button>
          <button
            onClick={() => moveItem(item.categoryId, item.id, 'down')}
            disabled={idx === totalItems - 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary/10 hover:text-primary text-(--text-muted) disabled:opacity-30 disabled:pointer-events-none"
          >
            <FiArrowDown size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const ItemSection: React.FC<Props> = ({ categories, subcategories, items, setPopup }) => {
  const { t, i18n } = useTranslation();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [itemNameAr, setItemNameAr] = useState("");
  const [itemIngredientsAr, setItemIngredientsAr] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [quickSearch, setQuickSearch] = useState("");

  const [selectedCategoryError, setSelectedCategoryError] = useState(false);
  const [itemNameError, setItemNameError] = useState(false);
  const [itemPriceError, setItemPriceError] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [showGallery, setShowGallery] = useState(false);
  const [galleryForItemId, setGalleryForItemId] = useState<string | null>(null);
  const [itemImage, setItemImage] = useState("");
  const [localItems, setLocalItems] = useState<Record<string, Item>>(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const addItem = async () => {
    let hasError = false;
    if (!selectedCategory) { setSelectedCategoryError(true); hasError = true; }
    if (!itemNameAr.trim()) { setItemNameError(true); hasError = true; }

    const priceArray = itemPrice.split(",").map(p => p.trim());
    if (!itemPrice.trim() || priceArray.some(p => isNaN(Number(p)) || Number(p) <= 0)) {
      setItemPriceError(true);
      hasError = true;
    }

    if (hasError) return;

    await push(ref(db, "items"), {
      nameAr: itemNameAr,
      ingredientsAr: itemIngredientsAr,
      price: itemPrice,
      categoryId: selectedCategory,
      subcategoryId: selectedSubcategory || null,
      visible: true,
      createdAt: Date.now(),
      image: itemImage || "",
      star: false,
    });

    setItemNameAr("");
    setItemIngredientsAr("");
    setItemPrice("");
    setSelectedCategory("");
    setSelectedSubcategory("");
    setItemImage("");

    setShowToast(true);
    setTimeout(() => setShowToast(false), 1500);
  };

  const toggleItem = async (id: string, visible: boolean) => {
    await update(ref(db, `items/${id}`), { visible: !visible });
  };

  const updateImage = async (id: string, image: string) => {
    await update(ref(db, `items/${id}`), { image });
  };

  const removeImage = async (id: string) => {
    await update(ref(db, `items/${id}`), { image: "" });
  };

  const openGallery = (itemId: string, currentImage?: string) => {
    setGalleryForItemId(itemId);
    setItemImage(currentImage || "");
    setShowGallery(true);
  };

  const handleSelectImage = async (img: string) => {
    if (!galleryForItemId) return;
    await updateImage(galleryForItemId, img);
    setShowGallery(false);
  };

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const moveItem = async (categoryId: string, itemId: string, direction: 'up' | 'down') => {
    const catItems = Object.entries(localItems)
      .map(([id, item]) => ({ ...item, id }))
      .filter(item => item.categoryId === categoryId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const index = catItems.findIndex(i => i.id === itemId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= catItems.length) return;

    const newItems = [...catItems];
    const [movedItem] = newItems.splice(index, 1);
    newItems.splice(newIndex, 0, movedItem);

    // Update orders in Firebase
    const updates: Record<string, any> = {};
    newItems.forEach((item, idx) => {
      updates[`items/${item.id}/order`] = idx;
    });

    try {
      await update(ref(db), updates);
    } catch (err) {
      console.error("Failed to reorder items:", err);
    }
  };

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    })
  );

  const handleDragEndItems = async (event: DragEndEvent, currentItems: (Item & { id: string })[]) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = currentItems.findIndex((i) => i.id === active.id);
    const newIndex = currentItems.findIndex((i) => i.id === over.id);

    const newArray = arrayMove(currentItems, oldIndex, newIndex);

    const updates: Record<string, any> = {};
    newArray.forEach((item, index) => {
      updates[`items/${item.id}/order`] = index;
    });

    try {
      await update(ref(db), updates);
    } catch (err) {
      console.error("Failed to drag reorder items:", err);
    }
  };

  const currentCatSubcategories = Object.entries(subcategories)
    .filter(([, sub]) => sub.categoryId === selectedCategory)
    .sort(([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="space-y-8">


      {/* Adding Form */}
      <div className="bg-(--bg-card) p-8 rounded-[2.5rem] border border-(--border-color) shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-primary/10 transition-colors" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl shadow-inner">
              <FiPlus />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-(--text-main)">{t('admin.add_new_item')}</h2>
              <p className="text-(--text-muted) text-[10px] sm:text-sm font-medium">{t('admin.item_details_desc')}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-(--text-muted) px-2">{t('admin.categories')}</label>
            <CustomSelect
              options={Object.keys(categories).map(id => ({ id, name: categories[id].nameAr || "" }))}
              value={selectedCategory}
              onChange={(val) => { setSelectedCategory(val); setSelectedSubcategory(""); setSelectedCategoryError(false); }}
              error={selectedCategoryError}
              placeholder={t('admin.select_category')}
            />
          </div>

          <div className={`flex flex-col gap-2 transition-all duration-300 ${currentCatSubcategories.length > 0 ? "opacity-100 translate-y-0" : "opacity-30 pointer-events-none translate-y-2"}`}>
            <label className="text-[10px] font-black uppercase tracking-widest text-(--text-muted) px-2">{t('admin.subcategories')}</label>
            <CustomSelect
              options={currentCatSubcategories.map(([id, sub]) => ({ id, name: sub.nameAr || "" }))}
              value={selectedSubcategory}
              onChange={(val) => setSelectedSubcategory(val)}
              placeholder={t('admin.select_subcategory')}
              disabled={currentCatSubcategories.length === 0}
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-(--text-muted) px-2">
              {t('common.name')}
            </label>
            <input
              className={`w-full bg-(--bg-main) border px-5 py-3 rounded-2xl text-sm font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all
                ${itemNameError ? "border-red-500" : "border-(--border-color)"} text-right`}
              placeholder={t('admin.item_name_ar_placeholder')}
              value={itemNameAr}
              onChange={(e) => {
                setItemNameAr(e.target.value);
                setItemNameError(false);
              }}
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-(--text-muted) px-2">
              {t('admin.ingredients_label')}
            </label>
            <input
              className="w-full bg-(--bg-main) border border-(--border-color) px-5 py-3 rounded-2xl text-sm font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-right"
              placeholder={t('admin.ingredients_placeholder')}
              value={itemIngredientsAr}
              onChange={(e) => setItemIngredientsAr(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-(--text-muted) px-2">{t('common.total')}</label>
            <input
              className={`w-full bg-(--bg-main) border px-5 py-3 rounded-2xl text-sm font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all
                ${itemPriceError ? "border-red-500" : "border-(--border-color)"}`}
              placeholder={t('admin.item_price_placeholder')}
              value={itemPrice}
              onChange={(e) => { setItemPrice(e.target.value); setItemPriceError(false); }}
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={addItem}
              className="w-full h-[52px] bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <FiPlus className="text-xl" />
              {t('admin.add_item_btn')}
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="absolute inset-0 bg-primary/95 flex items-center justify-center z-50 rounded-[2.5rem]"
            >
              <div className="text-center text-white">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
                <h3 className="text-2xl font-black">{t('admin.item_added_success_title')}</h3>
                <p className="opacity-80 font-bold mt-1 uppercase tracking-widest text-xs">{t('admin.item_added_success_desc')}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search Bar */}
      <div className="relative group px-2">
        <FiSearch className={`absolute ${i18n.language === 'ar' ? 'right-6' : 'left-6'} top-1/2 -translate-y-1/2 text-(--text-muted) group-focus-within:text-primary transition-colors text-xl`} />
        <input
          className={`w-full bg-(--bg-card) border border-(--border-color) rounded-3xl py-4 ${i18n.language === 'ar' ? 'pr-14 pl-6' : 'pl-14 pr-6'} text-sm sm:text-base font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-premium`}
          placeholder={t('admin.search_placeholder')}
          value={quickSearch}
          onChange={(e) => setQuickSearch(e.target.value)}
        />
      </div>
      {/* Items by Category */}
      <div className="space-y-6">
        {Object.entries(categories)
          .sort(([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0))
          .map(([catId, cat]) => {
            const catItems = Object.keys(localItems)
              .map(id => ({ ...localItems[id], id }))
              .filter(item => item.categoryId === catId)
              .filter(item => {
                const search = quickSearch.toLowerCase();
                const itemName = item.nameAr;
                const itemIngredients = item.ingredientsAr;
                return (
                  (itemName && itemName.toLowerCase().includes(search)) ||
                  (itemIngredients && itemIngredients.toLowerCase().includes(search)) ||
                  String(item.price).includes(search)
                );
              })
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

            if (quickSearch && catItems.length === 0) return null;

            const isExpanded = expandedSections[catId] ?? false;

            return (
              <div key={catId} className="bg-(--bg-card) border border-(--border-color) rounded-4xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <button
                  onClick={() => toggleSection(catId)}
                  className="w-full text-right p-6 flex items-center justify-between group bg-(--bg-main)/30"
                >

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                      <FiChevronDown className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-(--text-main)">{cat.nameAr}</h3>
                      <p className="text-(--text-muted) text-xs font-bold uppercase tracking-widest mt-0.5">{catItems.length} {t('admin.items_count', { count: catItems.length })}</p>
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-2 divide-y divide-(--border-color)">
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={(event) => handleDragEndItems(event, catItems)}
                        >
                          <SortableContext
                            items={catItems.map((i) => i.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="flex flex-col">
                              {catItems.map((item, idx) => (
                                <SortableItem
                                  key={item.id}
                                  item={item}
                                  idx={idx}
                                  totalItems={catItems.length}
                                  subcategories={subcategories}
                                  toggleItem={toggleItem}
                                  openGallery={openGallery}
                                  removeImage={removeImage}
                                  setPopup={setPopup}
                                  moveItem={moveItem}
                                />
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>

                        {catItems.length === 0 && (
                          <div className="py-12 text-center">
                            <p className="text-(--text-muted) font-bold">{t('admin.no_items_placeholder')}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
      </div>

      <FeaturedGallery
        visible={showGallery}
        onClose={() => setShowGallery(false)}
        onSelect={handleSelectImage}
        galleryImages={galleryImages}
        selectedImage={itemImage}
      />
    </div>
  );
};

export default ItemSection;
