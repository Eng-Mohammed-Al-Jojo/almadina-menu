import React from "react";
import { type PopupState } from "./types";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheck, FiTrash2, FiLogOut, FiKey, FiMail, FiEdit, FiLayers, FiType, FiDollarSign, FiInfo, FiImage } from "react-icons/fi";
import { useTranslation } from "react-i18next";

interface Props {
  popup: PopupState;
  setPopup: (popup: PopupState) => void;
  deleteItem?: () => void;
  deleteCategory?: (id: string) => void;
  addCategory?: () => void;
  addItem?: () => void;
  updateItem?: () => void;
  updateCategoryImage?: (id: string, image: string) => void;
  updateSubcategoryImage?: (id: string, image: string) => void;
  editItemValues?: {
    itemNameAr: string;
    itemPrice: string;
    priceTw: string;
    selectedCategory: string;
    selectedSubcategory: string;
    itemIngredientsAr?: string;
  };
  setEditItemValues?: (values: {
    itemNameAr: string;
    itemPrice: string;
    priceTw: string;
    selectedCategory: string;
    selectedSubcategory: string;
    itemIngredientsAr?: string;
  }) => void;
  categories?: any;
  subcategories?: any;
  addSubcategory?: (categoryId: string, nameAr: string, nameEn: string, image?: string) => void;
  updateSubcategory?: (id: string, nameAr: string, nameEn: string, image?: string) => void;
  deleteSubcategory?: (id: string) => void;
  resetPasswordPopup?: boolean;
  setResetPasswordPopup?: (val: boolean) => void;
  resetEmail?: string;
  setResetEmail?: (val: string) => void;
  resetMessage?: string;
  handleResetPassword?: () => void;
  logout?: () => void;
}

