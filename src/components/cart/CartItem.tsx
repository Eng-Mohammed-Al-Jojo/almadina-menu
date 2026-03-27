import { FaTrash, FaMinus, FaPlus } from "react-icons/fa";
import { TbCurrencyShekel } from "react-icons/tb";
import { type CartItem as CartItemType, useCart } from "../../context/CartContext";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

export default function CartItem({ item }: { item: CartItemType }) {
    const { increase, decrease, removeItem } = useCart();
    const { i18n, t } = useTranslation();
    const isRtl = i18n.language === 'ar';

    const itemName = isRtl 
        ? (item.nameAr || item.nameEn || item.name) 
        : (item.nameEn || item.nameAr || item.name);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center justify-between gap-4 bg-(--bg-card) p-4 sm:p-5 rounded-4xl border border-(--border-color) group hover:border-primary/30 transition-all shadow-sm hover:shadow-xl relative overflow-hidden"
        >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />

            <div className="flex-1 min-w-0 z-10">
                <p className="font-black text-(--text-main) truncate text-sm sm:text-base mb-1">
                    {itemName}
                </p>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 px-2 py-0.5 bg-primary/10 rounded-lg">
                        <span className="text-xs font-black text-primary">
                            {item.selectedPrice}
                        </span>
                        <TbCurrencyShekel size={12} className="text-primary opacity-70" />
                    </div>
                    {item.qty > 1 && (
                        <span className="text-[10px] font-bold text-(--text-muted) uppercase tracking-widest">
                            {t('common.total')}: {item.selectedPrice * item.qty}₪
                        </span>
                    )}
                </div>
            </div>

            <div className="flex flex-col items-end gap-3 z-10 shrink-0">
                <div className="flex items-center gap-2 bg-(--bg-main) p-1 rounded-xl border border-(--border-color) shadow-inner">
                    <button
                        onClick={() => decrease(item.priceKey)}
                        className="w-8 h-8 rounded-lg bg-(--bg-card) text-(--text-main) flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-(--border-color) active:scale-95 shadow-sm"
                    >
                        <FaMinus size={10} />
                    </button>

                    <span className="min-w-[24px] text-center font-black text-sm text-(--text-main)">
                        {item.qty}
                    </span>

                    <button
                        onClick={() => increase(item.priceKey)}
                        className="w-8 h-8 rounded-lg bg-(--bg-card) text-(--text-main) flex items-center justify-center hover:bg-primary hover:text-white transition-all border border-(--border-color) active:scale-95 shadow-sm"
                    >
                        <FaPlus size={10} />
                    </button>
                </div>

                <button
                    onClick={() => removeItem(item.priceKey)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-(--text-muted) hover:text-red-500 hover:bg-red-50 transition-all text-[10px] font-black uppercase tracking-tighter"
                >
                    <FaTrash size={10} />
                    {t('common.remove')}
                </button>
            </div>
        </motion.div>
    );
}
