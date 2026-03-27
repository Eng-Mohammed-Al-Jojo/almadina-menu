import React, { useState } from "react";
import { FiPlus, FiTrash2, FiEdit, FiCheck, FiChevronDown, FiMove, FiEye, FiEyeOff, FiX } from "react-icons/fi";
import { db } from "../../firebase";
import { ref, update } from "firebase/database";
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
import type { PopupState, Category, Subcategory } from "./types";

interface Props {
  categories: Record<string, Category>;
  subcategories: Record<string, Subcategory>;
  setPopup: (popup: PopupState) => void;
  toggleCategoryVisibility: (id: string, current: boolean) => void;
  toggleSubcategoryVisibility: (id: string, current: boolean) => void;
  updateCategoryImage: (id: string, image: string) => void;
  updateSubcategoryImage: (id: string, image: string) => void;
  showNotification: (message: string, type?: 'success' | 'error') => void;
  newCategoryNameAr: string;
  setNewCategoryNameAr: (val: string) => void;
}

const SortableCategory: React.FC<{
  cat: Category & { id: string };
  subcategories: Record<string, Subcategory>;
  editingId: string | null;
  editNameAr: string;
  setEditNameAr: React.Dispatch<React.SetStateAction<string>>;
  saveEdit: (id: string) => void;
  startEditing: (id: string, nameAr: string) => void;
  toggleCategoryVisibility: (id: string, current: boolean) => void;
  toggleSubcategoryVisibility: (id: string, current: boolean) => void;
  updateCategoryImage: (id: string, image: string) => void;
  updateSubcategoryImage: (id: string, image: string) => void;
  setPopup: (popup: PopupState) => void;
}> = ({
  cat,
  subcategories,
  editingId,
  editNameAr,
  setEditNameAr,
  saveEdit,
  startEditing,
  toggleCategoryVisibility,
  toggleSubcategoryVisibility,
  updateCategoryImage,
  updateSubcategoryImage,
  setPopup,
}) => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const [isExpanded, setIsExpanded] = useState(false);

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
      useSortable({ id: cat.id });

    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
      touchAction: "none",
    };

    const catSubcategories = Object.entries(subcategories)
      .filter(([, sub]) => sub.categoryId === cat.id)
      .sort(([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0));

    return (
      <motion.div
        ref={setNodeRef}
        style={style}
        {...attributes}
        layout
        className={`
          relative group flex flex-col bg-(--bg-card) rounded-3xl border transition-all duration-300 mb-4 overflow-hidden
          ${isDragging ? "z-50 border-primary shadow-2xl scale-[1.02]" : "border-(--border-color) hover:border-primary/20 shadow-sm"}
          ${!cat.visible ? "opacity-60 grayscale-[0.5]" : ""}
        `}
      >
        <div className="flex items-center">
          {/* Drag Handle */}
          <div
            {...listeners}
            className={`
      cursor-grab active:cursor-grabbing p-3
      text-(--text-muted) hover:text-primary transition-colors
      ${isRtl ? 'border-l' : 'border-r'} border-(--border-color)
      shrink-0
    `}
          >
            <FiMove className="w-5 h-5" />
          </div>

          {/* Content */}
          <div className="flex-1 p-4 flex items-center gap-4 min-w-0">

            {/* Left Side (Image + Text) */}
            <div className="flex items-center gap-4 flex-1 min-w-0">

              {/* Category Image */}
              <div className="relative shrink-0 group/img">
                <button
                  onClick={() => setPopup({ type: "categoryImage", id: cat.id })}
                  className="w-12 h-12 rounded-xl bg-(--bg-main) border border-(--border-color) flex items-center justify-center overflow-hidden"
                >
                  {cat.image ? (
                    <img
                      src={`/images/${cat.image}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FiPlus className="text-(--text-muted) group-hover/img:text-primary" />
                  )}
                </button>

                {cat.image && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateCategoryImage(cat.id, "");
                    }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all z-10"
                  >
                    <FiX size={12} />
                  </button>
                )}
              </div>

              {/* Text Section */}
              <div className="flex-1 min-w-0 overflow-hidden">
                {editingId === cat.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      className="flex-1 p-2 bg-(--bg-main) border border-primary rounded-xl text-sm font-bold outline-none text-right min-w-0"
                      placeholder={t('common.name')}
                      value={editNameAr}
                      onChange={(e) => setEditNameAr(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit(cat.id)}
                    />

                    <button
                      onClick={() => saveEdit(cat.id)}
                      className="p-2 rounded-xl bg-green-500 text-white shadow-lg shadow-green-500/20 shrink-0"
                    >
                      <FiCheck />
                    </button>
                  </div>
                ) : (
                  <div className="overflow-hidden">
                    <h3
                      className="text-sm sm:text-base font-black text-(--text-main) truncate w-full"
                      title={cat.nameAr}
                    >
                      {cat.nameAr}
                    </h3>

                    <p className="text-[10px] font-bold text-(--text-muted) uppercase tracking-widest mt-0.5 truncate">
                      {catSubcategories.length} {t('admin.subcategories')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all border border-(--border-color) ${isExpanded
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-(--bg-main) text-(--text-muted)"
                  }`}
              >
                <FiChevronDown
                  className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""
                    }`}
                />
              </button>

              <button
                onClick={() => startEditing(cat.id, cat.nameAr)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-(--bg-main) text-(--text-muted) hover:text-primary transition-all border border-(--border-color)"
              >
                <FiEdit size={14} />
              </button>

              <button
                onClick={() =>
                  toggleCategoryVisibility(cat.id, cat.visible ?? true)
                }
                className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all border border-(--border-color) ${cat.visible
                  ? "bg-(--bg-main) text-green-500"
                  : "bg-red-50 text-red-500"
                  }`}
              >
                {cat.visible ? <FiEye size={14} /> : <FiEyeOff size={14} />}
              </button>

              <button
                onClick={() =>
                  setPopup({ type: "deleteCategory", id: cat.id })
                }
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-(--bg-main) text-(--text-muted) hover:text-red-500 transition-all border border-(--border-color)"
              >
                <FiTrash2 size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Subcategories Accordion */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="bg-(--bg-main)/30 border-t border-(--border-color)"
            >
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between mb-2 px-1">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-(--text-muted)">{t('admin.subcategories')}</h4>
                  <button
                    onClick={() => setPopup({ type: "addSubcategory", parentId: cat.id })}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-black hover:bg-primary hover:text-white transition-all shadow-sm"
                  >
                    <FiPlus /> {t('admin.add_subcategory')}
                  </button>
                </div>

                {catSubcategories.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {catSubcategories.map(([id, sub]) => (
                      <div
                        key={id}
                        className={`
                          flex items-center justify-between p-3 bg-(--bg-card) border border-(--border-color) rounded-2xl shadow-sm transition-all
                          ${!sub.visible ? "opacity-60" : ""}
                        `}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative group/subimg shrink-0">
                            <button
                              onClick={() => setPopup({ type: "subcategoryImage", id })}
                              className="w-10 h-10 rounded-lg bg-(--bg-main) border border-(--border-color) flex items-center justify-center overflow-hidden"
                            >
                              {sub.image ? (
                                <img src={`/images/${sub.image}`} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <FiPlus className="text-(--text-muted) group-hover/subimg:text-primary" />
                              )}
                            </button>
                            {sub.image && (
                              <button
                                onClick={(e) => { e.stopPropagation(); updateSubcategoryImage(id, ""); }}
                                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all z-10"
                              >
                                <FiX size={10} />
                              </button>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-black text-(--text-main) block truncate">{sub.nameAr}</span>
                            <span className="text-[9px] font-bold text-(--text-muted) block truncate">{sub.nameEn}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => toggleSubcategoryVisibility(id, sub.visible ?? true)}
                            className={`p-1.5 rounded-lg transition-colors ${sub.visible ? "text-green-500 hover:bg-green-50" : "text-red-400 hover:bg-red-50"}`}
                          >
                            {sub.visible ? <FiEye size={12} /> : <FiEyeOff size={12} />}
                          </button>
                          <button
                            onClick={() => setPopup({ type: "editSubcategory", id })}
                            className="p-1.5 rounded-lg text-(--text-muted) hover:text-primary hover:bg-primary/5 transition-colors"
                          >
                            <FiEdit size={12} />
                          </button>
                          <button
                            onClick={() => setPopup({ type: "deleteSubcategory", id })}
                            className="p-1.5 rounded-lg text-(--text-muted) hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-center text-(--text-muted) py-4 italic">{t('admin.no_subcategories')}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

const CategorySection: React.FC<Props> = ({
  categories,
  subcategories,
  setPopup,
  toggleCategoryVisibility,
  toggleSubcategoryVisibility,
  updateCategoryImage,
  updateSubcategoryImage,
  showNotification,
  newCategoryNameAr,
  setNewCategoryNameAr,
}) => {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameAr, setEditNameAr] = useState("");
  const [openCategories, setOpenCategories] = useState(false);

  const startEditing = (id: string, nameAr: string) => {
    setEditingId(id);
    setEditNameAr(nameAr);
  };

  const saveEdit = async (id: string) => {
    if (!editNameAr.trim()) {
      showNotification(t('admin.category_name_required'), 'error');
      return;
    }
    try {
      await update(ref(db, `categories/${id}`), {
        nameAr: editNameAr.trim(),
      });
      setEditingId(null);
      setEditNameAr("");
      showNotification(t('common.success') + " ✅");
    } catch {
      showNotification(t('common.error'), 'error');
    }
  };

  const categoriesArray = Object.entries(categories)
    .map(([id, cat]) => ({ ...cat, id }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categoriesArray.findIndex((c) => c.id === active.id);
    const newIndex = categoriesArray.findIndex((c) => c.id === over.id);

    const newArray = arrayMove(categoriesArray, oldIndex, newIndex);

    const updates: Record<string, any> = {};
    newArray.forEach((cat, index) => {
      updates[`categories/${cat.id}/order`] = index;
    });

    await update(ref(db), updates);
  };

  return (
    <div className="bg-(--bg-card) p-6 sm:p-8 rounded-4xl sm:rounded-[2.5rem] mb-8 border border-(--border-color) shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-primary">{t('admin.categories')}</h2>
          <p className="text-(--text-muted) text-xs sm:text-sm font-medium mt-1">{t('admin.category_desc')}</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newCategoryNameAr}
            onChange={(e) => setNewCategoryNameAr(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setPopup({ type: "addCategory" })}
            placeholder={t('admin.add_category_placeholder')}
            className="w-full md:w-64 h-12 p-2  rounded-xl bg-(--bg-main) border border-(--border-color) text-sm font-bold outline-none text-right"
          />
          <button
            onClick={() => setPopup({ type: "addCategory" })}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all self-center md:self-auto"
          >
            <FiPlus size={24} />
          </button>

        </div>

      </div>

      {/* View Categories Button */}
      <button
        onClick={() => setOpenCategories((p) => !p)}
        className="
          w-full mb-2
          flex items-center justify-between
          px-4 sm:px-6 py-4
          bg-(--bg-main)
          rounded-2xl
          font-black text-sm sm:text-base text-(--text-main)
          hover:bg-primary/5 hover:text-primary
          transition-all border border-(--border-color)
        "
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
            <FiChevronDown className={`transition-transform duration-300 ${openCategories ? "rotate-180" : ""}`} />
          </span>
          <span>{t('admin.view_all_categories')}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-(--text-muted) uppercase mr-2 tracking-widest hidden sm:inline">{t('admin.total')}</span>
          <span className="bg-primary text-white text-[10px] sm:text-xs font-black px-3 py-1 rounded-lg shadow-lg shadow-primary/20">
            {categoriesArray.length}
          </span>
        </div>
      </button>

      {/* Accordion List */}
      <AnimatePresence>
        {openCategories && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-6">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={categoriesArray.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col">
                    {categoriesArray.map((cat) => (
                      <SortableCategory
                        key={cat.id}
                        cat={cat}
                        subcategories={subcategories}
                        editingId={editingId}
                        editNameAr={editNameAr}
                        setEditNameAr={setEditNameAr}
                        saveEdit={saveEdit}
                        startEditing={startEditing}
                        toggleCategoryVisibility={toggleCategoryVisibility}
                        toggleSubcategoryVisibility={toggleSubcategoryVisibility}
                        updateCategoryImage={updateCategoryImage}
                        updateSubcategoryImage={updateSubcategoryImage}
                        setPopup={setPopup}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategorySection;
