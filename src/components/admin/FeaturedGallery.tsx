import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheck, FiImage } from "react-icons/fi";
import { useTranslation } from "react-i18next";

interface Props {
    visible: boolean;
    onClose: () => void;
    onSelect: (img: string) => void;
    galleryImages: string[];
    selectedImage?: string;
}

const FeaturedGallery: React.FC<Props> = ({ visible, onClose, onSelect, galleryImages, selectedImage }) => {
    const { t } = useTranslation();
    return (
        <AnimatePresence>
            {visible && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-(--bg-card)/80 backdrop-blur-2xl w-full max-w-2xl rounded-[2.5rem] border border-(--border-color) shadow-2xl flex flex-col max-h-[85vh] overflow-hidden z-10"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-(--border-color) flex items-center justify-between bg-(--bg-main)/30">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center text-xl shadow-inner">
                                    <FiImage />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-(--text-main)">{t('admin.gallery_title')}</h2>
                                    <p className="text-(--text-muted) text-[10px] uppercase tracking-widest font-bold">{t('admin.select_image_desc')}</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-(--bg-main) text-(--text-muted) hover:text-red-500 transition-all border border-(--border-color)">
                                <FiX />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar">
                            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                {galleryImages.map((img) => (
                                    <button
                                        key={img}
                                        type="button"
                                        onClick={() => onSelect(img)}
                                        className={`group relative rounded-2xl overflow-hidden border-2 transition-all duration-300 aspect-square
                                            ${selectedImage === img ? "border-primary shadow-lg shadow-primary/20 scale-95" : "border-(--border-color) hover:border-primary/50 hover:scale-105"}`}
                                    >
                                        <img
                                            src={`/images/${img}`}
                                            alt={img}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            onError={(e) => e.currentTarget.src = '/hamada.png'}
                                        />

                                        <AnimatePresence>
                                            {selectedImage === img && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-white text-primary flex items-center justify-center shadow-lg">
                                                        <FiCheck strokeWidth={4} />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 pointer-events-none">
                                            <span className="text-[8px] text-white font-black truncate w-full uppercase tracking-tighter">{img}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-(--border-color) bg-(--bg-main)/30">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full py-4 rounded-2xl bg-(--bg-main) text-(--text-muted) font-black border border-(--border-color) hover:bg-(--bg-card) transition-all"
                            >
                                {t('admin.close_gallery')}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default FeaturedGallery;
