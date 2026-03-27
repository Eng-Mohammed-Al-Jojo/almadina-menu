import { useState } from "react";
import { FiShoppingCart } from "react-icons/fi";
import { useCart } from "../../context/CartContext";
import CartModal from "./CartModal";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

interface CartButtonProps {
    className?: string;
}

export default function CartButton({ className = "" }: CartButtonProps) {
    const { t, i18n } = useTranslation();
    const { totalItems } = useCart();
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Cart Button */}
            <AnimatePresence>
                {totalItems > 0 && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0, opacity: 0, y: 30 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setOpen(true)}
                        className={`
                            fixed bottom-8 ${i18n.language === 'ar' ? 'left-8' : 'right-8'} z-50
                            flex items-center gap-4
                            bg-primary text-white
                            px-7 py-4 rounded-4xl
                            shadow-2xl shadow-primary/40
                            transition-all duration-300
                            font-black uppercase tracking-widest text-[10px]
                            border border-white/10 backdrop-blur-xl
                            ${className}
                        `}
                    >
                        <div className="relative">
                            <FiShoppingCart size={22} />
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={totalItems}
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className={`absolute -top-3 ${i18n.language === 'ar' ? '-left-3' : '-right-3'} bg-white text-primary text-[10px] w-6 h-6 flex items-center justify-center rounded-full border-2 border-primary font-black shadow-lg`}
                                >
                                    {totalItems}
                                </motion.span>
                            </AnimatePresence>
                        </div>
                        <span className="hidden sm:inline-block">{t('common.cart')}</span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Modal */}
            <AnimatePresence>
                {open && <CartModal isOpen={open} onClose={() => setOpen(false)} />}
            </AnimatePresence>
        </>
    );
}
