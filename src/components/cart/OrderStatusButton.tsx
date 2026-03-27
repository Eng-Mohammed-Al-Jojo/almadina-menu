import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaClock, FaUtensils, FaCheckCircle, FaMotorcycle, FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { FirebaseService } from "../../services/firebaseService";

export default function OrderStatusButton() {
    const { t, i18n } = useTranslation();
    const [orderId, setOrderId] = useState<string | null>(null);
    const [order, setOrder] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const isRtl = i18n.language === 'ar';

    useEffect(() => {
        // Check for order ID in localStorage
        const storedId = localStorage.getItem("lastOrderId");
        if (storedId) {
            setOrderId(storedId);
        }

        // Listen for storage changes (if order placed in another tab or same tab)
        const handleStorage = () => {
            const newId = localStorage.getItem("lastOrderId");
            if (newId !== orderId) setOrderId(newId);
        };
        window.addEventListener("storage", handleStorage);
        const interval = setInterval(() => {
            const newId = localStorage.getItem("lastOrderId");
            if (newId !== orderId) setOrderId(newId);
        }, 2000);

        return () => {
            window.removeEventListener("storage", handleStorage);
            clearInterval(interval);
        };
    }, [orderId]);

    useEffect(() => {
        if (!orderId) {
            setOrder(null);
            setIsVisible(false);
            return;
        }

        const unsubscribe = FirebaseService.listen(`orders/${orderId}`, (data) => {
            if (data) {
                setOrder(data);
                setIsVisible(true);
            } else {
                setOrder(null);
                setIsVisible(false);
            }
        });

        return () => unsubscribe();
    }, [orderId]);

    const getStatusInfo = (status: string) => {
        switch (status) {
            case "pending":
                return {
                    label: t('admin.pending'),
                    icon: <FaClock className="animate-pulse" />,
                    color: "bg-yellow-500",
                    progress: 25
                };
            case "preparing":
                return {
                    label: t('admin.preparing'),
                    icon: <FaUtensils className="animate-bounce" />,
                    color: "bg-blue-500",
                    progress: 50
                };
            case "ready":
                return {
                    label: t('admin.ready'),
                    icon: <FaCheckCircle className="scale-110" />,
                    color: "bg-green-500",
                    progress: 75
                };
            case "done":
            case "delivered":
                return {
                    label: t('admin.delivered'),
                    icon: <FaMotorcycle />,
                    color: "bg-gray-700",
                    progress: 100
                };
            default:
                return {
                    label: status,
                    icon: <FaClock />,
                    color: "bg-gray-400",
                    progress: 0
                };
        }
    };

    const dismiss = () => {
        localStorage.removeItem("lastOrderId");
        setOrderId(null);
        setOrder(null);
        setIsVisible(false);
    };

    if (!isVisible || !order) return null;

    const statusInfo = getStatusInfo(order.status || "pending");

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 100, opacity: 0, scale: 0.8 }}
                className={`fixed bottom-24 ${isRtl ? 'left-6 sm:left-10' : 'right-6 sm:right-10'} z-50 w-[280px] sm:w-[320px]`}
            >
                <div className="bg-(--bg-card)/80 backdrop-blur-2xl border border-(--border-color) rounded-[2.5rem] p-4 shadow-2xl overflow-hidden relative group">
                    {/* Progress Bar Background */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-(--border-color) opacity-20" />
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${statusInfo.progress}%` }}
                        className={`absolute top-0 left-0 h-1 ${statusInfo.color} transition-all duration-1000`}
                    />

                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl ${statusInfo.color} text-white flex items-center justify-center text-xl shadow-lg shadow-${statusInfo.color.split('-')[1]}-500/20`}>
                            {statusInfo.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-widest text-(--text-muted) mb-0.5">
                                {t('common.order_type')}: {order.orderType === 'in' ? t('common.dine_in') : t('common.takeaway')}
                            </p>
                            <h4 className="font-black text-(--text-main) truncate text-sm">
                                {statusInfo.label}
                            </h4>
                        </div>

                        <button
                            onClick={dismiss}
                            className="w-8 h-8 rounded-xl bg-(--bg-main) border border-(--border-color) flex items-center justify-center text-(--text-muted) hover:text-red-500 transition-colors"
                        >
                            <FaTimes size={12} />
                        </button>
                    </div>

                    {/* Step Indicators */}
                    <div className="mt-4 flex justify-between px-2">
                        {[1, 2, 3, 4].map((step) => (
                            <div
                                key={step}
                                className={`h-1.5 flex-1 mx-0.5 rounded-full transition-all duration-500 ${statusInfo.progress >= step * 25 ? statusInfo.color : 'bg-(--border-color)'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
