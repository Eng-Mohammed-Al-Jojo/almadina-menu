import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import CartButton from "../components/cart/CartButton";
import Footer from "../components/menu/footer";
import Menu from "../components/menu/Menu";
import { FaFire, FaMoon, FaSun } from "react-icons/fa";
import FeaturedModal from "../components/menu/FeaturedModal";
import { motion } from "framer-motion";
import { FirebaseService } from "../services/firebaseService";
import OrderStatusButton from "../components/cart/OrderStatusButton";

export default function MenuPage() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [showFeaturedModal, setShowFeaturedModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasFeatured, setHasFeatured] = useState(false);
  const [orderSystem, setOrderSystem] = useState(true);

  useEffect(() => {
    const unsubscribe = FirebaseService.listen("settings/orderSystem", (value) => {
      setOrderSystem(value ?? true);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-(--bg-main) text-(--text-main) font-['Cairo'] relative transition-colors duration-500">

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-80 bg-linear-to-b from-primary/15 to-transparent pointer-events-none"></div>

      {/* ✅ Top Bar */}
      <div className="absolute top-8 left-0 right-0 z-50 px-8 flex justify-between items-center pointer-events-none">

        {/* 🔹 RIGHT SIDE (Action Buttons) */}
        <div className="flex items-center gap-4 pointer-events-auto mr-auto">
          <button
            onClick={toggleTheme}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-(--bg-card)/60 border border-(--border-color) backdrop-blur-xl hover:bg-(--bg-card) hover:border-primary/30 transition-all text-(--text-main) shadow-premium"
          >
            {theme === "light"
              ? <FaMoon size={18} />
              : <FaSun size={18} className="text-amber-400" />}
          </button>

          {!loading && hasFeatured && (
            <button
              onClick={() => setShowFeaturedModal(true)}
              className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 backdrop-blur-xl hover:bg-primary hover:text-white transition-all shadow-premium"
              title={t("common.most_ordered")}
            >
              <FaFire className="w-5 h-5" />
            </button>
          )}
        </div>

      </div>

      {/* Content */}
      <main className="relative z-10 flex flex-col min-h-screen pb-20">

        {/* Hero Banner Area */}
        <div className="relative w-full h-[40vh] md:h-[50vh] flex flex-col items-center justify-center text-center overflow-visible">
          
          {/* Main Banner Image with Seamless Fade Mask */}
          <div 
            className="absolute inset-x-0 top-0 h-full pointer-events-none"
            style={{
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)'
            }}
          >
            <motion.img
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5 }}
              src="/image.jpg"
              className="w-full h-full object-cover"
            />
            {/* Premium Gradient Overlays for Text Legibility */}
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/20 to-transparent"></div>
          </div>

          {/* Hero Content */}
          <div className="relative z-20 space-y-6 px-4 max-w-4xl mx-auto -mt-10 md:-mt-16">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="space-y-6"
            >
              {/* Floating Logo Container */}
              <div className="w-28 h-28 md:w-36 md:h-36 p-4 bg-white/10 backdrop-blur-2xl rounded-[3rem] border border-white/20 shadow-2xl mx-auto group hover:scale-105 transition-transform duration-500 ring-1 ring-white/10">
                <img src="/logo.png" className="w-full h-full object-contain drop-shadow-2xl" alt="Logo" />
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl md:text-7xl font-black text-white drop-shadow-2xl tracking-tight">
                  {t("menu.title")}
                </h1>

                <div className="inline-block px-6 py-2 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 shadow-lg">
                  <p className="text-primary-foreground text-sm md:text-base font-bold tracking-widest uppercase">
                    {t("menu.subtitle")}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Menu */}
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8">
          <Menu
            onLoadingChange={setLoading}
            onFeaturedCheck={setHasFeatured}
          />
        </div>

      </main>

      {/* Floating Cart (managed internally by CartButton) */}
      {!loading && <CartButton />}

      <FeaturedModal
        show={showFeaturedModal}
        onClose={() => setShowFeaturedModal(false)}
        orderSystem={orderSystem}
      />

      <OrderStatusButton />
      <Footer />
    </div>
  );
}