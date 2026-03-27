import { useEffect, useState } from "react";
import { FiX, FiStar } from "react-icons/fi";
import { ref, get } from "firebase/database";
import { db } from "../../firebase";
import { motion, AnimatePresence } from "framer-motion";
import ItemRow from "./ItemRow";
import { useTranslation } from "react-i18next";
import { type Item } from "./Menu";

interface Props {
    show: boolean;
    onClose: () => void;
    orderSystem: boolean;
}

export default function FeaturedModal({ show, onClose, orderSystem }: Props) {
    const { t } = useTranslation();
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!show) return;

        const fetchStarItems = async () => {
            setLoading(true);
            try {
                const snap = await get(ref(db, "items"));
                if (snap.exists()) {
                    const data = snap.val();
                    const starItems = Object.entries(data)
                        .map(([id, item]: any) => ({ id, ...item }))
                        .filter((item: any) => item.star === true && item.visible !== false);
                    setItems(starItems);
                } else {
                    setItems([]);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStarItems();
    }, [show]);

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                    {/* Background */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 30 }}
                        className="relative z-10 bg-(--bg-card)/90 backdrop-blur-xl w-full max-w-5xl rounded-[3rem] border border-(--border-color) shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-(--border-color) flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-amber-100 text-amber-500">
                                    <FiStar fill="currentColor" />
                                </div>
                                <h2 className="text-lg font-black text-(--text-main)">
                                    {t('common.most_ordered')}
                                </h2>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-(--bg-main) text-(--text-muted) hover:text-red-500 transition border border-(--border-color)"
                            >
                                <FiX size={18} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {loading ? (
                                <div className="text-center py-20 text-(--text-muted)">
                                    {t('common.loading')}
                                </div>
                            ) : items.length === 0 ? (
                                <div className="text-center py-20 text-(--text-muted)">
                                    {t('common.no_items_placeholder')}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {items.map((item, idx) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 25 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.06 }}
                                        >
                                            <ItemRow
                                                item={item}
                                                featuredMode={true}
                                                orderSystem={orderSystem}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}