const Popup: React.FC<Props> = ({
  popup,
  setPopup,
  deleteItem,
  deleteCategory,
  addCategory,
  updateItem,
  updateCategoryImage,
  editItemValues,
  setEditItemValues,
  categories,
  subcategories,
  addSubcategory,
  updateSubcategory,
  deleteSubcategory,
  updateSubcategoryImage,
  resetPasswordPopup,
  setResetPasswordPopup,
  resetEmail,
  setResetEmail,
  resetMessage,
  handleResetPassword,
  logout,
}) => {
  const { t } = useTranslation();
  const [subNameAr, setSubNameAr] = React.useState("");
  const [subNameEn, setSubNameEn] = React.useState("");
  const [selectedImg, setSelectedImg] = React.useState("");
  const [showGallery, setShowGallery] = React.useState(false);
  const isRtl = true;
  const isOpen = popup.type !== null || resetPasswordPopup;

  React.useEffect(() => {
    if (popup.type === "editSubcategory" && popup.id && subcategories[popup.id]) {
      const sub = subcategories[popup.id];
      setSubNameAr(sub.nameAr || "");
      setSubNameEn(sub.nameEn || "");
      setSelectedImg(sub.image || "");
    } else if (popup.type === "addSubcategory") {
      setSubNameAr("");
      setSubNameEn("");
      setSelectedImg("");
    }
  }, [popup.type, popup.id, subcategories]);

  if (!isOpen) return null;

  const closePopup = () => {
    setPopup({ type: null });
    setResetPasswordPopup && setResetPasswordPopup(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closePopup}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-sm bg-(--bg-card)/80 backdrop-blur-2xl rounded-[2.5rem] border border-(--border-color) shadow-2xl overflow-hidden z-10"
        >
          {/* Close Button */}
          <button
            onClick={closePopup}
            className={`absolute top-2 left-3 w-8 h-8 flex items-center justify-center rounded-xl bg-(--bg-main) text-(--text-muted) hover:text-primary transition-colors border border-(--border-color)`}
          >
            <FiX />
          </button>

          <div className="p-8 pt-10">
            {/* ===== Logout ===== */}
            {popup.type === "logout" && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
                  <FiLogOut />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-(--text-main)">{t('admin.logout_title')}?</h2>
                  <p className="text-(--text-muted) font-medium mt-1 uppercase tracking-widest text-[10px]">{t('admin.logout_confirm')}</p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => { logout && logout(); closePopup(); }}
                    className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-black shadow-xl shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    {t('admin.logout_title')}
                  </button>
                  <button
                    onClick={closePopup}
                    className="flex-1 py-4 rounded-2xl bg-(--bg-main) text-(--text-muted) font-black border border-(--border-color) hover:bg-(--bg-card) transition-all"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* ===== Add/Edit/Delete Subcategory ===== */}
            {(popup.type === "addSubcategory" || popup.type === "editSubcategory" || popup.type === "deleteSubcategory") && (
              <div className="text-center space-y-6">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner ${popup.type === 'deleteSubcategory' ? 'bg-red-50 text-red-500' : 'bg-primary/10 text-primary'}`}>
                  {popup.type === 'deleteSubcategory' ? <FiTrash2 /> : (popup.type === 'editSubcategory' ? <FiEdit /> : <FiLayers />)}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-(--text-main)">
                    {popup.type === "addSubcategory" ? t('admin.add_subcategory') : (popup.type === "editSubcategory" ? t('admin.edit_subcategory') : t('admin.delete_subcategory'))}
                  </h2>
                </div>

                {(popup.type === "addSubcategory" || popup.type === "editSubcategory") && (
                  <div className="space-y-4">
                    <div className="relative group">
                      <FiType className="right-4 absolute top-1/2 -translate-y-1/2 text-(--text-muted)" />
                      <input
                        className="w-full bg-(--bg-main) border border-(--border-color) rounded-2xl py-3 pr-11 pl-4 text-right text-sm font-bold outline-none focus:border-primary transition-all"
                        placeholder={t('admin.subcategory_name_ar')}
                        value={subNameAr}
                        onChange={(e) => setSubNameAr(e.target.value)}
                      />
                    </div>

                    <button
                      onClick={() => setShowGallery(true)}
                      className="w-full py-4 rounded-2xl bg-(--bg-main) border border-(--border-color) text-(--text-muted) font-black flex items-center justify-center gap-2 hover:border-primary transition-all overflow-hidden"
                    >
                      {selectedImg ? (
                        <div className="flex items-center gap-2">
                          <img src={`/images/${selectedImg}`} className="w-8 h-8 rounded-lg object-cover" />
                          <span className="truncate">{selectedImg}</span>
                        </div>
                      ) : (
                        <><FiImage /> {t('admin.select_image')}</>
                      )}
                    </button>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      if (popup.type === "addSubcategory") {
                        addSubcategory && addSubcategory(popup.parentId!, subNameAr, subNameEn, selectedImg);
                      } else if (popup.type === "editSubcategory") {
                        updateSubcategory && updateSubcategory(popup.id!, subNameAr, subNameEn, selectedImg);
                      } else {
                        deleteSubcategory && deleteSubcategory(popup.id!);
                      }
                      closePopup();
                    }}
                    className={`flex-1 py-4 rounded-2xl text-white font-black shadow-xl transition-all hover:scale-[1.02] active:scale-95 ${popup.type === 'deleteSubcategory' ? 'bg-red-500 shadow-red-500/20' : 'bg-primary shadow-primary/20'}`}
                  >
                    {popup.type === "deleteSubcategory" ? t('common.delete') : t('common.save')}
                  </button>
                  <button
                    onClick={closePopup}
                    className="flex-1 py-4 rounded-2xl bg-(--bg-main) text-(--text-muted) font-black border border-(--border-color) hover:bg-(--bg-card) transition-all"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* ===== Add/Delete Category ===== */}
            {(popup.type === "addCategory" || popup.type === "deleteCategory") && (
              <div className="text-center space-y-6">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner ${popup.type === 'deleteCategory' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                  {popup.type === 'deleteCategory' ? <FiTrash2 /> : <FiLayers />}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-(--text-main)">
                    {popup.type === "addCategory" ? t('admin.add_category_title') : t('admin.delete_category_title')}
                  </h2>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      if (popup.type === "addCategory") addCategory && addCategory();
                      else deleteCategory && deleteCategory(popup.id!);
                      closePopup();
                    }}
                    className={`flex-1 py-4 rounded-2xl text-white font-black shadow-xl transition-all hover:scale-[1.02] active:scale-95 ${popup.type === 'deleteCategory' ? 'bg-red-500 shadow-red-500/20' : 'bg-green-500 shadow-green-500/20'}`}
                  >
                    {popup.type === "addCategory" ? t('common.save') : t('common.delete')}
                  </button>
                  <button
                    onClick={closePopup}
                    className="flex-1 py-4 rounded-2xl bg-(--bg-main) text-(--text-muted) font-black border border-(--border-color) hover:bg-(--bg-card) transition-all"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* ===== Category/Subcategory Image Selection ===== */}
            {(popup.type === "categoryImage" || popup.type === "subcategoryImage") && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
                  <FiImage />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-(--text-main)">{t('admin.select_image')}</h2>
                </div>
                <div className="space-y-4">
                  <button
                    onClick={() => setShowGallery(true)}
                    className="w-full py-4 rounded-2xl bg-(--bg-main) border border-(--border-color) text-(--text-muted) font-black flex items-center justify-center gap-2 hover:border-primary transition-all overflow-hidden"
                  >
                    {selectedImg ? (
                      <div className="flex items-center gap-2">
                        <img src={`/images/${selectedImg}`} className="w-8 h-8 rounded-lg object-cover" />
                        <span className="truncate">{selectedImg}</span>
                      </div>
                    ) : (
                      <><FiImage /> {t('admin.select_image')}</>
                    )}
                  </button>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      if (popup.type === "categoryImage") {
                        updateCategoryImage && popup.id && updateCategoryImage(popup.id, selectedImg);
                      } else {
                        updateSubcategoryImage && popup.id && updateSubcategoryImage(popup.id, selectedImg);
                      }
                      closePopup();
                      setSelectedImg("");
                    }}
                    className="flex-1 py-4 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    {t('common.save')}
                  </button>
                  <button
                    onClick={closePopup}
                    className="flex-1 py-4 rounded-2xl bg-(--bg-main) text-(--text-muted) font-black border border-(--border-color) hover:bg-(--bg-card) transition-all"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* ===== Delete Item ===== */}
            {popup.type === "deleteItem" && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
                  <FiTrash2 />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-(--text-main)">{t('admin.delete_item_title')}</h2>
                  <p className="text-(--text-muted) font-medium mt-1">{t('admin.delete_item_confirm')}</p>
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => { deleteItem && deleteItem(); closePopup(); }}
                    className="w-full py-4 rounded-2xl bg-red-500 text-white font-black shadow-xl shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    {t('common.delete')}
                  </button>
                  <button
                    onClick={closePopup}
                    className="w-full py-4 rounded-2xl bg-(--bg-main) text-(--text-muted) font-black border border-(--border-color) hover:bg-(--bg-card) transition-all"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* ===== Edit Item ===== */}
            {popup.type === "editItem" && editItemValues && setEditItemValues && categories && (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center text-xl shadow-inner">
                      <FiEdit />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-(--text-main)">{t('admin.edit_product_title')}</h2>
                      <p className="text-(--text-muted) font-medium text-[10px] uppercase tracking-widest">{t('admin.edit_product_desc')}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative group">
                    <FiLayers className="right-4 absolute top-1/2 -translate-y-1/2 text-(--text-muted) transition-colors group-focus-within:text-primary" />
                    <select
                      className="w-full bg-(--bg-main) border border-(--border-color) rounded-2xl py-3 pr-11 pl-4 text-sm font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all appearance-none"
                      value={editItemValues.selectedCategory}
                      onChange={(e) => setEditItemValues({ ...editItemValues, selectedCategory: e.target.value, selectedSubcategory: "" })}
                    >
                      {Object.keys(categories).map((id) => (
                        <option key={id} value={id}>{categories[id].nameAr}</option>
                      ))}
                    </select>
                  </div>

                  {editItemValues.selectedCategory && subcategories && (
                    <div className="relative group">
                      <FiLayers className="right-4 absolute top-1/2 -translate-y-1/2 text-(--text-muted) transition-colors group-focus-within:text-primary" />
                      <select
                        className="w-full bg-(--bg-main) border border-(--border-color) rounded-2xl py-3 pr-11 pl-4 text-sm font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all appearance-none"
                        value={editItemValues.selectedSubcategory}
                        onChange={(e) => setEditItemValues({ ...editItemValues, selectedSubcategory: e.target.value })}
                      >
                        <option value="">{t('admin.no_subcategory')}</option>
                        {Object.entries(subcategories)
                          .filter(([, s]: any) => s.categoryId === editItemValues.selectedCategory)
                          .map(([id, s]: any) => (
                            <option key={id} value={id}>{s.nameAr}</option>
                          ))}
                      </select>
                    </div>
                  )}

                  <div className="relative group">
                    <FiType className="right-4 absolute top-1/2 -translate-y-1/2 text-(--text-muted) transition-colors group-focus-within:text-primary" />
                    <input
                      className="w-full bg-(--bg-main) border border-(--border-color) rounded-2xl py-3 pr-11 pl-4 text-right text-sm font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                      placeholder={t('admin.product_name_ar')}
                      value={editItemValues.itemNameAr}
                      onChange={(e) => setEditItemValues({ ...editItemValues, itemNameAr: e.target.value })}
                    />
                  </div>

                  <div className="relative group">
                    <FiInfo className="right-4 absolute top-1/2 -translate-y-1/2 text-(--text-muted) transition-colors group-focus-within:text-primary" />
                    <input
                      className="w-full bg-(--bg-main) border border-(--border-color) rounded-2xl py-3 pr-11 pl-4 text-right text-sm font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                      placeholder={t('admin.ingredients_ar')}
                      value={editItemValues.itemIngredientsAr || ""}
                      onChange={(e) => setEditItemValues({ ...editItemValues, itemIngredientsAr: e.target.value })}
                    />
                  </div>

                  <div className="relative group">
                    <FiDollarSign className="right-4 absolute top-1/2 -translate-y-1/2 text-(--text-muted) transition-colors group-focus-within:text-primary" />
                    <input
                      className="w-full bg-(--bg-main) border border-(--border-color) rounded-2xl py-3 pr-11 pl-4 text-right text-sm font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                      placeholder={t('common.total')}
                      value={editItemValues.itemPrice}
                      onChange={(e) => setEditItemValues({ ...editItemValues, itemPrice: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => { updateItem && updateItem(); closePopup(); }}
                    className="flex-1 py-4 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <FiCheck /> {t('admin.save_edits')}
                  </button>
                  <button
                    onClick={closePopup}
                    className="px-6 py-4 rounded-2xl bg-(--bg-main) text-(--text-muted) font-black border border-(--border-color) hover:bg-(--bg-card) transition-all"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* ===== Reset Password ===== */}
            {resetPasswordPopup && (
              <div className="space-y-6">
                <div className="text-center space-y-4 mb-6">
                  <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
                    <FiKey />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-(--text-main)">{t('admin.account_reset_title')}</h2>
                    <p className="text-(--text-muted) font-medium mt-1">{t('admin.account_reset_desc')}</p>
                  </div>
                </div>

                <div className="relative group">
                  <FiMail className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-(--text-muted) transition-colors group-focus-within:text-primary`} />
                  <input
                    type="email"
                    placeholder={t('admin.email_placeholder')}
                    className={`w-full bg-(--bg-main) border border-(--border-color) rounded-2xl py-4 ${isRtl ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'} text-sm font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-inner`}
                    value={resetEmail}
                    onChange={(e) => setResetEmail && setResetEmail(e.target.value)}
                  />
                </div>

                <AnimatePresence>
                  {resetMessage && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-xs text-center text-green-600 font-bold bg-green-50 p-3 rounded-xl border border-green-100">
                      {resetMessage}
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleResetPassword}
                    className="w-full py-4 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    {t('admin.send_reset_link')}
                  </button>
                  <button
                    onClick={closePopup}
                    className="w-full py-4 rounded-2xl bg-(--bg-main) text-(--text-muted) font-black border border-(--border-color) hover:bg-(--bg-card) transition-all"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div >

      <FeaturedGallery
        visible={showGallery}
        onClose={() => setShowGallery(false)}
        onSelect={(img) => { setSelectedImg(img); setShowGallery(false); }}
        galleryImages={Object.keys(import.meta.glob("/public/images/*")).map(p => p.replace("/public/images/", ""))}
        selectedImage={selectedImg}
      />
    </AnimatePresence >
  );
};

import FeaturedGallery from "./FeaturedGallery";

export default Popup;
