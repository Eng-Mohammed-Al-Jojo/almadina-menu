import React, { useState } from "react";
import { FiPlus, FiTrash2, FiEdit, FiCheck, FiChevronDown, FiMove, FiEye, FiEyeOff } from "react-icons/fi";
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
  showNotification: (message: string, type?: 'success' | 'error') => void;
  newCategoryNameAr: string;
  setNewCategoryNameAr: (val: string) => void;
}

const CategoryCard: React.FC<{
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
  setPopup,
}) => {
    const { t } = useTranslation();
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
          relative group flex flex-col bg-(--bg-card) rounded-4xl border transition-all duration-300 overflow-hidden h-full
          ${isDragging ? "z-50 border-primary shadow-2xl scale-[1.02]" : "border-(--border-color) hover:border-primary/20 shadow-sm hover:shadow-lg"}
          ${!cat.visible ? "opacity-60 grayscale-[0.5]" : ""}
        `}
      >
        {/* Category Image Header */}
        <div className="relative h-40 bg-(--bg-main) overflow-hidden group/img">
          {cat.image ? (
            <img
              src={`/images/${cat.image}`}
              alt=""
              className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-(--text-muted) gap-2">
              <FiPlus size={24} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{t('admin.add_image')}</span>
            </div>
          )}
          
          {/* Image Controls Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              onClick={() => setPopup({ type: "categoryImage", id: cat.id })}
              className="p-2 bg-white text-primary rounded-xl hover:scale-110 transition-transform"
            >
              <FiEdit size={16} />
            </button>
            {cat.image && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateCategoryImage(cat.id, "");
                }}
                className="p-2 bg-red-500 text-white rounded-xl hover:scale-110 transition-transform"
              >
                <FiTrash2 size={16} />
              </button>
            )}
          </div>

          {/* Drag Handle Overlay */}
          <div
            {...listeners}
            className="absolute top-3 right-3 p-2 bg-black/20 backdrop-blur-md text-white rounded-xl cursor-grab active:cursor-grabbing hover:bg-primary transition-colors"
          >
            <FiMove size={14} />
          </div>

          {/* Visibility Badge */}
          <div className="absolute top-3 left-3">
             <button
              onClick={() => toggleCategoryVisibility(cat.id, cat.visible ?? true)}
              className={`p-2 rounded-xl backdrop-blur-md transition-all ${cat.visible 
                ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                : "bg-red-500/20 text-red-400 border border-red-500/30"}`}
            >
              {cat.visible ? <FiEye size={14} /> : <FiEyeOff size={14} />}
            </button>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex-1 min-w-0 mb-4">
            {editingId === cat.id ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  className="flex-1 p-2 bg-(--bg-main) border border-primary rounded-xl text-sm font-bold outline-none text-right"
                  value={editNameAr}
                  onChange={(e) => setEditNameAr(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit(cat.id)}
                />
                <button
                  onClick={() => saveEdit(cat.id)}
                  className="p-2 rounded-xl bg-green-500 text-white shrink-0"
                >
                  <FiCheck />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-black text-(--text-main) truncate" title={cat.nameAr}>
                  {cat.nameAr}
                </h3>
                <button
                  onClick={() => startEditing(cat.id, cat.nameAr)}
                  className="p-2 text-(--text-muted) hover:text-primary transition-colors"
                >
                  <FiEdit size={14} />
                </button>
              </div>
            )}
            <p className="text-[10px] font-bold text-(--text-muted) uppercase tracking-widest mt-1">
              {catSubcategories.length} {t('admin.subcategories')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-4 border-t border-(--border-color)">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`flex-1 h-10 flex items-center justify-center gap-2 rounded-xl transition-all border ${isExpanded
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                : "bg-(--bg-main) text-(--text-muted) border-(--border-color) hover:border-primary/30"
                }`}
            >
              <span className="text-xs font-black">{t('admin.subcategories')}</span>
              <FiChevronDown className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
            </button>

            <button
               onClick={() => setPopup({ type: "deleteCategory", id: cat.id })}
               className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-100"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        </div>

        {/* Subcategories Accordion */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-(--bg-main)/50 border-t border-(--border-color)"
            >
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-black uppercase tracking-tighter text-(--text-muted)">{t('admin.manage_sub')}</span>
                  <button
                    onClick={() => setPopup({ type: "addSubcategory", parentId: cat.id })}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary text-[9px] font-black hover:bg-primary hover:text-white transition-all"
                  >
                    <FiPlus /> {t('admin.add_new')}
                  </button>
                </div>

                {catSubcategories.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {catSubcategories.map(([id, sub]) => (
                      <div
                        key={id}
                        className={`flex items-center justify-between p-2.5 bg-(--bg-card) border border-(--border-color) rounded-xl shadow-sm ${!sub.visible ? "opacity-60" : ""}`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <button
                            onClick={() => setPopup({ type: "subcategoryImage", id })}
                            className="w-8 h-8 rounded-lg bg-(--bg-main) border border-(--border-color) flex items-center justify-center overflow-hidden shrink-0"
                          >
                            {sub.image ? (
                              <img src={`/images/${sub.image}`} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <FiPlus size={12} className="text-(--text-muted)" />
                            )}
                          </button>
                          <div className="min-w-0">
                            <span className="text-[11px] font-black text-(--text-main) block truncate">{sub.nameAr}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleSubcategoryVisibility(id, sub.visible ?? true)}
                            className={`p-1 rounded-lg transition-colors ${sub.visible ? "text-green-500" : "text-red-400"}`}
                          >
                            {sub.visible ? <FiEye size={12} /> : <FiEyeOff size={12} />}
                          </button>
                          <button
                            onClick={() => setPopup({ type: "editSubcategory", id })}
                            className="p-1 text-(--text-muted) hover:text-primary transition-colors"
                          >
                            <FiEdit size={12} />
                          </button>
                          <button
                            onClick={() => setPopup({ type: "deleteSubcategory", id })}
                            className="p-1 text-(--text-muted) hover:text-red-500 transition-colors"
                          >
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[9px] text-center text-(--text-muted) py-2 italic">{t('admin.no_subcategories')}</p>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categoriesArray.map((cat) => (
                      <CategoryCard
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
