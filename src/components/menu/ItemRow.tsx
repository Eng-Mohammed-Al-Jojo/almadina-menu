import { type Item } from "./Menu";
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { FiPlus, FiCheck, FiStar } from "react-icons/fi";
import { TbCurrencyShekel } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

interface Props {
  item: Item;
  orderSystem: boolean;
  featuredMode?: boolean;
}

export default function ItemRow({ item, orderSystem, featuredMode }: Props) {
  const { t } = useTranslation();
  const prices = String(item.price).split(",");
  const unavailable = item.visible === false;

  const itemName = item.nameAr || "";
  const itemIngredients = item.ingredientsAr || "";

  const { addItem } = useCart();
  const [addedPrice, setAddedPrice] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);

  const handleAdd = (price: number) => {
    addItem(item, price);
    setAddedPrice(price);
    setShowToast(true);

    setTimeout(() => {
      setAddedPrice(null);
      setShowToast(false);
    }, 1500);
  };

  return (
    <motion.div
      layout
      className={`relative group flex flex-col md:flex-row gap-4 p-4 sm:p-5 bg-(--bg-card)/40 backdrop-blur-md rounded-4xl border border-(--border-color) transition-all duration-500 ${unavailable ? "opacity-60 grayscale-[0.8]" : "hover:border-primary/30 hover:shadow-xl hover:bg-(--bg-card)"
        } ${featuredMode ? "ring-2 ring-primary/20 bg-linear-to-b from-primary/10 to-transparent shadow-lg shadow-primary/5" : ""}`}
    >
      {/* Image Section - Only in Featured Mode */}
      {featuredMode && (
        <div className="relative shrink-0 overflow-hidden rounded-3xl border border-(--border-color) w-full md:w-32 h-48 md:h-32">
          <img
            src={item.image ? `/images/${item.image}` : "/logo.png"}
            alt={itemName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/logo.png";
            }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center min-w-0">
        {/* Top Row: Name & Price */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={`text-sm md:text-md font-black leading-tight truncate ${unavailable ? "text-(--text-muted)" : "text-(--text-main)"}`}>
                {itemName}
              </h3>
              {item.star && <FiStar className="text-amber-400 fill-amber-400 shrink-0" size={14} />}
            </div>
            
            {/* Ingredients */}
            {itemIngredients && (
              <p className="text-xs sm:text-sm text-(--text-muted) font-medium leading-relaxed opacity-80 line-clamp-2">
                {itemIngredients}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            {orderSystem ? (
              <div className="flex flex-col items-end gap-1">
                {prices.map((p, idx) => {
                  const price = Number(p.trim());
                  const isAdded = addedPrice === price;
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        <span className={`text-base sm:text-lg font-black ${isAdded ? "text-green-600" : "text-primary"}`}>
                          {price}
                        </span>
                        <TbCurrencyShekel size={16} className="text-(--text-muted) opacity-70" />
                      </div>
                      {!unavailable && (
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleAdd(price)}
                          className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-300 ${isAdded
                            ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                            : "bg-(--bg-main) text-(--text-muted) hover:bg-primary hover:text-white border border-(--border-color)"
                            }`}
                        >
                          {isAdded ? (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                              <FiCheck strokeWidth={4} size={14} />
                            </motion.div>
                          ) : (
                            <FiPlus size={14} />
                          )}
                        </motion.button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-base sm:text-lg font-black text-primary">
                  {prices.map((p) => Number(p.trim())).join(" - ")}
                </span>
                <TbCurrencyShekel size={18} className="text-(--text-muted) opacity-70" />
              </div>
            )}
          </div>
        </div>
      </div>

      {unavailable && (
        <div className="absolute top-4 left-4">
          <span className="bg-red-50 text-red-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100">
            {t('common.unavailable')}
          </span>
        </div>
      )}

      {/* Success Animation Overlay */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 bg-green-500/5 backdrop-blur-[1px] pointer-events-none z-10 flex items-center justify-center rounded-4xl"
          >
            <motion.div
              initial={{ y: 10 }} animate={{ y: 0 }}
              className="bg-white text-green-500 p-2 rounded-full shadow-2xl"
            >
              <FiCheck strokeWidth={4} size={24} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
